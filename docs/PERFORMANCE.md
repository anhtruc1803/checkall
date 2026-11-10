# Performance giao diện mới — 10/11/2026

## Kết quả và phạm vi

Source trước: da680e48ba5bbc953226541299b9805b93da54e5; source sau/đang phục vụ: ad25dd12fe10b5c88634d5befe7363a2261f5dfd. Mục tiêu median mobile ≥90 trên sáu trang đại diện: **lab đạt; HTTPS public đạt**. Không nhận đó là 80 route hoặc toàn bộ trạng thái phần cứng đã được benchmark. Phân loại Final Acceptance và hồi quy ở PROGRESS.md/TESTING.md.

Mỗi nhóm đủ 18 lượt: ba lần/trang, luân phiên sáu trang, không bỏ lượt xấu. Cặp trước/sau cùng job [42775910647](https://github.com/anhtruc1803/checkall/actions/runs/42775910647), cùng VM/browser/cấu hình; build cả hai trước khi đo, không chạy build/E2E đồng thời trong VM. [Public 42778723274](https://github.com/anhtruc1803/checkall/actions/runs/42778723274) là phép đo riêng qua domain/proxy sau triển khai. Không so điểm public với loopback như một điều kiện đo duy nhất.

Lighthouse 13.6.0, Chromium 156.0.0.0, profile tạm mới mỗi lượt, extension tắt, trace không có Script ngoài origin hoặc dấu hiệu Kaspersky/chrome-extension. CI dùng --no-sandbox trong VM tạm; không thay cấu hình bảo vệ của máy Windows. Mobile simulated, RTT 150 ms, throughput 1638,4 Kbps, CPU slowdown ×4. Public xác minh TLS bình thường, không bỏ qua lỗi chứng chỉ. Môi trường/UA/throttling/benchmark từng lượt tại [qa/performance-ui.json](qa/performance-ui.json), raw JSON/HTML/browser log trong artifact CI. CPU benchmark trước 3030.0–3537.5, sau 3209.0–3594.5, public 1767.0–2073.5; điểm lab vẫn có biến thiên.

## Median trước → sau, cùng VM

| Trang                | Performance |    FCP ms |    LCP ms |        TBT ms | JS truyền tải KiB |
| -------------------- | ----------: | --------: | --------: | ------------: | ----------------: |
| /vi                  |   100 → 100 | 913 → 917 | 913 → 917 |   53.0 → 65.5 |     196.4 → 187.0 |
| /en/screen/ppi       |   100 → 100 | 912 → 909 | 912 → 909 |   60.5 → 61.0 |     203.0 → 193.7 |
| /vi/keyboard/tester  |   100 → 100 | 912 → 911 | 912 → 911 |   58.0 → 57.5 |     205.3 → 195.9 |
| /en/audio/microphone |     99 → 99 | 909 → 912 | 909 → 912 | 109.0 → 114.0 |     197.3 → 187.9 |
| /vi/camera/preview   |     99 → 99 | 909 → 912 | 909 → 912 | 110.0 → 115.0 |     196.9 → 187.6 |
| /en/gamepad/tester   |     99 → 99 | 911 → 909 | 911 → 909 | 111.0 → 117.0 |     197.4 → 188.1 |

## Median HTTPS public sau triển khai

| Trang                |   P | FCP ms | LCP ms | TBT ms |     CLS | JS KiB | Font KiB | Ảnh KiB |
| -------------------- | --: | -----: | -----: | -----: | ------: | -----: | -------: | ------: |
| /vi                  |  95 |   1107 |   1107 |  241.5 | 0.00276 |  184.1 |     97.5 |     0.0 |
| /en/screen/ppi       |  98 |    966 |    966 |  177.0 | 0.00036 |  188.9 |     51.4 |     0.0 |
| /vi/keyboard/tester  |  97 |   1007 |   1007 |  184.5 | 0.00066 |  191.1 |     75.5 |     0.0 |
| /en/audio/microphone |  97 |   1297 |   1297 |  192.0 | 0.00440 |  185.1 |     51.4 |     0.0 |
| /vi/camera/preview   |  96 |   1183 |   1183 |  209.0 | 0.00008 |  184.7 |     75.5 |     0.0 |
| /en/gamepad/tester   |  97 |   1248 |   1248 |  180.0 | 0.00603 |  185.1 |     51.4 |     0.0 |

## Phân tích và thay đổi có bằng chứng

Bundle analyzer chỉ ra tailwind-merge trong chunk client dùng chung: 27421 byte module, 8444 byte gzip ước tính riêng module. Button chỉ dùng class CSS thuần; các class bổ sung là menu-toggle/command-trigger, cva đã tạo chuỗi đầy đủ. Bỏ lớp gọi cn thừa tại Button khiến module này không còn trong client graph. Utility cn giữ nguyên; không thay biến thể/kích thước/asChild hoặc thêm dependency. Số byte JS truyền tải trong bảng là phép đo network thực, khác với ước tính gzip riêng module.

Giữ nguyên 40 công cụ, engine/capability/permission/lifecycle, nội dung SEO/a11y, registry VI/EN và font. Không loại subset tiếng Việt hoặc đổi cách đo phần cứng. Các audit được chạy ở trạng thái idle; không tự cấp quyền microphone/camera/gamepad hay khởi chạy engine chỉ để lấy điểm. CSS/font vẫn được báo đầy đủ; ảnh ngoài được đo theo byte thực thay vì bỏ nội dung để nâng điểm.

Trong cặp cùng VM, JavaScript truyền tải giảm 9551 byte (khoảng 9,3 KiB) ở mỗi trang; điểm median giữ 99–100. FCP/LCP lab sau khoảng 909–917 ms, TBT 57.5–117.0 ms. Public có FCP/LCP 966–1297 ms, TBT 177.0–241.5 ms, CLS 0.00008–0.00603. Tất cả lượt public có Performance từ 95 đến 98; Accessibility/Best Practices/SEO đều được giữ trong QA JSON. CPU benchmark public thấp hơn VM so sánh, nên không quy riêng chênh lệch TBT/điểm giữa hai môi trường cho VPS hoặc proxy. Mức giảm byte công bố lấy từ cặp cùng VM.

Median cũ 84/87/75 thuộc UI Phase 1 trên Windows/CPU khác, không dùng để tính mức tăng của lần này. Baseline sạch UI đầu tiên ở run 42775192337 đã đạt 98/100/100/99/99/99 trước tối ưu; có một lượt homepage LCP 3310 ms nhưng vẫn giữ trong dữ liệu. Tối ưu hiện tại giảm JavaScript được chứng minh bằng graph và transfer; không quy mọi thay đổi TBT/điểm vào một component. Khi median public dưới 90, cần đọc raw LCP breakdown/TTFB/main-thread/network và nêu nguyên nhân bằng dữ liệu trước khi nhận mục tiêu đã đạt.

## Từng lượt trước tối ưu

| Trang                | Lượt |   P | FCP ms | LCP ms | TBT ms |     CLS | JS KiB | Font KiB | Ảnh KiB |
| -------------------- | ---: | --: | -----: | -----: | -----: | ------: | -----: | -------: | ------: |
| /vi                  |    1 | 100 |    916 |    916 |   55.0 | 0.00302 |  196.4 |    101.4 |     0.0 |
| /en/screen/ppi       |    1 |  98 |    912 |    912 |  151.0 | 0.00036 |  203.0 |     52.7 |     0.0 |
| /vi/keyboard/tester  |    1 | 100 |    909 |    909 |   58.0 | 0.00066 |  205.3 |     78.1 |     0.0 |
| /en/audio/microphone |    1 |  99 |    908 |    908 |  109.0 | 0.00377 |  197.3 |     52.7 |     0.0 |
| /vi/camera/preview   |    1 |  99 |    910 |    910 |  110.0 | 0.00038 |  196.9 |     78.1 |     0.0 |
| /en/gamepad/tester   |    1 |  99 |    912 |    912 |  119.0 | 0.00467 |  197.4 |     52.7 |     0.0 |
| /vi                  |    2 | 100 |    913 |    913 |   49.0 | 0.00302 |  196.4 |    101.4 |     0.0 |
| /en/screen/ppi       |    2 | 100 |    912 |    912 |   58.5 | 0.00036 |  203.0 |     52.7 |     0.0 |
| /vi/keyboard/tester  |    2 | 100 |    913 |    913 |   70.0 | 0.00066 |  205.3 |     78.1 |     0.0 |
| /en/audio/microphone |    2 |  99 |    910 |    910 |  107.0 | 0.00406 |  197.3 |     52.7 |     0.0 |
| /vi/camera/preview   |    2 |  99 |    909 |    909 |  101.0 | 0.00038 |  196.9 |     78.1 |     0.0 |
| /en/gamepad/tester   |    2 |  99 |    911 |    911 |  111.0 | 0.00467 |  197.4 |     52.7 |     0.0 |
| /vi                  |    3 | 100 |    913 |    913 |   53.0 | 0.00302 |  196.4 |    101.4 |     0.0 |
| /en/screen/ppi       |    3 | 100 |    909 |    909 |   60.5 | 0.00036 |  203.0 |     52.7 |     0.0 |
| /vi/keyboard/tester  |    3 | 100 |    912 |    912 |   55.5 | 0.00066 |  205.3 |     78.1 |     0.0 |
| /en/audio/microphone |    3 |  99 |    909 |    909 |  109.0 | 0.00406 |  197.3 |     52.7 |     0.0 |
| /vi/camera/preview   |    3 |  99 |    909 |    909 |  111.0 | 0.00038 |  196.9 |     78.1 |     0.0 |
| /en/gamepad/tester   |    3 |  99 |    909 |    909 |  106.0 | 0.00467 |  197.4 |     52.7 |     0.0 |

## Từng lượt sau tối ưu

| Trang                | Lượt |   P | FCP ms | LCP ms | TBT ms |     CLS | JS KiB | Font KiB | Ảnh KiB |
| -------------------- | ---: | --: | -----: | -----: | -----: | ------: | -----: | -------: | ------: |
| /vi                  |    1 | 100 |    922 |    922 |   58.0 | 0.00302 |  187.0 |    101.4 |     0.0 |
| /en/screen/ppi       |    1 | 100 |    911 |    911 |   58.0 | 0.00036 |  193.7 |     52.7 |     0.0 |
| /vi/keyboard/tester  |    1 | 100 |    911 |    911 |   55.5 | 0.00066 |  195.9 |     78.1 |     0.0 |
| /en/audio/microphone |    1 |  99 |    915 |    915 |  107.0 | 0.00406 |  187.9 |     52.7 |     0.0 |
| /vi/camera/preview   |    1 |  99 |    908 |    908 |  112.5 | 0.00038 |  187.6 |     78.1 |     0.0 |
| /en/gamepad/tester   |    1 |  99 |    909 |    909 |  117.0 | 0.00467 |  188.1 |     52.7 |     0.0 |
| /vi                  |    2 | 100 |    917 |    917 |   74.0 | 0.00302 |  187.0 |    101.4 |     0.0 |
| /en/screen/ppi       |    2 | 100 |    909 |    909 |   65.0 | 0.00036 |  193.7 |     52.7 |     0.0 |
| /vi/keyboard/tester  |    2 | 100 |    913 |    913 |   57.5 | 0.00050 |  195.9 |     78.1 |     0.0 |
| /en/audio/microphone |    2 |  99 |    912 |    912 |  118.0 | 0.00406 |  187.9 |     52.7 |     0.0 |
| /vi/camera/preview   |    2 |  99 |    915 |    915 |  119.0 | 0.00038 |  187.6 |     78.1 |     0.0 |
| /en/gamepad/tester   |    2 |  99 |    913 |    913 |  123.0 | 0.00467 |  188.1 |     52.7 |     0.0 |
| /vi                  |    3 | 100 |    911 |    911 |   65.5 | 0.00302 |  187.0 |    101.4 |     0.0 |
| /en/screen/ppi       |    3 | 100 |    908 |    908 |   61.0 | 0.00036 |  193.7 |     52.7 |     0.0 |
| /vi/keyboard/tester  |    3 | 100 |    911 |    911 |   59.0 | 0.00066 |  195.9 |     78.1 |     0.0 |
| /en/audio/microphone |    3 |  99 |    911 |    911 |  114.0 | 0.00406 |  187.9 |     52.7 |     0.0 |
| /vi/camera/preview   |    3 |  99 |    912 |    912 |  115.0 | 0.00038 |  187.6 |     78.1 |     0.0 |
| /en/gamepad/tester   |    3 |  99 |    908 |    908 |  108.0 | 0.00467 |  188.1 |     52.7 |     0.0 |

## Từng lượt HTTPS public

| Trang                | Lượt |   P | FCP ms | LCP ms | TBT ms |     CLS | JS KiB | Font KiB | Ảnh KiB |
| -------------------- | ---: | --: | -----: | -----: | -----: | ------: | -----: | -------: | ------: |
| /vi                  |    1 |  95 |   1132 |   1132 |  241.5 | 0.00021 |  184.1 |     97.5 |     0.0 |
| /en/screen/ppi       |    1 |  97 |    978 |    978 |  182.5 | 0.00000 |  189.0 |     51.5 |     0.0 |
| /vi/keyboard/tester  |    1 |  97 |   1007 |   1007 |  184.5 | 0.00066 |  191.1 |     75.5 |     0.0 |
| /en/audio/microphone |    1 |  97 |   1210 |   1210 |  199.0 | 0.00559 |  185.1 |     51.4 |     0.0 |
| /vi/camera/preview   |    1 |  97 |   1112 |   1112 |  198.0 | 0.00050 |  184.7 |     75.5 |     0.0 |
| /en/gamepad/tester   |    1 |  97 |   1248 |   1248 |  180.0 | 0.00603 |  185.1 |     51.4 |     0.0 |
| /vi                  |    2 |  96 |   1107 |   1107 |  216.0 | 0.00276 |  184.1 |     97.5 |     0.0 |
| /en/screen/ppi       |    2 |  98 |    952 |    952 |  177.0 | 0.00036 |  188.9 |     51.4 |     0.0 |
| /vi/keyboard/tester  |    2 |  97 |    973 |    973 |  205.5 | 0.00050 |  191.2 |     75.5 |     0.0 |
| /en/audio/microphone |    2 |  97 |   1394 |   1394 |  188.0 | 0.00406 |  185.1 |     51.4 |     0.0 |
| /vi/camera/preview   |    2 |  96 |   1241 |   1241 |  209.0 | 0.00008 |  184.7 |     75.5 |     0.0 |
| /en/gamepad/tester   |    2 |  97 |   1348 |   1348 |  180.0 | 0.00467 |  185.2 |     51.4 |     0.0 |
| /vi                  |    3 |  95 |   1012 |   1012 |  252.5 | 0.00276 |  184.1 |     97.5 |     0.0 |
| /en/screen/ppi       |    3 |  98 |    966 |    966 |  168.0 | 0.00036 |  188.9 |     51.4 |     0.0 |
| /vi/keyboard/tester  |    3 |  97 |   1055 |   1055 |  177.0 | 0.00066 |  191.1 |     75.5 |     0.0 |
| /en/audio/microphone |    3 |  97 |   1297 |   1297 |  192.0 | 0.00440 |  185.0 |     51.4 |     0.0 |
| /vi/camera/preview   |    3 |  96 |   1183 |   1183 |  218.0 | 0.00008 |  184.7 |     75.5 |     0.0 |
| /en/gamepad/tester   |    3 |  97 |   1238 |   1238 |  188.0 | 0.00603 |  185.1 |     51.4 |     0.0 |

## Smoke kiểm tra harness trên Windows — môi trường riêng

Ba lượt /en qua HTTPS loopback để xác minh lifecycle/validator của CLI: Performance 88/97/89 (median 89), TBT median 460.3 ms, CPU benchmark 1133.0–1440.5. Trace không có script chèn. Lượt cuối ghi Script Evaluation khoảng 628 ms và Style & Layout 696 ms; chưa khoanh riêng nguồn chi phí Windows. Không quy lỗi cho script Kaspersky khi trace không có nó.

Các lượt này không dùng cùng máy với cặp Linux; không gắn commit tự động và SITE_URL build khác origin QA nên SEO 92. Không dùng chúng tính mức tăng trước/sau hoặc nhận Windows ≥90. Giữ nguyên cả ba lượt, kể cả điểm dưới 90, tại QA JSON và bảng dưới.

| Trang | Lượt |   P | FCP ms | LCP ms | TBT ms |     CLS | JS KiB | Font KiB | Ảnh KiB |
| ----- | ---: | --: | -----: | -----: | -----: | ------: | -----: | -------: | ------: |
| /en   |    1 |  88 |   1067 |   1067 |  482.2 | 0.01664 |  187.0 |     52.7 |     0.0 |
| /en   |    2 |  97 |   1205 |   1205 |  198.0 | 0.00000 |  187.0 |     52.7 |     0.0 |
| /en   |    3 |  89 |   1069 |   1069 |  460.3 | 0.00000 |  187.0 |     52.7 |     0.0 |

## Tái lập

Chạy workflow performance.yml với before_ref/after_ref là SHA đầy đủ để so sánh; cả hai revision được build với SITE_URL=http://127.0.0.1:3000. Đặt public_only=true và after_ref đúng commit đang phục vụ để đo domain; script kiểm tra marker release trước khi đo. Đọc summary.json và toàn bộ runs.json, không chọn lượt đẹp. Dùng scripts/report-ui-performance.mjs --comparison <artifact-comparison> --public <artifact-public> --comparison-run <id> --public-run <id> để tạo báo cáo này. Script report-performance.mjs cũ chỉ dành dữ liệu Phase 1 lịch sử, không dùng sinh báo cáo UI mới.

Nguồn phương pháp: [Lighthouse variability](https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md), [Performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring).

## Báo cáo lịch sử, khác source và môi trường

Các số phía dưới giữ nguyên để đối chiếu lịch sử, không đại diện revision hiện tại.

<!-- HISTORICAL_PERFORMANCE_REPORT -->

## Performance Phase 1 — phép đo sạch ngày 29/10/2026

Checkpoint Phase 2 Milestone 6 (05/11/2026): chưa đo Lighthouse M6, không nhận ≥90 hoặc dùng điểm revision cũ làm điểm M6. Engine gamepad tải động, idle không getGamepads, UI tối đa 8 Hz, tối đa 16 slot/64 trục/128 nút/120 điểm; drift tích lũy thống kê với bộ nhớ hằng số. Không haptics, thêm ảnh/font/dependency hoặc upload. Các đặc tính này không phải benchmark; cần Lighthouse sạch ba lần/trang đại diện và profiling trên tay cầm/browser thật trước nghiệm thu performance.

Checkpoint Phase 2 Milestone 5 (05/11/2026): chưa đo lại Lighthouse revision mới, chưa có median M5 và không nhận Performance mobile ≥90. Camera engine tải động, idle không capture; UI 4 Hz, FPS từ rVFC, bộ nhớ hằng số và không đọc pixel hoặc thêm ảnh/font/dependency. Đây là đặc tính triển khai, không phải kết quả benchmark. Điểm các revision lịch sử bên dưới không đại diện M5. Lighthouse sạch ít nhất ba lần/trang đại diện, main-thread/memory trên camera thật và tải khi capture vẫn cần đo trước Final Acceptance.

Checkpoint lịch sử: Phase 2 Milestone 4. Input engine chỉ chạy sau thao tác chủ động, đọc 2048/1024 float mỗi 125 ms, đồ thị 64 điểm/dải và bộ đệm cố định. PolicyLink thêm document navigation ở ranh giới microphone để áp dụng đúng policy. Chưa đo lại Lighthouse source M4; build/E2E đạt không chứng minh Performance ≥90. Không gán các median lịch sử bên dưới cho source này.

Milestone hiện hành là Phase 2 Milestone 3: audio-output tải qua dynamic import, không tạo context hay tải file âm thanh khi mount. CI cuối source 1066568 đạt kiểm thử chức năng nhưng chưa đo Lighthouse source M3; không coi đó là bằng chứng Performance ≥90 hoặc gán các median Phase 1 bên dưới cho revision này. Kiểm thử API/audio/E2E và build không thay thế Lighthouse.

> Đây là dữ liệu checkpoint Phase 1 được đo theo revision ghi bên dưới. Phase 2 Milestone 2 (source 097404e, 30/10/2026) chưa đo lại Lighthouse; không gán các điểm/median cũ cho source mới hoặc coi Performance ≥90 đã đạt. Cần đo tiếp trong môi trường sạch/CPU ổn định; trạng thái này vẫn mở trong RELEASE_CHECKLIST.md.

## Phương pháp và tính hợp lệ

Lighthouse 13.6.0, Chromium 156, mobile simulated, RTT 150 ms, throughput 1638,4 Kbps, CPU slowdown ×4. Mỗi lượt dùng một profile Chrome tạm mới, tắt extension; không chạy đồng thời E2E, build hoặc unit tests. Mỗi trang được đo ba lần, theo thứ tự luân phiên; không bỏ lượt xấu.

HTTP trên Windows vẫn bị Kaspersky chèn script và sửa CSP, kể cả profile mới và loopback. Origin HTTPS QA riêng `https://127.0.0.1:3443` đã được xác minh không có request ngoài origin, extension request hoặc CSP bị sửa. Chrome chỉ pin SPKI của chứng chỉ tự ký QA; không tắt phần mềm bảo vệ, không chặn request trong Lighthouse, không sửa trace hoặc điểm. Chứng chỉ/key QA nằm trong artifacts bị Git bỏ qua, không được commit. Điều này không xác minh chứng chỉ HTTPS công khai.

Baseline sạch dùng build ban đầu với SITE_URL cũ nên SEO 92 do canonical khác origin QA. Build sau đặt SITE_URL đúng origin QA và SEO 100. Cấu hình mạng/CPU/browser/origin của phép đo Performance không đổi; khác biệt canonical chỉ là cấu hình metadata đã được công khai ở đây. Bản raw JSON/HTML ở artifacts/performance/clean-before và clean-release; dữ liệu gọn có thể đối chiếu trong [qa/performance.json](qa/performance.json). Bộ clean-release dùng đúng source initial commit c82cd20, trước thay đổi CSS bỏ background transition của nút để sửa tương phản lúc đổi theme. Không tuyên bố đã đo lại Lighthouse trên commit CSS đó.

## Median trước và sau

| Trang               | Performance |   LCP (ms) |   TBT (ms) | JS truyền tải (KiB) |
| ------------------- | ----------: | ---------: | ---------: | ------------------: |
| /vi                 |     78 → 84 | 939 → 1074 |  994 → 640 |       210.4 → 189.7 |
| /en/screen/ppi      |     94 → 87 | 976 → 1069 |  280 → 500 |       219.0 → 198.6 |
| /vi/keyboard/tester |     83 → 75 | 926 → 1073 | 695 → 1289 |       221.2 → 200.9 |

## Từng lượt baseline sạch

| Trang               | Lượt | Performance | FCP (ms) | LCP (ms) | TBT (ms) |     CLS | JS (KiB) |
| ------------------- | ---: | ----------: | -------: | -------: | -------: | ------: | -------: |
| /vi                 |    1 |          70 |     1189 |     1189 |     3614 | 0.00592 |    210.4 |
| /en/screen/ppi      |    1 |          99 |      925 |      925 |      140 | 0.00043 |    219.0 |
| /vi/keyboard/tester |    1 |          83 |      926 |      926 |      695 | 0.00000 |    221.2 |
| /vi                 |    2 |          80 |      939 |      939 |      858 | 0.00000 |    210.4 |
| /en/screen/ppi      |    2 |          94 |     1055 |     1055 |      280 | 0.00036 |    219.0 |
| /vi/keyboard/tester |    2 |          87 |      915 |      915 |      505 | 0.00038 |    221.2 |
| /vi                 |    3 |          78 |      936 |      936 |      994 | 0.00000 |    210.4 |
| /en/screen/ppi      |    3 |          83 |      976 |      976 |      671 | 0.00036 |    219.0 |
| /vi/keyboard/tester |    3 |          53 |     1039 |     1039 |     1984 | 0.42352 |    221.2 |

## Từng lượt sau tối ưu

| Trang               | Lượt | Performance | FCP (ms) | LCP (ms) | TBT (ms) |     CLS | JS (KiB) |
| ------------------- | ---: | ----------: | -------: | -------: | -------: | ------: | -------: |
| /vi                 |    1 |          83 |     1074 |     1074 |      702 | 0.00000 |    189.7 |
| /en/screen/ppi      |    1 |          87 |     1069 |     1069 |      500 | 0.00000 |    198.6 |
| /vi/keyboard/tester |    1 |          72 |     1083 |     1083 |     1912 | 0.00000 |    200.9 |
| /vi                 |    2 |          89 |     1191 |     1191 |      428 | 0.00081 |    189.7 |
| /en/screen/ppi      |    2 |          96 |      913 |      913 |      229 | 0.00045 |    198.6 |
| /vi/keyboard/tester |    2 |          84 |     1073 |     1073 |      620 | 0.00000 |    200.9 |
| /vi                 |    3 |          84 |     1067 |     1067 |      640 | 0.00081 |    189.7 |
| /en/screen/ppi      |    3 |          76 |     1260 |     1260 |     1235 | 0.00000 |    198.6 |
| /vi/keyboard/tester |    3 |          75 |     1072 |     1072 |     1289 | 0.00000 |    200.9 |

## Các nguyên nhân và thay đổi có bằng chứng

- Zod đầy đủ và metadata registry của cả 21 công cụ từng nằm trong bundle client dùng chung. Chuyển validation sang zod/mini, truyền chỉ mục tìm kiếm được sinh từ registry và chỉ truyền ba trường runtime cho engine. JS truyền tải giảm khoảng 21 KiB trên mỗi trang. Không bỏ validation, VI/EN, nội dung SEO hoặc chức năng.
- Hộp tìm kiếm không dựng 21 kết quả khi chưa mở. Catalog không prefetch hàng loạt engine chưa được chọn; các link và khả năng tìm kiếm vẫn đầy đủ.
- Một lượt baseline Keyboard có CLS 0,42352 do giao diện engine xuất hiện sau placeholder. Đợt tối ưu giữa có LCP median 3515 ms, trace chỉ rõ đoạn hướng dẫn capture được render muộn. HTML công cụ hiện prerender giao diện inert; native fieldset chỉ mở tương tác sau hydration của chính engine và capability detection. Không chạy phép đo phần cứng trên server. LCP median Keyboard cuối 1073 ms, CLS median 0.
- Catalog không nhận input trước hydration để tránh mất truy vấn trên WebKit. Device Overview không tạo canvas capability probe lặp lại theo timer.
- Không có ảnh truyền tải trong ba trang (0 byte). Font self-host giữ đủ ký tự Việt/Anh: median khoảng 93,1 KiB ở /vi, 52,7 KiB ở PPI tiếng Anh, 78,1 KiB ở Keyboard tiếng Việt. Không loại subset tiếng Việt để tăng điểm.

## Mục tiêu chưa đạt và giới hạn

Homepage đạt median 84, PPI 87 và Keyboard 75, đều chưa đạt 90 trong bộ đo cuối. TBT median tương ứng 640 / 500 / 1289 ms. Bundle framework lớn nhất khoảng 224 KiB chưa nén (70 KiB gzip), bên cạnh runtime React và các thành phần tương tác. JS toàn trang còn khoảng 190–201 KiB truyền tải dù giảm khoảng 21 KiB so với baseline.

Audit mainthread-work-breakdown của lượt 3 ghi Script Evaluation / Style & Layout lần lượt 882 / 746 ms ở homepage, 2040 / 1058 ms ở PPI, 1204 / 1020 ms ở Keyboard. Đây là dữ liệu hỗ trợ hướng điều tra JavaScript/hydration và layout; không kết luận mọi TBT là do một component cụ thể. Không còn script ngoài origin để quy nguyên nhân cho script bị chèn.

Benchmark CPU trong bộ cuối dao động từ 318,5 đến 1437; riêng PPI có Performance 87 / 96 / 76 và TBT 500 / 229 / 1235 ms. Các điều kiện cấu hình tương đương nhưng tốc độ CPU thực không ổn định. Không thể kết luận giảm bundle bảo đảm tăng điểm; PPI và Keyboard có median thấp hơn baseline. Giữ đủ cả chín lượt cuối, không chọn bộ clean-final trung gian (81 / 95 / 83) làm kết quả phát hành. Cần đo tiếp trên runner/staging có CPU ổn định để tách biến thiên môi trường khỏi regression.

Accessibility, Best Practices và SEO đều 100 ở ba trang trong lượt đo cuối; CLS median từ 0 đến 0,00081, không được làm tròn thành “mọi lượt CLS bằng 0”. Điểm lab không thay thế dữ liệu thực địa, kiểm thử thiết bị hay việc nghiệm thu production. Cần tiếp tục kiểm tra startup/hydration trên Linux staging có CPU ổn định; chưa tuyên bố Performance 90+ cho toàn bộ Phase 1.

## Tái lập trên Windows

1. Tạo chứng chỉ tự ký QA (SAN localhost/127.0.0.1), lưu key.pem và cert.pem trong artifacts/qa-tls bằng OpenSSL; không đưa key vào Git hoặc trust store hệ thống.
2. Đặt SITE_URL=https://127.0.0.1:3443 khi build, chạy pnpm build và pnpm start.
3. Chạy node scripts/qa-https.mjs ở terminal khác; proxy chỉ bind loopback.
4. Chạy node scripts/probe-browser.mjs và kiểm tra HTTPS không có externalOrigins.
5. Chạy node scripts/lighthouse.mjs --label clean-release --runs 3. Script từ chối kết quả “sạch” nếu trace có external/injected script. Chạy node scripts/report-performance.mjs để sinh báo cáo từ clean-before và clean-release.

Trên Linux sạch có thể dùng --base-url http://127.0.0.1:3000 và SITE_URL tương ứng, không cần chứng chỉ QA. Không so sánh trực tiếp điểm từ hai máy khác nhau như cùng một điều kiện đo.

## Báo cáo lịch sử

Các điểm 75–81 trong bàn giao trước là một lượt đo HTTP bị chèn script, không phải median sạch. Chúng còn ở artifacts/lighthouse-baseline và báo cáo cũ, chỉ dùng để giải thích lịch sử. Các bộ trung gian clean-after và clean-final vẫn giữ nguyên trong artifacts/performance; kết quả phát hành dùng clean-release, kể cả điểm thấp hơn.

Source M4 cuối 8f6e773 đã đạt kiểm thử chức năng/CI trong phạm vi capability hiện có; Lighthouse vẫn chưa đo. Không dùng kết quả unit/E2E, native audio smoke hoặc các median Phase 1 để chứng minh Performance của source này.
