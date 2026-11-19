# Tiện ích — Milestone 1, ngày 19/11/2026

## Trạng thái phát hành

Người dùng đã duyệt local và cho phép push/triển khai sau QA sạch. Source **7e3dd0b** đã công bố 42 công cụ VI/EN, giữ nguyên 40 công cụ cũ. CI 460 unit, 402 E2E đạt/6 native policy skip, tiện ích 24/24; Docker/candidate/public HTTP/UI đạt. Lighthouse trước chuyển 99–100, public 97–99, mỗi bộ 12 trang ×3 lượt sạch. Xem [QA phát hành](qa/deployment-utilities-2026-11-19.json). Manual QA/proxy/dev tooling và Final Acceptance vẫn mở.

## Phạm vi ban đầu để người dùng duyệt

Giữ nguyên 40 công cụ kiểm tra thiết bị. Bổ sung hai công cụ, giao diện VI/EN và hai nhóm khám phá: **Kiểm tra thiết bị** / **Tiện ích hằng ngày**. Đây là nhánh tiện ích riêng; không gán công cụ mới vào Phase 3 kiểm tra thiết bị. Chỉ làm local, không commit/push/CI từ xa/SSH/deploy trong milestone này.

| ID  | Route sau locale             | Công dụng                               |
| --- | ---------------------------- | --------------------------------------- |
| U01 | `/utilities/number-to-words` | Đọc số hoặc số tiền VND thành chữ VI/EN |
| U02 | `/utilities/percentage`      | Năm phép tính phần trăm                 |

Registry dùng lại `Tool`, `ToolRunner`, search index, metadata, sitemap, category page và các quy tắc Permissions-Policy hiện tại. Thêm category `utilities`; `groups.ts` ánh xạ category sang nhóm, bỏ nhóm chỉ có draft. `phase: null` đánh dấu nhánh tiện ích; 21 công cụ Phase 1 và 19 công cụ Phase 2 giữ nguyên. Hai engine mới được tải bằng `next/dynamic`, không đưa thuật toán vào engine bàn phím/chuột/media. Không thêm API, dịch vụ ngoài hoặc dependency số học.

## Quy tắc nhập và độ chính xác

- Người dùng chọn **định dạng nhập VI hoặc EN**, mặc định theo locale giao diện. Ngôn ngữ kết quả của U01 chọn độc lập; không tự thay định dạng khi đổi ngôn ngữ kết quả.
- VI: `1.234,56`; EN: `1,234.56`. `1,234` nghĩa là `1.234` trong VI và `1234` trong EN. Không tự đoán. Chỉ chấp nhận nhóm ba chữ số đúng vị trí; cho phép nhập không phân nhóm. Hiện số đã hiểu và dạng không phân nhóm trước khi dùng kết quả.
- Cho phép dấu `+`/`-`, khoảng trắng ngoài cùng. Không nhận ký hiệu tiền, dấu cách trong số, dạng khoa học, hexadecimal, NaN, Infinity hoặc chữ số ngoài ASCII. Cần chữ số trước và sau dấu thập phân nếu có dấu.
- Giới hạn 24 chữ số phần nguyên sau chuẩn hóa và 6 chữ số thập phân; chặn chuỗi đầu vào dài hơn 128 ký tự. Không chuyển toàn bộ số sang `Number`; dùng chuỗi và `BigInt`. Chỉ nhóm ba chữ số khi đọc chữ được chuyển sang `Number`.
- Chuẩn hóa số 0 âm thành 0; giữ các chữ số 0 sau dấu thập phân khi đọc số. Ví dụ `-12.0500` đọc cả hai chữ số 0 cuối.

## U01: số và số tiền thành chữ

Tiếng Việt dùng `mốt` sau hàng chục lớn hơn một, `lăm` sau hàng chục khác không, dùng `bốn` thống nhất. Có tùy chọn linh/lẻ và nghìn/ngàn. Nhóm thấp dưới 100 được đọc đủ `không trăm …` nếu trước đó có nhóm cao hơn. Nhóm lớn lặp tỷ theo từng bậc 10^9. Tiếng Anh dùng short scale, không thêm “and” trong số nguyên; các hàng chục ghép có dấu gạch nối. Tối đa bậc sextillion trong giới hạn đầu vào.

