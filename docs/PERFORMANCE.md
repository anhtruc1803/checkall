# Performance Phase 1 — phép đo sạch ngày 29/10/2026

## Phương pháp và tính hợp lệ

Lighthouse 13.6.0, Chromium 156, mobile simulated, RTT 150 ms, throughput 1638,4 Kbps, CPU slowdown ×4. Mỗi lượt dùng một profile Chrome tạm mới, tắt extension; không chạy đồng thời E2E, build hoặc unit tests. Mỗi trang được đo ba lần, theo thứ tự luân phiên; không bỏ lượt xấu.

HTTP trên Windows vẫn bị Kaspersky chèn script và sửa CSP, kể cả profile mới và loopback. Origin HTTPS QA riêng `https://127.0.0.1:3443` đã được xác minh không có request ngoài origin, extension request hoặc CSP bị sửa. Chrome chỉ pin SPKI của chứng chỉ tự ký QA; không tắt phần mềm bảo vệ, không chặn request trong Lighthouse, không sửa trace hoặc điểm. Chứng chỉ/key QA nằm trong artifacts bị Git bỏ qua, không được commit. Điều này không xác minh chứng chỉ HTTPS công khai.

Baseline sạch dùng build ban đầu với SITE_URL cũ nên SEO 92 do canonical khác origin QA. Build sau đặt SITE_URL đúng origin QA và SEO 100. Cấu hình mạng/CPU/browser/origin của phép đo Performance không đổi; khác biệt canonical chỉ là cấu hình metadata đã được công khai ở đây. Bản raw JSON/HTML ở artifacts/performance/clean-before và clean-final; dữ liệu gọn có thể đối chiếu trong [qa/performance.json](qa/performance.json).

## Median trước và sau

| Trang               | Performance |   LCP (ms) |  TBT (ms) | JS truyền tải (KiB) |
| ------------------- | ----------: | ---------: | --------: | ------------------: |
| /vi                 |     78 → 81 | 939 → 1077 | 994 → 768 |       210.4 → 189.7 |
| /en/screen/ppi      |     94 → 95 |  976 → 921 | 280 → 267 |       219.0 → 198.4 |
| /vi/keyboard/tester |     83 → 83 | 926 → 1081 | 695 → 667 |       221.2 → 200.7 |

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
| /vi                 |    1 |          59 |     4323 |     4323 |      570 | 0.00514 |    189.7 |
| /en/screen/ppi      |    1 |          95 |      925 |      925 |      248 | 0.00045 |    198.4 |
| /vi/keyboard/tester |    1 |          73 |     1081 |     1081 |     1704 | 0.00000 |    200.7 |
| /vi                 |    2 |          81 |     1077 |     1077 |      795 | 0.00000 |    189.7 |
| /en/screen/ppi      |    2 |          95 |      921 |      921 |      267 | 0.00045 |    198.4 |
| /vi/keyboard/tester |    2 |          83 |     1078 |     1078 |      667 | 0.00000 |    200.7 |
| /vi                 |    3 |          81 |     1075 |     1075 |      768 | 0.00081 |    189.7 |
| /en/screen/ppi      |    3 |          91 |      921 |      921 |      371 | 0.00045 |    198.4 |
| /vi/keyboard/tester |    3 |          95 |     1315 |     1315 |      255 | 0.00000 |    200.7 |

## Các nguyên nhân và thay đổi có bằng chứng

- Zod đầy đủ và metadata registry của cả 21 công cụ từng nằm trong bundle client dùng chung. Chuyển validation sang zod/mini, truyền chỉ mục tìm kiếm được sinh từ registry và chỉ truyền ba trường runtime cho engine. JS truyền tải giảm khoảng 21 KiB trên mỗi trang. Không bỏ validation, VI/EN, nội dung SEO hoặc chức năng.
- Hộp tìm kiếm không dựng 21 kết quả khi chưa mở. Catalog không prefetch hàng loạt engine chưa được chọn; các link và khả năng tìm kiếm vẫn đầy đủ.
- Một lượt baseline Keyboard có CLS 0,42352 do giao diện engine xuất hiện sau placeholder. Đợt tối ưu giữa có LCP median 3515 ms, trace chỉ rõ đoạn hướng dẫn capture được render muộn. HTML công cụ hiện prerender giao diện inert; chỉ mở tương tác sau capability detection. Không chạy phép đo phần cứng trên server. LCP median Keyboard cuối 1081 ms, CLS median 0.
- Catalog không nhận input trước hydration để tránh mất truy vấn trên WebKit. Device Overview không tạo canvas capability probe lặp lại theo timer.
- Không có ảnh truyền tải trong ba trang (0 byte). Font self-host giữ đủ ký tự Việt/Anh: median khoảng 93,1 KiB ở /vi, 52,7 KiB ở PPI tiếng Anh, 78,1 KiB ở Keyboard tiếng Việt. Không loại subset tiếng Việt để tăng điểm.

## Mục tiêu chưa đạt và giới hạn

PPI đạt median 95. Homepage 81 và Keyboard 83 vẫn dưới mục tiêu 90. TBT median còn 768 ms và 667 ms, tương ứng còn chi phí JavaScript/hydration và layout. Bundle framework lớn nhất khoảng 224 KiB chưa nén (70 KiB gzip), bên cạnh runtime React và các thành phần tương tác. JS toàn trang còn khoảng 190–201 KiB truyền tải. Môi trường có biến thiên CPU rõ rệt: lượt đầu homepage có FCP/LCP 4323 ms; Keyboard có TBT từ 255 đến 1704 ms. Các lượt này vẫn được giữ và median tính từ đủ ba lượt.

Accessibility, Best Practices và SEO đều 100 ở ba trang trong lượt đo cuối; CLS median từ 0 đến 0,00081, không được làm tròn thành “mọi lượt CLS bằng 0”. Điểm lab không thay thế dữ liệu thực địa, kiểm thử thiết bị hay việc nghiệm thu production. Cần tiếp tục kiểm tra startup/hydration trên Linux staging có CPU ổn định; chưa tuyên bố Performance 90+ cho toàn bộ Phase 1.

## Tái lập trên Windows

1. Tạo chứng chỉ tự ký QA (SAN localhost/127.0.0.1), lưu key.pem và cert.pem trong artifacts/qa-tls bằng OpenSSL; không đưa key vào Git hoặc trust store hệ thống.
2. Đặt SITE_URL=https://127.0.0.1:3443 khi build, chạy pnpm build và pnpm start.
3. Chạy node scripts/qa-https.mjs ở terminal khác; proxy chỉ bind loopback.
4. Chạy node scripts/probe-browser.mjs và kiểm tra HTTPS không có externalOrigins.
5. Chạy node scripts/lighthouse.mjs --label clean-final --runs 3. Script từ chối kết quả “sạch” nếu trace có external/injected script.

Trên Linux sạch có thể dùng --base-url http://127.0.0.1:3000 và SITE_URL tương ứng, không cần chứng chỉ QA. Không so sánh trực tiếp điểm từ hai máy khác nhau như cùng một điều kiện đo.

## Báo cáo lịch sử

Các điểm 75–81 trong bàn giao trước là một lượt đo HTTP bị chèn script, không phải median sạch. Chúng còn ở artifacts/lighthouse-baseline và báo cáo cũ, chỉ dùng để giải thích lịch sử. Một bộ đo giữa tối ưu được giữ tại artifacts/performance/clean-after, không thay thế bộ clean-final cuối cùng.
