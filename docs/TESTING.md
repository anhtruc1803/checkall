# Kiểm thử

## Kiểm thử chuyển tên miền a.ap.vn — 23/11/2026

Source **6c8252b3a53574cd9283101f0a95219fb3b85a41** giữ nguyên app/tests/dependencies của Milestone 3. Local typecheck/lint/secret scan và575 unit/43 file đạt. [CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/45101107988) đạt build 124, **466 E2E đạt/6 native policy skip**, 0 fail/flaky/global error; Chromium/mobile mỗi118 đạt, Firefox/WebKit mỗi115 đạt/3 skip. Docker CI health/Nginx/52 route trước/sau restart/stop-start và shutdown143 đạt. Candidate VPS cô lập đạt 96 route, sitemap 118, canonical/hreflang/policy/CSP trước/sau restart và Node private.

Public lần đầu83/84, một Chromium503; chạy riêng tái hiện 1 fail/3 pass, tách static vẫn1 fail/3 pass. Sau tách cả RSC và static khỏi bucket điều hướng: bài lỗi **4/4 đạt**, full smoke cuối **84/84 đạt**, mỗi cấu hình21, 0 fail/skip/flaky/global error. Giữ timeout/assertion/test. Public smoke là subset chức năng Windows; full privacy/no-upload lấy từ CI Linux. Mobile là Chromium giả lập iPhone13; WebKit/backend ảo không xác nhận Safari/phần cứng thật.

HTTP public đạt 96 route mới/96 redirect cũ, 48 card, sitemap 118, canonical/hreflang/robots/health và CSP 96/96. TLS/redirect/ACME kiểm tra riêng origin và 3 proxy IP. HTTP proxy mới 301, origin/tên miền cũ308, giữ path/query. Đã xem ảnh VI 375px và EN 1200px, không tràn ngang. Các bài WCAG bao gồm cả VI/EN Dark/Light, 320px và chữ200%, EVKey/dd.

Audit production0 advisory, toàn bộ2 moderate dev tooling glob/minimatch. Còn503 tài nguyên phụ trong Lighthouse chưa rõ nguồn. Chưa xác minh sáu native policy, Safari/phần cứng, clipboard/bộ gõ/mobile thật, screen reader, TLS proxy→origin trong dashboard, renewal dài hạn/rollback khi lỗi và field data. **Final Acceptance tổng thể vẫn mở.** Xem [báo cáo](DOMAIN-MIGRATION.md), [QA JSON](qa/domain-migration-2026-11-23.json); các mục dưới là lịch sử.

## Tiện ích Milestone 3 đã triển khai — 20/11/2026

