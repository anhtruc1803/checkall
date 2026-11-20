# Tiện ích Milestone 3 — đổi đơn vị và tính ngày

## Trạng thái phát hành

Đã được người dùng duyệt và triển khai ngày **20/11/2026**, source `890aa52`: **48 công cụ VI/EN**, giữ 46 công cụ trước. CI sạch 575 unit/43 file, build 124, 466 E2E đạt/6 native policy skip; nhóm mới 32/32; public smoke 84/84. Lighthouse trước chuyển 98–100, public 96–99, mỗi bộ 20 trang × 3 mẫu sạch. Xem [Nghiệm thu M3](ACCEPTANCE-UTILITIES-MILESTONE-3.md) và [QA phát hành](qa/deployment-utilities-milestone3-2026-11-20.json); Final Acceptance tổng thể vẫn mở. Đặc tả xử lý dưới đây không đổi sau duyệt.

| ID  | Route sau locale             | Công dụng                                |
| --- | ---------------------------- | ---------------------------------------- |
| U07 | `/utilities/unit-converter`  | Đổi đơn vị trong tám nhóm                |
| U08 | `/utilities/date-calculator` | Khoảng cách hai ngày; cộng/trừ ngày lịch |

## Đổi đơn vị

| Nhóm               | Đơn vị                                                |
| ------------------ | ----------------------------------------------------- |
| Độ dài             | mm, cm, m, km, inch, foot quốc tế, yard, mile quốc tế |
| Khối lượng         | mg, g, kg, tấn mét, ounce và pound avoirdupois        |
| Diện tích          | cm², m², ha, km², ft², acre quốc tế                   |
| Thể tích           | mL, L, m³, US liquid gallon, Imperial gallon          |
| Nhiệt độ           | °C, °F, K                                             |
| Tốc độ             | m/s, km/h, mph, knot                                  |
| Thời lượng         | ms, giây, phút, giờ, ngày 24 giờ, tuần 7 ngày         |
| Dung lượng dữ liệu | bit, byte, kB/MB/GB/TB và KiB/MiB/GiB/TiB             |

Người dùng chọn định dạng VI hoặc EN tường minh, mặc định theo locale giao diện. Dùng lại parser M1: tối đa 24 chữ số nguyên, sáu chữ số thập phân; không tự đoán dấu phân cách, nhận ký hiệu tiền, dạng khoa học, NaN hoặc Infinity. Input sai/quá giới hạn giữ nguyên để sửa; kết quả cũ và nút sao chép biến mất. Giá trị âm chỉ được chấp nhận cho nhiệt độ; không nhận nhiệt độ thấp hơn 0 K.

Hệ số và offset lưu bằng phân số `BigInt`, không đổi toàn bộ đầu vào thành `Number`. Chuyển nguồn sang đơn vị cơ sở, rồi sang đích. Nhiệt độ dùng offset: đây là đổi **giá trị nhiệt độ**, không phải độ chênh nhiệt. Ví dụ 0 °C = 32 °F, −40 °C = −40 °F, −459,67 °F = 0 K. Kiểm tra 0 K trước khi làm tròn.

Hiển thị tối đa sáu chữ số thập phân theo quy tắc M1: gần nhất, đúng nửa ra xa số 0; bỏ số 0 cuối. Kết quả có ghi chú nếu phải làm tròn, kể cả khi số rất nhỏ hiển thị 0. Phép tính dùng hệ số định nghĩa chính xác không biến độ chính xác của dữ liệu người dùng thành phép đo phần cứng.

Nút **Đảo đơn vị** giữ nguyên số đã nhập và đổi nguồn/đích; không đưa kết quả đã làm tròn trở lại input. Đổi nhóm sẽ chọn cặp đơn vị hợp lệ trong nhóm mới, không ghép chéo chiều đo. Không đổi tiền tệ, sào/mẫu, US survey foot, gallon khô, ounce troy, tháng/năm hoặc dung lượng đĩa đã đo.

Một số mốc đối chiếu độc lập:

- 1 inch = 0,0254 m; 1 foot quốc tế = 0,3048 m; 1 mile quốc tế = 1.609,344 m.
- 1 pound avoirdupois = 0,45359237 kg; 16 ounce = 1 pound.
- 1 acre quốc tế = 4.046,8564224 m²; 1 US liquid gallon = 3,785411784 L; 1 Imperial gallon = 4,54609 L.
- 1 knot = 1.852 m/giờ; 1 byte = 8 bit; 1 MB = 1.000.000 B; 1 MiB = 1.048.576 B.

