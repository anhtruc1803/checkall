# Nghiệm thu tiện ích Milestone 3

Ngày **20/11/2026**. Đã triển khai sau khi người dùng duyệt local và yêu cầu kiểm thử sạch/Lighthouse trước cập nhật. Source đang phục vụ: [`890aa52`](https://github.com/anhtruc1803/checkall/commit/890aa52d9af73d1d36fd96b79d941adcb20296ed).

## Kết luận và phạm vi

**Các gate phát hành phần mềm đạt. Final Acceptance tổng thể chưa đóng.** Hai công cụ mới: [Đổi đơn vị VI](https://nguyenanhtruc.io.vn/vi/utilities/unit-converter), [Tính ngày VI](https://nguyenanhtruc.io.vn/vi/utilities/date-calculator); có EN qua bộ đổi ngôn ngữ. Tổng 48 công cụ, giữ đầy đủ 46 công cụ trước; không triển khai milestone tiếp theo, sửa dependency hoặc viết lại kiến trúc.

## Kết quả thực tế

Source **890aa52d9af73d1d36fd96b79d941adcb20296ed**, [CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/44663888110), [Lighthouse trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/44663904488) và [Lighthouse public](https://github.com/anhtruc1803/checkall/actions/runs/44668621145). Đã triển khai **U07 Đổi đơn vị** và **U08 Tính ngày** sau khi người dùng duyệt local: **48 công cụ VI/EN**, giữ nguyên metadata/route/engine/copy của **46 công cụ trước**; **96 route công cụ**, sitemap **118 URL**. Không sửa mã ứng dụng/tests/scripts sau bản đã duyệt; không thêm dependency hoặc viết lại kiến trúc.

Typecheck/lint/secret scan đạt, **575 unit/integration/43 file**, build **124 trang**. Full CI sạch **466 E2E đạt/6 native policy skip**, không fail/flaky/global error; hai công cụ mới **32/32**, văn bản M2 **32/32**, số M1 **24/24**. Chromium/mobile mỗi 118 đạt; Firefox/WebKit mỗi 115 đạt/3 skip. Backend audio ảo qua smoke cả ba engine, không phải phần cứng thật hoặc Safari.

Trước chuyển đủ **60 mẫu sạch/20 trang × 3**, median mobile **98–100**; sau chuyển đủ **60 mẫu sạch/20 trang × 3**, median **96–99**. Median Accessibility/Best Practices/SEO 100 trên mọi trang ở cả hai bộ. Đối chiếu source/path/pageVerified/clean của từng mẫu; đủ 120 mẫu, FCP/LCP/TBT/CLS và byte JS/font/ảnh trong [QA phát hành](qa/deployment-utilities-milestone3-2026-11-20.json). Không lấy điểm Windows 76 có injection làm baseline hoặc nhận chênh lệch lab/public là thay đổi do code.

Docker CI đạt build/health/Nginx/**52 route smoke VI/EN** trước/sau restart/stop-start, Node private, SIGTERM 143/không OOM/Error. Candidate VPS network none, non-root/read-only, 768 MiB/256 PID: đủ **96 route**, sitemap 118 trước/sau restart/stop-start và exit 143; đã dọn candidate. Chỉ sau khi đọc đủ CI/Lighthouse/candidate và sinh gate đúng source mới chuyển website.

Public HTTP→HTTPS308, H1/canonical/release/policy và đủ **96 route** (92 cũ + 4 mới), 48 card, sitemap 118 đạt. **84/84 public smoke** trên Chromium/Firefox/WebKit/mobile, mỗi cấu hình 21 bài, không fail/skip/flaky/global error; gồm tiện ích số/văn bản/đơn vị/ngày, VI/EN, clipboard fixture, theme/reflow/WCAG và EVKey/dd. Đây là subset chức năng trên Windows hiện có; kiểm tra không-upload của full suite được xác minh riêng trong CI sạch. Public Lighthouse đo sau smoke để không có tải QA đồng thời.

## Docker, vận hành và rollback

VPS current→`/opt/device-lab/releases/890aa52`, image **device-lab:staging-890aa52-20261120**, ID **sha256:9c28cf062a63c875d120cbe4eefc2c8c4549b3c408bd93663d4b2df44cca3de1**, archive Git tracked SHA256 **f52d1bd5429d7c59b6c4d1a3f1a9994162959311ac3f223cc543ff7ecb3c5a54**; không mang .env/secret/cache trong archive/image. Runtime Node.js v24.22.3, healthy/nextjs/read-only, Node 3000 không publish, 768 MiB/256 PID/cap-drop ALL/no-new-privileges, restart unless-stopped.

Giữ release/image `142f807` và backup `/opt/device-lab/shared/nginx.conf.before-text-m3-20261120` để rollback. Nginx chỉ đổi release marker và reload, giữ inode bind mount; đối chiếu backup xác minh routing/policy/quyền và Compose override không đổi. Không sửa DNS/proxy, prune/reboot hoặc chạy renewal mới. Chuyển thành công; không cố gây lỗi production để diễn tập rollback. Phiên SSH đã đóng.

Snapshot runtime `2026-11-20T03:49:37Z`: app tail 80 dòng có **0 error**; Nginx từ app start có **3 rate-limit**, **0 lỗi upstream**, **0 lỗi khác**. Không nới rate limit để lấy pass; Certbot timer active. Chi tiết gate/image/lifecycle/log ở [QA phát hành](qa/deployment-utilities-milestone3-2026-11-20.json).

## Vấn đề phát hiện và xử lý

- Windows có script/POST Kaspersky cả trên HTML trống, không đủ môi trường sạch: chạy CI/Linux và Lighthouse bằng profile mới; không lọc request hoặc hạ assertion. Source ứng dụng/tests/scripts giữ nguyên so với bản đã duyệt.
- Kiểm tra đủ 46 định nghĩa cũ bằng fixture thiết bị/M1/M2 độc lập, cộng hồi quy full suite; mở rộng HTTP smoke Docker lên 52 route và candidate/public lên 96 route.
- Sáu native policy skip không được tính pass; hai advisory dev tooling vẫn mở. Không suy backend/fixture ảo hoặc WebKit thành kiểm thử thiết bị/Safari thật.
- CSP có tại app/origin nhưng public chỉ 0/96 route có header; proxy do người dùng quản lý, không tự sửa. TLS proxy→origin trong dashboard chưa kiểm chứng; giữ cấu hình do người dùng quản lý.

## Phân loại nghiệm thu

**Đã hoàn thành và xác minh:** phần mềm CI sạch, giữ 46 công cụ cũ, Docker CI/candidate, public HTTP/UI và median mobile ≥90 trên 20 trang đại diện. **Đã triển khai nhưng chưa xác minh đầy đủ:** clipboard quyền hệ thống, screen reader, date picker/bàn phím số/nhập âm/bộ gõ trên điện thoại thật; rollback khi production lỗi chưa diễn tập cố ý. **Chưa hoàn thành:** 6 native policy skip, hai moderate dev tooling glob/minimatch, TLS proxy→origin trong dashboard/field data và các mục manual của nền tảng. CSP có tại app/origin nhưng public chỉ 0/96 route có header; proxy do người dùng quản lý, không tự sửa. **Không thể kiểm chứng lượt này:** Safari/phần cứng thật và mọi phiên bản EVKey; chế độ TLS trong dashboard proxy. Không coi fixture/WebKit automation là thiết bị/Safari thật. **Các gate phát hành phần mềm đạt; Final Acceptance tổng thể vẫn mở.**

## File chính và công việc tiếp theo

File chính: hai engine/thuật toán `unit-converter`, `date-calculator`, Registry/ToolRunner/types/messages VI/EN, tests mới và fixture M2 đã được duyệt. Lượt triển khai chỉ thêm bằng chứng, báo cáo nghiệm thu và cập nhật README/ARCHITECTURE/PROGRESS/TESTING/PERFORMANCE/DEPLOYMENT/UTILITIES-MILESTONE-3; raw artifacts/cache/.env/key không commit.

Chi tiết thuật toán/giới hạn: [UTILITIES-MILESTONE-3.md](UTILITIES-MILESTONE-3.md). Số đo và provenance: [QA phát hành](qa/deployment-utilities-milestone3-2026-11-20.json), [TESTING.md](TESTING.md), [PERFORMANCE.md](PERFORMANCE.md), [DEPLOYMENT.md](DEPLOYMENT.md).

Tiếp theo: dùng hai công cụ trên domain và hoàn tất manual QA date picker/bàn phím số/nhập âm, clipboard quyền hệ thống, screen reader, Safari và các mục nền tảng còn mở. Không tự triển khai milestone khác. **Release checks passed: có; Final Acceptance complete: chưa.**
