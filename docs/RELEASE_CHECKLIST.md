# Checklist phát hành

## Phase 2 Milestone 3

- [x] Ba công cụ Speaker/Stereo/Frequency Generator có graph thật, registry/VI-EN/SEO và lifecycle; giữ 29 công cụ đã công bố trước đó.
- [x] Thêm unit/lifecycle và E2E đa browser, axe hai theme, responsive; Docker smoke bao phủ 18 route VI/EN gồm audio.
- [ ] Chốt toàn bộ E2E/CI của source mới; kết quả thực chạy ở PROGRESS.md/qa/phase2-milestone3.json.
- [ ] Nghe loa/tai nghe thật, stereo vật lý, mute/output routing và Safari thật.
- [ ] Screen reader/zoom/reduced motion thủ công và Lighthouse source mới.
- [ ] Final Acceptance toàn Phase 1/2: vẫn mở, không tự đánh dấu hoàn tất.

## Phase 2 Milestone 2

- [x] Tám engine G01–G06/C06–C07 có logic và phương pháp/giới hạn VI/EN, không có số đo giả.
- [x] 21 chức năng Phase 1 giữ nguyên, 11 draft còn lại không có route/search/sitemap công bố.
- [x] GPU opt-in, Web Storage isolated cleanup, pointer buffers/time limit, Fullscreen ownership/late request có kiểm thử.
- [x] Typecheck/lint/build và 118 unit/integration tests đạt cục bộ.
- [x] Local và CI source 097404e đạt 136/136 E2E (34/34 mỗi browser), 118 unit, build/typecheck/lint/secret scan và Docker smoke; run 41007493526.
- [ ] Manual QA Safari thật, GPU/driver, cảm ứng/bút và chuột vật lý theo PHASE2-MILESTONE2.md.
- [ ] Đo lại Performance source mới trong môi trường sạch/CPU ổn định; không dùng điểm Phase 1 cũ thay thế.

## Checkpoint Phase 1

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
- [x] Build/chạy Docker image trên CI Linux, healthcheck, Nginx/VI/EN, private Node port, restart và stop/start; bằng chứng run 40816709418.
- [x] Chạy automation Chromium, Firefox và WebKit; WebKit không tương đương Safari thật.
- [ ] Thử Safari thật trên macOS/iOS và browser trên thiết bị mục tiêu.
- [ ] Kiểm tra thiết bị vật lý theo ma trận trong TESTING.md.
- [ ] Đặt SITE_URL, khóa image release/digest, DNS và firewall trên VPS.
- [ ] Cấp và xác minh HTTPS, thử gia hạn và rollback.
- [ ] Chủ sở hữu cho phép triển khai hạ tầng thật.

Các ô trống là công việc chưa xác minh, không phải chức năng giả hoặc yêu cầu đã được bỏ qua. Kết quả từng lần chạy được lưu trong `PROGRESS.md`.