Nguồn hệ số: [NIST SP 811, Appendix B.8](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8), [NIST Handbook 133, Appendix E](https://www.nist.gov/document/2025-nist-handbook-133-appendix-e) và [NIST về binary prefixes](https://pml.nist.gov/cuu/Units/binary.html). Bảng NIST có thể trình bày hệ số thập phân đã làm tròn; code dùng quan hệ định nghĩa cho các đơn vị nêu trên.

## Tính ngày

Hai chế độ:

1. **Số ngày giữa hai ngày**: ngày kết thúc trừ ngày bắt đầu; cùng ngày = 0, kết thúc sớm hơn cho số âm. Không cộng thêm ngày đầu hoặc cuối; không gọi đây là số ngày tính cả hai đầu.
2. **Cộng/trừ ngày**: nhập số nguyên có dấu, tối đa bảy chữ số. `-7` lùi một tuần; `+7` tiến một tuần. Không nhận thập phân, phân nhóm hàng nghìn, dạng khoa học, khoảng trắng hoặc dấu trừ Unicode thay cho `-` ASCII. Kết quả ngoài phạm vi bị từ chối.

Lịch Gregorian kéo dài theo cùng quy tắc cho mọi năm **0001–9999**, kể cả trước mốc lịch sử áp dụng tại từng quốc gia. Năm chia hết 4 là nhuận, ngoại trừ thế kỷ không chia hết 400. Có kiểm tra ngày/tháng trước khi tạo `Date`; không cho ngày 30/2 tự chuyển sang tháng 3. Dùng `setUTCFullYear` để tránh quy tắc đặc biệt của `Date.UTC` với năm 00–99.

Chỉ tính ngày lịch, độc lập múi giờ và DST. Hai ngày cách nhau hai ngày qua thời điểm đổi DST vẫn cho 2, không suy từ chênh lệch giờ địa phương. Không phụ thuộc đồng hồ máy hoặc mặc định “hôm nay”; lúc đầu input trống, chưa có kết quả. Ngày kết quả dùng `YYYY-MM-DD` ở cả VI/EN để giữ định dạng rõ ràng, không phụ thuộc cách browser hiển thị date picker.

Tính cả cuối tuần/ngày lễ. Không tính ngày làm việc, tuổi, âm lịch, tháng/năm hoặc thời lượng theo giờ. Nút **Đảo hai ngày** đảo dấu khoảng cách; nút xóa xóa toàn bộ input và kết quả. Thay đổi input/chế độ luôn suy lại kết quả từ dữ liệu hiện tại.

## Giao diện, quyền riêng tư và lifecycle

- Dùng cùng EngineSurface, CSS utilities, next-intl và CopyResult; giao diện có nhãn tường minh, lỗi cạnh input, `aria-invalid`, mô tả liên kết và live region kết quả. Native date/select hỗ trợ thao tác bàn phím; màu dùng token Dark/Light hiện có.
- Hai engine tải riêng qua `next/dynamic`. Registry dẫn xuất search, category, SEO/canonical, related tools và sitemap; candidate có **96 route công cụ VI/EN**, **118 URL sitemap**. Không đổi kiến trúc, dependency hoặc policy.
- Không API mới, đọc clipboard, storage/lịch sử, upload, listener toàn cục, timer, worker hoặc tài nguyên phần cứng. State chỉ trong component; rời route hoặc reload xóa input. Chỉ ghi clipboard khi bấm Sao chép, có phản hồi thành công/thất bại; đổi kết quả xóa phản hồi cũ.
- Không thay engine/copy của 46 công cụ cũ. Fixture 40 thiết bị và M1 giữ nguyên; thêm fixture M2 U03–U06 lấy từ `git show HEAD:src/lib/tools/text-utilities.ts` trước khi triển khai, không sinh lại từ metadata candidate để tự xác nhận.

## Lịch sử kiểm thử local và manual QA

Kiểm thử bao gồm mốc chuyển đổi độc lập, số lớn, làm tròn, input lỗi, 0 K, đổi chéo nhóm, năm nhuận/thế kỷ, năm 0001/0099/9999, ngày sai, phạm vi, DST, VI/EN, tìm kiếm/đổi locale, clipboard fixture, theme, accessibility và reflow. Full suite giữ toàn bộ kiểm thử cũ; chỉ cập nhật tổng số công cụ/route và thêm assertions hồi quy M2.

Checkpoint local trước phát hành: **575 unit/43 file**, build **124 trang**; full E2E **438 đạt/19 skip/15 fail** do request Kaspersky, không flaky/global error. Nhóm mới **29/32 đạt**, còn 3 fail do injection. Đủ 96 route công cụ VI/EN và sitemap 118. Tại checkpoint này chưa xác minh Lighthouse sạch/mobile ≥90 và Docker/Linux; kết quả phát hành sạch nằm ở đầu tài liệu và báo cáo nghiệm thu. BUILD_ID, fingerprint và từng browser/file của lượt local nằm trong [QA JSON M3](qa/utilities-milestone3-local-2026-11-20.json). Không coi WebKit automation là Safari thật hoặc kết quả M2 public là xác minh Performance candidate M3.

Manual QA còn cần: date picker và bàn phím số/nhập dấu âm trên điện thoại thật, screen reader, Safari thật, clipboard quyền hệ thống và bộ gõ thực. Docker/Linux và Lighthouse sạch đã được xác minh trong đợt phát hành; các mục manual vẫn mở.
