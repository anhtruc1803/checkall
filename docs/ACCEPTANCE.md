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

Xác minh độc lập trên Linux: toàn [CI run 40816709418](https://github.com/anhtruc1803/checkall/actions/runs/40816709418) của commit d82120b **success**, cả verify và docker-smoke. Verify đạt typecheck/lint/secret scan/build, 29 unit và 88 E2E (2,2 phút E2E). Những commit tiếp theo chỉ cập nhật tài liệu/bằng chứng, không được mô tả như một lần đo Lighthouse mới.

**WebKit automation không phải Safari thật.** Fullscreen được thử khi browser hỗ trợ; nhánh không hỗ trợ phải hiện fallback rõ ràng, còn Safari/iOS và thiết bị vật lý nằm trong manual QA.

## Performance

Đã đo ba lượt/trang trước và sau trên origin HTTPS sạch. Median trước → cuối: homepage 78 → 84; PPI 94 → 87; Keyboard 83 → 75. Cả ba trang cuối chưa đạt 90. JS giảm khoảng 21 KiB/trang, nhưng TBT còn 640 / 500 / 1289 ms và benchmark CPU dao động 318,5–1437. Không chọn bộ trung gian có điểm tốt hơn thay kết quả cuối; cần đo tiếp trên CPU ổn định. Kết quả từng lượt ở PERFORMANCE.md và qa/performance.json. Việc đạt a11y/SEO 100 trên ba trang lab không phải chứng nhận toàn website hoặc WCAG thủ công.

## Docker

Máy Windows hiện tại không có Docker Engine, WSL không hoạt động. Docker được xác minh thực tế trên runner Linux tại [run 40816709418](https://github.com/anhtruc1803/checkall/actions/runs/40816709418), job docker-smoke đạt trong 1 phút 23 giây. Production image build đạt; Compose/healthcheck, Nginx và tám route VI/EN qua proxy đạt ba lần: ban đầu, sau restart, sau stop/start. Node 3000 không có published port; chỉ Nginx bind 127.0.0.1:8080 trong QA. SIGTERM exit 143 đúng Next.js 16.4.3, OOMKilled false, Error rỗng. Logs không có lỗi ứng dụng hoặc HTTP 4xx/5xx trong lượt smoke. Artifact logs/containers/shutdown được upload trước khi dọn project QA. Chưa thử drain request dài hoặc HTTPS công khai; không có kết nối hoặc triển khai VPS.

## Phân loại nghiệm thu

| Nhóm                                                               | Trạng thái rà soát hiện hành                                 |
| ------------------------------------------------------------------ | ------------------------------------------------------------ |
| 21 công cụ, VI/EN, theme, registry, validation, privacy            | Đã triển khai, kiểm thử tự động và rà source                 |
| Build, typecheck, lint, unit, secret/dependency scan               | Đã xác minh cục bộ; CI xác minh lại trừ dependency audit     |
| Cross-browser E2E trên bản sửa cuối                                | Đã hoàn thành và xác minh: 88/88                             |
| Docker Linux và vòng đời container                                 | Đã hoàn thành và xác minh trên CI Linux                      |
| Lighthouse mobile ≥90 cho mọi trang đại diện                       | Chưa hoàn thành                                              |
| Safari thật, màn hình 60/120/144 Hz, bàn phím/chuột/cảm ứng vật lý | Không thể kiểm chứng bằng môi trường automation hiện tại     |
| Template/quy trình HTTPS, DNS, gia hạn, rollback VPS               | Đã triển khai tài liệu nhưng chưa xác minh trên hạ tầng thật |

## Kết luận staging

**Đủ điều kiện kỹ thuật để đưa lên staging phục vụ QA có kiểm soát:** toàn E2E và Docker smoke Linux đã đạt. Đây chưa phải staging đã được triển khai, không phải nghiệm thu đầy đủ hoặc cho phép production. Không có kết nối VPS.

**Final Acceptance vẫn mở.** Mục tiêu Performance ≥90 chưa đạt, Safari/phần cứng thật và hạ tầng HTTPS còn chưa xác minh. Không có ngoại lệ Performance nào được chủ sở hữu chấp nhận. Tiếp theo: đo trên CPU ổn định và điều tra main-thread, thực hiện manual QA trong TESTING.md, chỉ cấu hình hạ tầng thật sau khi được yêu cầu. Không mở Phase 2/3.
