# Performance Phase 1 — phép đo sạch ngày 29/10/2026

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
