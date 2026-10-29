# Checklist phát hành

- [x] 21 khả năng Phase 1 có engine thật và route VI/EN.
- [x] TypeScript strict, ESLint và unit/integration tests chạy đạt ở các checkpoint.
- [x] Nội dung SEO, canonical, alternates, sitemap, robots và Breadcrumb JSON-LD.
- [x] Dữ liệu thiết bị không được giả lập thành thông số phần cứng.
- [x] Capture có cơ chế thoát, giới hạn log, cleanup và xử lý mất focus.
- [x] Light/dark, privacy opt-in và xóa dữ liệu đã được kiểm tra.
- [x] Compose CLI kiểm tra cấu hình thành công; binary chính thức được đối chiếu SHA-256.
- [x] Nginx syntax test thành công trên bản kiểm tra Windows thay host Docker bằng loopback và MIME path cục bộ.
- [x] Bản sửa cuối đạt 88/88 E2E trên production standalone: Chromium/Firefox/WebKit/Chromium mobile đều 22/22; axe ở hai theme và responsive.
- [x] Ghi báo cáo Lighthouse production và nêu rõ mục tiêu chưa đạt trong PERFORMANCE.md.
- [ ] Đạt hoặc được chủ sở hữu chấp nhận ngoại lệ đối với Performance ≥90; median clean-release là 84 / 87 / 75 trên ba trang, không có script ngoài origin, TBT/CPU còn là giới hạn.
- [ ] Build/chạy Docker image trên Linux hoặc CI có Docker Engine, kiểm tra Nginx trong mạng Compose.
- [x] Chạy automation Chromium, Firefox và WebKit; WebKit không tương đương Safari thật.
- [ ] Thử Safari thật trên macOS/iOS và browser trên thiết bị mục tiêu.
- [ ] Kiểm tra thiết bị vật lý theo ma trận trong TESTING.md.
- [ ] Đặt SITE_URL, khóa image release/digest, DNS và firewall trên VPS.
- [ ] Cấp và xác minh HTTPS, thử gia hạn và rollback.
- [ ] Chủ sở hữu cho phép triển khai hạ tầng thật.

Các ô trống là công việc chưa xác minh, không phải chức năng giả hoặc yêu cầu đã được bỏ qua. Kết quả từng lần chạy được lưu trong `PROGRESS.md`.
