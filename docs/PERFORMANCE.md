# Hiệu năng và kết quả đo

## Tiện ích Milestone 3 đã triển khai — 20/11/2026

Trước chuyển đủ **60 mẫu sạch/20 trang × 3**, median mobile **98–100**; sau chuyển đủ **60 mẫu sạch/20 trang × 3**, median **96–99**. Median Accessibility/Best Practices/SEO 100 trên mọi trang ở cả hai bộ. Đối chiếu source/path/pageVerified/clean của từng mẫu; đủ 120 mẫu, FCP/LCP/TBT/CLS và byte JS/font/ảnh trong [QA phát hành](qa/deployment-utilities-milestone3-2026-11-20.json). Không lấy điểm Windows 76 có injection làm baseline hoặc nhận chênh lệch lab/public là thay đổi do code.

[CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/44663888110), [Lighthouse trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/44663904488) và [Lighthouse public](https://github.com/anhtruc1803/checkall/actions/runs/44668621145)

| Trang                               | Lab trước chuyển | Public | FCP public ms | LCP public ms | TBT public ms | CLS public |
| ----------------------------------- | ---------------: | -----: | ------------: | ------------: | ------------: | ---------: |
| `/vi`                               |               98 |     98 |       1079.09 |       1079.09 |        116.00 |    0.00000 |
| `/en`                               |              100 |     98 |       1079.65 |       1083.91 |        101.00 |    0.00000 |
| `/vi/keyboard/tester`               |              100 |     99 |       1007.57 |       1007.57 |        103.00 |    0.00000 |
| `/en/audio/microphone`              |               99 |     99 |       1351.67 |       1351.67 |        103.00 |    0.00505 |
| `/vi/camera/preview`                |               98 |     99 |       1365.22 |       1365.22 |        106.00 |    0.00050 |
| `/en/gamepad/tester`                |               98 |     99 |       1376.03 |       1376.03 |        105.00 |    0.01514 |
| `/vi/utilities/number-to-words`     |               98 |     99 |        969.79 |        969.79 |         96.00 |    0.00000 |
| `/en/utilities/percentage`          |              100 |     99 |        978.01 |        978.01 |        102.00 |    0.00000 |
| `/vi/utilities/word-counter`        |              100 |     99 |        974.02 |        974.02 |        104.00 |    0.00000 |
| `/en/utilities/word-counter`        |               99 |     96 |        961.91 |        961.91 |        183.00 |    0.00000 |
| `/vi/utilities/case-converter`      |               98 |     97 |        976.16 |        976.16 |        151.50 |    0.00000 |
| `/en/utilities/case-converter`      |              100 |     98 |        972.43 |        972.43 |        119.00 |    0.00000 |
| `/vi/utilities/remove-accents-slug` |              100 |     98 |        985.79 |        985.79 |        128.50 |    0.00000 |
| `/en/utilities/remove-accents-slug` |              100 |     98 |        964.17 |        964.17 |        115.00 |    0.00000 |
| `/vi/utilities/text-cleaner`        |              100 |     99 |        981.52 |        981.52 |        104.00 |    0.00000 |
| `/en/utilities/text-cleaner`        |               98 |     98 |        938.93 |        938.93 |         98.00 |    0.00000 |
| `/vi/utilities/unit-converter`      |               99 |     99 |        966.49 |        966.49 |        108.50 |    0.00000 |
| `/en/utilities/unit-converter`      |              100 |     99 |        972.84 |        972.84 |         96.50 |    0.00000 |
| `/vi/utilities/date-calculator`     |               98 |     99 |        979.57 |        979.57 |         96.00 |    0.00000 |
| `/en/utilities/date-calculator`     |              100 |     97 |        985.27 |        985.27 |        157.50 |    0.00000 |

Hai bộ cùng source `890aa52d9af73d1d36fd96b79d941adcb20296ed`: mỗi trang ba lượt Chromium/profile mới, extension tắt, mobile/throttling mô phỏng cùng cấu hình ghi trong [QA phát hành](qa/deployment-utilities-milestone3-2026-11-20.json). Public đo sau khi smoke kết thúc. VM/origin/HTTP khác HTTPS proxy nên không quy chênh lệch điểm cho code. Mẫu Windows có Kaspersky không dùng so sánh tối ưu. Không bỏ công cụ/SEO/accessibility hoặc sửa UI đã duyệt để lấy điểm. Đây là Lighthouse lab, không phải field Core Web Vitals.

Toàn bộ 120 mẫu, số đo không làm tròn, settings/execution và byte Script/Font/Image/Document/CSS nằm trong QA JSON; raw HTML/JSON bị ignore. Mục tiêu median mobile ≥90 đạt trên 20 trang đại diện trước và sau triển khai. Xem [Nghiệm thu M3](ACCEPTANCE-UTILITIES-MILESTONE-3.md); các mục manual/field data còn mở.

## Lịch sử trước phát hành: Tiện ích Milestone 3 — local để duyệt, 20/11/2026

Build cuối `53i7Q8tGFzXpfNgRhVJ7k`, chưa commit/push/deploy. Hai engine tải riêng; unit **7.594 byte / gzip ước tính 2.864 byte**, date **4.761 / 1.783 byte**. Không tải trên `/vi`, `/vi/keyboard/tester`, `/vi/utilities/number-to-words`; có trên bốn route mới VI/EN trong runtime graph. Không thêm dependency, font/ảnh hoặc bỏ SEO/accessibility; messages và Registry tăng payload chung, không tuyên bố không overhead.

Đã yêu cầu Lighthouse mobile ba lượt/trang trên sáu trang (bốn route mới VI/EN, trang chủ và Keyboard Tester), profile Chromium mới và extension tắt. Chạy sau full E2E để không có tải QA đồng thời. Guard phát hiện Kaspersky và dừng đúng thiết kế ở mẫu đầu; **không có median sạch**, **chưa xác minh mobile ≥90 cho M3**. Số dưới chỉ chẩn đoán bị loại, không phải Performance nghiệm thu:

| Trang                          | Lượt | Performance thô |  FCP ms |  LCP ms | TBT ms |     CLS | Sạch  |
| ------------------------------ | ---: | --------------: | ------: | ------: | -----: | ------: | ----- |
| `/vi/utilities/unit-converter` |    1 |              76 | 2862.72 | 2862.72 | 539.00 | 0.00000 | không |

[QA JSON M3](qa/utilities-milestone3-local-2026-11-20.json) giữ số thô, external origins, điều kiện đo và runtime graph; raw HTML/JSON trong artifacts bị ignore. Gzip là phép nén ước tính của riêng chunk, không phải transfer toàn trang. Không lấy điểm public M2 95–98 làm xác minh candidate hoặc so sánh cải thiện với mẫu Windows có injection. Máy không có Docker/Linux khả dụng; để ngỏ đo sạch trước gate phát hành sau duyệt, không tắt phần mềm bảo mật hoặc giảm guard để lấy điểm. Không suy Lighthouse lab thành field Core Web Vitals.

Trong mẫu bị loại, Script transfer tổng **384.829 byte** gồm **200.634 byte từ ứng dụng local** và **184.195 byte từ origin Kaspersky**; font 56.135 byte, ảnh 0 byte. Phần script chèn được xác minh bằng network log, nhưng không thể quy toàn bộ TBT 539 ms hoặc điểm 76 cho một nguồn khi chưa có phép đo sạch đối chứng. Chưa có dữ liệu để kết luận Performance của code M3 dưới 90 hoặc để tối ưu dựa trên mẫu này.

## Tiện ích Milestone 2 — đo sạch trước/sau chuyển 19/11/2026

Báo cáo hoàn thiện và kiểm tra lại HTTP ngày **20/11/2026**; số liệu CI, Lighthouse và snapshot Docker/runtime bên dưới thuộc đợt phát hành **19/11/2026**. Kết luận và phân loại chi tiết: [Nghiệm thu Milestone 2](ACCEPTANCE-UTILITIES-MILESTONE-2.md).

Source **142f807dbb87374452acb65a8be6e2052caa5367**, [CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/44492926836), [Lighthouse trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/44493548246) và [Lighthouse public](https://github.com/anhtruc1803/checkall/actions/runs/44498282182). Giữ nguyên 42 công cụ trước (40 thiết bị + U01/U02), thêm U03–U06: **46 công cụ VI/EN**, **92 route công cụ**, sitemap **114 URL**. Mã ứng dụng, tests và scripts không đổi từ bản người dùng đã duyệt; các commit sau chỉ chuẩn hóa CI/tài liệu.

Trước chuyển đủ **48 mẫu sạch/16 trang × 3**, median mobile **99–100**; sau chuyển đủ **48 mẫu sạch/16 trang × 3**, median **95–98**. Cả hai bộ có median Accessibility/Best Practices/SEO 100 trên mọi trang. Kiểm tra source/path/pageVerified/clean của từng mẫu; không chỉ dựa job success. Giữ toàn bộ 96 sample và median FCP/LCP/TBT/CLS/JS/font/ảnh trong [QA phát hành](qa/deployment-utilities-milestone2-2026-11-19.json). Không lấy mẫu Windows bị Kaspersky chèn hoặc dữ liệu M1 làm baseline tăng điểm M2.

| Trang                               | Lab trước chuyển | Public | FCP public (ms) | LCP public (ms) | TBT public (ms) | CLS public |
| ----------------------------------- | ---------------: | -----: | --------------: | --------------: | --------------: | ---------: |
| `/vi`                               |              100 |     97 |         1092.17 |         1099.54 |          173.50 |    0.00000 |
| `/en`                               |              100 |     95 |          957.67 |          957.67 |          227.50 |    0.00000 |
| `/vi/keyboard/tester`               |              100 |     97 |          936.51 |          936.51 |          179.00 |    0.00000 |
| `/en/audio/microphone`              |               99 |     97 |         1277.04 |         1277.04 |          182.00 |    0.00621 |
| `/vi/camera/preview`                |               99 |     97 |         1188.26 |         1188.26 |          189.00 |    0.00038 |
| `/en/gamepad/tester`                |               99 |     97 |         1241.42 |         1241.42 |          179.00 |    0.01839 |
| `/vi/utilities/number-to-words`     |               99 |     97 |          939.88 |          939.88 |          185.50 |    0.00000 |
| `/en/utilities/percentage`          |              100 |     98 |          989.61 |          989.61 |          163.00 |    0.00000 |
| `/vi/utilities/word-counter`        |               99 |     98 |          936.76 |          936.76 |          152.50 |    0.00000 |
| `/en/utilities/word-counter`        |              100 |     98 |          988.35 |          988.35 |          154.50 |    0.00000 |
| `/vi/utilities/case-converter`      |              100 |     97 |          987.85 |          987.85 |          162.00 |    0.00000 |
| `/en/utilities/case-converter`      |              100 |     98 |          995.75 |          995.75 |          157.00 |    0.00000 |
| `/vi/utilities/remove-accents-slug` |               99 |     97 |          995.54 |          995.54 |          170.50 |    0.00000 |
| `/en/utilities/remove-accents-slug` |              100 |     98 |          941.33 |          941.33 |          158.00 |    0.00000 |
| `/vi/utilities/text-cleaner`        |               99 |     97 |          982.38 |          982.38 |          172.50 |    0.00000 |
| `/en/utilities/text-cleaner`        |               99 |     97 |          992.49 |          992.49 |          163.00 |    0.00000 |

Mỗi trang ba lượt Chromium/profile mới, extension tắt, mobile/throttling mô phỏng cùng cấu hình trong báo cáo. Public đo sau khi smoke kết thúc để tránh tải QA đồng thời. Hai bộ khác VM/origin/HTTP so với HTTPS proxy: không quy chênh lệch điểm/TBT cho code. Không bỏ công cụ/SEO/accessibility hoặc sửa UI đã duyệt để lấy điểm. Không coi Lighthouse lab là Core Web Vitals thực địa hoặc chứng nhận mọi thiết bị.

FCP/LCP/TBT/CLS và byte JS/font/ảnh/document/CSS của mọi sample cùng execution/settings được giữ trong [QA phát hành](qa/deployment-utilities-milestone2-2026-11-19.json); không chỉ lấy sample cao nhất. Nguồn Windows Performance 73 trước đây bị injection và không đủ ba mẫu, giữ làm chẩn đoán, không dùng tính mức cải thiện. Mục tiêu median mobile ≥90 đạt trên 16 trang đại diện của release; field data và manual QA còn mở.

## Lịch sử trước phát hành: Milestone 2 candidate local 19/11/2026

Thêm bốn tiện ích văn bản, tổng 46 công cụ; chưa phát hành. Giữ dependency hiện có, font/ảnh/SEO/accessibility và 42 công cụ trước. Thuật toán chỉ xử lý khi bấm nút, giới hạn 50.000 UTF-16, không chạy segmentation lại trên từng lần gõ. Dùng `Intl.Segmenter` native, không tải polyfill hoặc thư viện xử lý văn bản.

Runtime graph trên Chromium/profile mới xác minh chunk engine text **11.595 byte**, gzip ước tính riêng chunk **3.925 byte**: không tải trên `/vi`, `/vi/keyboard/tester`, `/vi/utilities/number-to-words`; có tải trên `/vi/utilities/word-counter` và `/en/utilities/text-cleaner`. Đây là kiểm tra tách bundle trên năm route, không phải tổng JS/transfer hoặc chứng nhận mọi route và không phải Lighthouse sạch. Tài nguyên đo lưu tại `artifacts/text-runtime-graph.json`.

Messages vẫn do provider hiện có cấp cho mỗi locale; thêm namespace văn bản và bốn mục search làm tăng payload chung. Vì vậy không suy từ chunk tải riêng thành “không có overhead trên trang cũ”. Chưa có phép đo transfer sạch trước/sau cùng điều kiện để định lượng ảnh hưởng tổng thể; không thay kiến trúc provider chỉ từ mẫu Lighthouse bị nhiễu.

Đã thử `node scripts/lighthouse.mjs --base-url http://127.0.0.1:3100 --label text-milestone2-local --runs 3 --paths /vi/utilities/word-counter,/en/utilities/word-counter,/vi/utilities/case-converter,/en/utilities/case-converter,/vi/utilities/remove-accents-slug,/en/utilities/remove-accents-slug,/vi/utilities/text-cleaner,/en/utilities/text-cleaner`. Script dừng đúng guard ngay mẫu đầu vì `http://gc.kis.v2.scr.kaspersky-labs.com` được chèn dù profile mới, extension tắt. Đây là lượt chẩn đoán môi trường đồng thời với E2E, trước chỉnh khoảng cách CSS cuối; **không hợp lệ để đánh giá hiệu năng build cuối, không đủ ba mẫu/trang và không tính median**.

Giữ số liệu thô bị loại để minh bạch: `/vi/utilities/word-counter` Performance73, FCP/LCP 2.872,7133 ms, TBT697 ms, CLS0, JS385.765 byte, font56.135 byte, ảnh0, document91.515 byte, CSS17.892 byte; A11y100/BP81/SEO92. Những số này chịu script ngoài ứng dụng và tải máy, không chứng minh regression code hoặc làm căn cứ tối ưu. Raw `artifacts/performance/text-milestone2-local/runs.json`; không bỏ nội dung/SEO/a11y hoặc nới guard để nâng điểm.

**Chưa xác minh mobile≥90 cho M2.** Median sạch M1 public97–99 phía dưới là lịch sử source khác, không kế thừa sang candidate. Sau duyệt local và trước phát hành cần đo lại Linux/Chromium sạch, không E2E đồng thời, ít nhất ba lượt mỗi trang đại diện trong điều kiện tương đương, lưu mọi mẫu và median FCP/LCP/TBT/CLS/JS/font/ảnh. Nếu median dưới90 phải phân tích trace dữ liệu thật. Không có kết luận “trước/sau tăng điểm” trong lượt local này.

## Tiện ích Milestone 1 — đo sạch trước và sau triển khai 19/11/2026

Source **7e3dd0b119ef9c59da69f3b244787b9f5a9c1d04**, giữ 40 công cụ cũ và thêm hai tiện ích. [Lab trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/44445554690) đủ **36 lượt sạch/12 trang ×3**, median mobile **99–100**. [HTTPS public](https://github.com/anhtruc1803/checkall/actions/runs/44449524546) đủ **36 lượt sạch/12 trang ×3** trên đúng release, median **97–99**. Chromium/profile mới, extension tắt; mọi sample qua guard pageVerified/clean. Median A11y/Best Practices/SEO đều 100 ở hai bộ; đã đọc dữ liệu thực, không chỉ kết luận job success. Không sửa thêm code, bỏ tính năng/nội dung/SEO/a11y để lấy điểm.

| Trang                           | Lab trước chuyển | Public | LCP public (ms) | TBT public (ms) | CLS public |
| ------------------------------- | ---------------: | -----: | --------------: | --------------: | ---------: |
| `/vi`                           |              100 |     98 |         1046.61 |          142.00 |    0.00000 |
| `/en`                           |              100 |     99 |         1040.38 |           95.00 |    0.00000 |
| `/vi/keyboard/tester`           |              100 |     97 |          992.95 |          158.00 |    0.00000 |
| `/en/keyboard/tester`           |              100 |     98 |          997.29 |          132.00 |    0.00000 |
| `/vi/privacy`                   |               99 |     99 |         1025.51 |           97.00 |    0.00729 |
| `/en/audio/microphone`          |               99 |     99 |         1366.00 |          107.00 |    0.00466 |
| `/vi/camera/preview`            |               99 |     99 |         1366.54 |          106.00 |    0.00038 |
| `/en/gamepad/tester`            |               99 |     99 |         1387.70 |          104.00 |    0.01514 |
| `/vi/utilities/number-to-words` |              100 |     98 |          972.21 |          123.50 |    0.00000 |
| `/en/utilities/number-to-words` |               99 |     99 |          981.02 |           99.00 |    0.00000 |
| `/vi/utilities/percentage`      |               99 |     98 |          936.51 |           98.50 |    0.00000 |
| `/en/utilities/percentage`      |              100 |     99 |          946.68 |           96.50 |    0.00000 |

Bảng là median ba lượt/trang, làm tròn để hiển thị. FCP/LCP/TBT/CLS/Speed Index, byte JS/font/ảnh/document/CSS, CPU benchmark, môi trường/throttling của **toàn bộ 72 sample** và median chưa làm tròn được giữ trong [QA phát hành](qa/deployment-utilities-2026-11-19.json). Raw tại artifact lighthouse-mobile của hai run; bản local trong `artifacts/utilities-lab-clean` và `artifacts/utilities-public-performance`.

Lab và public khác VM/origin/network/CPU, không quy chênh lệch điểm thành hồi quy/tăng tốc do code. Label `ui-before` là tên workflow dùng lại cho candidate-only, không phải source 40 công cụ trước đó. Mẫu Windows 84 bị chèn vẫn bị loại, không dùng tính mức cải thiện. Chỉ đo idle, không tự cấp quyền hoặc khởi chạy engine phần cứng; không nhận 12 trang là toàn bộ 84 route/trạng thái hoặc dữ liệu thực địa. Các phần dưới là checkpoint lịch sử.

## Đo sạch source 57a5de2 và HTTPS public — 16/11/2026

Source **57a5de29307418c9d060f50e7e1e527bb1626eba**, [CI 43804594079](https://github.com/anhtruc1803/checkall/actions/runs/43804594079) success verify/Docker. Typecheck/lint/secret scan, build 106 trang, 333 unit trên 35 file đạt; full **378 E2E đạt/6 skip**, không fail/flaky/global error, 774.698,232 ms. Không đổi assertion/retry hoặc nhận skip là xác minh quyền native. [Lighthouse lab 43804641819](https://github.com/anhtruc1803/checkall/actions/runs/43804641819) đủ 48 lượt sạch và [public 43807789325](https://github.com/anhtruc1803/checkall/actions/runs/43807789325) đủ 24 lượt sạch; tám trang, ba lượt/trang/nguồn.

Bộ lab so sánh 3191485→57a5de2 trong cùng VM, đo tuần tự; public đo sau khi kiểm tra marker đúng source. Tất cả đều clean/pageVerified, không script ngoài origin; median mobile sau 98–100, public 94–97. A/BP/SEO đều 100 trong toàn bộ 72 phép đo; không lấy điểm Windows nhiễu hoặc source public cũ thay thế.

| Trang                | P lab trước → sau | P public median | Ba lượt public | FCP public ms | LCP public ms | TBT public ms | CLS public |
| -------------------- | ----------------: | --------------: | -------------- | ------------: | ------------: | ------------: | ---------: |
| /vi                  |           98 → 98 |              95 | 95/95/94       |       985,561 |       985,561 |         241,5 |          0 |
| /en                  |         100 → 100 |              94 | 95/94/94       |       962,954 |       962,954 |           238 |          0 |
| /vi/keyboard/tester  |           99 → 98 |              96 | 96/96/95       |       979,076 |       979,076 |           208 |          0 |
| /en/keyboard/tester  |          100 → 99 |              95 | 95/94/95       |       952,747 |       952,747 |           216 |          0 |
| /vi/privacy          |          100 → 99 |              97 | 97/97/97       |       999,601 |       999,601 |         189,5 |      0,008 |
| /en/audio/microphone |           98 → 98 |              96 | 96/96/96       |     1.422,576 |     1.422,576 |           197 |      0,005 |
| /vi/camera/preview   |           98 → 98 |              97 | 96/97/97       |     1.327,333 |     1.327,333 |           182 |      0,001 |
| /en/gamepad/tester   |           99 → 98 |              97 | 97/97/97       |     1.266,268 |     1.266,268 |           187 |      0,015 |

JavaScript, document, CSS và font transfer lab (byte):

| Trang                |  JS trước → sau | Document trước → sau | CSS trước → sau | Font trước → sau |
| -------------------- | --------------: | -------------------: | --------------: | ---------------: |
| /vi                  | 192808 → 192806 |        38053 → 36721 |   14784 → 14815 |  103874 → 103874 |
| /en                  | 192808 → 192806 |        35986 → 34629 |   14784 → 14815 |    54008 → 54008 |
| /vi/keyboard/tester  | 203876 → 204836 |        26171 → 25082 |   16854 → 17065 |    80003 → 80003 |
| /en/keyboard/tester  | 203876 → 204836 |        24631 → 23602 |   16854 → 17065 |    54008 → 71260 |
| /vi/privacy          | 189845 → 189878 |        22051 → 21684 |   14784 → 14815 |    56135 → 56135 |
| /en/audio/microphone | 192458 → 192456 |        22905 → 21615 |   13321 → 13352 |    54008 → 54008 |
| /vi/camera/preview   | 192109 → 192107 |        24120 → 22796 |   13321 → 13352 |    80003 → 80003 |
| /en/gamepad/tester   | 192632 → 192630 |        22889 → 21570 |   13321 → 13352 |    54008 → 54008 |

Không so public với lab như cùng điều kiện mạng/build. Tệp font/dependency không đổi nhưng font transfer Keyboard EN tăng; không bỏ ví dụ Telex hoặc cảnh báo để giảm byte. JS keyboard tăng 960 byte cho hai hook nhận diện/nhắc D, document giảm; không tuyên bố giảm số chữ đồng nghĩa giảm JavaScript. Một số median TBT tăng, không suy hiệu quả CPU định lượng chỉ từ ba mẫu. Không cắt tính năng, SEO hoặc accessibility lấy điểm.

Lighthouse 13.6/Chromium 156, mobile simulated RTT 150 ms/1638,4 Kbps/CPU ×4, profile mới/tắt extension từng lượt; phiên bản/CPU/benchmarkIndex/thông số đầy đủ trong [QA triển khai](qa/deployment-content-2026-11-16.json). Lượt 43804610361 bị chặn validation SHA rút gọn, chưa đo; chỉ 43804641819/43807789325 cung cấp kết quả. Đạt mục tiêu ≥90 trong tám trang đại diện, không chứng nhận mọi trạng thái tương tác hoặc field performance.

## Tinh gọn nội dung toàn website — local 12/11/2026

Đã rút gọn mô tả VI/EN, bỏ FAQ lặp ở 80 trang công cụ và giữ nội dung hướng dẫn/giới hạn/metadata. Đối chiếu source: 170 trường nội dung registry giảm tổng 39.424→28.631 ký tự; 87 thông báo hiện có được sửa ở mỗi ngôn ngữ. Đây là thống kê văn bản source, không phải số byte transfer, mức giảm JavaScript hoặc mức tăng Performance. Không cắt công cụ, nội dung SEO cần thiết hoặc accessibility để lấy điểm.

Không thêm dependency, ảnh/font hoặc timer; tên công cụ trong lịch sử được truyền từ server thành bảng tên, không đưa toàn bộ registry vào client component. Đã sửa reflow ở 320 px/chữ 200%, giữ bài kiểm tra không tràn. Build và E2E không thay cho phép đo Lighthouse.

Chưa đo Lighthouse mới; control HTML trắng local trong lượt này vẫn ghi nhận script và POST từ Kaspersky dù không tải mã ứng dụng. Không tắt phần mềm bảo vệ, lọc request, push lên CI hoặc đổi môi trường hệ thống để né validator. **Chưa xác nhận Performance mobile ≥90 cho bản tinh gọn**, không dùng số đo của source public cũ làm bằng chứng mới. Xem CONTENT-REVIEW.md và qa/content-review-local-2026-11-12.json.

## Bổ sung cảnh báo dd — local 12/11/2026

Bản local mới thêm lưu ý dd → đ và lời nhắc theo hai sự kiện keyup D, VI/EN; không font/ảnh/dependency, listener toàn trang, timer, log hoặc request mới. Hook chỉ giữ cờ cảnh báo và cờ quan sát D trước đó; không dùng các cờ này làm thống kê phần cứng. Chưa đo Lighthouse mới cho thay đổi nhỏ này do môi trường chèn Kaspersky đã xác minh bên dưới; **chưa xác nhận Performance mobile ≥90 cho bản hiện tại**. Không suy điểm từ độ nhỏ của thay đổi hoặc lấy điểm public của source cũ. Kết quả E2E accessibility/reflow được ghi riêng ở TESTING.md, không thay thế phép đo Performance.

## EVKey keyup — bản local 12/11/2026, chưa xác minh median sạch

Đã chạy sau full E2E: node scripts/lighthouse.mjs --base-url http://127.0.0.1:3100 --label evkey-keyup-local-20261112 --runs 3 --paths /vi,/vi/keyboard/tester,/en/keyboard/tester. Kế hoạch ba trang/ba lượt mỗi trang; script dừng ngay sau lượt /vi đầu tiên vì clean=false, externalScript origin http://gc.kis.v2.scr.kaspersky-labs.com. Không chỉnh validator hoặc bỏ lượt để tạo median.

Lượt bị loại ghi Performance 71, A 100/BP 81/SEO 92, FCP=LCP 3220.5732 ms/TBT 633 ms/CLS 0.00521347, JS 376960 byte/document 196960 byte. Đây là số liệu có nhiễu, **không dùng kết luận regression, Performance ≥90, hoặc chất lượng SEO của source mới**. Không có phép so sánh sạch để định lượng phần ảnh hưởng của source và phần chèn từ môi trường. Kết quả 95–99 của source 3191485 bên dưới thuộc lịch sử, không thay thế phép đo mới.

Chromium 156 profile mới/tắt extension, Lighthouse 13.6/mobile simulated RTT 150 ms/1638,4 Kbps/CPU×4; vẫn bị chèn từ môi trường Windows. Control HTML trắng không mã ứng dụng cũng có script/POST Kaspersky. Không tắt antivirus, đổi bảo vệ Windows, lọc request hoặc suy điểm từ dữ liệu nhiễu. WSL không khả dụng, chưa có môi trường Linux local sạch để đo lại; chưa push lên CI.

Bản local chỉ thêm Set tối đa 26 mã, cập nhật khi có mã mới, không timer/rAF/raw log/network hoặc font/ảnh mới. Các giới hạn này được kiểm tra bằng unit/lifecycle, không phải bằng chứng định lượng điểm Lighthouse. Không cắt tính năng/SEO/accessibility để lấy điểm. Raw HTML/JSON/browser log tại artifacts/performance/evkey-keyup-local-20261112; fingerprint và trạng thái rejected trong [QA JSON](qa/keyboard-release-local-2026-11-12.json). Source uncommitted nên không gán SHA 97fd2eb thành commit của ứng dụng đã sửa.

## Bản sửa luồng nhập 3191485 — 11/11/2026

[So sánh 42991541981](https://github.com/anhtruc1803/checkall/actions/runs/42991541981): baseline 097da5ea2e2bc09d4c6ecfce89ddc5b68163eb72 và candidate 3191485048bc024c00376db258f5b939b426e39a, cùng VM, build hai bản trước khi đo tuần tự. Ba trang đại diện, ba lượt/trang/bản, đủ 18 lượt sạch/pageVerified, không bỏ lượt thấp. Median **97/98/99 →97/98/99**, từng lượt 97–100; A/BP/SEO 100 toàn bộ. Đạt mục tiêu≥90 trong bộ mẫu, không suy rộng thành mọi tool hoặc field performance.

| Trang               | P trước → sau | FCP=LCP trước → sau ms | TBT trước → sau ms | CLS sau | JS trước → sau byte |
| ------------------- | ------------: | ---------------------: | -----------------: | ------: | ------------------: |
| /vi                 |       97 → 97 |        1071.1 → 1067.0 |      202.0 → 191.0 | 0.00293 |     192805 → 192808 |
| /vi/keyboard/tester |       98 → 98 |        1066.2 → 1064.9 |      164.0 → 172.0 | 0.00038 |     203438 → 203876 |
| /en/keyboard/events |       99 → 99 |        1064.0 → 1064.7 |       93.5 → 112.0 | 0.00029 |     203438 → 203876 |

Nhóm bàn phím JS +438 byte, CSS 16544→16854 byte (+310); homepage JS 192805→192808, CSS 14784 giữ nguyên. Font/image không đổi; không thêm ảnh ngoài inlineSVG. TBT keyboard tăng 8 và 18,5 ms trong bộ mẫu; không tuyên bố bản sửa làm mọi metric nhanh hơn. BenchmarkIndex trước 1505.5–2050.5/sau 1774–1993; không có bằng chứng để quy toàn bộ khác biệt CPU cho source. Giữ tính năng/SEO/accessibility, không thay font/dependency hoặc cắt nội dung để lấy điểm.

Lighthouse 13.6/Chromium 156/mobile simulated RTT 150 ms,1638,4 Kbps, CPU ×4, profile mới/tắt extension mỗi lượt; không Script ngoài origin hoặc dấu hiệu chèn được phát hiện. Linux CI --no-sandbox chỉ ở runner tạm, không đổi bảo vệ Windows. Không so điểm VM này với lượt 4e trước đây như cùng điều kiện. Run 42991484746 bị từ chối ở validation vì after_ref SHA ngắn, chưa đo; chỉ run đúng 42991541981 cung cấp dữ liệu trên.

### HTTPS public sau triển khai

[Lighthouse public 42994636551](https://github.com/anhtruc1803/checkall/actions/runs/42994636551): chín lượt sạch đúng source 3191485, median **95/96/95** cho /vi, /vi/keyboard/tester, /en/keyboard/events; mọi lượt 93–96, A/BP/SEO 100. Kết quả thật và giới hạn tại [QA JSON](qa/keyboard-input-method-2026-11-11.json).

| Trang               | Ba lượt P    | Median P | FCP=LCP ms | TBT ms | CLS | Speed Index ms |
| ------------------- | ------------ | -------: | ---------: | -----: | --: | -------------: |
| /vi                 | 95 / 93 / 96 |       95 |     1095.8 |  209.5 |   0 |         3561.7 |
| /vi/keyboard/tester | 96 / 96 / 96 |       96 |      949.4 |  200.0 |   0 |         3374.9 |
| /en/keyboard/events | 95 / 95 / 94 |       95 |      943.0 |  213.0 |   0 |         3528.8 |

Chạy sau khi kết thúc public E2E, không đồng thời build/E2E trên runner đo. Profile mới mỗi lượt, không extension/Script ngoài origin hoặc dấu hiệu chèn được phát hiện. BenchmarkIndex 1861.5–2057, CPU AMD EPYC 7763 64-Core Processor; khác VM lab, không diễn giải chênh lệch điểm như hồi quy do source. Chỉ nhận Performance ≥90 cho bộ mẫu hiện tại; field performance/phiên thao tác dài vẫn cần đo riêng. Raw HTML/JSON/browser log nằm trong artifact của run; QA JSON giữ đủ 27 phép đo cuối (18 lab +9 public).

## Lịch sử kết quả source 4e26811

Source **4e26811527f5c05e1bbc0ef421597505e14d47fc**. Giữ 40 công cụ VI/EN. Mục tiêu median Performance mobile≥90 đạt trong bộ mẫu bảy trang: lab **99/100/100/99/100/99/100**, HTTPS public **97/95/97/97/95/97/97**. Bao gồm cả hai homepage và đủ năm công cụ bàn phím; mỗi trang ba lượt luân phiên, không bỏ lượt thấp.

[So sánh42983672718](https://github.com/anhtruc1803/checkall/actions/runs/42983672718) đủ 42 lượt cùng VM, baseline 801a05a (code app ca2344f) và source mới 4e26811; build cả hai trước rồi đo tuần tự, không chạy build/E2E đồng thời trong VM đo. [Public](https://github.com/anhtruc1803/checkall/actions/runs/42986572779) đủ 21 lượt qua domain sau triển khai, kiểm release đúng và TLS hợp lệ. Raw HTML/JSON/browser log trong artifact GitHub; [QA JSON](qa/keyboard-2026-11-11.json) lưu 63 phép đo của bộ cuối/settings/môi trường/median cùng hồi quy. Candidate db864dd đo trước đó được giữ riêng trong lịch sử PROGRESS.md, không thay số đo cuối.

Lighthouse 13.6.0/Chromium 156, mobile simulated, RTT 150 ms/1638,4 Kbps/CPU×4; profile mới mỗi lượt/tắt extension, tất cả trace clean/pageVerified, không có Script ngoài origin hoặc dấu hiệu script chèn. Linux runner tạm dùng --no-sandbox; không coi là kiểm chứng sandbox và không thay phần mềm bảo vệ Windows. Benchmark trước 2265.5–2458.5, sau 2303–2535.5, public 1791–2061.5. Public khác VM, không so TBT/điểm public và lab như cùng điều kiện.

## Median trước → sau trong cùng VM

| Trang                 | P trước → sau | LCP trước → sau ms | TBT trước → sau ms | CLS sau | JS trước → sau KiB |
| --------------------- | ------------: | -----------------: | -----------------: | ------: | -----------------: |
| /vi                   |       99 → 99 |        1063 → 1065 |      142.5 → 149.0 | 0.00293 |      188.3 → 188.3 |
| /en                   |     100 → 100 |        1062 → 1063 |        74.0 → 76.0 | 0.00234 |      188.3 → 188.3 |
| /vi/keyboard/tester   |      99 → 100 |         911 → 1063 |        92.6 → 74.0 | 0.00038 |      197.2 → 198.7 |
| /en/keyboard/rollover |      100 → 99 |         913 → 1060 |       71.5 → 141.0 | 0.00029 |      197.2 → 198.7 |
| /vi/keyboard/chatter  |     100 → 100 |         910 → 1064 |        77.0 → 73.0 | 0.00017 |      197.2 → 198.7 |
| /en/keyboard/hold     |      100 → 99 |         911 → 1062 |       75.0 → 139.0 | 0.00029 |      197.2 → 198.7 |
| /en/keyboard/events   |     100 → 100 |         912 → 1061 |        71.5 → 80.0 | 0.00029 |      197.2 → 198.7 |

## Median HTTPS public

| Trang                 | P public | FCP ms | LCP ms | TBT ms |     CLS |
| --------------------- | -------: | -----: | -----: | -----: | ------: |
| /vi                   |       97 |   1096 |   1096 |  186.5 | 0.00000 |
| /en                   |       95 |   1000 |   1000 |  246.5 | 0.00000 |
| /vi/keyboard/tester   |       97 |    952 |    952 |  190.0 | 0.00000 |
| /en/keyboard/rollover |       97 |   1014 |   1014 |  191.5 | 0.00000 |
| /vi/keyboard/chatter  |       95 |    961 |    961 |  232.0 | 0.00000 |
| /en/keyboard/hold     |       97 |   1008 |   1008 |  186.5 | 0.00000 |
| /en/keyboard/events   |       97 |   1017 |   1017 |  184.5 | 0.00000 |

Mọi lượt candidate sau có Performance 97–100, public 94–98. Accessibility/Best Practices/SEO từng lượt sau và public đều100. Accessibility baseline theo thứ tự bảng: 100/100/100/100/99/98/98; sau đều100. Lighthouse đã phát hiện h3 nhảy cấp ở candidate db; sửa thànhh2 và bổ sung rule heading-order toàn trang, không loại rule hoặc giấu nội dung để tăng điểm.

## Tối ưu có căn cứ và chi phí

- B01/B02/B03/B05 không còn interval 50 ms; unit spy xác nhận0 interval khi giữ phím. B04 chỉ chạy khi có phím held; mất focus/hidden/unmount dọn timer. Sơ đồ memoized tránh render lại vì đồng hồ Hold khi dữ liệu phím không đổi. Đây là bằng chứng cơ chế, không phải tuyên bố CPU giảm một tỷ lệ đã đo.
- B01/B02/B04 không dựng log 200 sự kiện. B03 giữ aggregate cộng dồn riêng thay vì tính từ cửa sổ log đang trượt; raw table chỉ mount khi mở. B05 lọc local với tối đa 200 dòng; code/key/API flags vẫn nguyên bản. Không upload hoặc tự ghi lịch sử phím.
- Sơ đồ cuộn có focus/label và keycap 0,75 rem giúp đọc được; không ép toàn bộ layout 104/105 phím vào mobile bằng chữ nhỏ. Tiến độ và tổ hợp chỉ là sự kiện browser quan sát, không phải chứng nhận phần cứng.
- Byte network thực theo thứ tự bảng: JavaScript trước 192789/192789/201914/201914/201914/201914/201914, sau 192805/192805/203438/203438/203438/203438/203438; CSS trước 14755/14755/14755/14755/14755/14755/14755, sau 14775/14775/16535/16535/16535/16535/16535. Không nhận tính năng mới miễn phí về byte hoặc mọi metric đều cải thiện. Font/image không bị cắt; giữ registry/copy SEO và accessibility. FCP/LCP thay đổi được giữ trong QA JSON, không quy chênh lệch TBT/điểm nhỏ cho một tối ưu đơn lẻ.

Các lượt Lighthouse đo idle, không tự tạo phím, cấp quyền hoặc chạy engine để lấy điểm. Không đồng nhất điểm này với điện thoại thật hoặc lúc người dùng giữ nhiều phím. Build 106 trang/typecheck/lint/secret scan, **292 unit trên 34 file và 346 E2E đạt/6 skip**, không failure/flaky. Chromium/mobile 88 đạt mỗi cấu hình; Firefox/WebKit 85 đạt/ba skip native microphone/camera/gamepad policy mỗi cấu hình. Public keyboard **18/18 đạt** trên Chromium/Firefox/WebKit, không skip/failure/flaky, 61862.528 ms. Không coi WebKit là Safari thực tế hoặc skip native policy là enforcement đã xác minh.

Chi tiết lỗi, phương pháp/giới hạn, fixture và manual QA ở KEYBOARD-IMPROVEMENTS.md/TESTING.md. Safari/phần cứng, OS/IME/screen reader/field data và các tiêu chí bảo mật còn mở. Không đóng Final Acceptance Phase 1/2 hoặc nhận mọi runtime≥90; số đo Windows và các source trước vẫn được giữ dưới đây.

---

# Lịch sử Performance mục chọn công cụ theo vấn đề — 10/11/2026

## Kết quả mới nhất

Source **ca2344f2bfdc5ed65d324d480b663da6db3d5e53**. **Đạt median mobile ≥90** trên bảy trang đại diện, gồm hai homepage VI/EN: lab **100/100/100/100/99/99/100**; HTTPS public **98/99/99/99/99/98/98**. Mỗi trang ba lượt luân phiên, giữ tất cả lượt, không dùng số đo bản bàn lab cũ để nhận source mới đạt.

[So sánh 42790638550](https://github.com/anhtruc1803/checkall/actions/runs/42790638550) đủ 42 lượt cùng VM: baseline f6446bf (code app 882c4d9), sau ca2344f. Build cả hai trước khi đo, không chạy build/E2E đồng thời trong VM. [Public](https://github.com/anhtruc1803/checkall/actions/runs/42794779483) đủ 21 lượt trên đúng release sau triển khai, TLS hợp lệ không bỏ qua chứng chỉ. Chromium profile mới/tắt extension, trace đều clean/pageVerified, không có Script ngoài origin hoặc dấu hiệu script chèn. Giữ cả lượt baseline Performance 94. Raw HTML/JSON/browser log nằm trong artifacts của hai run; [QA JSON](qa/problems-2026-11-10.json) có đầy đủ 63 lượt, môi trường/settings/median và hồi quy.

Lighthouse 13.6.0/Chromium156, mobile simulated, RTT 150 ms/1638,4 Kbps/CPU×4. Linux runner tạm dùng --no-sandbox; không nhận đó là kiểm chứng sandbox hoặc thay cấu hình bảo vệ Windows. Benchmark trước 3181–3800, sau 3209–3824, public 3254–3729. Public là VM khác, không so điểm/TBT public và lab như cùng điều kiện hoặc nhận chênh lệch giữa các source trên VM khác là tác dụng của UI.

## Median trước → sau trong cùng VM

| Trang                | P trước → sau | LCP sau ms | TBT sau ms | CLS sau | JS trước → sau KiB |
| -------------------- | ------------: | ---------: | ---------: | ------: | -----------------: |
| /vi                  |      99 → 100 |       1064 |       49.5 | 0.00293 |      188.3 → 188.3 |
| /en                  |     100 → 100 |       1061 |       52.0 | 0.00234 |      188.3 → 188.3 |
| /en/screen/ppi       |     100 → 100 |        909 |       51.5 | 0.00036 |      194.9 → 194.9 |
| /vi/keyboard/tester  |     100 → 100 |        911 |       60.5 | 0.00066 |      197.2 → 197.2 |
| /en/audio/microphone |       99 → 99 |        911 |       94.0 | 0.00406 |      187.9 → 187.9 |
| /vi/camera/preview   |       99 → 99 |        908 |      107.0 | 0.00038 |      187.6 → 187.6 |
| /en/gamepad/tester   |      99 → 100 |        911 |       90.0 | 0.00467 |      188.1 → 188.1 |

## Median HTTPS public

| Trang                | P public | FCP ms | LCP ms | TBT ms |     CLS |
| -------------------- | -------: | -----: | -----: | -----: | ------: |
| /vi                  |       98 |   1033 |   1033 |  119.5 | 0.00000 |
| /en                  |       99 |   1009 |   1009 |  105.0 | 0.00000 |
| /en/screen/ppi       |       99 |    950 |    950 |  133.0 | 0.00036 |
| /vi/keyboard/tester  |       99 |    988 |    988 |  119.0 | 0.00008 |
| /en/audio/microphone |       99 |   1258 |   1258 |  111.0 | 0.00406 |
| /vi/camera/preview   |       98 |   1301 |   1301 |  139.0 | 0.00025 |
| /en/gamepad/tester   |       98 |   1353 |   1353 |  114.0 | 0.00466 |

Mọi lượt candidate lab có Performance 99–100; public 95–99. Accessibility/Best Practices/SEO của tất cả lượt sau đều 100/100/100; public 100/100/100. Median tính độc lập cho từng metric; số liệu chưa làm tròn và từng lượt trong QA JSON. Đây là kiểm tra idle, không tự bật camera/microphone/gamepad hoặc giả số đo phần cứng để lấy điểm.

## Chi phí của nội dung mới

ProblemChooser là Server Component, chỉ nối tới sáu công cụ published hiện có. Không thêm Client Component riêng; tái dùng PolicyLink hiện có để điều hướng đúng policy. Không thêm dependency, font hoặc ảnh. **JavaScript/font/image truyền tải không đổi trên cả bảy trang trong cặp cùng VM**. Homepage VI thêm 1822 byte document, EN thêm 1788 byte; nội dung VI/EN, SVG inline và SEO vẫn được tính đầy đủ trong HTML/RSC.

CSS Module được import từ section trang chủ, nhưng bundler vẫn chia sẻ chunk: homepage VI/EN, PPI và Keyboard tải 14755 byte CSS (trước 13287, tăng 1468); ba route media/gamepad tải 13292 byte (tăng 5). Trace homepage trước có một request stylesheet 13287 byte; sau có hai request13292+1463 byte. Không nhận CSS Module chỉ tải trên homepage hoặc không có chi phí network.

FCP/LCP homepage lab VI 914→1064 ms, EN 913→1061 ms, tăng khoảng150/148 ms trong mô hình simulated. Đây là chi phí đo được, không nhận UI làm web chạy nhanh hơn từ điểm tổng. Chưa quy phần tăng cho một nguyên nhân đơn lẻ. Mục tiêu vẫn đạt với nội dung/khả năng truy cập giữ nguyên; không cần thay kiến trúc hoặc bỏ tính năng để lấy điểm.

Build 106 trang/typecheck/lint/secret scan, 275 unit trên 33 file và 330 E2E đạt/6 skip, không failure/flaky. Local mới 8/8 và public 6/6 đạt; giữ đủ 40 công cụ/VI-EN. Không nhận WebKit là Safari thật hoặc skip native policy là enforcement đã xác minh.

Giới hạn: không suy rộng thành mọi điện thoại, trạng thái engine đang chạy hoặc field data. Safari, phần cứng, screen reader/OS zoom và các tiêu chí bảo mật/manual còn mở ở PROGRESS.md. Final Acceptance tổng thể chưa đóng; smoke Windows median 89 của lịch sử vẫn được giữ, không nhận mọi runtime≥90.

---

# Lịch sử Performance bàn lab tương tác — 10/11/2026

## Kết quả mới nhất

Source **882c4d925e95d86672dd5b9469367335fe93c9d5**, giữ 40 công cụ VI/EN. **Đạt mục tiêu median mobile ≥90 trên sáu trang đại diện:** lab 99/99/99/98/97/98; HTTPS public 99/99/99/99/99/99. Không nhận đó là toàn bộ route/trạng thái engine hoặc điện thoại thật đã được benchmark. Final Acceptance còn các tiêu chí manual/hardware/bảo mật ở PROGRESS.md.

[So sánh 42783870665](https://github.com/anhtruc1803/checkall/actions/runs/42783870665) đủ 36 lượt trên cùng VM Ubuntu, build cả hai revision trước rồi đo tuần tự: baseline 571bd19 (code ứng dụng ad25dd1) và sau 882c4d9. [Public 42788047041](https://github.com/anhtruc1803/checkall/actions/runs/42788047041) đủ 18 lượt trên đúng release sau triển khai, TLS hợp lệ không bỏ qua chứng chỉ. Ba lượt/trang luân phiên, giữ mọi lượt, profile Chromium mới/tắt extension; trace đều clean/pageVerified và không có Script ngoài origin hoặc dấu hiệu script chèn. Raw HTML/JSON/browser log trong artifact của hai run; [QA JSON](qa/lab-scene-2026-11-10.json) lưu đủ 54 phép đo, môi trường/settings/median cùng bằng chứng hồi quy.

Lighthouse 13.6.0/Chromium 156, mobile simulated, RTT 150 ms/1638,4 Kbps/CPU×4. Linux CI VM riêng, không chạy build/E2E cùng lúc trong VM đo; --no-sandbox chỉ phục vụ runner tạm, không coi là kiểm chứng sandbox browser. CPU benchmark cặp trước 1694–2061/sau 1833,5–1938,5; public 2902–3414,5. Public khác VM nên không dùng chênh lệch public/lab hoặc public bản cũ để khẳng định minh họa làm web chạy nhanh hơn.

## Median trước → sau trong cùng VM

| Trang                | P trước → sau | LCP sau ms | TBT sau ms | CLS sau | JS trước → sau KiB |
| -------------------- | ------------: | ---------: | ---------: | ------: | -----------------: |
| /vi                  |       98 → 99 |        929 |      124.6 | 0.00293 |      187.0 → 188.3 |
| /en/screen/ppi       |       99 → 99 |        915 |      116.7 | 0.00036 |      193.7 → 194.9 |
| /vi/keyboard/tester  |       99 → 99 |        915 |      105.0 | 0.00066 |      195.9 → 197.2 |
| /en/audio/microphone |       98 → 98 |        915 |      166.0 | 0.00406 |      187.9 → 187.9 |
| /vi/camera/preview   |       96 → 97 |        914 |      196.0 | 0.00038 |      187.6 → 187.6 |
| /en/gamepad/tester   |       97 → 98 |        913 |      172.5 | 0.00467 |      188.1 → 188.1 |

## Median HTTPS public tại checkpoint bàn lab

| Trang                | P public | FCP ms | LCP ms | TBT ms |     CLS |
| -------------------- | -------: | -----: | -----: | -----: | ------: |
| /vi                  |       99 |   1191 |   1191 |  118.5 | 0.00186 |
| /en/screen/ppi       |       99 |    961 |    978 |  113.0 | 0.00036 |
| /vi/keyboard/tester  |       99 |    967 |    967 |  122.0 | 0.00050 |
| /en/audio/microphone |       99 |   1269 |   1269 |  121.0 | 0.00406 |
| /vi/camera/preview   |       99 |   1266 |   1266 |  120.0 | 0.00025 |
| /en/gamepad/tester   |       99 |   1228 |   1228 |  128.0 | 0.00466 |

Mọi lượt sau ở cả lab/public có Performance 97–99; Accessibility/Best Practices/SEO đều 100. FCP/LCP lab sau khoảng 913–929 ms, TBT median 105–196 ms, CLS median tối đa 0,00467. Public FCP 961–1269 ms/LCP 967–1269 ms, TBT 113–128 ms, CLS median tối đa 0,00466. Chi tiết chưa làm tròn và từng lượt nằm trong QA JSON; median của từng metric tính độc lập, không chọn một lượt đẹp đại diện.

## Chi phí và quyết định triển khai

Hero dùng SVG inline và Client Component nhỏ, tám CategoryArt render server; không thêm GSAP, thư viện mới, ảnh tải ngoài hoặc font. Không có RAF loop/timer/chuyển động tự chạy; phản hồi chỉ do tương tác. Reduced motion tắt transform; SSR giữ chỗ bằng aspect-ratio, tránh chèn hình sau hydrate. Không sửa engine, quyền, registry, nội dung SEO/accessibility hoặc subset font để lấy điểm.

Trong cặp cùng VM, JavaScript network tăng chính xác **1272 byte** ở homepage/PPI/Keyboard; microphone/camera/gamepad không đổi. CSS dùng chung tăng **923 byte** (12364→13287), font không đổi, ảnh tải riêng0 byte. SVG vẫn có chi phí trong HTML/JS: document homepage 31977→35011 byte; không diễn giải ảnh0 byte là minh họa miễn phí. Mức tăng nhỏ vẫn giữ mục tiêu và không có vấn đề hiệu năng đã xác minh cần thay kiến trúc. Chênh lệch điểm/TBT nhỏ nằm trong biến thiên của Lighthouse, không nhận là mức tối ưu do thêm đồ họa.

Đã kiểm tra build 106 trang/typecheck/lint/275 unit; CI322 E2E đạt/6 skip native policy, local UI16/16, public UI6/6 trên Chromium/Firefox/WebKit. Phạm vi và giới hạn tại TESTING.md; không coi WebKit là Safari thật. Trạng thái hardware/media đang hoạt động, OS/screen reader/zoom thật và field data chưa xác minh. Smoke Windows trước đây median 89 vẫn được giữ trong lịch sử bên dưới, không nhận mọi máy đều đạt90.

---

# Lịch sử tối ưu giao diện trước bàn lab — 10/11/2026

## Kết quả và phạm vi

Source trước: da680e48ba5bbc953226541299b9805b93da54e5; source sau tại checkpoint: ad25dd12fe10b5c88634d5befe7363a2261f5dfd. Mục tiêu median mobile ≥90 trên sáu trang đại diện: **lab đạt; HTTPS public đạt**. Không nhận đó là 80 route hoặc toàn bộ trạng thái phần cứng đã được benchmark. Phân loại Final Acceptance và hồi quy ở PROGRESS.md/TESTING.md.

Mỗi nhóm đủ 18 lượt: ba lần/trang, luân phiên sáu trang, không bỏ lượt xấu. Cặp trước/sau cùng job [42775910647](https://github.com/anhtruc1803/checkall/actions/runs/42775910647), cùng VM/browser/cấu hình; build cả hai trước khi đo, không chạy build/E2E đồng thời trong VM. [Public 42778723274](https://github.com/anhtruc1803/checkall/actions/runs/42778723274) là phép đo riêng qua domain/proxy sau triển khai. Không so điểm public với loopback như một điều kiện đo duy nhất.

Lighthouse 13.6.0, Chromium 156.0.0.0, profile tạm mới mỗi lượt, extension tắt, trace không có Script ngoài origin hoặc dấu hiệu Kaspersky/chrome-extension. CI dùng --no-sandbox trong VM tạm; không thay cấu hình bảo vệ của máy Windows. Mobile simulated, RTT 150 ms, throughput 1638,4 Kbps, CPU slowdown ×4. Public xác minh TLS bình thường, không bỏ qua lỗi chứng chỉ. Môi trường/UA/throttling/benchmark từng lượt tại [qa/performance-ui.json](qa/performance-ui.json), raw JSON/HTML/browser log trong artifact CI. CPU benchmark trước 3030.0–3537.5, sau 3209.0–3594.5, public 1767.0–2073.5; điểm lab vẫn có biến thiên.

## Median trước → sau, cùng VM

| Trang                | Performance |    FCP ms |    LCP ms |        TBT ms | JS truyền tải KiB |
| -------------------- | ----------: | --------: | --------: | ------------: | ----------------: |
| /vi                  |   100 → 100 | 913 → 917 | 913 → 917 |   53.0 → 65.5 |     196.4 → 187.0 |
| /en/screen/ppi       |   100 → 100 | 912 → 909 | 912 → 909 |   60.5 → 61.0 |     203.0 → 193.7 |
| /vi/keyboard/tester  |   100 → 100 | 912 → 911 | 912 → 911 |   58.0 → 57.5 |     205.3 → 195.9 |
| /en/audio/microphone |     99 → 99 | 909 → 912 | 909 → 912 | 109.0 → 114.0 |     197.3 → 187.9 |
| /vi/camera/preview   |     99 → 99 | 909 → 912 | 909 → 912 | 110.0 → 115.0 |     196.9 → 187.6 |
| /en/gamepad/tester   |     99 → 99 | 911 → 909 | 911 → 909 | 111.0 → 117.0 |     197.4 → 188.1 |

## Median HTTPS public sau triển khai

| Trang                |   P | FCP ms | LCP ms | TBT ms |     CLS | JS KiB | Font KiB | Ảnh KiB |
| -------------------- | --: | -----: | -----: | -----: | ------: | -----: | -------: | ------: |
| /vi                  |  95 |   1107 |   1107 |  241.5 | 0.00276 |  184.1 |     97.5 |     0.0 |
| /en/screen/ppi       |  98 |    966 |    966 |  177.0 | 0.00036 |  188.9 |     51.4 |     0.0 |
| /vi/keyboard/tester  |  97 |   1007 |   1007 |  184.5 | 0.00066 |  191.1 |     75.5 |     0.0 |
| /en/audio/microphone |  97 |   1297 |   1297 |  192.0 | 0.00440 |  185.1 |     51.4 |     0.0 |
| /vi/camera/preview   |  96 |   1183 |   1183 |  209.0 | 0.00008 |  184.7 |     75.5 |     0.0 |
| /en/gamepad/tester   |  97 |   1248 |   1248 |  180.0 | 0.00603 |  185.1 |     51.4 |     0.0 |

## Phân tích và thay đổi có bằng chứng

Bundle analyzer chỉ ra tailwind-merge trong chunk client dùng chung: 27421 byte module, 8444 byte gzip ước tính riêng module. Button chỉ dùng class CSS thuần; các class bổ sung là menu-toggle/command-trigger, cva đã tạo chuỗi đầy đủ. Bỏ lớp gọi cn thừa tại Button khiến module này không còn trong client graph. Utility cn giữ nguyên; không thay biến thể/kích thước/asChild hoặc thêm dependency. Số byte JS truyền tải trong bảng là phép đo network thực, khác với ước tính gzip riêng module.

Giữ nguyên 40 công cụ, engine/capability/permission/lifecycle, nội dung SEO/a11y, registry VI/EN và font. Không loại subset tiếng Việt hoặc đổi cách đo phần cứng. Các audit được chạy ở trạng thái idle; không tự cấp quyền microphone/camera/gamepad hay khởi chạy engine chỉ để lấy điểm. CSS/font vẫn được báo đầy đủ; ảnh ngoài được đo theo byte thực thay vì bỏ nội dung để nâng điểm.

Trong cặp cùng VM, JavaScript truyền tải giảm 9551 byte (khoảng 9,3 KiB) ở mỗi trang; điểm median giữ 99–100. FCP/LCP lab sau khoảng 909–917 ms, TBT 57.5–117.0 ms. Public có FCP/LCP 966–1297 ms, TBT 177.0–241.5 ms, CLS 0.00008–0.00603. Tất cả lượt public có Performance từ 95 đến 98; Accessibility/Best Practices/SEO đều được giữ trong QA JSON. CPU benchmark public thấp hơn VM so sánh, nên không quy riêng chênh lệch TBT/điểm giữa hai môi trường cho VPS hoặc proxy. Mức giảm byte công bố lấy từ cặp cùng VM.

Median cũ 84/87/75 thuộc UI Phase 1 trên Windows/CPU khác, không dùng để tính mức tăng của lần này. Baseline sạch UI đầu tiên ở run 42775192337 đã đạt 98/100/100/99/99/99 trước tối ưu; có một lượt homepage LCP 3310 ms nhưng vẫn giữ trong dữ liệu. Tối ưu hiện tại giảm JavaScript được chứng minh bằng graph và transfer; không quy mọi thay đổi TBT/điểm vào một component. Khi median public dưới 90, cần đọc raw LCP breakdown/TTFB/main-thread/network và nêu nguyên nhân bằng dữ liệu trước khi nhận mục tiêu đã đạt.

## Từng lượt trước tối ưu

| Trang                | Lượt |   P | FCP ms | LCP ms | TBT ms |     CLS | JS KiB | Font KiB | Ảnh KiB |
| -------------------- | ---: | --: | -----: | -----: | -----: | ------: | -----: | -------: | ------: |
| /vi                  |    1 | 100 |    916 |    916 |   55.0 | 0.00302 |  196.4 |    101.4 |     0.0 |
| /en/screen/ppi       |    1 |  98 |    912 |    912 |  151.0 | 0.00036 |  203.0 |     52.7 |     0.0 |
| /vi/keyboard/tester  |    1 | 100 |    909 |    909 |   58.0 | 0.00066 |  205.3 |     78.1 |     0.0 |
| /en/audio/microphone |    1 |  99 |    908 |    908 |  109.0 | 0.00377 |  197.3 |     52.7 |     0.0 |
| /vi/camera/preview   |    1 |  99 |    910 |    910 |  110.0 | 0.00038 |  196.9 |     78.1 |     0.0 |
| /en/gamepad/tester   |    1 |  99 |    912 |    912 |  119.0 | 0.00467 |  197.4 |     52.7 |     0.0 |
| /vi                  |    2 | 100 |    913 |    913 |   49.0 | 0.00302 |  196.4 |    101.4 |     0.0 |
| /en/screen/ppi       |    2 | 100 |    912 |    912 |   58.5 | 0.00036 |  203.0 |     52.7 |     0.0 |
| /vi/keyboard/tester  |    2 | 100 |    913 |    913 |   70.0 | 0.00066 |  205.3 |     78.1 |     0.0 |
| /en/audio/microphone |    2 |  99 |    910 |    910 |  107.0 | 0.00406 |  197.3 |     52.7 |     0.0 |
| /vi/camera/preview   |    2 |  99 |    909 |    909 |  101.0 | 0.00038 |  196.9 |     78.1 |     0.0 |
| /en/gamepad/tester   |    2 |  99 |    911 |    911 |  111.0 | 0.00467 |  197.4 |     52.7 |     0.0 |
| /vi                  |    3 | 100 |    913 |    913 |   53.0 | 0.00302 |  196.4 |    101.4 |     0.0 |
| /en/screen/ppi       |    3 | 100 |    909 |    909 |   60.5 | 0.00036 |  203.0 |     52.7 |     0.0 |
| /vi/keyboard/tester  |    3 | 100 |    912 |    912 |   55.5 | 0.00066 |  205.3 |     78.1 |     0.0 |
| /en/audio/microphone |    3 |  99 |    909 |    909 |  109.0 | 0.00406 |  197.3 |     52.7 |     0.0 |
| /vi/camera/preview   |    3 |  99 |    909 |    909 |  111.0 | 0.00038 |  196.9 |     78.1 |     0.0 |
| /en/gamepad/tester   |    3 |  99 |    909 |    909 |  106.0 | 0.00467 |  197.4 |     52.7 |     0.0 |

## Từng lượt sau tối ưu

| Trang                | Lượt |   P | FCP ms | LCP ms | TBT ms |     CLS | JS KiB | Font KiB | Ảnh KiB |
| -------------------- | ---: | --: | -----: | -----: | -----: | ------: | -----: | -------: | ------: |
| /vi                  |    1 | 100 |    922 |    922 |   58.0 | 0.00302 |  187.0 |    101.4 |     0.0 |
| /en/screen/ppi       |    1 | 100 |    911 |    911 |   58.0 | 0.00036 |  193.7 |     52.7 |     0.0 |
| /vi/keyboard/tester  |    1 | 100 |    911 |    911 |   55.5 | 0.00066 |  195.9 |     78.1 |     0.0 |
| /en/audio/microphone |    1 |  99 |    915 |    915 |  107.0 | 0.00406 |  187.9 |     52.7 |     0.0 |
| /vi/camera/preview   |    1 |  99 |    908 |    908 |  112.5 | 0.00038 |  187.6 |     78.1 |     0.0 |
| /en/gamepad/tester   |    1 |  99 |    909 |    909 |  117.0 | 0.00467 |  188.1 |     52.7 |     0.0 |
| /vi                  |    2 | 100 |    917 |    917 |   74.0 | 0.00302 |  187.0 |    101.4 |     0.0 |
| /en/screen/ppi       |    2 | 100 |    909 |    909 |   65.0 | 0.00036 |  193.7 |     52.7 |     0.0 |
| /vi/keyboard/tester  |    2 | 100 |    913 |    913 |   57.5 | 0.00050 |  195.9 |     78.1 |     0.0 |
| /en/audio/microphone |    2 |  99 |    912 |    912 |  118.0 | 0.00406 |  187.9 |     52.7 |     0.0 |
| /vi/camera/preview   |    2 |  99 |    915 |    915 |  119.0 | 0.00038 |  187.6 |     78.1 |     0.0 |
| /en/gamepad/tester   |    2 |  99 |    913 |    913 |  123.0 | 0.00467 |  188.1 |     52.7 |     0.0 |
| /vi                  |    3 | 100 |    911 |    911 |   65.5 | 0.00302 |  187.0 |    101.4 |     0.0 |
| /en/screen/ppi       |    3 | 100 |    908 |    908 |   61.0 | 0.00036 |  193.7 |     52.7 |     0.0 |
| /vi/keyboard/tester  |    3 | 100 |    911 |    911 |   59.0 | 0.00066 |  195.9 |     78.1 |     0.0 |
| /en/audio/microphone |    3 |  99 |    911 |    911 |  114.0 | 0.00406 |  187.9 |     52.7 |     0.0 |
| /vi/camera/preview   |    3 |  99 |    912 |    912 |  115.0 | 0.00038 |  187.6 |     78.1 |     0.0 |
| /en/gamepad/tester   |    3 |  99 |    908 |    908 |  108.0 | 0.00467 |  188.1 |     52.7 |     0.0 |

## Từng lượt HTTPS public

| Trang                | Lượt |   P | FCP ms | LCP ms | TBT ms |     CLS | JS KiB | Font KiB | Ảnh KiB |
| -------------------- | ---: | --: | -----: | -----: | -----: | ------: | -----: | -------: | ------: |
| /vi                  |    1 |  95 |   1132 |   1132 |  241.5 | 0.00021 |  184.1 |     97.5 |     0.0 |
| /en/screen/ppi       |    1 |  97 |    978 |    978 |  182.5 | 0.00000 |  189.0 |     51.5 |     0.0 |
| /vi/keyboard/tester  |    1 |  97 |   1007 |   1007 |  184.5 | 0.00066 |  191.1 |     75.5 |     0.0 |
| /en/audio/microphone |    1 |  97 |   1210 |   1210 |  199.0 | 0.00559 |  185.1 |     51.4 |     0.0 |
| /vi/camera/preview   |    1 |  97 |   1112 |   1112 |  198.0 | 0.00050 |  184.7 |     75.5 |     0.0 |
| /en/gamepad/tester   |    1 |  97 |   1248 |   1248 |  180.0 | 0.00603 |  185.1 |     51.4 |     0.0 |
| /vi                  |    2 |  96 |   1107 |   1107 |  216.0 | 0.00276 |  184.1 |     97.5 |     0.0 |
| /en/screen/ppi       |    2 |  98 |    952 |    952 |  177.0 | 0.00036 |  188.9 |     51.4 |     0.0 |
| /vi/keyboard/tester  |    2 |  97 |    973 |    973 |  205.5 | 0.00050 |  191.2 |     75.5 |     0.0 |
| /en/audio/microphone |    2 |  97 |   1394 |   1394 |  188.0 | 0.00406 |  185.1 |     51.4 |     0.0 |
| /vi/camera/preview   |    2 |  96 |   1241 |   1241 |  209.0 | 0.00008 |  184.7 |     75.5 |     0.0 |
| /en/gamepad/tester   |    2 |  97 |   1348 |   1348 |  180.0 | 0.00467 |  185.2 |     51.4 |     0.0 |
| /vi                  |    3 |  95 |   1012 |   1012 |  252.5 | 0.00276 |  184.1 |     97.5 |     0.0 |
| /en/screen/ppi       |    3 |  98 |    966 |    966 |  168.0 | 0.00036 |  188.9 |     51.4 |     0.0 |
| /vi/keyboard/tester  |    3 |  97 |   1055 |   1055 |  177.0 | 0.00066 |  191.1 |     75.5 |     0.0 |
| /en/audio/microphone |    3 |  97 |   1297 |   1297 |  192.0 | 0.00440 |  185.0 |     51.4 |     0.0 |
| /vi/camera/preview   |    3 |  96 |   1183 |   1183 |  218.0 | 0.00008 |  184.7 |     75.5 |     0.0 |
| /en/gamepad/tester   |    3 |  97 |   1238 |   1238 |  188.0 | 0.00603 |  185.1 |     51.4 |     0.0 |

## Smoke kiểm tra harness trên Windows — môi trường riêng

Ba lượt /en qua HTTPS loopback để xác minh lifecycle/validator của CLI: Performance 88/97/89 (median 89), TBT median 460.3 ms, CPU benchmark 1133.0–1440.5. Trace không có script chèn. Lượt cuối ghi Script Evaluation khoảng 628 ms và Style & Layout 696 ms; chưa khoanh riêng nguồn chi phí Windows. Không quy lỗi cho script Kaspersky khi trace không có nó.

Các lượt này không dùng cùng máy với cặp Linux; không gắn commit tự động và SITE_URL build khác origin QA nên SEO 92. Không dùng chúng tính mức tăng trước/sau hoặc nhận Windows ≥90. Giữ nguyên cả ba lượt, kể cả điểm dưới 90, tại QA JSON và bảng dưới.

| Trang | Lượt |   P | FCP ms | LCP ms | TBT ms |     CLS | JS KiB | Font KiB | Ảnh KiB |
| ----- | ---: | --: | -----: | -----: | -----: | ------: | -----: | -------: | ------: |
| /en   |    1 |  88 |   1067 |   1067 |  482.2 | 0.01664 |  187.0 |     52.7 |     0.0 |
| /en   |    2 |  97 |   1205 |   1205 |  198.0 | 0.00000 |  187.0 |     52.7 |     0.0 |
| /en   |    3 |  89 |   1069 |   1069 |  460.3 | 0.00000 |  187.0 |     52.7 |     0.0 |

## Tái lập

Chạy workflow performance.yml với before_ref/after_ref là SHA đầy đủ để so sánh; cả hai revision được build với SITE_URL=http://127.0.0.1:3000. Đặt public_only=true và after_ref đúng commit đang phục vụ để đo domain; script kiểm tra marker release trước khi đo. Đọc summary.json và toàn bộ runs.json, không chọn lượt đẹp. Dùng scripts/report-ui-performance.mjs --comparison <artifact-comparison> --public <artifact-public> --comparison-run <id> --public-run <id> để tạo báo cáo này. Script report-performance.mjs cũ chỉ dành dữ liệu Phase 1 lịch sử, không dùng sinh báo cáo UI mới.

Nguồn phương pháp: [Lighthouse variability](https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md), [Performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring).

## Báo cáo lịch sử, khác source và môi trường

Các số phía dưới giữ nguyên để đối chiếu lịch sử, không đại diện revision hiện tại.

<!-- HISTORICAL_PERFORMANCE_REPORT -->

## Performance Phase 1 — phép đo sạch ngày 29/10/2026

Checkpoint Phase 2 Milestone 6 (05/11/2026): chưa đo Lighthouse M6, không nhận ≥90 hoặc dùng điểm revision cũ làm điểm M6. Engine gamepad tải động, idle không getGamepads, UI tối đa 8 Hz, tối đa 16 slot/64 trục/128 nút/120 điểm; drift tích lũy thống kê với bộ nhớ hằng số. Không haptics, thêm ảnh/font/dependency hoặc upload. Các đặc tính này không phải benchmark; cần Lighthouse sạch ba lần/trang đại diện và profiling trên tay cầm/browser thật trước nghiệm thu performance.

Checkpoint Phase 2 Milestone 5 (05/11/2026): chưa đo lại Lighthouse revision mới, chưa có median M5 và không nhận Performance mobile ≥90. Camera engine tải động, idle không capture; UI 4 Hz, FPS từ rVFC, bộ nhớ hằng số và không đọc pixel hoặc thêm ảnh/font/dependency. Đây là đặc tính triển khai, không phải kết quả benchmark. Điểm các revision lịch sử bên dưới không đại diện M5. Lighthouse sạch ít nhất ba lần/trang đại diện, main-thread/memory trên camera thật và tải khi capture vẫn cần đo trước Final Acceptance.

Checkpoint lịch sử: Phase 2 Milestone 4. Input engine chỉ chạy sau thao tác chủ động, đọc 2048/1024 float mỗi 125 ms, đồ thị 64 điểm/dải và bộ đệm cố định. PolicyLink thêm document navigation ở ranh giới microphone để áp dụng đúng policy. Chưa đo lại Lighthouse source M4; build/E2E đạt không chứng minh Performance ≥90. Không gán các median lịch sử bên dưới cho source này.

Milestone hiện hành là Phase 2 Milestone 3: audio-output tải qua dynamic import, không tạo context hay tải file âm thanh khi mount. CI cuối source 1066568 đạt kiểm thử chức năng nhưng chưa đo Lighthouse source M3; không coi đó là bằng chứng Performance ≥90 hoặc gán các median Phase 1 bên dưới cho revision này. Kiểm thử API/audio/E2E và build không thay thế Lighthouse.

> Đây là dữ liệu checkpoint Phase 1 được đo theo revision ghi bên dưới. Phase 2 Milestone 2 (source 097404e, 30/10/2026) chưa đo lại Lighthouse; không gán các điểm/median cũ cho source mới hoặc coi Performance ≥90 đã đạt. Cần đo tiếp trong môi trường sạch/CPU ổn định; trạng thái này vẫn mở trong RELEASE_CHECKLIST.md.

## Phương pháp và tính hợp lệ

Lighthouse 13.6.0, Chromium 156, mobile simulated, RTT 150 ms, throughput 1638,4 Kbps, CPU slowdown ×4. Mỗi lượt dùng một profile Chrome tạm mới, tắt extension; không chạy đồng thời E2E, build hoặc unit tests. Mỗi trang được đo ba lần, theo thứ tự luân phiên; không bỏ lượt xấu.

HTTP trên Windows vẫn bị Kaspersky chèn script và sửa CSP, kể cả profile mới và loopback. Origin HTTPS QA riêng `https://127.0.0.1:3443` đã được xác minh không có request ngoài origin, extension request hoặc CSP bị sửa. Chrome chỉ pin SPKI của chứng chỉ tự ký QA; không tắt phần mềm bảo vệ, không chặn request trong Lighthouse, không sửa trace hoặc điểm. Chứng chỉ/key QA nằm trong artifacts bị Git bỏ qua, không được commit. Điều này không xác minh chứng chỉ HTTPS công khai.

Baseline sạch dùng build ban đầu với SITE_URL cũ nên SEO 92 do canonical khác origin QA. Build sau đặt SITE_URL đúng origin QA và SEO 100. Cấu hình mạng/CPU/browser/origin của phép đo Performance không đổi; khác biệt canonical chỉ là cấu hình metadata đã được công khai ở đây. Bản raw JSON/HTML ở artifacts/performance/clean-before và clean-release; dữ liệu gọn có thể đối chiếu trong [qa/performance.json](qa/performance.json). Bộ clean-release dùng đúng source initial commit c82cd20, trước thay đổi CSS bỏ background transition của nút để sửa tương phản lúc đổi theme. Không tuyên bố đã đo lại Lighthouse trên commit CSS đó.

## Median trước và sau

| Trang               | Performance |   LCP (ms) |   TBT (ms) | JS truyền tải (KiB) |
| ------------------- | ----------: | ---------: | ---------: | ------------------: |
| /vi                 |     78 → 84 | 939 → 1074 |  994 → 640 |       210.4 → 189.7 |
| /en/screen/ppi      |     94 → 87 | 976 → 1069 |  280 → 500 |       219.0 → 198.6 |
| /vi/keyboard/tester |     83 → 75 | 926 → 1073 | 695 → 1289 |       221.2 → 200.9 |

## Từng lượt baseline sạch

| Trang               | Lượt | Performance | FCP (ms) | LCP (ms) | TBT (ms) |     CLS | JS (KiB) |
| ------------------- | ---: | ----------: | -------: | -------: | -------: | ------: | -------: |
| /vi                 |    1 |          70 |     1189 |     1189 |     3614 | 0.00592 |    210.4 |
| /en/screen/ppi      |    1 |          99 |      925 |      925 |      140 | 0.00043 |    219.0 |
| /vi/keyboard/tester |    1 |          83 |      926 |      926 |      695 | 0.00000 |    221.2 |
| /vi                 |    2 |          80 |      939 |      939 |      858 | 0.00000 |    210.4 |
| /en/screen/ppi      |    2 |          94 |     1055 |     1055 |      280 | 0.00036 |    219.0 |
| /vi/keyboard/tester |    2 |          87 |      915 |      915 |      505 | 0.00038 |    221.2 |
| /vi                 |    3 |          78 |      936 |      936 |      994 | 0.00000 |    210.4 |
| /en/screen/ppi      |    3 |          83 |      976 |      976 |      671 | 0.00036 |    219.0 |
| /vi/keyboard/tester |    3 |          53 |     1039 |     1039 |     1984 | 0.42352 |    221.2 |

## Từng lượt sau tối ưu

| Trang               | Lượt | Performance | FCP (ms) | LCP (ms) | TBT (ms) |     CLS | JS (KiB) |
| ------------------- | ---: | ----------: | -------: | -------: | -------: | ------: | -------: |
| /vi                 |    1 |          83 |     1074 |     1074 |      702 | 0.00000 |    189.7 |
| /en/screen/ppi      |    1 |          87 |     1069 |     1069 |      500 | 0.00000 |    198.6 |
| /vi/keyboard/tester |    1 |          72 |     1083 |     1083 |     1912 | 0.00000 |    200.9 |
| /vi                 |    2 |          89 |     1191 |     1191 |      428 | 0.00081 |    189.7 |
| /en/screen/ppi      |    2 |          96 |      913 |      913 |      229 | 0.00045 |    198.6 |
| /vi/keyboard/tester |    2 |          84 |     1073 |     1073 |      620 | 0.00000 |    200.9 |
| /vi                 |    3 |          84 |     1067 |     1067 |      640 | 0.00081 |    189.7 |
| /en/screen/ppi      |    3 |          76 |     1260 |     1260 |     1235 | 0.00000 |    198.6 |
| /vi/keyboard/tester |    3 |          75 |     1072 |     1072 |     1289 | 0.00000 |    200.9 |

## Các nguyên nhân và thay đổi có bằng chứng

- Zod đầy đủ và metadata registry của cả 21 công cụ từng nằm trong bundle client dùng chung. Chuyển validation sang zod/mini, truyền chỉ mục tìm kiếm được sinh từ registry và chỉ truyền ba trường runtime cho engine. JS truyền tải giảm khoảng 21 KiB trên mỗi trang. Không bỏ validation, VI/EN, nội dung SEO hoặc chức năng.
- Hộp tìm kiếm không dựng 21 kết quả khi chưa mở. Catalog không prefetch hàng loạt engine chưa được chọn; các link và khả năng tìm kiếm vẫn đầy đủ.
- Một lượt baseline Keyboard có CLS 0,42352 do giao diện engine xuất hiện sau placeholder. Đợt tối ưu giữa có LCP median 3515 ms, trace chỉ rõ đoạn hướng dẫn capture được render muộn. HTML công cụ hiện prerender giao diện inert; native fieldset chỉ mở tương tác sau hydration của chính engine và capability detection. Không chạy phép đo phần cứng trên server. LCP median Keyboard cuối 1073 ms, CLS median 0.
- Catalog không nhận input trước hydration để tránh mất truy vấn trên WebKit. Device Overview không tạo canvas capability probe lặp lại theo timer.
- Không có ảnh truyền tải trong ba trang (0 byte). Font self-host giữ đủ ký tự Việt/Anh: median khoảng 93,1 KiB ở /vi, 52,7 KiB ở PPI tiếng Anh, 78,1 KiB ở Keyboard tiếng Việt. Không loại subset tiếng Việt để tăng điểm.

## Mục tiêu chưa đạt và giới hạn

Homepage đạt median 84, PPI 87 và Keyboard 75, đều chưa đạt 90 trong bộ đo cuối. TBT median tương ứng 640 / 500 / 1289 ms. Bundle framework lớn nhất khoảng 224 KiB chưa nén (70 KiB gzip), bên cạnh runtime React và các thành phần tương tác. JS toàn trang còn khoảng 190–201 KiB truyền tải dù giảm khoảng 21 KiB so với baseline.

Audit mainthread-work-breakdown của lượt 3 ghi Script Evaluation / Style & Layout lần lượt 882 / 746 ms ở homepage, 2040 / 1058 ms ở PPI, 1204 / 1020 ms ở Keyboard. Đây là dữ liệu hỗ trợ hướng điều tra JavaScript/hydration và layout; không kết luận mọi TBT là do một component cụ thể. Không còn script ngoài origin để quy nguyên nhân cho script bị chèn.

Benchmark CPU trong bộ cuối dao động từ 318,5 đến 1437; riêng PPI có Performance 87 / 96 / 76 và TBT 500 / 229 / 1235 ms. Các điều kiện cấu hình tương đương nhưng tốc độ CPU thực không ổn định. Không thể kết luận giảm bundle bảo đảm tăng điểm; PPI và Keyboard có median thấp hơn baseline. Giữ đủ cả chín lượt cuối, không chọn bộ clean-final trung gian (81 / 95 / 83) làm kết quả phát hành. Cần đo tiếp trên runner/staging có CPU ổn định để tách biến thiên môi trường khỏi regression.

Accessibility, Best Practices và SEO đều 100 ở ba trang trong lượt đo cuối; CLS median từ 0 đến 0,00081, không được làm tròn thành “mọi lượt CLS bằng 0”. Điểm lab không thay thế dữ liệu thực địa, kiểm thử thiết bị hay việc nghiệm thu production. Cần tiếp tục kiểm tra startup/hydration trên Linux staging có CPU ổn định; chưa tuyên bố Performance 90+ cho toàn bộ Phase 1.

## Tái lập trên Windows

1. Tạo chứng chỉ tự ký QA (SAN localhost/127.0.0.1), lưu key.pem và cert.pem trong artifacts/qa-tls bằng OpenSSL; không đưa key vào Git hoặc trust store hệ thống.
2. Đặt SITE_URL=https://127.0.0.1:3443 khi build, chạy pnpm build và pnpm start.
3. Chạy node scripts/qa-https.mjs ở terminal khác; proxy chỉ bind loopback.
4. Chạy node scripts/probe-browser.mjs và kiểm tra HTTPS không có externalOrigins.
5. Chạy node scripts/lighthouse.mjs --label clean-release --runs 3. Script từ chối kết quả “sạch” nếu trace có external/injected script. Chạy node scripts/report-performance.mjs để sinh báo cáo từ clean-before và clean-release.

Trên Linux sạch có thể dùng --base-url http://127.0.0.1:3000 và SITE_URL tương ứng, không cần chứng chỉ QA. Không so sánh trực tiếp điểm từ hai máy khác nhau như cùng một điều kiện đo.

## Báo cáo lịch sử

Các điểm 75–81 trong bàn giao trước là một lượt đo HTTP bị chèn script, không phải median sạch. Chúng còn ở artifacts/lighthouse-baseline và báo cáo cũ, chỉ dùng để giải thích lịch sử. Các bộ trung gian clean-after và clean-final vẫn giữ nguyên trong artifacts/performance; kết quả phát hành dùng clean-release, kể cả điểm thấp hơn.

Source M4 cuối 8f6e773 đã đạt kiểm thử chức năng/CI trong phạm vi capability hiện có; Lighthouse vẫn chưa đo. Không dùng kết quả unit/E2E, native audio smoke hoặc các median Phase 1 để chứng minh Performance của source này.

## Tiện ích Milestone 1 — local 19/11/2026

Bổ sung U01/U02, giữ nguyên 40 engine thiết bị, font/ảnh/SEO và accessibility. Hai engine mới tiếp tục tải qua `next/dynamic`; không đưa thuật toán đọc chữ vào Header/search index hoặc engine bàn phím. Với production build Next.js 16.4.6, file chứa bộ đọc số (`1a3dsue-1n16u.js`) là 8.349 byte / gzip ngoại tuyến 3.271 byte; file chứa biểu mẫu phần trăm (`1fymh-f-_hoo3.js`) là 5.806 / 2.359 byte. Đây là kích thước file, chưa phải tổng JavaScript truyền tải của trang. Đối chiếu HTML prerender: homepage VI và Keyboard Tester VI không tham chiếu hai file; trang U01 chỉ tham chiếu file U01, U02 chỉ tham chiếu U02. Kiểm tra marker/byte nằm ở raw artifact `artifacts/utilities-static-splitting.json`.

Lighthouse sạch và Runtime graph của candidate được ghi ở bản QA milestone sau khi kiểm tra; không lấy median public 94–97 ngày 16/11 làm điểm của tính năng mới. Môi trường Windows hiện vẫn bị Kaspersky chèn script/POST: đối chứng HTML trắng ngày 19/11 không có mã ứng dụng vẫn phát sinh request ngoài. Giữ nguyên tiêu chí clean của `scripts/lighthouse.mjs`, không lọc script, không tắt bảo vệ máy, không bỏ nội dung hoặc tính năng để lấy điểm. Chỉ công bố median khi có đủ ít nhất ba lượt sạch/trang trong điều kiện tương đương; nếu bị chặn, ghi rõ số lượt thực và không nhận mục tiêu mobile ≥90 đã xác minh.

### Kết quả candidate sau full E2E

Graph request thực trên Chromium 156.0.8078.4 xác nhận `/vi` và `/vi/keyboard/tester` không tải hai file JS tiện ích; `/vi/utilities/number-to-words` chỉ tải engine đọc chữ, `/vi/utilities/percentage` chỉ tải engine phần trăm. Raw `artifacts/utilities-runtime-graph.json`, dữ liệu gọn nằm trong [QA milestone](qa/utilities-milestone1-local-2026-11-19.json). Đây là kiểm tra graph ứng dụng, không phải chứng nhận browser sạch hoặc tổng payload giảm so với public cũ.

Đã chạy lệnh dưới đây khi full E2E và lint/typecheck kết thúc, không chạy benchmark đồng thời với bộ kiểm thử:

```text
node scripts/lighthouse.mjs --base-url http://127.0.0.1:3100 --label utilities-local-20261119 --runs 3 --paths /vi/utilities/number-to-words,/en/utilities/number-to-words,/vi/utilities/percentage,/en/utilities/percentage,/vi,/en
```

Lập lịch 18 lượt, **thực hiện 1, 0 lượt sạch được chấp nhận**; script chủ động dừng ở mẫu đầu vì phát hiện external script Kaspersky trong Chromium mới/extension tắt. Mẫu U01 VI bị loại có Performance **84**, FCP/LCP **2.843,139 ms**, TBT **303 ms**, CLS **0**, Speed Index **2.843,139 ms**; script 385.064 byte, font 56.135 byte, ảnh 0, document 84.857 byte, CSS 16.552 byte. A11y 100, Best Practices 81 (5 insecure requests), SEO 92 (canonical mặc định localhost:3000 khác origin preview 127.0.0.1:3100). Các giá trị này chỉ là dấu vết của lần thử không hợp lệ; không gán nguyên nhân toàn bộ TBT/điểm cho một resource hoặc kết luận hiệu năng production từ đây.

**Median: chưa có. Mobile ≥90: chưa xác minh.** Không đo đủ ba lượt sạch/trang do môi trường bị chèn; không tính median từ một mẫu không sạch, không tiếp tục lặp mẫu nhiễu để hợp thức hóa điểm. Không đổi cấu hình public hay SITE_URL phát hành trong nhiệm vụ local. Chưa đo các route còn lại trong điều kiện sạch. Raw JSON/HTML tại `artifacts/performance/utilities-local-20261119/`; các metric/settings thực được giữ trong QA milestone. Tiếp theo cần Chromium/Linux sạch, cùng origin/canonical và CPU/network tương đương, ít nhất ba lượt trên sáu trang rồi mới so sánh với baseline phù hợp.
