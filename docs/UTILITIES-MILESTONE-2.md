# Tiện ích Milestone 2 — văn bản

## Trạng thái phát hành

Milestone 2 đã được duyệt và triển khai ngày **19/11/2026**, source `142f807`; báo cáo hoàn thiện ngày **20/11/2026**. Tổng **46 công cụ VI/EN**, giữ nguyên 42 công cụ trước. Đặc tả và quy tắc xử lý dưới đây không đổi sau duyệt.

CI sạch đạt 494 unit/41 file, build 120 trang, 434 E2E đạt/6 native policy skip; nhóm văn bản 32/32. Public smoke 56/56. Lighthouse mobile: 48 mẫu trước chuyển, median 99–100; 48 mẫu public, median 95–98. Không gộp skip/manual vào phần đã xác minh.

Xem [nghiệm thu](ACCEPTANCE-UTILITIES-MILESTONE-2.md) và [QA phát hành](qa/deployment-utilities-milestone2-2026-11-19.json) để biết source, scope browser, Docker và phần còn mở. Final Acceptance tổng thể chưa đóng. Không mở thêm Phase phần cứng hoặc milestone khác.

| ID  | Công cụ                   | Route sau `/vi` hoặc `/en`       |
| --- | ------------------------- | -------------------------------- |
| U03 | Đếm từ và ký tự           | `/utilities/word-counter`        |
| U04 | Đổi chữ hoa và chữ thường | `/utilities/case-converter`      |
| U05 | Bỏ dấu và tạo slug        | `/utilities/remove-accents-slug` |
| U06 | Làm sạch văn bản          | `/utilities/text-cleaner`        |

## Cách dùng và nền tảng

Nhập hoặc dán vào **Văn bản gốc**, chọn tùy chọn rồi bấm nút xử lý. Kết quả riêng bên dưới; thao tác sửa input/tùy chọn xóa kết quả cũ để tránh sao chép nhầm. Xóa văn bản xóa input/kết quả, giữ các lựa chọn của phiên hiện tại. Không tự chuyển nội dung gốc thành kết quả hoặc chèn HTML. Ngôn ngữ văn bản VI/EN chọn độc lập với ngôn ngữ giao diện ở những phép xử lý có dùng locale.

Ô nhập/kết quả mang thuộc tính ngôn ngữ theo lựa chọn văn bản để hỗ trợ screen reader, không đổi ngôn ngữ toàn trang. Đã kiểm tra thuộc tính và locale qua unit/E2E; vẫn cần thử screen reader thật.

Giới hạn **50.000 đơn vị UTF-16**, tính cả khoảng trắng và xuống dòng. Đầu vào vượt giới hạn vẫn ở ô nhập, hiện lỗi và khóa xử lý, không tự cắt ngắn. Emoji có thể gồm nhiều đơn vị UTF-16. Bấm xử lý ô trống tạo số đếm 0 hoặc chuỗi rỗng; trạng thái ban đầu không có kết quả giả. Nút xử lý tạm khóa trong composition; đây không phải chứng nhận mọi phiên bản EVKey/bộ gõ.

Dùng lại Registry, nhóm utilities, category/search, metadata/sitemap, next-intl, EngineSurface, CopyResult và token giao diện. Một engine `text` tải bằng `next/dynamic`; không thêm dependency, API server hoặc đổi engine thiết bị/số cũ. Các công cụ có `phase: null`, không xin capability/quyền thiết bị. Registry có 92 route công cụ VI/EN và sitemap 114 URL nội dung.

File chính: `src/lib/utilities/text.ts`, `src/lib/tools/text-utilities.ts`, `src/features/utilities/text-tool.tsx`, `text-tool.css`, Registry/ToolRunner/types, messages VI/EN. Kiểm thử mới: `tests/text-utilities.test.ts`, `tests/text-utilities-ui.test.tsx`, `tests/e2e/text-utilities.spec.ts`. Fixture 40 công cụ thiết bị cũ giữ nguyên; thêm fixture độc lập hai tiện ích Milestone 1 để so khớp toàn bộ metadata/copy.

