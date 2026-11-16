# Rà soát nội dung giao diện — 12/11/2026

## Phạm vi

Theo yêu cầu người dùng, rà nội dung trang chủ, danh mục, 40 công cụ, quyền riêng tư và thông báo lỗi trong cả VI/EN. Bản làm việc local, nối tiếp chế độ EVKey đã được người dùng phản hồi là ổn. Phản hồi này không thay thế ma trận kiểm thử phần cứng. Không tự commit, push, chạy CI từ xa hoặc cập nhật website/VPS.

## Nội dung đã tinh gọn

- Bỏ FAQ công cụ vốn lặp nguyên văn phương pháp và giới hạn trên cả 80 route VI/EN. Giữ hướng dẫn, phương pháp, giới hạn, công cụ liên quan, H1, metadata và breadcrumb.
- Không hiện badge “không yêu cầu quyền” trên mọi công cụ; vẫn hiện yêu cầu quyền ở microphone/camera. Phép kiểm tra có phân loại và thông tin xử lý cục bộ như trước.
- Rút gọn 170 trường mô tả/hướng dẫn/phương pháp/giới hạn trong registry và các module công cụ. Thay thông tin context, timer, observer, cleanup, thuật toán cập nhật UI và chi tiết triển khai bằng thao tác, cách đọc kết quả và lưu ý cần biết. Giữ công thức PPI/tỷ lệ và thông tin kỹ thuật cần thiết cho Event Inspector, FFT, WebGL hoặc phép kiểm tra API.
- Viết lại 87 thông báo hiện có ở mỗi ngôn ngữ: quyền, âm thanh, camera, tay cầm, thiết bị, chuột, bàn phím và hướng dẫn chọn công cụ theo vấn đề. Nhãn tốc độ lấy mẫu ghi nguồn trình duyệt, FPS video vẫn tách với FPS luồng được báo.
- Bỏ mã A05/B01 khỏi thẻ công cụ. Bản tóm tắt đã lưu hiển thị tên công cụ VI/EN; ID cũ hoặc không có trong danh mục dùng nhãn lượt kiểm tra chung. Tra cứu chỉ chấp nhận thuộc tính riêng, tránh nhầm các tên như `__proto__` với dữ liệu công cụ.
- Trang quyền riêng tư chia thành ba phần: tùy chọn trên thiết bị, phím/chuột/lịch sử và microphone/camera. Không còn đoạn dài nói về AudioContext, track, pixel readback hoặc việc liệt kê thiết bị.
- Sửa xuống dòng nút xóa dữ liệu ở 320 px/chữ 200%; sửa cụm từ dài trong cảnh báo dd và cho phép ngắt từ khi cần. Không nới assertion reflow.

Ví dụ: mô tả Fullscreen không còn nhắc requestFullscreen/ResizeObserver/cleanup mà chỉ nói cách mở vùng thử, thoát và đọc kích thước. Cảnh báo microphone tập trung vào cấp quyền, không ghi âm/gửi dữ liệu và kiểm tra mute/thiết bị đầu vào nếu không có tín hiệu.

Giữ các cảnh báo cần thiết: dd → đ và Backspace do bộ gõ, A–Z chỉ nhận qua keyup và tách phép đo, quyền truy cập trước Bắt đầu, giảm âm lượng trước phát tín hiệu, không dùng làm phép đo thính lực, giới hạn thông số phần cứng và lưu lịch sử theo opt-in. Không tạo số đo hoặc tự kết luận thiết bị hỏng.

## Kiểm soát phạm vi mã nguồn

Đối chiếu AST trước/sau sáu module registry xác nhận chỉ đổi giá trị nội dung; metadata, route, engine, permission, capability và logic công bố không đổi. Tổng nội dung được kiểm tra trong các module này giảm từ 39.424 xuống 28.631 ký tự cho hai ngôn ngữ; đây là số ký tự source, **không phải** JavaScript transfer hoặc điểm Performance. File thông báo còn đủ bộ khóa VI/EN và cùng placeholder. Khóa FAQ trùng và đoạn quyền riêng tư cũ được bỏ, thay bằng ba mục mới.

