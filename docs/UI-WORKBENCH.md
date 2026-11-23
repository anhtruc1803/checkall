# Giao diện công cụ Workbench — bản local 23/11/2026

Người dùng chọn hướng **bảng điều khiển kỹ thuật, rõ nét và có chiều sâu** cho 48 công cụ VI/EN. Bản production local để duyệt sử dụng UI/UX Pro Max và Hallmark.

## Vấn đề và thay đổi

Trước sửa, nhiều công cụ đặt toàn bộ trường nhập, thông số, cảnh báo và kết quả trong một khối dọc. Kết quả tiện ích ở xa vùng nhập; camera chưa mở vẫn chiếm vùng đen lớn; bố cục các engine thiếu thứ bậc chung.

- Template dùng icon nhóm, tiêu đề gọn và thanh chuyển công cụ có trạng thái đang chọn. Khi thu nhỏ cửa sổ, thanh cuộn trong phạm vi của nó để giữ link đang focus nhìn thấy. Nếu focus ở ngoài thanh, công cụ hiện tại được đưa vào tầm nhìn. Listener resize được dọn khi rời trang. `PolicyLink` giữ document navigation khi đổi Permissions-Policy và các link mới dùng `prefetch={false}`.
- Tiện ích số, phần trăm, đơn vị, ngày và văn bản có cột nhập/kết quả; dưới 960px trở về một cột theo DOM. Kết quả thực được làm nổi, copy có icon và phản hồi cũ. Trước khi xử lý văn bản hiển thị “Chưa có kết quả”, không thêm số đếm hoặc output giả.
- Toolbar, metric, bảng thông tin thiết bị, vùng pointer, sơ đồ bàn phím và audio controls có thứ bậc, khoảng cách, border/surface thống nhất. Camera idle dùng trạng thái trống dễ đọc, khung có kích thước ổn định; video thật vẫn object-fit contain.
- Giữ toàn bộ hướng dẫn, giới hạn, SEO, accessibility, các trạng thái quyền và opt-in lưu kết quả. Không thêm font/ảnh/thư viện animation. Không sửa màu RGB/canvas của các bài thử màn hình.

Hệ thống và quy tắc được lưu trong `design.md`, token trong `tokens.css`, CSS trang công cụ ở `src/components/tools/workbench.css`. Các màu mới dùng OKLCH và có Dark/Light riêng; giữ font Geist/Geist Mono local. Layout mới không xuất hiện trên trang chủ/danh mục hiện có.

## Phạm vi bảo toàn

Đã đối chiếu Git: `src/lib/`, `src/hooks/`, các hook keyboard/mouse không đổi. Registry, engine, thuật toán, capability và session permission giữ nguyên. Tất cả message cũ VI/EN bằng baseline sau khi bỏ namespace `workbench` mới. Không thay route, tên tool hoặc metadata. JSX tiện ích/camera chỉ đổi wrapper và trình bày.

Template thanh điều hướng là Client Component nhỏ để giữ tab đang chọn nhìn thấy trên mobile; trang và nội dung SEO vẫn Server Component. Các engine tiếp tục lazy-load. CSS Workbench nguồn 8.341 byte, gzip ước tính 1.917 byte; phần tăng utility CSS gzip ước tính 701 byte. Đây là ước tính từ source, không phải tổng JS/transfer hoặc điểm Lighthouse.

## Kiểm thử và ảnh

Đã chụp 28 ảnh trước và 28 ảnh sau để đối chiếu desktop/mobile, VI/EN và Dark/Light. Tiện ích văn bản dùng nhãn chờ trước lần xử lý đầu tiên. Camera dùng nền sáng hoặc tối theo theme khi chưa chạy và khung preview phủ đủ chiều rộng. Bài hồi quy focus thực hiện thu nhỏ từ 1440px xuống 375px sau khi focus link đầu thanh.

Typecheck, lint và quét secret đạt. **575 unit test trong 43 file** đạt. Build production sau sửa focus tạo **124 trang**, mã build `wYXolPmo0oEiIw7QNSMOO`. Kiểm tra health, 52 route smoke, toàn bộ **96 route công cụ**, sitemap **118 URL**, canonical, hreflang, Permissions-Policy và CSP đều đạt.

Hồi quy đầy đủ trước bản sửa focus chạy **488 E2E**, gồm **454 đạt, 19 skip, 15 failure**. Chromium và mobile mỗi cấu hình đạt 117 và fail 5. Firefox đạt 114, skip 3 và fail 5. WebKit đạt 106 và skip 16. Sáu skip thuộc native Permissions-Policy, 13 skip còn lại do thiếu backend Web Audio hoặc MediaDevices. Cả 15 failure ở các bài kiểm tra không upload đều ghi nhận request tới Kaspersky. Giữ nguyên assertion và kết quả gốc. Không có flaky hoặc global error.

Bản cuối chạy **28/28 E2E liên quan**, gồm năm bài Workbench và hai bài điều hướng, locale và policy trên mỗi cấu hình Chromium, Firefox, WebKit và mobile. Các bài này xác minh focus khi resize, lựa chọn công cụ, reset dữ liệu nhập, reflow 320px với chữ 200%, WCAG qua axe ở cả hai theme, trạng thái camera và reduced motion. Kiểm tra hình ảnh cuối đạt 36 tổ hợp trang, theme và viewport, gồm desktop 1280×800, 320/375/414px, tablet và mobile ngang.

Lệnh kiểm tra chính gồm `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test --maxWorkers=2`, `node scripts/scan-secrets.mjs` và `node scripts/smoke-http.mjs http://127.0.0.1:3100`. Playwright chạy bản production local trên bốn project với cấu hình trong `artifacts/ui-workbench-focus-playwright.config.ts`. Audit dependency production trả 0 advisory.

## Giới hạn và duyệt

Mobile dùng Chromium giả lập. Safari, thiết bị thật, screen reader và quyền hệ điều hành cần kiểm thử thủ công. Lighthouse local dừng sau mẫu đầu trên trang Đổi đơn vị vì phát hiện script Kaspersky. Mẫu đó bị loại khỏi phép đo nghiệm thu. Performance mobile của bản mới cần đo lại bằng Chromium sạch. Final Acceptance tổng thể vẫn mở.

Bản production để duyệt chạy tại [Đổi đơn vị](http://127.0.0.1:3100/vi/utilities/unit-converter), [Kiểm tra bàn phím](http://127.0.0.1:3100/vi/keyboard/tester) và [Xem trước webcam](http://127.0.0.1:3100/vi/camera/preview). Cần chạy lại CI và đo Lighthouse sạch khi chuẩn bị phát hành.