## U03 — định nghĩa số đếm

- **Ký tự hiển thị**: grapheme cluster qua `Intl.Segmenter`, không phải `.length` hay code point. `e` + dấu kết hợp, emoji gia đình, cờ và emoji màu da/ZWJ được nhóm theo browser.
- **Không tính khoảng trắng**: bỏ những grapheme chỉ gồm whitespace JavaScript. Không tự loại mọi ký tự ẩn hoặc dấu kết hợp.
- **Từ**: segment có `isWordLike` của `Intl.Segmenter` với ngôn ngữ người dùng chọn. Có tính cụm số; không phải phân tích từ ghép hoặc ngữ nghĩa tiếng Việt. Kết quả có thể khác theo ICU/Unicode của browser.
- **Dòng**: CRLF là một xuống dòng; CR, LF, LS và PS cũng tách dòng. Chuỗi trống có 0 dòng; có ký tự xuống dòng cuối thì tính thêm dòng trống cuối.
- **Đoạn**: khối dòng không trống liên tiếp, ngăn bởi dòng trống (sau kiểm tra whitespace).
- Chi tiết gồm số code point, đơn vị UTF-16 và byte UTF-8 bằng TextEncoder. Chuỗi UTF-16 không hợp lệ được TextEncoder thay bằng ký tự thay thế theo API; không coi đây là số byte của một file gốc với encoding bất kỳ.

Ví dụ `é 👨‍👩‍👧‍👦 🇻🇳`: 5 ký tự hiển thị, 3 không tính khoảng trắng, 13 code point, 19 UTF-16, 38 byte UTF-8. Khi thiếu `Intl.Segmenter`, ba mục từ/ký tự hiển thị hiện `—` và thông báo không hỗ trợ; những mục còn lại vẫn có giá trị thật. Không lấy code point thay cho grapheme.

## U04 — quy tắc đổi hoa/thường

Bốn chế độ: toàn bộ hoa, toàn bộ thường, hoa đầu từng cụm chữ và hoa đầu câu theo quy tắc đơn giản. Chuyển bằng locale VI/EN đã chọn. Hai chế độ đầu từ/đầu câu hạ chữ thường trước, sau đó viết hoa điểm đầu. Đầu từ là chuỗi chữ Unicode có thể có dấu kết hợp, số và dấu nháy nội bộ; đầu câu theo `. ! ?` có whitespace phía sau hoặc xuống dòng. Không nhận biết tên riêng, từ viết tắt, tiêu đề biên tập hoặc dấu chấm thập phân như ngữ pháp đầy đủ. Không suy diễn ngôn ngữ. Hoa/thường có thể đổi độ dài, ví dụ `ß` thành `SS`.

## U05 — bỏ dấu và slug

**Bỏ dấu**: NFD, bỏ mark gắn sau chữ Latin, ánh xạ `đ/Đ → d/D`, đưa về NFC. Giữ hoa/thường, dấu câu và khoảng trắng. Giữ mark ngoài hệ Latin và joiner của emoji/chữ; không phiên âm mọi bảng chữ.

**ASCII slug**: bỏ dấu Latin/tiếng Việt, chuyển thường, lấy cụm `a-z`/`0-9`, nối bằng `-` hoặc `_`. Có thể mất chữ ngoài Latin cơ bản hoặc cho kết quả rỗng, ví dụ chỉ có chữ Nhật/emoji. Không biến kết quả rỗng thành một slug bịa đặt.

**Unicode slug**: NFC, chuyển thường, giữ cụm chữ/số và mark theo sau; giữ dấu tiếng Việt và các hệ chữ khác. Cũng có lựa chọn `-`/`_`. Cả hai dạng loại dấu phân cách thừa ở hai đầu. Đây là chuỗi slug, chưa URL-encode, không kiểm tra trùng hoặc bảo đảm route hợp lệ của dịch vụ khác. Ví dụ `Đà Nẵng / 2026!` → `da-nang-2026` hoặc `đà-nẵng-2026`.

## U06 — thứ tự và mặc định làm sạch

