# Trang chủ và điều hướng Device Lab

Ngày 23/11/2026. Bản production local để duyệt. [Trang chủ tiếng Việt](http://127.0.0.1:3100/vi) · [Trang chủ tiếng Anh](http://127.0.0.1:3100/en)

## Bố cục và tương tác

- Ô **Tìm công cụ hoặc mô tả vấn đề** lọc 48 công cụ theo tên và từ khóa. Có thể gõ không dấu, dùng tiếng Việt hoặc tiếng Anh. Khi đang nhập, nhấn mũi tên xuống hoặc Enter để chuyển focus đến kết quả đầu. Nhấn Esc trong ô nhập hoặc dùng nút xóa để xóa từ khóa.
- Khối **Thiết bị đang gặp vấn đề gì?** nằm cạnh ô tìm trên desktop và ngay dưới phần tìm trên mobile. Ba tình huống giữ đủ sáu liên kết gợi ý. Từ khóa của các tình huống dùng chung cấu hình trong `src/lib/tools/problem-shortcuts.ts`.
- Header hiện **Kiểm tra thiết bị** để mở tám danh mục và **Tiện ích** để vào danh sách tám tiện ích. Nút đổi theme, đổi ngôn ngữ và tìm toàn trang vẫn dùng chung trên mỗi route.
- Hình minh họa và bảng thông tin thiết bị nằm sau danh mục công cụ. Tìm kiếm chỉ đọc index có sẵn. Liên kết công cụ vẫn dùng `PolicyLink` để áp dụng đúng Permissions Policy khi điều hướng.

Các file chính gồm `src/app/[locale]/page.tsx`, `src/components/layout/header.tsx`, `src/components/tools/home-tool-search.tsx`, `src/components/tools/problem-chooser.tsx`, các CSS Module tương ứng và nhãn next-intl VI/EN.

## Kiểm tra trên bản local

Ở viewport mô phỏng 390 × 664 px, tiêu đề khối chọn theo vấn đề trên bản tiếng Việt chuyển từ khoảng 1.026 px lên khoảng 468 px tính từ đầu trang. Ô tìm kiếm và lối tắt chẩn đoán đầu tiên nằm trong màn hình đầu ở cả hai ngôn ngữ. Số đo dựa trên vị trí DOM sau khi font tải xong, dùng để xác minh bố cục.

Lượt build đầu dùng `SITE_URL` mặc định `http://localhost:3000`. Khi đối chiếu canonical với cổng duyệt, kiểm tra dừng ở route đầu tiên. Bản local kiểm thử lại được build với `SITE_URL=http://127.0.0.1:3100`.

Lượt Playwright đầu phát hiện nhãn menu và tên công cụ tràn ở 320 px hoặc khi tăng cỡ chữ. Bản cuối cho nhãn xuống dòng và tự chuyển liên kết theo vấn đề sang một cột khi thiếu chỗ. Menu giữ các liên kết trong thứ tự Tab trên WebKit. Bài kiểm tra bấm ra ngoài menu dùng vị trí nằm ngoài lớp xổ xuống.

Firefox từng trả `43.9999847` px qua `boundingBox()` cho nút có chiều cao 44 px. WebKit chạm timeout khi kiểm tra kích thước từng liên kết trong vòng lặp. Ca reflow đọc toàn bộ kích thước trong một lần gọi DOM cho mỗi cấu hình, giữ ngưỡng 44 px, các viewport, cỡ chữ, theme và locale.

| Kiểm tra                                            | Kết quả                                                                                                                                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm typecheck`, `pnpm lint`                       | Đạt                                                                                                                                                                                                          |
| `pnpm test --maxWorkers=2`                          | 576/576 bài, có ca tìm theo triệu chứng bằng VI/EN                                                                                                                                                           |
| `pnpm build`                                        | 124/124 trang, build `_uEz7aoBnraP_2PtDypdV`                                                                                                                                                                 |
| `node scripts/smoke-http.mjs http://127.0.0.1:3100` | Healthcheck và 52 route smoke đạt                                                                                                                                                                            |
| Đối chiếu toàn bộ route công cụ                     | 96 route VI/EN của 48 công cụ, sitemap 118 URL, H1, canonical, hreflang, CSP và Permissions Policy đạt                                                                                                       |
| Playwright, 5 tệp kiểm thử liên quan                | 48/48 kịch bản đã đạt trên cùng build qua hai lượt. Lượt chính đạt 46/48. Chạy lại ca reflow sau khi chỉnh cách đo đạt 4/4. Mỗi cấu hình Chromium, Firefox, WebKit và Chromium mobile có 12/12 kịch bản đạt. |

Bản duyệt dùng loopback cổng 3100. Lượt này tập trung kiểm thử giao diện và hồi quy điều hướng. Lighthouse và Safari trên thiết bị thật chưa được đo hoặc thử lại. Ảnh desktop/mobile, log và báo cáo JSON lưu trong `artifacts/` trên máy local.
