# Nghiệm thu rà soát Phase 1 — 29/10/2026

## Phạm vi và vấn đề phát hiện

Chỉ rà soát 21 khả năng Phase 1. Không có công cụ hoặc endpoint Phase 2/3 mới. Registry vẫn là nguồn metadata duy nhất, tám nhóm engine đều được đọc lại và có kiểm thử mount từng capability.

Các vấn đề có bằng chứng: HTTP trên Windows bị phần mềm bảo vệ chèn JavaScript/sửa CSP; số đo cũ chỉ có một lượt; bundle client mang theo metadata/validation lớn; vùng capture Keyboard xuất hiện muộn sau lazy-load; input có thể nhận thao tác trước hydration; native automation trên WebKit chậm hơn cửa sổ đo; cần thêm ma trận browser và Docker restart/shutdown QA.

## Đã sửa

- Origin HTTPS QA riêng, profile Chromium mới, không extension, xác minh trace sạch và chạy ba lượt/trang; lưu raw metrics, median và cả lượt bất lợi.
- Chỉ mục tìm kiếm gọn được sinh từ registry, zod/mini, props runtime tối thiểu, command search chỉ dựng khi mở, tránh prefetch hàng loạt engine. Không bỏ SEO, VI/EN, a11y hoặc phép thử.
- Giao diện engine prerender inert; native fieldset khóa controls cho đến khi **chính engine** hydrate, đồng thời capability detection vẫn quyết định fallback. Không tạo số đo phần cứng tại server.
- Đồng bộ E2E theo trạng thái sẵn sàng, dùng cửa sổ pointer 20 giây và đối chiếu wheel event nhận được. Giữ nguyên yêu cầu đủ mẫu, kết quả, Stop/Reset và ngưỡng điều tra.
- Bổ sung cleanup tests cho RAF, ResizeObserver, timers, listeners; secret scan trước commit; Linux Docker smoke và CI thu logs.
- Sau CI Linux đầu tiên phát hiện tương phản trung gian khi đổi theme: bỏ background transition của nút, giữ toàn bộ rule axe, xác nhận theme đích trước audit; ba lượt lặp WebKit cục bộ đều đạt.

## Kết quả cục bộ đã xác minh

- TypeScript strict, ESLint và production standalone build đạt.
- 29 unit/integration tests đạt, gồm bảy bài lifecycle và kiểm tra chỉ mục 21 công cụ.
- Audit dependencies toàn bộ/production không ghi nhận lỗ hổng đã biết; secret scan theo mẫu không có finding. Đây không thay thế việc rà mọi loại secret hoặc audit tương lai.
- Source sản phẩm không có fetch/sendBeacon/XMLHttpRequest upload log phím/chuột. Log có giới hạn; storage được validate, tóm tắt chỉ lưu sau opt-in và hành động lưu.
- E2E cuối đạt **88/88**, gồm 22/22 trên từng cấu hình Chromium, Firefox, WebKit và Chromium mobile. Mỗi cấu hình kiểm tra axe hai theme, 21 engine/capability fallback, SSR inert và các luồng tương tác.

**WebKit automation không phải Safari thật.** Fullscreen được thử khi browser hỗ trợ; nhánh không hỗ trợ phải hiện fallback rõ ràng, còn Safari/iOS và thiết bị vật lý nằm trong manual QA.

## Performance

Đã đo ba lượt/trang trước và sau trên origin HTTPS sạch. Median trước → cuối: homepage 78 → 84; PPI 94 → 87; Keyboard 83 → 75. Cả ba trang cuối chưa đạt 90. JS giảm khoảng 21 KiB/trang, nhưng TBT còn 640 / 500 / 1289 ms và benchmark CPU dao động 318,5–1437. Không chọn bộ trung gian có điểm tốt hơn thay kết quả cuối; cần đo tiếp trên CPU ổn định. Kết quả từng lượt ở PERFORMANCE.md và qa/performance.json. Việc đạt a11y/SEO 100 trên ba trang lab không phải chứng nhận toàn website hoặc WCAG thủ công.

## Docker

Máy Windows hiện tại không có Docker Engine, WSL không hoạt động. Compose CLI config đạt; Nginx Windows syntax test trước đó không tương đương container Linux. `scripts/docker-smoke.sh` và GitHub Actions đã được chuẩn bị; trạng thái chạy CI thực tế phải được dẫn bằng run URL/kết quả trong PROGRESS.md. Không có kết nối hoặc triển khai VPS.

## Phân loại nghiệm thu

| Nhóm                                                               | Trạng thái tại checkpoint trước push                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------ |
| 21 công cụ, VI/EN, theme, registry, validation, privacy            | Đã triển khai, kiểm thử tự động và rà source                 |
| Build, typecheck, lint, unit, secret/dependency scan               | Đã hoàn thành và xác minh cục bộ                             |
| Cross-browser E2E trên bản sửa cuối                                | Đã hoàn thành và xác minh: 88/88                             |
| Docker Linux và vòng đời container                                 | Đã triển khai quy trình QA, chưa xác minh tại checkpoint này |
| Lighthouse mobile ≥90 cho mọi trang đại diện                       | Chưa hoàn thành                                              |
| Safari thật, màn hình 60/120/144 Hz, bàn phím/chuột/cảm ứng vật lý | Không thể kiểm chứng bằng môi trường automation hiện tại     |
| HTTPS công khai, DNS, gia hạn, rollback VPS                        | Chưa xác minh; không triển khai khi chưa được yêu cầu        |

## Kết luận staging

Chỉ chốt khả năng staging sau khi toàn bộ E2E cuối và Docker smoke trên runner Linux đạt. Staging dùng để kiểm tra browser/phần cứng thật và hiệu năng còn mở; không đồng nghĩa production hoặc Final Acceptance. Các điều kiện chưa xác minh phải còn trên RELEASE_CHECKLIST.md, không tự chuyển sang hoàn tất.