| Bước theo thứ tự          | Mặc định | Hành vi                                                                           |
| ------------------------- | -------- | --------------------------------------------------------------------------------- |
| Chuẩn hóa NFC             | Tắt      | Gộp dạng Unicode tương đương, không phiên âm                                      |
| Bỏ ký tự ẩn               | Tắt      | Chỉ U+200B, U+FEFF, U+2060, U+00AD; giữ ZWJ/ZWNJ/variation selector               |
| Gộp whitespace ngang/tab  | Bật      | Mỗi cụm thành một dấu cách, không gộp xuống dòng                                  |
| Cắt đầu/cuối từng dòng    | Bật      | Dùng whitespace của String.trim                                                   |
| Xóa dòng trống            | Tắt      | Bỏ dòng chỉ có whitespace                                                         |
| Xóa dòng trùng            | Tắt      | So khớp chính xác sau các bước trước, phân biệt hoa/thường, giữ lần đầu và thứ tự |
| Cắt whitespace ngoài cùng | Bật      | String.trim trên kết quả cuối                                                     |

Gộp khoảng trắng có thể thay đổi thụt lề. String.trim/whitespace JavaScript nhận BOM U+FEFF là whitespace, nên BOM ở lề vẫn có thể bị bỏ khi cắt lề dù tùy chọn bỏ ký tự ẩn đang tắt. Không cam kết giữ mọi ký tự ẩn với mọi tùy chọn. Giữ kiểu xuống dòng của các dòng còn lại trong hàm thuần; khi bỏ dòng cuối không tự tạo newline cuối mới. Tắt hết bảy bước giữ nguyên chuỗi đầu vào. DOM textarea có thể chuẩn hóa xuống dòng khi nhập/dán, nên không tuyên bố giữ nguyên byte/encoding của file clipboard gốc.

Không sửa ngữ pháp, dịch, khử mã HTML hoặc thực thi nội dung. Chuỗi `<script>` vẫn là văn bản trong textarea readOnly, không được xem là HTML an toàn để chèn vào một trang khác.

## Quyền riêng tư và lifecycle

Văn bản chỉ ở React state, không localStorage/sessionStorage/cookie, lịch sử, fetch, event logging, media hoặc permission query. Cờ opt-in lịch sử cũ không làm bốn tiện ích tự lưu. Không có clipboard read; người dùng dán bằng thao tác hệ thống. Clipboard write chỉ khi bấm Sao chép, xử lý cả thiếu API/từ chối quyền, giữ kết quả để chọn thủ công. Không có timer, stream hoặc listener toàn cục. Rời trang/remount khởi tạo input rỗng; browser BFCache/session restore không phải cơ chế lưu của ứng dụng.

## Bằng chứng và phần còn mở

Kết quả thật, phạm vi browser và số liệu nằm ở [PROGRESS](PROGRESS.md), [TESTING](TESTING.md), [PERFORMANCE](PERFORMANCE.md) và QA JSON milestone. Chỉ ghi đạt các bài thực chạy; không coi skip hoặc request phần mềm bảo mật là xác minh privacy sạch. WebKit automation không thay Safari thật.

Manual QA: bộ gõ EVKey/UniKey thực với composition, dán nội dung từ Word/Excel và xuống dòng, clipboard được cấp/từ chối quyền thực, Android/iOS, Safari thật và screen reader khi xử lý/lỗi/xóa kết quả. Người dùng duyệt quy tắc hoa đầu từ/câu và số đếm từ tiếng Việt theo định nghĩa đã công bố. Những yêu cầu phần cứng của 40 công cụ cũ vẫn giữ nguyên. Chưa làm xử lý file, hàng loạt, OCR, dịch, sửa ngữ pháp hoặc tài khoản/lưu văn bản.

Tham khảo thiết kế: [Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter), [Unicode Text Segmentation](https://www.unicode.org/reports/tr29/), [String.normalize](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize). Dùng segmentation native, không chứng nhận browser đang dùng bản Unicode mới nhất hoặc quy tắc hoa đầu câu tự viết đạt phân tích ngôn ngữ đầy đủ.