Chế độ tiền chỉ hỗ trợ **VND nguyên**; phần thập phân toàn 0 được chấp nhận là giá trị nguyên, phần lẻ khác 0 báo lỗi và ẩn nút sao chép. Không âm thầm làm tròn, không quy đổi tỷ giá. VI thêm “đồng”, EN thêm “Vietnamese dong”; có thể bật/tắt “chẵn” / “only”, viết hoa chữ đầu. Kết quả không chứng nhận tính phù hợp của chứng từ; cần đối chiếu quy cách nơi sử dụng.

| Ví dụ                         | Kết quả                                     |
| ----------------------------- | ------------------------------------------- |
| `125` VI                      | Một trăm hai mươi lăm                       |
| `1.250.000` định dạng VI, VND | Một triệu hai trăm năm mươi nghìn đồng chẵn |
| `125` kết quả EN              | One hundred twenty-five                     |
| `1,5` định dạng VI, VND       | Báo lỗi phần lẻ, không tạo kết quả tiền     |

## U02: phần trăm

| Lựa chọn                  | Công thức          | Ví dụ              |
| ------------------------- | ------------------ | ------------------ |
| A% của B                  | A × B ÷ 100        | 12,5% của 200 = 25 |
| A chiếm bao nhiêu % của B | A ÷ B × 100%       | 1/3 ≈ 33,333333%   |
| Thay đổi từ A sang B      | (B − A) ÷ A × 100% | 100 → 80 = −20%    |
| Tăng A thêm B%            | A × (1 + B ÷ 100)  | 100 tăng 10% = 110 |
| Giảm A đi B%              | A × (1 − B ÷ 100)  | 100 giảm 10% = 90  |

Tính với số nguyên có thang thập phân, chỉ làm tròn khi hiển thị kết quả đến tối đa 6 chữ số thập phân. Làm tròn về gần nhất, đúng nửa ra xa số 0; bỏ số 0 cuối không cần thiết. Hiện riêng trạng thái kết quả chính xác/đã làm tròn. Không chia cho 0. Mức thay đổi yêu cầu giá trị ban đầu dương để tránh diễn giải mơ hồ khi gốc âm; tỷ lệ hoặc tăng/giảm vẫn có thể vượt 100%, nhận giá trị âm theo công thức hiển thị. Không tự áp thuế, lãi suất hay tỷ giá.

## Quyền riêng tư và lifecycle

Không dùng localStorage/sessionStorage, cookie, lịch sử, event logging, fetch hoặc media API trong hai engine tiện ích. Giá trị nằm trong React state của trang, không có cơ chế ứng dụng khôi phục từ storage; tải lại hoặc mount phiên trang mới khởi tạo ô nhập trống. Cờ opt-in lưu lịch sử của các công cụ cũ không làm tiện ích tự lưu. Sao chép chỉ sau thao tác nút; lỗi hoặc thiếu Clipboard API có thông báo và vẫn giữ văn bản để chọn thủ công. Thông báo sao chép được đặt lại khi kết quả thay đổi. Không có stream, timer, listener toàn cục hoặc tài nguyên thiết bị cần duy trì.

## Kiểm thử và giới hạn nghiệm thu

Kết quả thực chạy: 460 unit đạt; full E2E 380 đạt/19 skip/9 fail do request Kaspersky. Fingerprint, BUILD_ID và phần chưa xác minh nằm trong `PROGRESS.md`, `TESTING.md`, `PERFORMANCE.md` và [QA JSON milestone](qa/utilities-milestone1-local-2026-11-19.json). Đủ để duyệt local, chưa đủ nghiệm thu release; Lighthouse sạch và Docker/Linux còn mở. Không lấy kết quả CI/Lighthouse của bản public ngày 16/11 làm bằng chứng cho candidate này. WebKit automation không thay cho Safari thật. Các yêu cầu nghiệm thu phần cứng của 40 công cụ cũ vẫn giữ nguyên.

Manual QA trước phát hành: người dùng duyệt VI/EN, cách đọc dùng cho chứng từ, bàn phím số/dấu âm/dấu phân cách trên Android/iOS, Clipboard thật khi được cấp/từ chối quyền, screen reader với kết quả thay đổi, Safari thật. Chưa hỗ trợ USD/ngoại tệ, đọc phân số, ordinal, đọc chữ ngược thành số, xuất file, tính hàng loạt hoặc lưu số liệu.

Tham khảo: [Unicode CLDR về number formatting và RBNF](https://unicode.org/reports/tr35/tr35-numbers.html), [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). Đây là tham khảo thiết kế, không tuyên bố bộ đọc tự viết đạt chứng nhận CLDR. Quy tắc cụ thể phía trên và các golden cases trong test là hợp đồng của milestone.