Source **890aa52d9af73d1d36fd96b79d941adcb20296ed**, [CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/44663888110), [Lighthouse trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/44663904488) và [Lighthouse public](https://github.com/anhtruc1803/checkall/actions/runs/44668621145). Đã triển khai **U07 Đổi đơn vị** và **U08 Tính ngày** sau khi người dùng duyệt local: **48 công cụ VI/EN**, giữ nguyên metadata/route/engine/copy của **46 công cụ trước**; **96 route công cụ**, sitemap **118 URL**. Không sửa mã ứng dụng/tests/scripts sau bản đã duyệt; không thêm dependency hoặc viết lại kiến trúc.

Typecheck/lint/secret scan đạt, **575 unit/integration/43 file**, build **124 trang**. Full CI sạch **466 E2E đạt/6 native policy skip**, không fail/flaky/global error; hai công cụ mới **32/32**, văn bản M2 **32/32**, số M1 **24/24**. Chromium/mobile mỗi 118 đạt; Firefox/WebKit mỗi 115 đạt/3 skip. Backend audio ảo qua smoke cả ba engine, không phải phần cứng thật hoặc Safari.

Trước chuyển đủ **60 mẫu sạch/20 trang × 3**, median mobile **98–100**; sau chuyển đủ **60 mẫu sạch/20 trang × 3**, median **96–99**. Median Accessibility/Best Practices/SEO 100 trên mọi trang ở cả hai bộ. Đối chiếu source/path/pageVerified/clean của từng mẫu; đủ 120 mẫu, FCP/LCP/TBT/CLS và byte JS/font/ảnh trong [QA phát hành](qa/deployment-utilities-milestone3-2026-11-20.json). Không lấy điểm Windows 76 có injection làm baseline hoặc nhận chênh lệch lab/public là thay đổi do code.

Docker CI đạt build/health/Nginx/**52 route smoke VI/EN** trước/sau restart/stop-start, Node private, SIGTERM 143/không OOM/Error. Candidate VPS network none, non-root/read-only, 768 MiB/256 PID: đủ **96 route**, sitemap 118 trước/sau restart/stop-start và exit 143; đã dọn candidate. Chỉ sau khi đọc đủ CI/Lighthouse/candidate và sinh gate đúng source mới chuyển website.

Public HTTP→HTTPS308, H1/canonical/release/policy và đủ **96 route** (92 cũ + 4 mới), 48 card, sitemap 118 đạt. **84/84 public smoke** trên Chromium/Firefox/WebKit/mobile, mỗi cấu hình 21 bài, không fail/skip/flaky/global error; gồm tiện ích số/văn bản/đơn vị/ngày, VI/EN, clipboard fixture, theme/reflow/WCAG và EVKey/dd. Đây là subset chức năng trên Windows hiện có; kiểm tra không-upload của full suite được xác minh riêng trong CI sạch. Public Lighthouse đo sau smoke để không có tải QA đồng thời.

Các số liệu sạch thuộc source `890aa52`; không đổi 15 failure/19 skip của lượt Windows cũ thành pass. Giữ checkpoint local/đối chứng Kaspersky và báo cáo raw; sáu skip CI là native microphone/camera/gamepad policy của Firefox/WebKit, HTTP scope/app guard đã kiểm tra riêng. Không giảm timeout/assertions, thêm skip hoặc sửa ứng dụng để làm CI đạt.

**Đã hoàn thành và xác minh:** phần mềm CI sạch, giữ 46 công cụ cũ, Docker CI/candidate, public HTTP/UI và median mobile ≥90 trên 20 trang đại diện. **Đã triển khai nhưng chưa xác minh đầy đủ:** clipboard quyền hệ thống, screen reader, date picker/bàn phím số/nhập âm/bộ gõ trên điện thoại thật; rollback khi production lỗi chưa diễn tập cố ý. **Chưa hoàn thành:** 6 native policy skip, hai moderate dev tooling glob/minimatch, TLS proxy→origin trong dashboard/field data và các mục manual của nền tảng. CSP có tại app/origin nhưng public chỉ 0/96 route có header; proxy do người dùng quản lý, không tự sửa. **Không thể kiểm chứng lượt này:** Safari/phần cứng thật và mọi phiên bản EVKey; chế độ TLS trong dashboard proxy. Không coi fixture/WebKit automation là thiết bị/Safari thật. **Các gate phát hành phần mềm đạt; Final Acceptance tổng thể vẫn mở.**

[Nghiệm thu M3](ACCEPTANCE-UTILITIES-MILESTONE-3.md); [QA phát hành](qa/deployment-utilities-milestone3-2026-11-20.json).

## Lịch sử trước phát hành: Tiện ích Milestone 3 — local để duyệt, 20/11/2026

Candidate local **48 công cụ VI/EN**, giữ nguyên metadata/route/engine/copy của 46 công cụ trước; thêm **U07 Đổi đơn vị** (tám nhóm, phân số BigInt) và **U08 Tính ngày** (khoảng cách và cộng/trừ ngày Gregorian 0001–9999, độc lập DST). Không thêm dependency, API, capability hoặc permission. Chưa commit/push, CI từ xa, SSH hoặc triển khai website; public vẫn M2. Xem [đặc tả M3](UTILITIES-MILESTONE-3.md).

Typecheck/lint/secret scan đạt; **575 unit/integration/43 file** đạt, không fail/skip (baseline trước sửa 494/41). Build cuối **124 trang**, BUILD_ID `53i7Q8tGFzXpfNgRhVJ7k`; health +**52 route smoke VI/EN**/policy đạt; kiểm tra thêm đủ **96 tool route**, canonical/CSP/ngôn ngữ và sitemap **118 URL**. Fixture thiết bị/M1 giữ nguyên; thêm fixture M2 U03–U06 từ committed HEAD, không sinh lại từ candidate. 213 file source/test/script được fingerprint, không đổi từ build cuối trong suốt full suite.

Full **472 E2E: 438 đạt / 19 skip / 15 fail**, không flaky/global error; 1.878.757,726 ms. Nhóm mới **29/32 đạt, 3 fail, 0 skip**. Tất cả failure đã đọc đều là POST do Kaspersky chèn ngoài ứng dụng; đối chứng mới HTML trống không tải app/nhập dữ liệu cũng có script/POST Kaspersky trên Chromium và Firefox. Không lọc request, giảm assertion, tăng timeout hoặc gán failure thành pass. Các skip native/runtime giữ từng lý do trong [QA JSON M3](qa/utilities-milestone3-local-2026-11-20.json); không chứng nhận quyền/phần cứng từ fixture hoặc Safari thật từ WebKit.

Hai engine tải riêng: unit chunk **7.594 byte**, gzip ước tính **2.864 byte**; date chunk **4.761 byte**, gzip ước tính **1.783 byte**. Không tải hai engine trên trang chủ, Keyboard Tester và đọc số trong bảy route runtime graph đã kiểm tra. Đây không phải tổng JS/transfer hoặc kết luận điểm Lighthouse; messages/Registry có overhead chung. Đã xem ảnh desktop/mobile của cả hai công cụ; các bài passed bao gồm VI/EN, tính toán, clipboard fixture, Dark/Light/WCAG và reflow 320px/chữ 200%.

Lighthouse profile mới/extension tắt dừng bởi guard injection; chỉ có **1 mẫu chẩn đoán bị loại**, chưa đủ ba lượt/trang, chưa có median sạch hoặc xác minh mobile ≥90 cho M3. Không lấy điểm public M2 làm bằng chứng. Audit production **0 advisory**, còn **2 moderate dev tooling** glob/minimatch. Docker CLI không có, WSL không khả dụng; không tuyên bố đã thử Docker/Linux candidate.

| Browser/config | Đạt | Skip | Fail |
| -------------- | --: | ---: | ---: |
| chromium       | 113 |    0 |    5 |
| firefox        | 110 |    3 |    5 |
| webkit         | 102 |   16 |    0 |
| mobile         | 113 |    0 |    5 |

Các lệnh đã chạy: `pnpm typecheck`, `pnpm lint`, `pnpm test --maxWorkers=2 --reporter=json --outputFile=artifacts/utilities-m3-unit-final.json`, `pnpm build` với SITE_URL local, `node scripts/smoke-http.mjs http://127.0.0.1:3100`, `pnpm exec playwright test --config artifacts/utilities-m3-playwright.config.ts`, audit production/toàn bộ, Prettier và secret/diff checks. Config QA dùng production server khởi tạo riêng ở loopback và output riêng; giữ bốn project, hai worker, timeout/assertions và các kiểm thử cũ. File E2E M3 chạy múi giờ America/New_York để kiểm tra qua mốc DST; không đổi timezone của các bài cũ.

Lượt focused đầu chủ động dừng để sửa liên kết nhãn select và lời nhắc một giá trị. Các bài lỗi/dừng ban đầu không tính là full QA; build cuối và 472 E2E phía trên chạy sau sửa. Không thay source trong lúc full suite đang chạy. Clipboard/permission fixtures và backend audio/thiết bị ảo không chứng nhận OS/hardware.

**Đã hoàn thành và xác minh:** implementation local, khóa 46 định nghĩa cũ, unit/build/HTTP và các bài E2E có trạng thái passed. **Đã triển khai nhưng chưa xác minh đầy đủ:** clipboard quyền hệ thống, date picker/bàn phím số/nhập âm/bộ gõ trên điện thoại thật, screen reader. **Chưa hoàn thành:** full E2E sạch, Lighthouse sạch/mobile ≥90, Docker/Linux candidate, native/runtime skips và hai dev advisory. **Không thể kiểm chứng trong môi trường hiện tại:** browser hoàn toàn sạch script bảo mật trên Windows này, Safari/phần cứng thật, Docker Engine/WSL. Các mục native/manual/bảo mật còn mở của M2 vẫn giữ nguyên. **Final Acceptance và gate phát hành M3 chưa đóng.**

Tiếp theo: người dùng duyệt [Đổi đơn vị local](http://127.0.0.1:3100/vi/utilities/unit-converter) và [Tính ngày local](http://127.0.0.1:3100/vi/utilities/date-calculator); có EN qua bộ đổi ngôn ngữ. Sau duyệt và yêu cầu phát hành mới: CI/browser sạch, Lighthouse ba lượt/trang và Docker/Linux đúng source trước cập nhật website. Không tự mở milestone tiếp theo hoặc triển khai từ lượt local này.

## Tiện ích Milestone 2 đã phát hành — 19/11/2026

Báo cáo hoàn thiện và kiểm tra lại HTTP ngày **20/11/2026**; số liệu CI, Lighthouse và snapshot Docker/runtime bên dưới thuộc đợt phát hành **19/11/2026**. Kết luận và phân loại chi tiết: [Nghiệm thu Milestone 2](ACCEPTANCE-UTILITIES-MILESTONE-2.md).

Kiểm tra lại ngày 20/11: release `142f807`, health HTTP200/status OK, đủ 92 route công cụ VI/EN, sitemap 114 và audit production 0 advisory; còn 2 moderate dev tooling. Không chạy lại hoặc gán ngày mới cho toàn bộ suite đã chạy ngày 19/11.

Lượt chốt tài liệu ngày 20/11 chạy lại `pnpm typecheck`, `pnpm lint`, Prettier check và `node scripts/scan-secrets.mjs`: đều đạt. Diff xác nhận không thay mã ứng dụng/tests/scripts; không chạy lại build/E2E/Lighthouse cho thay đổi chỉ gồm tài liệu.

Source **142f807dbb87374452acb65a8be6e2052caa5367**, [CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/44492926836), [Lighthouse trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/44493548246) và [Lighthouse public](https://github.com/anhtruc1803/checkall/actions/runs/44498282182). Giữ nguyên 42 công cụ trước (40 thiết bị + U01/U02), thêm U03–U06: **46 công cụ VI/EN**, **92 route công cụ**, sitemap **114 URL**. Mã ứng dụng, tests và scripts không đổi từ bản người dùng đã duyệt; các commit sau chỉ chuẩn hóa CI/tài liệu.

Typecheck/lint/secret scan đạt, **494 unit/41 file**, production build **120 trang**; full E2E **434 đạt/6 native policy skip**, không fail/flaky/global error, 1.034.526,065 ms. Chromium/mobile mỗi 110 đạt; Firefox/WebKit mỗi 107 đạt/3 skip. Nhóm văn bản **32/32**, tiện ích số **24/24** sạch. Backend audio ảo qua smoke cả ba engine; không chứng nhận phần cứng thật hoặc Safari.

CI dùng image browser chính thức đã pin; Node.js 24, PulseAudio chạy pwuser với HOME/runtime/socket/cookie riêng, browser HOME đúng user job và test server bind loopback. Chẩn đoán APT mirror chậm, Git ownership, HOME của audio/Firefox và HOSTNAME container ở các lượt trước; không tính các lượt đó là pass. Không đổi ứng dụng/tests hoặc giảm yêu cầu. Native policy skip được ghi từng lý do, không suy thành đã xác minh quyền hệ thống.

Docker CI đạt build/health/Nginx/48 route VI/EN trước/sau restart/stop-start, Node không publish, SIGTERM 143/không OOM/Error. Candidate VPS kiểm tra riêng đủ 92 route/sitemap 114 trong chế độ cô lập trước khi chuyển; không đồng nhất Docker CI với VPS.

Public HTTP→HTTPS308, H1/canonical/release/policy và toàn bộ 92 route (84 cũ + 8 mới) đạt. **56/56 public smoke** trên Chromium/Firefox/WebKit/mobile, không fail/skip/flaky/global error; gồm VI/EN, chữ/số, ngôn ngữ văn bản độc lập UI, clipboard/IME fixture, theme/reflow/WCAG và EVKey/dd. Đây là subset chức năng Windows hiện có, không phải full privacy sạch trên public; full privacy đã xác minh riêng trong CI.

Trước chuyển đủ **48 mẫu sạch/16 trang × 3**, median mobile **99–100**; sau chuyển đủ **48 mẫu sạch/16 trang × 3**, median **95–98**. Cả hai bộ có median Accessibility/Best Practices/SEO 100 trên mọi trang. Kiểm tra source/path/pageVerified/clean của từng mẫu; không chỉ dựa job success. Giữ toàn bộ 96 sample và median FCP/LCP/TBT/CLS/JS/font/ảnh trong [QA phát hành](qa/deployment-utilities-milestone2-2026-11-19.json). Không lấy mẫu Windows bị Kaspersky chèn hoặc dữ liệu M1 làm baseline tăng điểm M2.

Audit production 0 advisory, toàn bộ dependency còn 2 moderate dev tooling. Secret scan gồm tracked/untracked không bị ignore; .env/key/cache/raw reports không commit. Fingerprint và sourceHistory trong [QA phát hành](qa/deployment-utilities-milestone2-2026-11-19.json); không xóa kết quả Windows không sạch hoặc gán lại là pass.

**Đã hoàn thành và xác minh:** phần mềm qua CI, Docker CI/candidate, public HTTP/UI, median mobile ≥90 trên bộ đại diện. **Đã triển khai nhưng chưa xác minh đầy đủ:** clipboard/bộ gõ/mobile/screen reader thật, rollback khi lỗi production chưa diễn tập cố ý. **Chưa hoàn thành:** 6 native policy skips, 2 moderate dev tooling glob/minimatch, CSP public còn bị proxy bỏ (0/92 route có header), TLS proxy→origin/field data. **Không thể kiểm chứng lượt này:** Safari thật/phần cứng/mọi phiên bản EVKey. Không đồng nhất WebKit automation với Safari thật, fixture/backend ảo với thiết bị thật. Người dùng quản lý proxy; không tự sửa. **Final Acceptance tổng thể vẫn mở.**

## Lịch sử trước phát hành: Milestone 2 local để duyệt, 19/11/2026

Candidate gồm 46 công cụ VI/EN, giữ nguyên 40 công cụ thiết bị và U01/U02. Chưa commit/push/CI từ xa/SSH/deploy. Typecheck, lint, secret scan đạt; production build **120 trang**, BUILD_ID `c-NDmO-s7fw5rZXNdGwtV`; HTTP smoke health +**48 route VI/EN** và scope Permissions-Policy đạt. Registry/sitemap kiểm thử 46 công cụ, 92 route công cụ, 114 URL sitemap. Fixture thiết bị cũ giữ nguyên; fixture U01/U02 đối chiếu trực tiếp định nghĩa committed HEAD rồi dùng trong test, không sinh từ metadata M2 để tự xác nhận.

**494 unit/integration đạt trên 41 file**, không fail/skip, 56.116,649 ms ở lượt cuối sau thêm thuộc tính ngôn ngữ. Bài mới bao phủ grapheme emoji/ZWJ/cờ/dấu kết hợp; từ native, đoạn/dòng CRLF/LS; thiếu Segmenter không bịa fallback; tiếng Việt và `đ/Đ`; case/slug ASCII/Unicode; tính ổn định khi xử lý lặp trên 128 tổ hợp làm sạch với mẫu hỗn hợp, giữ xuống dòng khi tắt hết bước; HTML literal; biên 50.000 UTF-16/vượt giới hạn không cắt; composition; giữ bản gốc/xóa kết quả cũ; clipboard chủ động/từ chối; không storage/fetch kể cả opt-in lịch sử và remount reset. Thuộc tính `lang` của input/output theo ngôn ngữ văn bản dù UI vẫn ngôn ngữ khác. Không coi mocks là browser hoặc thiết bị thật.

Focused bốn tiện ích mới **25/28 đạt, 3 fail**, không skip/flaky/global error, 159.974,423 ms. Chromium/Firefox/mobile mỗi6 đạt/1 fail, WebKit7 đạt. VI/EN, case/slug/clean/count, IME fixture, giới hạn và thiếu Segmenter, clipboard fixture, WCAG automation Dark/Light và reflow320/chữ200 đều đạt. Ba fail đều assertion không request ngoài GET/HEAD, chỉ origin Kaspersky; không lọc bỏ request hoặc hạ yêu cầu. Sau lượt này thêm bài điều hướng cùng engine/đổi locale và đặt lại scroll trước ảnh, được kiểm tra trong bộ full. Không đổi code ứng dụng để né lỗi privacy.

Bộ full **440 bài/4 project**: **409 đạt / 19 skip / 12 fail**, không flaky/global error; 1.596.243,295 ms. Dùng production preview loopback, hai worker, không retry. Cả 12 fail chỉ ở assertion không-upload nhận origin Kaspersky: mỗi Chromium/Firefox/mobile có bốn bài camera/gamepad/tiện ích số/tiện ích văn bản. Không nới assertions/skip/timeout hoặc loại request này. Các skip là native Web Audio/mediaDevices/Permissions-Policy theo khả năng runtime, từng lý do trong [QA milestone](qa/utilities-milestone2-local-2026-11-19.json).

| Project         | Đạt | Skip | Fail |
| --------------- | --: | ---: | ---: |
| Chromium        | 106 |    0 |    4 |
| Firefox         | 103 |    3 |    4 |
| WebKit Windows  |  94 |   16 |    0 |
| Mobile Chromium | 106 |    0 |    4 |

Full run dùng build `ElsN5RtI1lhnxp6u9TxJS`, source không đổi trong lượt; nhóm văn bản 29 đạt/3 fail, tiện ích số 21 đạt/3 fail. Sau full chỉ thêm hai thuộc tính `lang={language}` cho textarea và assertions trong hai file unit/E2E tương ứng. Không đổi hàm xử lý, Registry, engine hoặc metadata cũ; 207 file khác trong checkpoint 210 file khớp SHA256. Build cuối `c-NDmO-s7fw5rZXNdGwtV` đã typecheck/lint/unit494/build120/HTTP48 và được chạy lại 32 E2E văn bản, gồm locale độc lập với ngôn ngữ input/output. Không tuyên bố chạy lại full440 trên build cuối sau thay đổi thuộc tính; checkpoint/đối chiếu delta và kết quả lượt32 riêng trong QA JSON. Không tính lượt đầu đã dừng để sửa margin checkbox thành một lượt full hoàn tất.

Lượt 32 trên build cuối: **29 đạt/3 fail**, không skip/flaky/global error, 168.729,403 ms; Chromium/Firefox/mobile mỗi 7 đạt/1 fail, WebKit 8 đạt. Ba fail vẫn chỉ là origin Kaspersky trong bài không-upload. Thuộc tính ngôn ngữ, VI/EN, điều hướng/reset, mọi chế độ văn bản, IME/clipboard fixture, fallback/biên và WCAG/reflow đều qua. Lỗi typecheck tạm từ snapshot QA `.tsx` đã xử lý bằng đổi đuôi bản lưu `.txt`; không nới tsconfig, typecheck sau đó đạt.

Đối chứng mới `artifacts/text-injection-control.json`: phục vụ HTML trống, 0 script ứng dụng, không nhập bàn phím; Chromium156.0.8078.4 và Firefox157.0 đều bị chèn script/POST Kaspersky. Chỉ giữ origin/method/type, không path/session/payload. Do đó source/unit chứng minh ứng dụng không gọi storage/upload, nhưng privacy gate toàn môi trường cần chạy lại máy sạch. Không tuyên bố phần mềm bảo mật đã gửi nội dung văn bản; chưa kiểm tra payload của nó.

Audit production **0 advisory**; toàn bộ dependency còn **2 moderate dev tooling** glob/minimatch, không đổi dependency hoặc ép override major. Secret scan bao gồm tracked và untracked không bị ignore, không phát hiện. `.gitignore` vẫn loại `.env`, key, cache, build và raw artifacts. Docker CLI/Engine không có nên chưa kiểm thử Docker M2; script smoke đã mở rộng route mới cho Linux CI khi được phép phát hành. Không lấy CI/Docker/Lighthouse sạch M1 thay bằng chứng M2. Lighthouse chẩn đoán bị loại vì injection, chưa xác minh mobile≥90; chi tiết [PERFORMANCE](PERFORMANCE.md).

Các lệnh đã chạy:

```powershell
pnpm typecheck
pnpm lint
node scripts/scan-secrets.mjs
pnpm test --maxWorkers=2 --reporter=json --outputFile=artifacts/text-milestone2-unit.json
pnpm build
node scripts/smoke-http.mjs http://127.0.0.1:3100
$env:TEXT_QA_LABEL='focused'
pnpm exec playwright test tests/e2e/text-utilities.spec.ts --config=artifacts/text-playwright.config.ts
$env:TEXT_QA_LABEL='full'
pnpm exec playwright test --config=artifacts/text-playwright.config.ts
$env:TEXT_QA_LABEL='semantic'
pnpm exec playwright test tests/e2e/text-utilities.spec.ts --config=artifacts/text-playwright.config.ts
pnpm audit --prod --json
pnpm audit --json
```

Config E2E local trong artifacts chỉ thay baseURL3100/report/output; giữ đủ Chromium/Firefox/WebKit/mobile Chromium và hai worker, không nới assertion. Đây là cấu hình QA máy hiện tại, không file production. Ảnh duyệt bao gồm desktop và mobile Light/Dark của bốn tiện ích, không chứng nhận điện thoại thật. WebKit Windows không tương đương Safari thật.

Manual QA còn mở: người dùng duyệt local/quy tắc tiếng Việt, EVKey/UniKey thật, dán Word/Excel/line ending, clipboard/quyền thật, screen reader, Safari và Android/iOS. Không đóng manual hardware cũ hoặc Final Acceptance. Sau duyệt, chạy lại Linux sạch và Lighthouse ba lượt/trang, Docker trước phát hành theo yêu cầu riêng.

## Tiện ích Milestone 1 đã phát hành — 19/11/2026

Source **7e3dd0b119ef9c59da69f3b244787b9f5a9c1d04**, [CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/44445480650): typecheck/lint/secret scan đạt, **460 unit/39 file**, build 112 trang, **402 E2E đạt/6 skip**, không fail/flaky/global error; E2E 1.174.129,904 ms. Chromium/mobile mỗi 102 đạt, Firefox/WebKit mỗi 99 đạt/3 skip. Sáu skip đều native Permissions-Policy microphone/camera/gamepad; không đổi assertion/retry/timeout để đạt. Native Web Audio ba engine qua backend ảo, không xác nhận thiết bị thật. Nhóm tiện ích **24/24**, hồi quy bàn phím 52 bài; metadata 40 công cụ gốc tiếp tục khớp fixture đã đối chiếu committed HEAD trước milestone.

Docker CI đạt build/health/Nginx/40 route VI/EN trước/sau restart/stop-start, SIGTERM143/OOM false/Error rỗng, Node không publish. Candidate VPS có bằng chứng riêng: 84 route/sitemap 106 trước/sau restart/stop-start, network none/nonroot/read-only; app cũ chỉ được thay sau khi CI và 36 lượt Lighthouse sạch đạt. Không đồng nhất Docker CI với kiểm tra VPS.

Sau chuyển: public HTTP kiểm tra 84 route với H1/canonical/header release/policy, hai trang chủ 42 thẻ, sitemap 106, redirect HTTPS. **28/28 public browser smoke** đạt trên Chromium/Firefox/WebKit/mobile, 221.037,348 ms, không fail/skip/flaky/global error; chọn nhóm tiện ích/đọc chữ/VND/phần trăm/clipboard fixture/a11y/reflow/EVKey/dd. Không chạy lại full 408 trên VPS để tránh tải không cần thiết. Public smoke dùng Windows hiện có, không phải chứng nhận full suite sạch/no-upload; bộ đầy đủ đã chạy trước chuyển trên Ubuntu, gồm cả bài không upload của hai tiện ích. Đã xem ảnh mobile public; không nhận emulation là điện thoại thật.

Audit production lặp lại không có advisory, toàn bộ dependency còn 2 moderate dev tooling. App trực tiếp có CSP, public VI/EN vẫn bị proxy bỏ; không thay proxy hoặc nới policy. Danh sách skip/scope, 72 sample Lighthouse, runtime và rollback nằm ở [QA phát hành](qa/deployment-utilities-2026-11-19.json). Kết quả Windows 380/19/9 vẫn giữ đúng checkpoint trước, không xóa hoặc gán lại là pass. Manual hardware/Safari/screen reader/clipboard/quy cách chứng từ và Final Acceptance còn mở. Các phần dưới lưu lịch sử trước phát hành.

## Source 57a5de2 trên CI sạch và website — 16/11/2026

Source **57a5de29307418c9d060f50e7e1e527bb1626eba**, [CI 43804594079](https://github.com/anhtruc1803/checkall/actions/runs/43804594079) success verify/Docker. Typecheck/lint/secret scan, build 106 trang, 333 unit trên 35 file đạt; full **378 E2E đạt/6 skip**, không fail/flaky/global error, 774.698,232 ms. Không đổi assertion/retry hoặc nhận skip là xác minh quyền native. [Lighthouse lab 43804641819](https://github.com/anhtruc1803/checkall/actions/runs/43804641819) đủ 48 lượt sạch và [public 43807789325](https://github.com/anhtruc1803/checkall/actions/runs/43807789325) đủ 24 lượt sạch; tám trang, ba lượt/trang/nguồn.

CI mỗi project: Chromium 96 pass, Firefox 93 pass/3 skip, WebKit 93 pass/3 skip, mobile 96 pass. Native audio smoke cả ba engine đạt, context closed; đây là backend/thiết bị ảo, không phải âm thanh nghe được hoặc mic/camera thật. Các failure Kaspersky và lỗi context Windows của snapshot local vẫn giữ lịch sử, không tái hiện trong Linux CI của source này.

Docker CI xác minh health/private Node/Nginx/VI-EN/logs/restart/stop-start, SIGTERM 143, OOMKilled=false/Error rỗng. Image trên VPS được build riêng cùng archive/source, thử container cô lập không cổng public rồi mới chuyển; không gán image ID CI cho image VPS.

Public chạy 32 bài: 31 pass/1 fail, không skip/flaky; lỗi duy nhất page.goto WebKit khi chuyển /en/keyboard/tester báo Failed sending data to the peer. Giữ rawlog/trace ban đầu; chạy lại chính bài đó ba lần liên tiếp, workers 1/retries 0: 3 pass/0 fail. Không nhận lượt đầu là 32/32 hoặc tuyên bố nguyên nhân mạng đã sửa. Phạm vi public gồm EVKey/dd, strict D/Backspace/rollback, VI/EN/Dark-Light/a11y/reflow và mở đủ80 trang công cụ ở mỗi browser. WebKit automation không tương đương Safari thật.

Sau chuyển, HTTP health+34 route/quyền, marker/canonical/home/keyboard/privacy VI/EN và sitemap 100 đạt. Origin/public TLS không bỏ qua xác minh chứng chỉ. [QA triển khai](qa/deployment-content-2026-11-16.json) lưu median/từng lượt 72 phép đo và các trạng thái thật. CSP public vẫn thiếu; manual hardware/Safari/screen reader/field data và Final Acceptance còn mở.

## Tinh gọn nội dung toàn website — local 12/11/2026

Đã rà đủ 40 công cụ/80 route VI/EN, rút gọn 170 trường registry và 87 thông báo ở mỗi ngôn ngữ. Bỏ FAQ lặp; giữ hướng dẫn, giới hạn, SEO, quyền, dd/EVKey và privacy. Source uncommitted nền 97fd2eb; fingerprint 24 file và BUILD_ID tại [QA JSON](qa/content-review-local-2026-11-12.json). Không dùng kết quả milestone trước cho source này.

Typecheck/lint/Prettier/secret scan đạt; build 106 trang và **333 unit/35 file** đạt. Lệnh unit cuối dùng --maxWorkers=2, giữ test/timeout/assertion; đầu lượt có 325 pass/8 fail do selector câu cũ và một bài nhiều sự kiện quá thời gian, đã ghi checkpoint riêng. Chỉ sửa câu/nhãn mà assertion tìm, không giảm kiểm tra hành vi.

Full E2E bản cuối chạy đủ 384 bài: **359 pass/19 skip/6 fail**, flaky 0, global error 0; 1.532.870,849 ms. Bốn project, workers 2/retries 0; cấu hình tạm local tương đương project gốc, không thay cấu hình CI. Nhóm nội dung mới **8/8** đạt, mỗi browser mở đủ 80 trang và kiểm tra lịch sử/quyền riêng tư VI/EN. Nhóm bàn phím **52/52** đạt.

| Browser  | Pass | Skip | Fail |
| -------- | ---: | ---: | ---: |
| chromium |   94 |    0 |    2 |
| firefox  |   91 |    3 |    2 |
| webkit   |   80 |   16 |    0 |
| mobile   |   94 |    0 |    2 |

Các failure còn lại: Request từ script Kaspersky chèn ngoài ứng dụng. Full gate vẫn fail; không lọc request hoặc nới assertion để lấy pass. Control HTML trắng không tải mã ứng dụng cũng có script/POST Kaspersky trong lượt này; không suy ra payload request hoặc độ an toàn toàn browser. Lỗi đóng context Firefox của checkpoint trước không tái diễn trong lượt cuối; chưa xác định hoặc sửa nguyên nhân gốc của lỗi trước.

Các skip là điều kiện runtime cũ về native audio/media/policy, không phải bài bị xóa hoặc hardware đã xác minh. WebKit automation không thay Safari thật. Đã kiểm tra HTTP health+34 route/scoped policy; đối chiếu AST registry chỉ đổi copy, locale key/placeholder đủ, engine nhận phím giữ hash của preview trước được người dùng chấp nhận.

Regression mới phát hiện và đã sửa tràn nút xóa dữ liệu ở 320 px/chữ 200%, cụm từ dài của cảnh báo dd; giữ nguyên assertion. Lịch sử hiển thị tên VI/EN thay ID, có fallback cho ID cũ/khóa như **proto**, xóa dữ liệu ứng dụng vẫn giữ khóa ngoài phạm vi. Đã xem ảnh Light desktop, Dark mobile và chữ 200%. Raw log/ảnh/trace ở artifacts bị ignore; QA JSON chỉ aggregate, không URL/sessionID của vendor.

Chưa đo Lighthouse sạch mới hoặc xác nhận mobile≥90; control vẫn có chèn Kaspersky. Chưa kiểm chứng lại thiết bị/bộ gõ/Safari thật/screen reader. Chưa commit/push/triển khai hoặc đổi hạ tầng. Final Acceptance tiếp tục mở. Chi tiết: CONTENT-REVIEW.md.

## Cảnh báo dd trên B01 — bản local cuối 12/11/2026

Đã bổ sung lưu ý dd → đ luôn hiển thị và lời nhắc sau hai keyup D đủ điều kiện, VI/EN ở cả chế độ thường và tương thích. Không dùng lời nhắc làm số lần nhấn vật lý. Source chưa commit, nền 97fd2eb; fingerprint tám file source/test và BUILD_ID tại [QA cảnh báo dd](qa/keyboard-dd-warning-local-2026-11-12.json). Đây là checkpoint mới hơn bản EVKey 328 unit/48 E2E phía dưới; giữ nguyên bằng chứng cũ thay vì gán lại cho source mới.

Đã chạy:

- `pnpm typecheck`, `pnpm lint`, `pnpm build`: đạt; build 106 trang.
- `pnpm test`: **333/333 unit đạt**, 35 file. Nhóm `pnpm exec vitest run tests/keyboard-release.test.tsx`: **28/28 đạt**.
- `pnpm exec playwright test --config artifacts/playwright.keyboard-dd.config.mts`: **52/52 E2E bàn phím đạt**, không fail/skip/flaky, không global error; 321097.852 ms. Chromium/Firefox/WebKit/mobile Chromium mỗi cấu hình 13 pass. Config trong artifacts chỉ chọn bốn file keyboard hiện có và bốn cấu hình tương đương cấu hình gốc; không sửa config CI hoặc hạ assertion. Một lượt chuẩn bị 13 pass chỉ dùng project mặc định chưa đủ ma trận; chỉ lượt cuối 52 bài được dùng làm kết quả đa browser.
- `node scripts/smoke-http.mjs http://127.0.0.1:3100`: health + 34 route VI/EN và scoped policy đạt. Secret scan không finding; Prettier bảy file của lượt này đạt.

Regression mới kiểm tra một D chưa cảnh báo, hai sự kiện thả D có nhắc, strict vẫn đúng hai press trong input browser có đầy đủ cặp; tương thích chỉ nhận một mã chữ, không có bộ đếm nhấn/giữ và không đánh dấu Backspace. Loại repeat, phím xen giữa, shortcut, composition/229/231/Process/Unidentified/mã thiếu; không ghép chuỗi qua Stop/Tab/Esc/blur/hidden/phiên mới. Reset/đổi mode xóa nhắc; thiếu D thứ hai do IME vẫn đọc được lưu ý cố định, engine thường tiếp tục dừng/rollback như trước. B02–B05 tiếp tục hồi quy cũ. Kiểm tra cảnh báo role=status, Axe WCAG trong VI/EN/Dark-Light, 320 px/chữ 200%; bộ hiện có giữ reflow đến 1440 px và heading-order. Đã xem ảnh VI mobile phần hướng dẫn Light và cảnh báo Dark; raw ảnh/trace/JSON ở artifacts bị ignore.

Không chạy lại full E2E toàn bộ website cho thay đổi cảnh báo B01; full suite checkpoint trước vẫn có 345 pass/18 skip/9 fail và không được nhận là pass. Chưa đo Lighthouse sạch mới hoặc xác nhận ≥90; không coi kết quả keyboard E2E là khắc phục môi trường Kaspersky/context Firefox. Manual EVKey trên giao diện mới và Safari thật chưa xác nhận; browser automation không xác nhận số lần nhấn phần cứng. Chưa push hoặc cập nhật website, Final Acceptance tiếp tục mở.

## EVKey keyup cho B01 — bản local 12/11/2026

Source chưa commit, nền 97fd2eb; fingerprint bảy file source/test và BUILD_ID tại [QA JSON](qa/keyboard-release-local-2026-11-12.json). Không dùng CI hoặc số đo của source cũ nhận đây là source mới đã nghiệm thu. Không push/triển khai.

Typecheck/lint/build 106 trang đạt; **328 unit/35 file** đạt, nhóm bàn phím 55/55. E2E mới **12/12** bốn cấu hình, không skip/fail/flaky, 93150.081 ms. Trong full E2E, cả **48/48 bài bàn phím** đạt. Bao gồm VI/EN/Dark-Light/heading-order/WCAG tự động/320–1440 px/chữ 200%, source keyup rõ, không đếm nhấn/giữ, không nhận Backspace, code thiếu/231/229/Process/composition/repeat, giữ chế độ cũ, Reset/đổi mode/layout, Tab/Esc/Stop/blur/hidden/unmount và privacy. Không đổi assertion/skip của bộ test hiện có.

Full local chạy đủ 372 bài: **345 pass, 18 skip, 9 fail**, flaky 0, 1217309.841 ms. Chưa đạt full gate.

| Cấu hình | Pass | Skip | Fail |
| -------- | ---: | ---: | ---: |
| chromium |   91 |    0 |    2 |
| firefox  |   86 |    2 |    5 |
| webkit   |   77 |   16 |    0 |
| mobile   |   91 |    0 |    2 |

Sáu failure thuộc camera/gamepad no-upload trên Chromium/Firefox/mobile: assertion thấy requestPOST từ script Kaspersky bên ngoài. Control chỉ HTML trắng, không script/mã Device Lab, cũng phát sinh script/POST Kaspersky. Không lọc request hoặc tắt bảo vệ Windows để lấy pass. Ba failure khác là Browser.removeBrowserContext/\_maybeDontRestoreTabs khi teardown Firefox ở nhóm microphone. Chạy riêng ba bài trên cùng build: 2 pass/1 skip, không lỗi đóng context, 7692.802000000001 ms; không dùng lượt riêng xóa failure của full suite, chưa khẳng định nguyên nhân gốc. Bài native microphone policy vẫn chưa xác minh trên runtime không có introspection.

18 skip theo điều kiện có sẵn trong test: Firefox 2, WebKit 16 (native policy/media/Web Audio không khả dụng). Native audio smoke Chromium/Firefox pass; Windows WebKit không có AudioContext, assertion smoke fail. Không coi skip là enforcement/playback đã xác minh, hoặc WebKit là Safari thật.

Replay hai trace khảo sát người dùng ở ba browser đạt 6/6; chỉ KeyD có nguồn keyup, progress 1/26, không badge/count/hold hoặc Backspace giả. Replay dùng event constructor, không phải live hardware mới. Manual UI mới đang chờ phản hồi; không chứng nhận mọi phím A–Z/mọi phiên bản EVKey. Đã xem ảnh local Light/mobile, HTTP smoke health+34 route VI/EN/policy đạt. Raw log/trace chỉ trong artifacts bị ignore; QA JSON chỉ aggregate, failure đã bỏ URL/session identifiers của vendor.

Lighthouse local bị loại vì script ngoài origin; không có median sạch hoặc xác minh ≥90 cho source này. Cần môi trường sạch và đối chiếu manual trước nghiệm thu rộng; xem PERFORMANCE.md/KEYBOARD-EVKEY-COMPATIBILITY.md.

## Sửa D/Backspace và giao diện — source 3191485, 11/11/2026

[CI 42991483325](https://github.com/anhtruc1803/checkall/actions/runs/42991483325) success verify/Docker: build 106 trang, typecheck/lint/secret scan, **305 unit trên 34 file, 354 E2E pass/6 skip**, không failure/flaky. Chromium/mobile 90 pass mỗi cấu hình; Firefox/WebKit 87 pass và 3 skip native microphone/camera/gamepad policy mỗi cấu hình. E2E 937530.787 ms; Docker job 84 giây, health/private Node/Nginx/34 route-policy/restart/stop-start đạt. Shutdown SIGTERM 143, OOM false/Error rỗng; trạng thái health sau khi container dừng không phải health đang chạy. Native audio smoke ba browser pass và context closed, không phải loa/microphone thật.

Local bản cuối: toàn bộ 305 unit/nhóm bàn phím 32, regression mới 8/8 (80837.953 ms), bộ bàn phím 36/36 (274237.126 ms). Trên HTTPS public đúng source 3191485: **24/24 pass**, không skip/flaky/failure (106732.597 ms), Chromium/Firefox/WebKit. Đã xem ảnh UI Light/Dark/mobile từ domain. Giữ 40 công cụ, 80 route công cụ và 100 URL sitemap.

Ca mới kiểm tra D ba lần, Backspace thật tách riêng, auto-repeat/maximum/hold rollback, Backspace trước unknown, IME 229 khi isComposing=false, compositionstart, Process, key/code Unidentified, bỏ 22 Backspace tiếp sau dừng, giữ lượt trước và retry. Checkpoint Chatter kiểm tra copy histogram độc lập. Có Axe cảnh báo VI/EN Dark/Light, hình học focus/hint; giữ bộ năm công cụ responsive/chữ 200%/heading-order và privacy/cleanup hiện có. Raw inspector giữ keyCode, key/code/isComposing không sửa thành dữ liệu tưởng tượng.

Các fixture có chú thích; không xác nhận UniKey/EVKey/keyboard vật lý. Lượt đầu vướng selector alert trùng Next.js; đã scope cảnh báo riêng. Rà tiếp phát hiện Firefox không luôn áp dụng focus-visible sau click, sửa focus cho vùng capture thay vì bỏ assertion. Một timeout WebKit xảy ra khi hai suite chạy đồng thời; bài hai locale/bốn Axe có timeout 90 giây, giữ đủ assertion. Kết quả checkpoint không thay thế run cuối. Manual QA cụ thể tại KEYBOARD-IMPROVEMENTS.md; Safari/IME thật/screen reader/OS zoom và Final Acceptance tiếp tục mở.

[Lighthouse public 42994636551](https://github.com/anhtruc1803/checkall/actions/runs/42994636551): chín lượt sạch đúng source 3191485, median **95/96/95** cho /vi, /vi/keyboard/tester, /en/keyboard/events; mọi lượt 93–96, A/BP/SEO 100. Kết quả thật và giới hạn tại [QA JSON](qa/keyboard-input-method-2026-11-11.json).

## Cải tiến bàn phím — 11/11/2026

Source 4e26811: [CI 42983550339](https://github.com/anhtruc1803/checkall/actions/runs/42983550339) success verify/Docker. Build 106 trang/typecheck/lint/secret scan, **292 unit trên 34 file và 346 E2E đạt/6 skip**, không failure/flaky. Chromium/mobile 88 đạt mỗi cấu hình; Firefox/WebKit 85 đạt/ba skip native microphone/camera/gamepad policy mỗi cấu hình. Full E2E 941394.031 ms. Không dùng CI bị hủy của7b/db hoặc local snapshot cũ nhận source mới đã nghiệm thu.

Kiểm tra bao phủ: native keydown/keyup/repeat, Exit không tự kích hoạt lại sau blur, Tab/Esc, coverage theo layout/ngoài layout, max combination thực nhận, Chatter vượt200 sự kiện/xóa log không mất aggregate, không nối cặp qua gián đoạn, ngưỡng và orphan/duplicate, các cờ event nguyên bản, IME/code thiếu fixture rõ, filter local, timer/hidden/unmount/giới hạn bộ nhớ. Unit storage/fetch spies xác nhận component không tự ghi/gửi phím; không suy rộng thành mọi request browser đều trống.

Local functional snapshot db28/28 đạt (206467.946 ms); sau sửa heading, bốn bài bao phủ đủ 5 tool/VI-EN/Dark-Light/WCAG+heading-order/zoom200%/responsive đạt4/4 (204373.368 ms). Full CI source cuối đã chạy cả các ca chức năng và heading. Fixture IME/clock/code không khả dụng không phải phần cứng thật; isTrusted=true của automation không chứng nhận phím vật lý.

Public keyboard **18/18 đạt** trên Chromium/Firefox/WebKit, không skip/failure/flaky, 61862.528 ms. Không coi WebKit là Safari thực tế hoặc skip native policy là enforcement đã xác minh. Native browser input kiểm tra Stop và các trường sự kiện; không test keyboard phần cứng. Docker CI job81 s: healthy/Nginx/34 route/policy ba checkpoint/private Node port/restart/stop-start, SIGTERM 143/OOM false/Error rỗng. Đã đọc JSON/log/native audio smoke context đóng; không thay engine audio/camera/gamepad.

Lighthouse cuối 42 lượt cùng VM và 21 lượt public, median≥90 đủ 7 trang, A/BP/SEO 100; số đo và môi trường tại PERFORMANCE.md/qa/keyboard-2026-11-11.json. Production audit 0 finding; audit toàn bộ còn 2 moderate dev tooling. Manual hardware/IME/Safari/screen reader/OS zoom còn mở ở KEYBOARD-IMPROVEMENTS.md. Final Acceptance chưa đóng.

## Chọn công cụ theo vấn đề — 10/11/2026

Source ca2344f: [CI 42790611051](https://github.com/anhtruc1803/checkall/actions/runs/42790611051) success verify/Docker. Build 106 trang/typecheck/lint/secret scan, 275 unit trên 33 file và 330 E2E đạt/6 skip, không failure/flaky. Local mới 8/8 và public 6/6 đạt; giữ đủ 40 công cụ/VI-EN. Không nhận WebKit là Safari thật hoặc skip native policy là enforcement đã xác minh. E2E toàn bộ 762292.843 ms; Chromium/mobile mỗi cấu hình 84 đạt, Firefox/WebKit 81 đạt/ba skip native microphone/camera/gamepad policy. Unit/native audio smoke đều giữ bộ kiểm tra hiện có, không đổi engine hoặc nới assertion.

Bộ mới kiểm tra ba dấu hiệu/hai link mỗi dấu hiệu ở cả VI/EN: Enter mở đúng sáu route và có workspace, keyboard capture còn idle, spy không có gọi getUserMedia trước Start. Spy chỉ xác nhận không tự yêu cầu capture, không kiểm chứng microphone thật. Có kiểm tra semantic region/heading/link, Axe hai theme, 320/375/768/1024/1440 px/chữ100–200%, reduced motion, target≥44 px và Tab order đủ sáu link.

Local đầu 7 đạt/một lỗi WebKit Windows: Tab bỏ anchor tự nhiên tới input. Debug Tab/Alt+Tab xác nhận, tabindex=0 rõ trên link khắc phục; đã sửa code và giữ assertion. Local cuối 8/8 đạt, 91483.840 ms, không skip/failure/flaky. Public 6/6 trên Chromium/Firefox/WebKit, 131672.631 ms, không skip/failure/flaky; không thay full CI bằng public smoke.

Docker Linux CI đã đọc containers/logs/shutdown: healthy, Nginx/34 route/policy ba checkpoint, private Node port, restart/stop-start, SIGTERM 143/OOM false/Error rỗng. Production audit 0 finding; toàn bộ vẫn hai moderate dev glob/minimatch, không thêm dependency. Lighthouse mới 42 lượt cùng VM/21 lượt public giữ median≥90 cả bảy trang; số đo tại PERFORMANCE.md/qa/problems-2026-11-10.json.

Manual còn Safari/điện thoại thật/screen reader/OS zoom và quyền microphone trên thiết bị thật; xem UI-UX-REFRESH.md cùng ma trận từng milestone. Không đóng Final Acceptance tổng thể.

## Performance giao diện mới — 10/11/2026

Source ad25dd1: [CI 42775890687](https://github.com/anhtruc1803/checkall/actions/runs/42775890687) success verify/Docker, build 106 trang/typecheck/lint/secret scan và **275 unit/33 file đạt**. **318 E2E đạt/6 skip**, không failure/flaky, 668827.891 ms. Chromium/mobile mỗi cấu hình 81 đạt, Firefox/WebKit 78 đạt/ba skip native policy; giữ toàn bộ 324 bài/40 công cụ/80 route công cụ. Không coi WebKit là Safari thật hoặc skip là enforcement đã đạt.

Nhóm UI local source tối ưu **44/44 đạt**, không skip/failure/flaky, 183267.522 ms; ba UI public Chromium/Firefox/WebKit **3/3 đạt**, 38789.722 ms. Sau triển khai app healthy/private Node port, smoke health + 34 route/policy, canonical/sitemap 100 URL và CSS/release marker đúng. Docker CI job 77 giây kiểm tra ba checkpoint, restart/stop-start, SIGTERM 143 không OOM/Error; artifacts đã đọc.

Lighthouse Linux: 18 lượt baseline đầu và 36 lượt so sánh trước/sau cùng VM đều sạch; sau có median 100/100/100/99/99/99. HTTPS public sau chuyển release 18 lượt sạch, median 95/98/97/97/96/97, mọi lượt ≥95. Mỗi lượt profile mới/extension tắt, mobile simulated/RTT 150 ms/1638,4 Kbps/CPU ×4; public xác minh TLS và nội dung app thật, không dùng trang challenge làm kết quả. Chi tiết số thực/điều kiện tại PERFORMANCE.md và qa/performance-ui.json; hồi quy tại qa/performance-validation.json.

Smoke riêng kiểm tra harness Windows /en giữ đủ 88/97/89, median 89; CPU/TBT khác runner Linux và SEO 92 do origin QA khác SITE_URL, không nhận Windows ≥90. Không dùng nhóm này tính mức tăng trước/sau. Hardware/Safari/screen reader/field data và các mục bảo mật/tooling cũ còn mở; Final Acceptance vẫn chưa hoàn tất. Không chạy Lighthouse đồng thời build/E2E trong VM đo hoặc tạo số phần cứng giả.

## Nâng cấp UI/UX — 10/11/2026

Thêm interface.spec.ts: shortcut và count lấy theo registry trong VI/EN; filter/search/clear giữ category và trả focus; hai theme ở 320/375/414/768/1024/1440 px; tăng chữ 200%, reduced motion và keyboard activation. Giữ toàn bộ bài cũ; bộ đầy đủ hiện 324 E2E (81/cấu hình). Không sửa engine hoặc nới assertion để đổi giao diện.

Checkpoint ban đầu: 275 unit/33 file, build 106 trang, typecheck/lint đạt. Lượt Chromium interface + quality 7 đạt/một lỗi reflow shortcut khi chữ 200%; đã sửa auto-fit/minmax theo rem, chạy lại ba bài interface đạt. Full E2E khi đổi phiên bị gián đoạn, không có report cuối. Source 49bd12f đạt 92 local; source 27f1383 bị 19 lỗi accessibility trong CI, lịch sử/nguyên nhân/sửa được giữ tại PROGRESS.md.

**Kết quả cuối source 387c03f:** [CI 42759176453](https://github.com/anhtruc1803/checkall/actions/runs/42759176453) đạt build/typecheck/lint/secret scan, 275 unit/33 file; **318 E2E đạt/6 skip**, không failure/flaky, 681819.829 ms. Chromium/mobile mỗi cấu hình 81 đạt, Firefox/WebKit mỗi cấu hình 78 đạt/ba skip native policy. Không giả skip thành enforcement đã đạt. Nhóm local sau sửa logo và tương phản theme **32/32 đạt** trên bốn cấu hình, 316821.173 ms, gồm toàn bộ ma trận accessibility từng lỗi; giữ assertion.

Docker CI source cuối đạt 87 giây: healthy/private Node port/Nginx/health + 34 route/policy ba checkpoint, restart/stop-start và SIGTERM 143, không OOM/Error. Đã đọc artifacts. Sau triển khai VPS: HTTP smoke 34 route/policy đạt; public HTML/CSS release mới, canonical, sitemap 100 URL và HTTPS đạt; **ba UI E2E public đạt** trên Chromium/Firefox/WebKit, không skip/failure/flaky, 38009.247 ms. Public smoke không thay full CI hoặc Safari/thiết bị thật. CSP public vẫn thiếu; không chỉnh dashboard proxy của người dùng. QA tổng hợp tại [qa/ui-ux-refresh.json](qa/ui-ux-refresh.json), manual QA tại UI-UX-REFRESH.md. Final Acceptance còn mở.

## Smoke staging ngày 06/11/2026

Release fca62c6 đã build/chạy Docker trên VPS theo yêu cầu, tại https://nguyenanhtruc.io.vn. Không thay code hoặc assertion của ứng dụng. `node scripts/smoke-http.mjs https://nguyenanhtruc.io.vn` đạt health + 34 route VI/EN và scope Permissions-Policy, chạy lại đạt sau restart app. Nginx syntax/health/Node port private đạt; Certbot renewal dry-run kèm deploy hook đạt. HTTP → HTTPS 308, canonical VI/EN đúng và sitemap 100 URL duy nhất cùng domain.

Nhóm E2E public: `shell.spec.ts`, `screen.spec.ts`, `keyboard.spec.ts`, `mouse.spec.ts`, cấu hình tạm không khởi động webServer local, hai worker và ba project. **45 đạt**, Chromium/Firefox/WebKit mỗi browser 15, không skip/failure/flaky, 114678.238 ms. Bao gồm navigation các route công cụ, locale/theme/responsive, Refresh Rate/fullscreen, keyboard và mouse. Đây là smoke qua domain thực, không thay bộ 306 E2E M6 trên CI và không xác minh camera/microphone/gamepad vật lý hoặc Safari thật. Các giới hạn môi trường Windows/Kaspersky đã ghi ở checkpoint M6 vẫn còn; không suy ra privacy sạch chỉ từ smoke staging này.

Lượt harness đầu nhập base config sai dạng module: 14 đạt/một lỗi 503 từ rate limit, chỉ một project/sáu worker. Sau khi sửa harness thành ba project/hai worker, chạy lại 45 đạt; không đổi rate limit hoặc giảm assertion. Raw log/JSON ở artifacts bị ignore, bản tổng hợp không chứa credential tại [qa/staging-2026-11-06.json](qa/staging-2026-11-06.json).

CSP **có ở origin nhưng thiếu ở response public** khi đo lại 15:58 Asia/Saigon, kể cả URL có query mới. Người dùng tự quản lý proxy/tên miền; không chỉnh dashboard và không đánh dấu tiêu chí này đạt. Scoped Permissions-Policy public được kiểm tra độc lập, không chứng minh mọi browser enforce directive. Chưa chạy Lighthouse mới, reboot host, rollback release cũ hoặc manual hardware QA. Final Acceptance tiếp tục mở.

## Checkpoint M6 trước staging

Milestone hiện hành: Phase 2 Milestone 6 (05/11/2026). Checkpoint cục bộ build/typecheck/lint và 275 unit/integration trên 33 file đạt. [CI 41984091737](https://github.com/anhtruc1803/checkall/actions/runs/41984091737) source 76a71ce: 306 E2E đạt/6 skip native policy, không failure/flaky; 612200.268 ms, tổng 312 bài (78/cấu hình). Local M6 43 đạt/hai skip/ba lỗi do request Kaspersky chèn; không tính là môi trường sạch. Native discovery/fallback và native policy tách khỏi fixture nút/trục/drift. Fixture/Playwright Clock không phải phần cứng hoặc native gamepad injection. Axe VI/EN hai theme/idle-running-disconnected, responsive/keyboard/document navigation. Kết quả/source/skip/CI thật ghi cuối PROGRESS.md và qa/phase2-milestone6.json; manual QA trong PHASE2-MILESTONE6.md.

Checkpoint lịch sử: Phase 2 Milestone 5 (05/11/2026). Bộ hiện tại 234 unit/integration trên 30 file; [CI 41956011535](https://github.com/anhtruc1803/checkall/actions/runs/41956011535) source f260bfd: 260 E2E đạt/4 skip, không failure/flaky, trong 374144.780 ms; tổng 264 (66/cấu hình). Chromium/mobile mỗi cấu hình 66 đạt; Firefox/WebKit mỗi cấu hình 64 đạt/hai skip native policy. Local nhóm M5: 38 đạt/ba skip/ba lỗi assertion do request Kaspersky chèn, không tính là môi trường sạch. Giữ hồi quy 34 công cụ cũ, thêm 11 bài camera/cấu hình. Native getUserMedia dùng camera ảo, video/getSettings/rVFC thật; fixture riêng kiểm tra lỗi/pending/playback/lifecycle, không thay native capture. Axe toàn trang VI/EN hai theme, idle/running/error, responsive và keyboard. Windows WebKit thiếu mediaDevices ghi skip riêng; CI yêu cầu native API. Native header enforcement khi runtime không expose policy API ghi skip riêng, không coi là đạt. Chi tiết phương pháp/manual QA ở [PHASE2-MILESTONE5.md](PHASE2-MILESTONE5.md). Kết quả cuối từng lượt/source/CI ở PROGRESS.md và qa/phase2-milestone5.json.

## Phase 2 Milestone 4 — 05/11/2026

Cập nhật sau checkpoint: bộ mở rộng 220 E2E (55/cấu hình), native capture và native header enforcement là hai bài độc lập. Firefox không expose policy API và probe vẫn capture khi header khai báo microphone=(); đối chiếu [Mozilla bug 1694922](https://bugzilla.mozilla.org/show_bug.cgi?id=1694922). Capture/Stop và analyser vẫn bắt buộc chạy. Bài native header enforcement ghi skip theo capability khi browser chưa triển khai; không tính skip là tiêu chí bảo mật đã đạt. Header scope HTTP/Nginx và nhánh policy của ứng dụng vẫn được kiểm tra. Yêu cầu native Web Audio trên CI giữ nguyên. InputSession bổ sung kiểm tra readyState khi track ended nhưng không có event; kết quả cuối ở PROGRESS/JSON.

Bộ unit hiện 194 bài trên 27 file; kiểm tra InputSession, thuật toán RMS/FFT, permission/media failures, late grant/denial/resume, lifecycle/StrictMode và policy navigation. Mười hai E2E mới mỗi cấu hình, tổng 220 (55/cấu hình), giữ hồi quy 32 công cụ cũ. Kiểm tra policy tất cả non-media tool routes, capture native với input ảo, analyser native từ MediaStream tổng hợp 1 kHz, Stop/Reset/revocation/mute/ended/late cleanup và chuyển document qua catalog/related/search. Không gán tín hiệu QA thành số đo phần cứng.

Axe hai theme cho chạy/lỗi/fallback; responsive VI/EN 320/375/414/768/1024/1280 px. WebKit Windows thiếu Web Audio phải ghi skip native riêng, không giả API để báo capture đạt; CI bắt buộc native API. WebKit automation và Chromium mobile emulation không thay Safari/thiết bị thật. Manual QA và nguồn phương pháp ở [PHASE2-MILESTONE4.md](PHASE2-MILESTONE4.md). Kết quả/source/CI cuối ở PROGRESS.md và qa/phase2-milestone4.json; các đoạn M3 bên dưới là lịch sử.

Kết quả cuối source 8f6e773: [CI 41949819465](https://github.com/anhtruc1803/checkall/actions/runs/41949819465) success, 194 unit/27 file; 218 E2E đạt, hai skip native policy, không failure/flaky. Chromium/mobile đều 55; Firefox/WebKit đều 54 + một skip. Native capture/analyser/lifecycle chạy đủ cả bốn cấu hình; skip không tính là tiêu chí chặn policy đã đạt. JSON và annotations đã đọc. Local M4 cuối 41 đạt/bảy skip (WebKit Windows thiếu native audio, Firefox policy thiếu API); không tuyên bố toàn bộ 220 đạt cục bộ. Chi tiết timing/source/attempts ở qa/phase2-milestone4.json.

## Phase 2 Milestone 3 — 30/10/2026

Ba công cụ Speaker/Stereo/Frequency Generator dùng Web Audio thật. Bộ unit/lifecycle mở rộng thêm validation/Nyquist, stereo graph, timer/late resume/cleanup và StrictMode; E2E thêm chín bài mỗi cấu hình, tổng 172 (43 × Chromium/Firefox/WebKit/Chromium mobile). Automation phát ở mức 0, xác minh API/graph/lifecycle, không xác nhận nghe được hoặc stereo vật lý. Axe chạy ba công cụ ở Dark/Light; responsive VI/EN ở 320/375/414/768/1024/1150/1280 px. Toàn bộ hồi quy Phase 1/M2 được giữ. Chi tiết và manual QA ở [PHASE2-MILESTONE3.md](PHASE2-MILESTONE3.md); số đạt/source/CI cuối ở PROGRESS.md và qa/phase2-milestone3.json. Các kết quả M2 bên dưới là checkpoint lịch sử.

WebKit Windows hiện không expose AudioContext hoặc webkitAudioContext (probe trực tiếp); bảy bài cần playback thật ghi skip có lý do, không giả API để báo đạt. Có bài fallback riêng cho cả ba công cụ ở VI/EN, hai theme và responsive. Trên CI, thiếu native AudioContext làm test fail trước khi có thể skip; cần đủ 172 bài không skip để xác nhận graph thật đa browser. WebKit automation vẫn không tương đương Safari thật.

CI Linux audio cần backend output: workflow cài/chạy PulseAudio và tạo null sink hai kênh, không cần thiết bị thật. scripts/smoke-audio.mjs kiểm tra resume, graph mức 0 và close bằng native API của ba browser trước E2E; nếu backend không hoạt động, gate thất bại và lưu artifacts/audio-smoke/results.json. Không thay bằng mock hoặc bỏ bài phát âm. CI 41026457800 trước cấu hình backend đạt 166/172, sáu lỗi Firefox resume pending; sau cấu hình, CI 41027637979 source 1066568 đạt 172/172, mỗi cấu hình 43/43, không skip/flaky; native audio smoke ba browser đạt.

Kết quả cuối: build/typecheck/lint, 146/146 unit (23 file), 172/172 E2E trên [CI source 1066568](https://github.com/anhtruc1803/checkall/actions/runs/41027637979); E2E 333755,564 ms. Đã đọc JSON và xác nhận Chromium/Firefox/WebKit/mobile đều 43/43, không skip/flaky. Local 146 unit cuối đạt; hồi quy build eea659e 165 đạt/bảy skip, nhóm audio build deadline 2bd1020 29 đạt/bảy skip. Các skip đều do WebKit Windows không có native API, đã được CI Linux kiểm tra đủ; không gọi là 172 bài đạt cục bộ. Chi tiết nguồn/bằng chứng ở qa/phase2-milestone3.json.

## Phase 2 Milestone 2 — 30/10/2026

Tám công cụ mới có readers/thuật toán tách khỏi UI. Bộ unit/lifecycle hiện 118 bài trên 21 file; E2E mở rộng từ 24 lên 34 bài mỗi cấu hình, tổng 136 bài dự kiến. Số đạt thực và run/commit cuối nằm ở cuối PROGRESS.md, không suy ra đã đạt chỉ từ số bài dự kiến.

Kiểm tra mới: device/browser đọc chủ động và Reset; GPU không tự tạo context, opt-in driver details, WebGL 2/1/lost/blocked và cleanup; Web Storage ghi/đọc/xóa đúng khóa riêng, collision/cleanup failure, estimate/persisted thiếu hoặc lỗi; pointer thật, path break/buffer cap, hit/miss và giới hạn tác vụ; timer/blur/hidden/unmount/Fullscreen late request/ownership/ResizeObserver/pointer capture cleanup. Failure fixtures dùng dữ liệu kiểm thử xác định, không phải số đo phần cứng.

E2E vẫn giữ 21 engine Phase 1 và 42 route cũ, kiểm tra tổng 58 route công cụ/72 URL nội dung, 11 draft còn lại không public. Bổ sung tám engine, thao tác click/move/touch mà browser automation nhận thực, primary mouse scoring, keyboard không tạo điểm giả, storage không xóa dữ liệu khác, GPU/storage fallback. Published non-media pages được theo dõi getUserMedia/permissions.query và header, kể cả sau thao tác đọc snapshot.

Axe chạy tám trang mới ở Dark/Light; responsive kiểm tra 320/375/414/768/1024 px và language switch giữ route. Fullscreen chỉ thử vào/thoát khi browser hỗ trợ, nếu không phải có fallback. Không coi WebKit automation hoặc Chromium iPhone emulation là Safari/thiết bị cảm ứng thật. Ma trận manual chi tiết ở [PHASE2-MILESTONE2.md](PHASE2-MILESTONE2.md).

**Kết quả cuối source 097404e:** local 118/118 unit trên 21 file và 136/136 E2E (340325,84 ms); CI [41007493526](https://github.com/anhtruc1803/checkall/actions/runs/41007493526) success cả verify và docker-smoke, cùng 118 unit/136 E2E (224967,275 ms). Mỗi cấu hình 34/34, không skip/flaky. Đã tải [browser-qa JSON](https://github.com/anhtruc1803/checkall/actions/runs/41007493526/artifacts/12956800342) và đối chiếu thống kê. Lượt đầu local 135/136 do tọa độ mobile nằm ngoài viewport, được sửa bằng scrollIntoView và assertion viewport, không giảm số mẫu/quãng đường cần nhận. Sau sửa, toàn bộ source cuối đã chạy lại đạt.

## Tự động

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm exec playwright install chromium firefox webkit
pnpm build
pnpm test:e2e
```

Playwright hiện có bốn cấu hình: `chromium`, `firefox`, `webkit` và `mobile` (Chromium giả lập iPhone). Chạy riêng bằng `pnpm exec playwright test --project=firefox` hoặc `--project=webkit`. **WebKit automation trên Windows/Linux không phải kiểm tra Safari thật trên macOS/iOS.**

Ngoài các luồng tương tác, `registry.spec.ts` lần lượt mount đủ 21 engine/capability fallback và kiểm tra HTML ban đầu có giao diện inert trước hydration. `lifecycle.test.tsx` kiểm tra cleanup các RAF, ResizeObserver, timers và listeners. Bài Polling Rate dùng cửa sổ 20 giây để chuỗi mouse automation không chạy hết thời gian trên WebKit chậm; vẫn yêu cầu mẫu thực, kết quả hợp lệ, Stop và Reset.

## Kết quả rà soát ngày 29/10/2026

- Windows production standalone: 29/29 unit/integration tests, 88/88 E2E (22 bài cho mỗi cấu hình), typecheck/lint/build đạt.
- Sau sửa background transition của nút, lặp riêng axe WebKit ba lần: 3/3 đạt trên năm trang × hai theme. Không tắt color-contrast hoặc bỏ phần tử khỏi audit.
- Job verify Linux của [run 40816398723](https://github.com/anhtruc1803/checkall/actions/runs/40816398723) đạt 29 unit và 88 E2E, gồm axe hai theme, trong 1,7 phút E2E. Toàn run này vẫn fail do assertion Docker exit 0 sai với Next.js; không gán nhãn toàn pipeline đạt.
- CI cuối [40816709418](https://github.com/anhtruc1803/checkall/actions/runs/40816709418), commit d82120b: **cả verify và docker-smoke success**; 29 unit, 88 E2E (22/22 mỗi cấu hình, 2,2 phút E2E), typecheck/lint/secret scan/build đạt. Docker smoke đầy đủ đạt; bằng chứng ở qa/docker.json và artifact Docker. E2E thành công được lưu trong job logs; trace chỉ giữ khi fail nên bước upload browser có cảnh báo không có file trong lượt toàn bộ đạt.
- Bộ Lighthouse sạch cuối có ba lượt cho mỗi trang; Performance chưa đạt 90. Dữ liệu trước/sau và revision đo ở PERFORMANCE.md.

Fullscreen chỉ được thử nhánh vào/thoát khi API khả dụng. Refresh dùng RAF thật của browser; input tests dùng event automation thật mà browser nhận, không suy ra tần số panel hoặc USB. Safari thật, giao diện màn hình thử màu, cảm ứng nhiều ngón, tổ hợp phím hệ thống và screen reader vẫn cần manual QA.

Playwright chạy production server nếu chưa có server tại `http://localhost:3000`. Khi development server đang chạy, cấu hình sẽ dùng lại server đó; dừng dev trước khi đo production. `localhost` cần thiết trong môi trường Windows hiện tại vì HMR qua 127.0.0.1 bị reset. Bản release phải chạy E2E trên production build.

Vitest dùng dữ liệu tổng hợp xác định cho aspect ratio, PPI, frame intervals, pointer rate, chatter, double click và CPS. Kiểm thử tích hợp kiểm tra validation và vòng đời tài nguyên. E2E không chứng minh phần cứng thực.

## Ma trận phần cứng cần làm thủ công

Các mục dưới đây **chưa được xác minh bằng phần cứng thực**, không được đánh dấu đạt chỉ dựa trên automation.

| Thiết bị                   | Thao tác                                            | Cần ghi nhận                                                        |
| -------------------------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| Màn hình 60/120/144 Hz     | Chạy A05 ba lượt 10 giây khi tab ở phía trước       | Median, độ lệch chuẩn, tải CPU, OS, browser, màn hình đang dùng     |
| Nhiều màn hình / scaling   | Di chuyển cửa sổ, đổi scaling và zoom               | CSS dimensions, viewport, DPR, khác biệt native resolution          |
| LCD / IPS / OLED           | A06–A09 toàn màn hình, phòng sáng và tối            | Người quan sát ghi chú; không tự chẩn đoán pixel/hở sáng            |
| Màn hình gaming            | A10 ở nhiều tốc độ, tương phản và hướng             | Vệt bóng quan sát được, frame timing; không suy ra GTG/MPRT         |
| Thiết bị cảm ứng           | 1, 2, 5 và nhiều ngón; pointercancel; xoay màn hình | Dấu chạm, số active, trail và reset                                 |
| Bàn phím ANSI / ISO        | Từng phím, các layout, numpad và modifier           | code nhận được, tổ hợp bị OS chặn                                   |
| Bàn phím cơ / laptop       | Hold, auto-repeat, nhiều phím, nhấn nhanh           | Phân biệt repeat/chatter; mất focus xóa held; không chứng nhận NKRO |
| Chuột 3/5 nút              | Từng nút, nhấp đơn/đôi, giữ rồi kéo ra ngoài        | Counter, release, pointercancel, context menu trong/ngoài vùng thử  |
| Chuột có polling khác nhau | C05 nhiều lượt, di chuyển liên tục                  | Coalesced support, mẫu hợp lệ; không xác nhận USB polling rate      |
| Con lăn / touchpad         | Cuộn dọc/ngang ở các deltaMode                      | Hướng, delta, vùng thử chặn cuộn; ngoài vùng vẫn cuộn trang         |
| Browser engines            | Chromium, Firefox, Safari/WebKit                    | Fullscreen, visualViewport, clipboard, coalesced và fallback        |

## Accessibility và giao diện

- Chỉ dùng bàn phím đi qua menu, tìm kiếm, form, FAQ; focus luôn thấy được.
- Capture bàn phím có nút kích hoạt, Tab/Esc thoát; mất focus không để phím kẹt.
- Fullscreen có nút thoát và Esc; không có nhấp nháy nhanh.
- Thử light/dark, prefers-reduced-motion, zoom 200%, độ rộng 320/375/414/768 px.
- Kiểm tra chuỗi VI/EN, metadata và language switcher giữ route.
- Không coi Lighthouse 90+/95+/95+ là đạt nếu chưa có báo cáo thực.

## Dữ liệu và vòng đời

- Không bật lưu: reload không có lịch sử. Bật lưu và bấm lưu: tối đa 30 tóm tắt.
- Xóa dữ liệu chỉ xóa key `device-lab:*` và cookie ngôn ngữ liên quan.
- Rời route: RAF, timers, pointer capture, listener và Fullscreen phải được dọn.
- Tab ẩn: dừng các lượt lấy mẫu, không hiển thị kết quả như thông số phần cứng chắc chắn.
- Chặn localStorage, clipboard hoặc Fullscreen: thông báo rõ, công cụ còn lại vẫn dùng được.

Kết quả chạy thực tế từng milestone và lần xác minh cuối nằm trong `docs/PROGRESS.md`.

## Công cụ QA bổ sung

- `node scripts/inspect-browser.mjs`: lưu ảnh desktop/mobile/capture keyboard trong `artifacts/` và báo lỗi browser nhận được.
- `node scripts/lighthouse.mjs --label clean-release --runs 3`: đo ba trang production, mỗi trang ít nhất ba lượt, lưu raw metrics và median. Xem PERFORMANCE.md để tạo origin HTTPS QA sạch trên Windows; không chạy đồng thời với E2E/build.
- Trên Windows: `./scripts/check-compose.ps1` tải Compose CLI 5.6.1 từ release chính thức, đối chiếu SHA-256 rồi kiểm tra cấu hình; không build/chạy image.
- `.github/workflows/ci.yml` chạy ba browser engines và Chromium mobile trên Linux, secret scan, unit/build và `scripts/docker-smoke.sh`. Kết quả thực thi của từng lần audit được ghi trong PROGRESS.md, không suy ra workflow đã đạt chỉ vì có file YAML.
- `node scripts/scan-secrets.mjs` rà file Git theo rule token/private key và file nhạy cảm; `--staged` kiểm tra đúng blob sắp commit, không in giá trị secret. Đây là kiểm tra theo mẫu, không bảo đảm phát hiện mọi loại secret.

Kết quả Lighthouse tại máy phát triển có ảnh hưởng từ JavaScript do phần mềm bảo vệ của máy chèn vào HTTP. Xem PERFORMANCE.md để đọc số liệu thật và phần còn chưa đạt, không suy ra điểm khi đã loại bỏ yếu tố môi trường.

## Phase 2 — Milestone nền tảng

Bộ unit bổ sung registry draft/publication guard, capability/SSR, permission observer và media session. Các lỗi DOMException dùng dữ liệu giả xác định; kiểm tra late grant/rejection sau dispose, start trùng, retry, stream rỗng/ended, Stop/pagehide/hidden/track ended và cleanup listener. Đây không phải kiểm thử camera/microphone thật.

Bộ E2E tăng từ 22 lên 24 bài cho mỗi cấu hình, tổng 96 bài dự kiến. Giữ toàn bộ hồi quy Phase 1; thêm bài kiểm tra 19 draft × VI/EN trả 404 và không xuất hiện ở search/navigation/sitemap, cùng bài xác nhận public pages không gọi media/permission và header chặn vẫn nguyên. Kết quả thực chạy ở cuối PROGRESS.md, không lấy số bài dự kiến làm số đã đạt.

Kết quả cục bộ milestone: **86/86 unit/integration tests (16 file), 96/96 E2E (24/24 mỗi browser), typecheck/lint đạt**. E2E 7,7 phút; WebKit không được tính là Safari thật. JSON raw có đủ project/results/statistics. Bằng chứng CI sẽ được ghi theo revision/run riêng, không dùng lại kết quả Phase 1.

CI Linux cuối của source 5ef7ae1: [run 40836651018](https://github.com/anhtruc1803/checkall/actions/runs/40836651018) success, cả verify và docker-smoke. 86 unit, 96 E2E, typecheck/lint/secret scan/production build đạt. Đã đọc artifact JSON: Chromium/Firefox/WebKit/mobile mỗi cấu hình 24 passed/0 failed/0 skipped; flaky 0, E2E 140343,642 ms (khoảng 2,3 phút). Browser artifact [12880917721](https://github.com/anhtruc1803/checkall/actions/runs/40836651018/artifacts/12880917721) đã được upload kể cả khi không có failure. Docker smoke source này đạt trong 74 giây; không cần lấy pipeline cũ làm bằng chứng.

Playwright lưu artifacts/playwright/results.json cho cả lượt thành công. CI upload artifact browser-qa chứa JSON cùng trace/test-results khi có; không còn phụ thuộc vào việc phải có failure mới có bằng chứng browser. Không commit JSON raw/artifacts vào Git.

Trước khi công bố công cụ media ở milestone sau, bổ sung E2E phù hợp cho cấp/từ chối quyền trong secure context, route policy thực và thiết bị giả của browser; đồng thời manual QA microphone/webcam/loa/gamepad và Safari thật. Không nới header toàn website để làm bài kiểm thử dễ đạt.

## Bàn lab tương tác — 10/11/2026

Source 882c4d9: [CI 42783852103](https://github.com/anhtruc1803/checkall/actions/runs/42783852103) success, build 106 trang/typecheck/lint/secret scan, 275 unit/33 file và **322 E2E đạt/6 skip**, không failure/flaky, 717456,362 ms. Chromium/mobile 82 đạt mỗi cấu hình; Firefox/WebKit 79 đạt/ba skip native policy mỗi cấu hình. Giữ nguyên lý do skip, không coi là Safari thực tế. Bộ UI local 16/16 đạt trên bốn cấu hình; public sáu bài category/search và minh họa trên ba browser đạt, không skip/failure/flaky. Lượt đầu 12 đạt/bốn lỗi chữ 200% do white-space kế thừa, đã sửa reflow và chạy lại, không nới assertion.

Bài mới kiểm tra VI/EN, chú thích không phải kết quả đo, SVG trang trí, nút aria-pressed, click/tap/Space/Enter, pointer reset, reduced motion và Refresh Rate không đổi thành số giả. Ma trận cũ mở rộng selector hero/summary ở 320/375/414/768/1024/1440 px, hai theme và chữ 200%; Axe kiểm tra thêm vùng mới. Không gọi camera/microphone/gamepad khi tương tác hero; không thêm timer, listener toàn cục hoặc ghi sự kiện.

Docker Linux CI job 81 giây đạt 34 route/policy ba checkpoint/restart/stop-start/private port/SIGTERM143 không OOM. Production dependency audit 0 finding; audit toàn bộ còn hai moderate dev glob/minimatch. Lighthouse mới: 36 lượt so sánh cùng VM đạt median sau 99/99/99/98/97/98; 18 lượt HTTPS public đạt median sáu trang đều 99, A/BP/SEO đều 100. Từng lượt và môi trường tại PERFORMANCE.md/qa/lab-scene-2026-11-10.json. Public UI 76275,86 ms. Manual QA mới tại UI-UX-REFRESH.md; vẫn cần thiết bị/Safari/screen reader/OS zoom thật. Giữ đủ 40 công cụ, 80 route công cụ VI/EN/100 URL nội dung và Final Acceptance mở.

## Tiện ích Milestone 1 — local 19/11/2026

### Phạm vi và lệnh tái lập

Giữ nguyên 40 công cụ thiết bị, thêm U01/U02. Bộ kiểm thử mới: `tests/utilities-decimal.test.ts`, `utilities-words.test.ts`, `utilities-registry.test.ts`, `utilities-ui.test.tsx`, `tests/e2e/utilities.spec.ts` và fixture metadata 40 công cụ ở `tests/fixtures/device-tools-baseline.json`. Các test tổng số chỉ cập nhật 40→42, 80→84 URL công cụ, 100→106 URL nội dung, category 8→9. Giữ assertion 21 Phase 1/19 Phase 2, permission scope, không upload, cleanup, fallback, timeout và retry; thêm đối chiếu đầy đủ metadata gốc của 40 công cụ, không chỉ tổng số.

```text
pnpm typecheck
pnpm lint
pnpm test --maxWorkers=2 --reporter=json --outputFile=artifacts/utilities-unit-patched.json
pnpm test tests/i18n.test.ts tests/utilities-ui.test.tsx --maxWorkers=2 --reporter=json --outputFile=artifacts/utilities-copy-final-unit.json
pnpm build
node scripts/scan-secrets.mjs
pnpm audit --json
pnpm audit --prod --json
node scripts/smoke-http.mjs http://127.0.0.1:3100
```

Production preview bind loopback 3100. Playwright local dùng bản config QA trong `artifacts/` giữ nguyên bốn project Chromium/Firefox/WebKit/mobile Chromium, workers=2, retries=0, trace khi fail, chỉ đổi baseURL/output và bỏ khởi động thêm server 3000. CI hiện có vẫn tự phát hiện toàn bộ file mới qua config chính; chưa chạy CI của candidate vì người dùng yêu cầu local.

```text
pnpm exec playwright test --config=artifacts/utilities-playwright.config.ts tests/e2e/utilities.spec.ts
pnpm exec playwright test --config=artifacts/utilities-playwright-full.config.ts
```

### Kết quả đã xác minh trước full E2E

Next.js/eslint-config-next 16.4.6; typecheck/lint đạt, production build 112 trang đạt, 106 URL nội dung trong sitemap. Unit **460/460, 39 file**, 128.314,84 ms sau bản vá dependency; 11/11 i18n/UI đạt sau chỉnh một nhãn VI. Initial unit có một golden case dùng “tư” khác quy ước “bốn” của bộ đọc; đã đối chiếu số và thống nhất hợp đồng bốn, không sửa thuật toán để làm tròn hoặc mất chữ số. Rà soát label bổ sung `aria-labelledby` để tên ô nhập tách khỏi mô tả/lỗi. Mock pathname chỉ dùng trong unit Catalog; không thay navigation code thật.

Nhóm riêng tiện ích **21/24 E2E đạt, 3 fail, không skip/flaky**: Chromium 5/6, Firefox 5/6, WebKit 6/6, mobile Chromium 5/6. Thời gian và chi tiết kết quả từ raw JSON được đóng băng trong QA JSON milestone. VI/EN, độc lập ngôn ngữ kết quả/định dạng nhập, số lớn, tiền lẻ bị từ chối, năm phép tính, chia cho 0, làm tròn, clipboard fixture, WCAG AA Dark/Light, lỗi nhập và reflow 320px/chữ 200% đều đạt. Đã xem ảnh mobile Light/Dark.

Ba fail đều ở assertion không có request ngoài GET/HEAD, chỉ nhận POST từ origin Kaspersky (Chromium/mobile `gc.kis.v2.scr.kaspersky-labs.com`, Firefox `ff.kis.v2.scr.kaspersky-labs.com`). Các assertion trước đó về storage/permission/capture bằng 0 và reload xóa giá trị đã qua. Không lọc request, không nới assertion, không tắt bảo vệ để lấy pass. Control HTML trắng mới ngày 19/11, không có script ứng dụng hoặc nhập dữ liệu, vẫn có script/POST Kaspersky; raw `artifacts/utilities-injection-control-2026-11-19.json` chỉ ghi origin/method/type, không session ID/payload. Unit xác minh tiện ích không tự lưu/upload kể cả khi bật lưu lịch sử cũ; chưa tuyên bố toàn bộ môi trường browser sạch.

Audit production không có advisory; audit toàn bộ còn 2 moderate trong dev tooling glob/minimatch, chưa giải quyết bằng ép major override. Secret scan không phát hiện trong source được theo dõi và file mới không bị ignore. Không đồng nhất audit production với toàn bộ repository không có rủi ro.

### Manual QA còn mở

Người dùng duyệt local; cách đọc phù hợp chứng từ thực tế; gõ dấu âm/phân cách bằng bàn phím số Android/iOS; Clipboard API thật khi cấp hoặc từ chối quyền; screen reader với nhãn và vùng kết quả; Safari thật. Không coi clipboard fixture là quyền hệ thống thật, WebKit Windows là Safari, hoặc media/gamepad fixture là phần cứng thật. Yêu cầu manual hardware cũ không bị đóng bởi milestone tiện ích. Full E2E/Lighthouse sạch và kết luận release được cập nhật ở PROGRESS và QA JSON khi kết thúc, không lấy kết quả public trước thay thế.

### Full E2E của candidate

Đã chạy đủ **408 bài trên bốn project**, 1.463.932,291 ms: **380 đạt / 19 skip / 9 fail**, flaky 0, global error 0. Raw JSON: `artifacts/artifacts/utilities-e2e-full.json`; không ghi raw request path/session ID vào tài liệu commit. Cùng source ứng dụng và BUILD_ID trong toàn bộ lượt; sau QA chỉ chuẩn hóa định dạng một file E2E và JSON fixture. TypeScript AST/literal và dữ liệu JSON trước/sau tương đương; unit fixture 2/2 chạy lại đạt. Kiểm tra so sánh emitted JS ban đầu khác do TypeScript giữ bố cục xuống dòng nên không dùng làm bằng chứng; đối chiếu AST mới là bằng chứng được chấp nhận.

| Project         | Đạt | Skip | Fail |
| --------------- | --: | ---: | ---: |
| Chromium        |  99 |    0 |    3 |
| Firefox         |  96 |    3 |    3 |
| WebKit Windows  |  86 |   16 |    0 |
| Mobile Chromium |  99 |    0 |    3 |

Cả chín fail chỉ có request origin Kaspersky: mỗi Chromium/Firefox/mobile một bài camera, một gamepad và một tiện ích. Các bài này giữ nguyên assertion không upload; không đổi retry/timeout/skip để lấy pass. Full run bao gồm lại nhóm tiện ích 21 đạt/3 fail và toàn bộ hồi quy 40 công cụ. Các skip gồm Web Audio/mediaDevices và native introspection/enforcement Permissions-Policy không có trong runtime; danh sách từng bài và lý do ở QA JSON. **Full gate chưa đạt**, không dùng 380 pass để che 19 skip hoặc 9 fail. Chưa chạy full suite sạch trên Linux của candidate; không kế thừa CI trước đây.
