# Mẫu giao diện Keyboard Event Inspector

Ngày 23/11/2026. Bản production local để duyệt dùng bộ màu Workbench hiện có, hỗ trợ VI/EN và Dark/Light. [Mở bản tiếng Việt](http://127.0.0.1:3100/vi/keyboard/events) · [Mở bản tiếng Anh](http://127.0.0.1:3100/en/keyboard/events)

## Giao diện và xử lý

- Desktop xem `keydown` hoặc `keyup`, `key`, `code` và thời điểm cạnh sơ đồ bàn phím. Màn hình nhỏ đặt sự kiện ngay trước sơ đồ. Cờ `repeat`, tín hiệu bộ gõ hoặc `code` rỗng chỉ hiện khi có sự kiện tương ứng.
- Nhật ký mặc định có loại sự kiện, `key`, `code` và thời điểm. Nút **Chi tiết** mở các trường còn lại ngay dưới dòng được chọn. Có thể lọc theo `key`, `code`, `keydown` và `keyup`, sao chép JSON theo bộ lọc hoặc xóa nhật ký. Giới hạn lưu trong bộ nhớ là 200 sự kiện.
- `src/features/keyboard/keyboard.tsx` đặt bảng đọc cạnh vùng thử. `keyboard-event-details.tsx`, `keyboard-event-log.tsx` và `keyboard.css` trình bày sự kiện và độ rộng cột. `src/messages/vi.json` và `src/messages/en.json` cung cấp nhãn và hướng dẫn Telex.
- Engine tiếp tục dừng và hoàn tác thống kê của lượt thu khi nhận tín hiệu IME hoặc thiếu mã phím. Nhật ký giữ sự kiện chẩn đoán đã nhận trong lượt đó. Chế độ tương thích A–Z qua `keyup` vẫn thuộc Keyboard Tester.

## Lượt EVKey người dùng thao tác

Người dùng đã bấm phím trên tab tiếng Việt của bản local. Bảng ghi dưới đây theo thứ tự browser nhận sự kiện.

| Thứ tự | Sự kiện   | `key`       | `code`      |
| ------ | --------- | ----------- | ----------- |
| 1      | `keydown` | `d`         | `KeyD`      |
| 2      | `keyup`   | `d`         | `KeyD`      |
| 3      | `keydown` | `Backspace` | `Backspace` |
| 4      | `keyup`   | `Backspace` | `Backspace` |
| 5      | `keydown` | `đ`         | `""`        |

Thẻ sự kiện gần nhất hiển thị `đ`, `""` và cảnh báo **Thiếu code**. Capture đã dừng. Nhật ký giữ đủ năm sự kiện và tiến độ của lượt thu trở về 0. Dữ liệu phản ánh đúng những gì tab quan sát. Chưa xác định được mọi sự kiện EVKey có thể phát sau thời điểm engine tự dừng, hay hành vi của cấu hình bộ gõ khác. Lượt này được đọc trước lần chỉnh độ rộng cột và nhãn trợ năng cuối. Logic thu phím giữ nguyên trong các lần chỉnh đó.

## Kiểm thử

Kiểm thử tự động bao gồm cặp D thường, gõ hai lần D, fixture Backspace thay thế và `đ` thiếu `code`, IME 229, lọc lượt thả D, mở chi tiết bằng bàn phím, xóa nhật ký, reset và kiểm tra hồi quy B01–B04. Kiểm tra giao diện bao gồm axe ở hai theme và reflow 320, 375, 414, 768 px với chữ 200%.

| Kiểm tra                                                                             | Kết quả                                                                                                     |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`, `pnpm lint`                                                        | Đạt                                                                                                         |
| `pnpm test --maxWorkers=2`                                                           | 575/575 đạt trong 43 tệp khi chạy riêng                                                                     |
| `pnpm build`                                                                         | 124/124 trang, build `0I4VYNpiGs-2YqSV7C4O1`                                                                |
| `node scripts/smoke-http.mjs http://127.0.0.1:3100` và rà soát toàn bộ route công cụ | Healthcheck và 52 route smoke đạt. Kiểm tra đủ 96 route công cụ VI/EN và 48 công cụ.                        |
| Playwright, 5 tệp kiểm thử bàn phím                                                  | 60/60 đạt. Chromium, Firefox, WebKit và Chromium mobile mỗi cấu hình 15/15. Không có bài bỏ qua hoặc flaky. |

Lượt kiểm thử giao diện đã phát hiện tên truy cập của bộ lọc kèm chữ trong các lựa chọn và cột nhật ký tràn ở 768 px khi chữ 200%. Bản cuối gắn nhãn bộ lọc riêng, cho giá trị xuống dòng và đã chạy lại cả bốn cấu hình. WebKit automation kiểm tra engine WebKit. Lượt này chưa kiểm thử Safari trên thiết bị thật.

Một bài Key Chatter chạm timeout 5 giây trong lượt unit chạy cùng Playwright. Lượt unit chạy riêng đạt đủ 575 bài với timeout giữ nguyên. Báo cáo JSON và log build lưu trong `artifacts/` trên máy local.

Preview ảnh được chụp từ lượt Playwright nhập D. Dữ liệu gõ tay chỉ được tóm tắt ở bảng trên. [Khảo sát EVKey trước đây](KEYBOARD-IME-SURVEY.md)
