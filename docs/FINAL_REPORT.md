# Báo cáo bàn giao Device Lab — 29/10/2026

> Đây là báo cáo bàn giao lịch sử trước đợt rà soát bổ sung, không phải trạng thái release hiện hành. Báo cáo nghiệm thu mới ở [ACCEPTANCE.md](ACCEPTANCE.md); kết quả Git/CI ở [PROGRESS.md](PROGRESS.md), dữ liệu đo sạch ở [PERFORMANCE.md](PERFORMANCE.md). Các con số và trạng thái chưa commit/browser/Docker bên dưới chỉ áp dụng checkpoint lịch sử này.

## 1. Kiến trúc

Next.js 16 App Router + React + TypeScript strict, Tailwind v4, UI shadcn/ui, Lucide, next-intl và Zod. Modular monolith, không database/tài khoản. Registry duy nhất điều khiển navigation, search, category, nội dung công cụ, SEO và related tools. Engine client tải riêng; thuật toán đo tách khỏi React; dữ liệu thô chỉ ở bộ nhớ browser.

## 2. Chức năng đã triển khai

- **11 công cụ màn hình:** Screen Resolution, Viewport/DPR, Aspect Ratio, PPI, Refresh Rate bằng RAF, Dead Pixel, Stuck Pixel, Backlight Bleed, Color/Gradient, Ghosting/Motion Blur và Touch.
- **5 công cụ bàn phím:** Tester với sáu layout, Rollover, Chatter, Hold và Event Inspector. Capture có kích hoạt/thoát; mất focus xóa held; Tab/Esc vừa được ghi nhận vừa thoát an toàn; log giới hạn 200.
- **5 công cụ chuột:** Buttons, Double Click, CPS, Scroll và browser-observed Polling Rate với coalesced fallback.
- **Ứng dụng:** VI mặc định/EN đầy đủ, language switch giữ route, tìm kiếm không dấu, dark/light, menu mobile, tổng quan thiết bị thực, privacy opt-in/xóa dữ liệu, 52 URL nội dung, sitemap/robots/metadata/canonical/hreflang/Open Graph/Breadcrumb.

Mỗi công cụ có hướng dẫn, phương pháp, giới hạn, FAQ và related links; không biến ước tính browser thành thông số phần cứng đã xác nhận.

## 3. Cấu trúc

`src/app` chứa route/metadata; `src/components` chứa shell/UI; `src/features` chứa các engine; `src/lib/tools` chứa registry; `src/lib/measurements` chứa thuật toán; `src/messages` chứa VI/EN; `tests` chứa unit/integration/E2E; `deploy` chứa Nginx; `scripts` chứa start/QA; `docs` chứa tài liệu tiếng Việt.

Các file nền tảng chính: `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `Dockerfile`, `compose.yaml`, `.env.example`, `.github/workflows/ci.yml`. Chi tiết mô-đun trong ARCHITECTURE.md và TOOL_SPECIFICATIONS.md.

## 4. Phát triển

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Mở `http://localhost:3000/vi` hoặc `/en`. Node.js 24 LTS, pnpm 11.25.0. Git đã khởi tạo, chưa commit/push.

## 5. Production build cục bộ

```bash
pnpm build
pnpm start
```

`start` chuẩn bị static assets và chạy `.next/standalone/server.js`. Build đã đạt, không có lỗi TypeScript. Các server QA được dừng sau bàn giao; chạy lệnh trên để mở lại.

## 6. Kiểm thử thực tế

- 21 unit/integration tests đạt; typecheck và ESLint đạt, không lỗi/cảnh báo ở lần chạy cuối.
- 40/40 E2E đạt trên production standalone ở Chromium desktop và mobile giả lập. Sau sửa Tab/Esc, 6/6 E2E bàn phím bổ sung trên hai cấu hình cũng đạt; production build và typecheck được chạy lại thành công.
- Axe trên các trang đại diện ở hai theme không phát hiện vi phạm trong bộ quy tắc tự động; đã kiểm tra controls ở 320/375/414/768 px.
- Audit dependencies production không ghi nhận lỗ hổng đã biết ở lần chạy; điều này không phải bảo đảm an toàn tuyệt đối hoặc thay thế kiểm tra release sau này.
- Lighthouse mobile: Performance **75–81**, Accessibility **100**, SEO **100**, CLS **0** trên ba trang đại diện. Mục tiêu Performance 90+ chưa đạt; báo cáo có script ngoài source được Kaspersky chèn từ môi trường máy. Không bỏ qua audit hoặc công bố điểm giả định.

Ảnh production và báo cáo JSON/HTML ở `artifacts/`. Kết quả chi tiết và giới hạn phép đo trong PROGRESS.md, PERFORMANCE.md và TESTING.md.

## 7. Docker và HTTPS

```bash
docker compose config --quiet
docker compose up -d --build --wait
docker compose exec nginx nginx -t
```

Compose CLI kiểm tra cấu hình đạt. Nginx Windows kiểm tra cú pháp đạt trên config thay host Docker/MIME path để dùng cục bộ. Dockerfile multi-stage standalone, user không phải root, Node port chỉ trong mạng Compose, healthcheck, restart policy và Nginx reverse proxy đã chuẩn bị.

Chưa build/chạy container Linux do không có Docker Engine và WSL không khởi động được. HTTPS template, hướng dẫn cấp/gia hạn Certbot, nâng cấp/rollback/log nằm trong DEPLOYMENT.md; chưa có chứng chỉ hoặc VPS thật nào được tạo.

## 8. Các giới hạn chưa kiểm chứng

Chưa kiểm tra màn hình thật 60/120/144 Hz, bàn phím/chuột/cảm ứng vật lý, đa màn hình và Firefox/Safari/WebKit. Các phép pixel/hở sáng/Ghosting cần người tự quan sát; RAF không xác nhận panel Hz; pointer events không xác nhận USB Polling Rate; event timing không chẩn đoán switch hoặc chứng nhận NKRO.

## 9. Công việc còn lại

1. Chạy pipeline Linux có Docker Engine để xác nhận image, healthcheck và Nginx trong mạng Compose.
2. Đo staging HTTPS trong môi trường browser kiểm soát được; tiếp tục tối ưu/đánh giá Performance để đạt 90+.
3. Hoàn thành ma trận browser/phần cứng thủ công.
4. Chỉ cấu hình domain, DNS, HTTPS và deploy VPS sau khi người dùng yêu cầu rõ ràng.

Milestone 1–6 hoàn thành; code của 21 khả năng đã có và được kiểm thử tự động. Milestone 7 **chưa đóng toàn bộ final acceptance** vì các mục kiểm chứng trên còn mở. Không có trang giả cho Phase 2/3 hoặc endpoint mạng chưa được kiểm soát.