Không đổi testing engine, session, hook nhận phím/keyup/cảnh báo D, dependency, API, chính sách quyền hoặc hạ tầng. Riêng tên công cụ trong lịch sử được truyền từ server bằng bảng tên nhỏ; không import toàn bộ registry vào client component. Không thay schema dữ liệu đã lưu hoặc bật lưu tự động.

Áp dụng hướng dẫn UI/UX Pro Max về vị trí trợ giúp nhất quán và accessibility. Truy vấn riêng cho câu chữ ngắn không tìm được kết quả phù hợp trong dữ liệu skill; phần biên tập dùng tiêu chí rõ nghĩa, ít trùng lặp, giúp thao tác hoặc hiểu kết quả, không mô tả đây là khuyến nghị đã được tra cứu thành công.

## File chính

- `src/app/[locale]/[category]/[slug]/page.tsx`: bỏ FAQ trùng và badge không có quyền.
- `src/lib/tools/registry.ts`, `phase2-milestone2.ts` đến `phase2-milestone6.ts`: nội dung công cụ.
- `src/messages/vi.json`, `src/messages/en.json`: thông báo ngắn, rõ và đủ hai ngôn ngữ.
- `src/app/[locale]/privacy/page.tsx`, `src/components/tools/privacy-settings.tsx`: quyền riêng tư và tên lượt đã lưu.
- `src/components/tools/tool-card.tsx`, `src/app/globals.css`, `src/features/keyboard/keyboard.css`: bỏ mã hiển thị, sửa xuống dòng.
- `tests/e2e/user-content.spec.ts`: mở đủ 80 trang, kiểm tra nội dung/SEO và lịch sử VI/EN, khóa lạ, xóa dữ liệu, accessibility/reflow. Các test cũ chỉ đổi câu/nhãn được tìm, giữ kiểm tra hành vi, thông số, privacy và lifecycle.

## Kiểm chứng và giới hạn

Đã có typecheck/lint và build 106 trang đạt; toàn bộ unit giữ 333 bài, không bỏ assertion hoặc tăng timeout. Lượt đầu có 8 fail (câu cũ và timeout ở bài nhiều sự kiện); đã cập nhật selector và chạy lại. Lượt cuối dùng hai worker để giảm tranh chấp tài nguyên, giữ toàn bộ test và timeout như cũ. Kiểm tra ban đầu phát hiện tràn nút xóa dữ liệu ở chữ 200%; đã sửa và bài privacy đạt lại. Lượt E2E dở trước sửa cảnh báo/selector hình minh họa đã dừng, không được coi là full gate.

Full E2E bản cuối: **359 pass/19 skip/6 fail**, flaky 0, global error 0; 1.532.870,849 ms. Nhóm nội dung mới 8/8 và bàn phím 52/52 đạt.

| Browser  | Pass | Skip | Fail |
| -------- | ---: | ---: | ---: |
| chromium |   94 |    0 |    2 |
| firefox  |   91 |    3 |    2 |
| webkit   |   80 |   16 |    0 |
| mobile   |   94 |    0 |    2 |

Các failure: Request từ script Kaspersky chèn ngoài ứng dụng. Chưa đạt full gate, giữ nguyên bằng chứng lỗi. Control HTML trắng trong lượt này xác nhận script/POST Kaspersky ngoài mã ứng dụng. Các skip theo điều kiện runtime cũ vẫn chưa xác minh native API. HTTP health+34 route/scoped policy, Prettier và secret scan đạt. Đã xem bốn ảnh local Light/Dark/desktop/mobile/chữ 200%. Fingerprint và số liệu thực tại [QA JSON](qa/content-review-local-2026-11-12.json) và TESTING.md; các kết quả milestone trước chỉ là lịch sử.

Không đo lại Lighthouse trong môi trường Windows đã xác minh có script Kaspersky chèn từ ngoài ứng dụng. Không suy điểm ≥90 từ việc giảm chữ, không lấy kết quả public trước thay cho source mới. WebKit automation không chứng nhận Safari thật. Kiểm thử thiết bị, screen reader/OS zoom và các tiêu chí Final Acceptance còn mở. Preview chỉ trên loopback; không thay website đang phục vụ.
