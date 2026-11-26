# Tiến độ Device Lab

## Đã phát hành 52 công cụ — 26/11/2026

a.ap.vn đã chuyển sang `5e2d205`, gồm giao diện dễ đọc hơn, Tạo mã QR, Nén và đổi kích thước ảnh và chế độ Thi gõ tiếng Việt có bảng xếp hạng tại máy. Origin xác minh đủ 52 công cụ và 104 trang VI/EN. [Tạo mã QR](https://a.ap.vn/vi/utilities/qr-code) · [Xử lý ảnh](https://a.ap.vn/vi/utilities/image-resizer) · [Thi gõ](https://a.ap.vn/vi/keyboard/vietnamese-typing?challenge=morning-v1)

Hai lượt CI đầu phát hiện camera ảo WebKit bị kẹt ở bước chuẩn bị. Đối chiếu trên Linux cho thấy vùng video của bản mới nằm dưới khung nhìn 720 px và WebKit chưa có khung hình, dù track đã hoạt động. `src/features/camera/camera.tsx` đưa vùng video vào tầm nhìn khi người dùng bấm Bắt đầu và video nằm hoàn toàn phía dưới khung nhìn. Bản sửa đạt 2/2 lượt đối chiếu với kích thước ban đầu. [Chẩn đoán Linux](https://github.com/anhtruc1803/checkall/actions/runs/45756180085) · [Kiểm tra bản sửa](https://github.com/anhtruc1803/checkall/actions/runs/45756487260)

Trước khi chuyển, CI Linux đạt typecheck, lint, quét secret, 589 unit test, build 132 trang, 574 E2E và Docker smoke. Sáu ca kiểm tra native Permissions Policy được bỏ qua theo khả năng Firefox/WebKit. Lighthouse đo 60 lượt sạch trên commit phát hành, median 99–100 ở 12 trang, bốn trang QR và xử lý ảnh đều đạt 99. [CI](https://github.com/anhtruc1803/checkall/actions/runs/45756396732) · [Đo so sánh](https://github.com/anhtruc1803/checkall/actions/runs/45756556846) · [Đo tiện ích mới](https://github.com/anhtruc1803/checkall/actions/runs/45756556881)

Sau khi chuyển, kiểm thử trực tiếp trên a.ap.vn đạt 24/24 ca cho QR, xử lý ảnh và Thi gõ trên Chromium, Firefox, WebKit và Chromium mobile. Container healthy, Node chỉ có cổng nội bộ, log Nginx và ứng dụng ghi nhận 0 lỗi trong lượt kiểm tra. Camera đã được xác minh bằng thiết bị ảo trên CI. Việc kiểm tra camera vật lý trên Safari chưa nằm trong phạm vi đợt này. [Chi tiết triển khai](DEPLOYMENT.md)

## Tạo mã QR và xử lý ảnh — bản local để duyệt, 26/11/2026

Thêm hai tiện ích U09 và U10 vào nhóm **QR và hình ảnh** trong danh mục VI/EN. Bản local có đủ 50 công cụ trước đó, hai tiện ích mới và chế độ thi gõ trong B06. Đã xác minh 52 công cụ với 104 trang VI/EN và sitemap 126 URL.

U09 nhận link hoặc văn bản tối đa 1.000 byte UTF-8 và giữ nguyên nội dung khi mã hóa. Thư viện `qr` được tải khi bấm tạo. Canvas vẽ mã đen trắng, có viền trống bốn mô-đun, rồi xuất PNG. Có xem trước và tải xuống tại chỗ. [Thư viện mã hóa QR](https://github.com/paulmillr/qr)

U10 đọc một tệp JPEG, PNG hoặc WebP tối đa 20 MiB và 24 megapixel, giữ tỷ lệ khi đổi chiều rộng và giới hạn ảnh xuất 4.096 px mỗi cạnh. JPEG và WebP có điều chỉnh chất lượng. Chọn định dạng theo khả năng xuất thật của trình duyệt. JPEG tô trắng phần trong suốt, còn tệp xuất từ ảnh động là ảnh tĩnh. So sánh số byte thật của tệp gốc và tệp xuất. Canvas, xem trước và tải tệp đều chạy trong trình duyệt. [Đặc tả Canvas](https://html.spec.whatwg.org/multipage/canvas.html#dom-canvas-toblob)

File chính gồm `src/features/utilities/{qr-code,image-resizer,local-image}.tsx`, `media-tools.module.css` trong cùng thư mục, `src/lib/utilities/image-resize.ts`, Registry `src/lib/tools/media-utilities.ts` và nhãn VI/EN. Ảnh kiểm thử ở `artifacts/media-utilities-review/`. Trên Chromium, ảnh thẻ kết quả mẫu 1200 × 630 px và 601,6 KiB xuất thành JPEG 640 × 336 px và 19,7 KiB ở chất lượng 80%.

Build tạo 132 trang với `pnpm build`. `pnpm typecheck`, `pnpm lint` và `pnpm audit --prod --json` đạt, báo cáo audit không có lỗ hổng đã công bố. `node scripts/smoke-http.mjs http://127.0.0.1:3100` đạt healthcheck và 60 route, còn `shell.spec.ts` kiểm tra 104 trang công cụ.

Unit test liên quan đạt 33/33. `pnpm exec playwright test --config artifacts/media-utilities-final-playwright.config.ts media-utilities.spec.ts typing-competition.spec.ts vietnamese-typing.spec.ts utility-catalog.spec.ts --workers=2` đạt 60/60 trên Chromium, Firefox, WebKit và Chromium mobile. Đã tạo và tải QR, xử lý và tải ảnh khi offline, giải mã PNG bằng `jsQR`, kiểm tra chữ tiếng Việt và khoảng trắng, kích thước, kênh alpha, chữ 200% ở 320 px, axe ở hai theme và hồi quy chế độ thi gõ. Cùng ảnh JPEG 640 × 336 px trên Chromium, chất lượng 80% tạo 20.190 byte và chất lượng 10% tạo 6.477 byte. [Thư viện dùng để kiểm tra giải mã](https://github.com/cozmo/jsQR)

Lượt kiểm tra mạng ban đầu ghi nhận lưu lượng do Kaspersky chèn. Lượt cuối tải mã ứng dụng trước rồi ngắt mạng trong phiên Playwright để kiểm chứng xử lý và tải tệp. Ca QR chạy lại riêng đạt 4/4, xác minh URL xem trước được thu hồi khi sửa nội dung.

[Tạo mã QR VI](http://127.0.0.1:3100/vi/utilities/qr-code) · [Tạo mã QR EN](http://127.0.0.1:3100/en/utilities/qr-code) · [Xử lý ảnh VI](http://127.0.0.1:3100/vi/utilities/image-resizer) · [Xử lý ảnh EN](http://127.0.0.1:3100/en/utilities/image-resizer)

## Thi gõ tiếng Việt và bảng xếp hạng — bản local để duyệt, 26/11/2026

Thêm chế độ thi 60 giây vào công cụ B06. Có hai đề cố định với link mở đúng đề trên VI/EN. Đồng hồ chạy từ văn bản đầu tiên đã được bộ gõ xác nhận. Trong lúc thi, người dùng có thể sửa lỗi. Ô gõ chặn dán và kéo thả. Điểm dùng bộ tính hiện có dựa trên số ký tự đúng, độ chính xác và lỗi trong văn bản cuối lượt.

Xếp hạng từng lượt đã lưu cho cùng đề trong trình duyệt. Thứ tự dùng WPM trước, rồi độ chính xác làm tròn đến một chữ số thập phân. Hai lượt có cùng điểm đồng hạng. Bản tóm tắt gồm đề, biệt danh tùy nhập, thời điểm, ký tự đúng và độ chính xác. Chỉ lưu sau khi bật tùy chọn và bấm Lưu lượt thi. Giới hạn 30 bản tóm tắt dùng chung với lịch sử hiện có. Khi thi từ nhiều máy, người dự thi có thể gửi ảnh để người tổ chức tổng hợp thủ công.

Tải ảnh ngay từ kết quả hoặc từ bảng xếp hạng. PNG ngang có kích thước 1200 × 630 và PNG vuông có kích thước 1080 × 1080. Hình có tên đề, biệt danh, thời điểm và điểm số. Canvas dựng PNG tại thiết bị. File chính nằm ở `src/features/typing/typing.tsx`, `typing-competition.tsx`, `competition-image.ts`, `competition.module.css`, `src/lib/typing/competition.ts`, `src/lib/storage/preferences.ts` và nhãn VI/EN.

`pnpm build` tạo 128 trang. `pnpm typecheck` và `pnpm lint` đạt. Sáu nhóm unit test liên quan đạt 25/25, gồm xếp hạng, đồng hạng, kiểm tra schema và tương thích lịch sử. Smoke HTTP đạt healthcheck và 56 route, probe đầy đủ xác minh 50 công cụ cùng 100 trang VI/EN. Ảnh từ lượt kiểm thử tự động lưu tại `artifacts/typing-competition-review/`.

`pnpm exec playwright test --config artifacts/typing-competition-playwright.config.ts typing-competition.spec.ts vietnamese-typing.spec.ts mouse-reaction.spec.ts --workers=2` đạt 48/48 trên Chromium, Firefox, WebKit và Chromium mobile. Ca thi gõ kiểm tra mô phỏng bộ gõ, mốc 60 giây, chặn dán, chỉ lưu theo thao tác, xếp hạng cùng đề, tải lại điểm, chữ 200% ở 320 px, axe hai theme và kích thước PNG thực tế ở cả hai khổ. [Thi gõ VI](http://127.0.0.1:3100/vi/keyboard/vietnamese-typing?challenge=morning-v1) · [Thi gõ EN](http://127.0.0.1:3100/en/keyboard/vietnamese-typing?challenge=morning-v1)

## Tinh chỉnh cỡ chữ, menu và hướng dẫn gõ — bản local để duyệt, 26/11/2026

Trang Tốc độ gõ tiếng Việt mở sẵn hướng dẫn 10 ngón với sơ đồ QWERTY và hai bàn tay. Toàn bộ tiêu đề có thể bấm hoặc dùng bàn phím để thu gọn. Lựa chọn mở/đóng được giữ khi đổi bài và chế độ trong cùng trang. Đoạn mẫu và ô gõ dùng 20 px ở cỡ mặc định, phần chỉ phím và ngón kế tiếp có nền riêng để dễ đọc.

Giao diện dùng chữ nội dung 17 px, nút và thanh menu 16 px, chữ phụ thường dùng 15 px ở cỡ mặc định. Cập nhật trang chủ, thẻ danh mục, gợi ý theo vấn đề, thanh điều hướng chính và Workbench. Mục hiện tại có nền xanh và chữ đậm ở hai theme. Thanh công cụ xuống hàng trên desktop khi thiếu chỗ và cuộn ngang trong vùng riêng trên mobile, có giữ mục hiện tại trong tầm nhìn. Các file chính gồm `tokens.css`, `src/app/{globals,interface}.css`, `src/components/layout/header.module.css`, `src/components/tools/workbench.css` và `src/features/typing/`.

`pnpm build` tạo 128 trang, `pnpm typecheck` và `pnpm lint` đạt. `node scripts/smoke-http.mjs http://127.0.0.1:3100` đạt healthcheck và 56 route VI/EN. Probe riêng xác minh đủ 50 công cụ, 100 trang VI/EN, mục đang chọn trên từng trang và sitemap 122 URL. Đã xem bản chụp desktop và mobile, kiểm tra 9 nhóm menu với VI/EN ở hai theme.

`pnpm test --maxWorkers=2` có 584/585 ca đạt. Ca Key Chatter vượt timeout 5 giây khi chạy cùng Playwright và đạt khi chạy lại riêng với `pnpm test tests/keyboard.test.tsx --maxWorkers=1 -t 'retains chatter totals beyond 200 events'`.

Playwright đạt 100/100 ca trên Chromium, Firefox, WebKit và Chromium mobile với `pnpm exec playwright test --config artifacts/ui-readability-playwright.config.ts vietnamese-typing.spec.ts mouse-reaction.spec.ts interface.spec.ts workbench.spec.ts utility-catalog.spec.ts problem-chooser.spec.ts --workers=2`. Kiểm tra gồm thao tác bàn phím, reflow 320 px với chữ 200%, kiểm tra axe hai theme, đủ 31 bài và hồi quy bài phản xạ. Ảnh bản duyệt ở `artifacts/ui-readability-review/`.

Bản production local đang mở để duyệt. [Trang chủ](http://127.0.0.1:3100/vi) · [Luyện gõ VI](http://127.0.0.1:3100/vi/keyboard/vietnamese-typing) · [Luyện gõ EN](http://127.0.0.1:3100/en/keyboard/vietnamese-typing) · [Menu Bàn phím](http://127.0.0.1:3100/vi/keyboard/hold)

## Đã phát hành 31 bài luyện gõ và hướng dẫn hai bàn tay — 25/11/2026

Bản `09f2bd5` đã tích hợp vào `main` và chạy trên a.ap.vn. B06 có 18 bài văn bản, sáu bài theo hàng phím và bảy bài luyện lỗi dấu. Sơ đồ QWERTY và hai bàn tay chỉ phím, ngón gõ và ngón giữ Shift. Sau lượt gõ, trang có thể gợi ý bài luyện theo lỗi dấu trong phiên. Danh mục giữ đủ 50 công cụ, gồm C08 với năm lượt phản xạ nhấp chuột. [Luyện gõ VI](https://a.ap.vn/vi/keyboard/vietnamese-typing) · [Luyện gõ EN](https://a.ap.vn/en/keyboard/vietnamese-typing) · [Phản xạ chuột](https://a.ap.vn/vi/mouse/reaction)

Các thay đổi chính nằm ở `src/features/typing/`, `src/lib/typing/`, `src/messages/{vi,en}.json` và các test luyện gõ. `pnpm typecheck`, `pnpm lint`, `pnpm build` và 20 unit test liên quan đều đạt trên bản ghép. Build tạo 128 trang. Playwright local đạt 36/36 E2E cho B06 và C08 trên Chromium, Firefox, WebKit và Chromium mobile. Smoke HTTP local đạt healthcheck và 56 route. Worktree phản xạ cũ được chuyển ra cạnh repository vì TypeScript quét test trong thư mục đó khi build `main`.

GitHub Actions đạt typecheck, lint, quét secret, 585 unit test, build và Docker smoke. Bộ E2E toàn site hoàn tất sau khi chuyển, với 546 ca đạt và sáu ca native Permissions Policy được bỏ qua theo khả năng của Firefox/WebKit. Lighthouse mobile giữ median Performance 100 cho B06 và 99 cho C08 ở cả VI và EN, từ 24 lượt đo trên hai commit. [CI Linux](https://github.com/anhtruc1803/checkall/actions/runs/45580508013) · [Lighthouse](https://github.com/anhtruc1803/checkall/actions/runs/45580566712)

Sau chuyển, origin xác minh đủ 100 trang công cụ VI/EN và website đạt 24/24 lượt kiểm tra trình duyệt. Docker healthy, healthcheck và sitemap 122 URL đạt, chưa ghi nhận lỗi ứng dụng hoặc Nginx tại thời điểm kiểm tra. Đợt tích hợp kiểm tra EVKey bằng mô phỏng trong trình duyệt. [Chi tiết triển khai](DEPLOYMENT.md)

## Đã phát hành Kiểm tra phản xạ nhấp chuột — 25/11/2026

Bản `65d6eea` đã đưa C08 lên a.ap.vn. C08 mở bài năm lượt hợp lệ, đo phản xạ theo ms, hiển thị trung vị, lượt nhanh nhất, từng lượt và số lần nhấp sớm. Đã xác minh 50 công cụ với 100 route công cụ VI/EN. [Mở VI](https://a.ap.vn/vi/mouse/reaction) · [Mở EN](https://a.ap.vn/en/mouse/reaction)

CI Linux đạt typecheck, lint, quét secret, 583 unit test, build 128 trang và Docker smoke. E2E có 542 bài đạt, gồm 12/12 ca C08. Sáu ca native Permissions Policy được bỏ qua theo khả năng của Firefox/WebKit. Sau khi chuyển, 24/24 lượt smoke public đạt, gồm bài năm lượt và chơi lại trên cả hai ngôn ngữ. [CI Linux](https://github.com/anhtruc1803/checkall/actions/runs/45564171370)

Lighthouse mobile trước chuyển đo 12 lượt sạch, ba lượt trên mỗi trang. Hai trang C08 đạt median Performance 99 và Accessibility 100. Bản phát hành lấy từ worktree riêng, còn bản luyện gõ đang duyệt nằm ở workspace local ban đầu. [Lighthouse](https://github.com/anhtruc1803/checkall/actions/runs/45564205951) · [Chi tiết triển khai](DEPLOYMENT.md)

## Kiểm tra phản xạ nhấp chuột — bản ứng viên, 25/11/2026

Thêm C08 vào nhóm Chuột, đưa tổng số lên 50 công cụ và 100 route VI/EN. Vùng thử cố định, đổi màu và chữ khi có tín hiệu sau khoảng chờ ngẫu nhiên 1,5–4 giây. Bài gồm năm lượt hợp lệ và hiển thị trung vị, lượt nhanh nhất, từng thời gian và số lần nhấp sớm. Nhấn giữ nút từ trước tín hiệu rồi mới thả vẫn tính là nhấp sớm. Lượt đang dở được tạm dừng khi mất focus hoặc ẩn tab. Kết quả dùng đồng hồ của trình duyệt và tồn tại trong trang đang mở.

File chính gồm `src/features/mouse/reaction.tsx`, `reaction.module.css`, `src/lib/tools/mouse-reaction-tool.ts`, nhãn VI/EN và `tests/e2e/mouse-reaction.spec.ts`. Build local tạo 128 trang, smoke HTTP đạt healthcheck và 56 route. 22 unit test liên quan và 12/12 E2E C08 đạt trên Chromium, Firefox, WebKit và Chromium mobile, gồm nhấp sớm, giữ nút qua tín hiệu, trung vị, tạm dừng và axe hai theme. Đã sửa phần xuống dòng ở viewport 320 px với chữ 200% và kiểm tra lại.

## Luyện theo lỗi dấu và hàng phím — bản local để duyệt, 25/11/2026

B06 có 31 bài luyện. Nhóm Văn bản gồm 18 bài, sáu bài mỗi mức Dễ, Vừa và Khó, với các chủ đề sinh hoạt, thư từ, đi lại và công việc. Nhóm Hàng phím gồm sáu bài cho hàng cơ sở, hàng trên, hàng dưới, hàng số và bài phối hợp. Sơ đồ QWERTY tự mở khi chọn bài hàng phím, đánh dấu hàng đang luyện và chỉ phím cùng ngón kế tiếp. Nút Bài tiếp theo chuyển sang bài kế tiếp trong cùng nhóm.

Nhóm Lỗi dấu có bảy bài cho dấu hỏi/ngã, sắc/nặng, ngang/huyền và bốn nhóm nguyên âm biến thể. Sau lượt 60 giây hoặc lượt luyện văn bản, công cụ đếm các lỗi dấu còn trong văn bản cuối lượt dựa trên căn chỉnh với đoạn mẫu. Gợi ý lấy nhóm có nhiều lỗi nhất trong phiên mở trang và chuyển thẳng đến bài tương ứng. Các số đếm dùng bộ nhớ của trang, được làm mới khi tải lại. Lịch sử lưu tự nguyện của bài 60 giây vẫn chứa điểm tóm tắt WPM và độ chính xác.

File chính gồm `src/features/typing/typing.tsx`, `typing-guide.tsx`, `typing.module.css` trong cùng thư mục, `src/lib/typing/{lessons,accents,score,keyboard-guide}.ts` và nhãn VI/EN. [Mở VI](http://127.0.0.1:3100/vi/keyboard/vietnamese-typing) · [Mở EN](http://127.0.0.1:3100/en/keyboard/vietnamese-typing)

`pnpm build` tạo 126 trang, `pnpm typecheck` và `pnpm lint` đạt. `pnpm test --maxWorkers=2` đạt 585/585 trên 45 file. `pnpm exec playwright test --config artifacts/typing-drills-playwright.config.ts vietnamese-typing.spec.ts --workers=2` đạt 24/24 trên Chromium, Firefox, WebKit và Chromium mobile. Đã kiểm tra các bài trong cả ba nhóm, chuyển bài, gợi ý tích lũy, lịch sử opt-in, reflow 320 px với chữ 200% và axe ở hai giao diện. `node scripts/smoke-http.mjs http://127.0.0.1:3100` đạt healthcheck và 54 route.

Ảnh bản duyệt ở `artifacts/typing-drills-review/`. Ảnh gợi ý dùng lỗi từ lượt gõ kiểm thử. Luồng EVKey trong lượt này được kiểm tra bằng mô phỏng trên trình duyệt. Bản local chạy ở loopback để người dùng duyệt.

### Mô phỏng bàn tay trong hướng dẫn 10 ngón

Thêm sơ đồ hai bàn tay dưới QWERTY trong `typing-guide.tsx` và `typing.module.css`. Phím kế tiếp và ngón gõ dùng chung ánh xạ. Ngón gõ có dấu chấm, ngón út giữ Shift có viền nét đứt. Ô phím cách hiển thị hai ngón cái để người luyện chọn một. Nhãn ngón hiện bằng chữ trên giao diện VI/EN. Ảnh desktop và mobile ở `artifacts/typing-hands-review/`.

`pnpm build` tạo 126 trang, `pnpm typecheck` và `pnpm lint` đạt. `pnpm test tests/typing-score.test.ts tests/typing-lessons.test.ts tests/i18n.test.ts --maxWorkers=2` đạt 11/11. `pnpm exec playwright test --config artifacts/typing-hands-playwright.config.ts vietnamese-typing.spec.ts --workers=2` đạt 24/24 trên Chromium, Firefox, WebKit và Chromium mobile, gồm đổi ngón trái/phải, phím cách, phím Shift và reflow 320 px với chữ 200%. `node scripts/smoke-http.mjs http://127.0.0.1:3100` đạt healthcheck và 54 route. Bản VI/EN đang chạy local để duyệt.

## Đã phát hành Lộ trình luyện gõ tiếng Việt — 25/11/2026

Bản `844cf4c` đưa chín bài luyện Dễ, Vừa và Khó, bàn phím hướng dẫn 10 ngón và biểu đồ WPM, độ chính xác lên a.ap.vn. Đã xác minh 49 công cụ và đủ 98 route công cụ VI/EN trên origin. [Bản tiếng Việt](https://a.ap.vn/vi/keyboard/vietnamese-typing) · [Bản tiếng Anh](https://a.ap.vn/en/keyboard/vietnamese-typing)

CI Linux đạt typecheck, lint, quét secret, build 126 trang và Docker smoke. Có 583 unit test và 530 E2E đạt, gồm 20/20 ca B06. Sáu ca native Permissions Policy được bỏ qua theo khả năng của Firefox/WebKit. [CI Linux](https://github.com/anhtruc1803/checkall/actions/runs/45543164579)

Trước khi chuyển, Lighthouse mobile đo 24 lượt sạch trên hai bản, bốn trang mỗi bản và ba lượt mỗi trang. Bản mới đạt median Performance 100 trên bốn trang. Sau chuyển, 24/24 lượt smoke public xác minh mã release, danh mục và luồng luyện gõ, gồm lưu tóm tắt, đổi VI/EN và tải lại để xem lịch sử. [Lighthouse](https://github.com/anhtruc1803/checkall/actions/runs/45543182395) · [Chi tiết triển khai](DEPLOYMENT.md)

## Lộ trình luyện gõ tiếng Việt — bản local để duyệt, 25/11/2026

B06 có chín bài luyện chia đều theo ba mức Dễ, Vừa và Khó. Giữ hai bài cũ trong lộ trình và thêm bài Hàng phím cơ sở cho người mới. Chế độ 60 giây có một đoạn mẫu cố định cho mỗi mức, trong đó mức Vừa dùng đoạn mẫu của bản đã phát hành. Nút Bài tiếp theo chuyển bài và trả focus về ô gõ.

Hướng dẫn 10 ngón dùng sơ đồ QWERTY, đánh dấu F và J, làm nổi bật phím gốc của ký tự mẫu kế tiếp và nêu tên ngón. Dấu tiếng Việt tiếp tục được xử lý qua văn bản đã nhận từ bộ gõ. Ô nhập chỉ mở sau khi trình xử lý phía trình duyệt sẵn sàng.

Lịch sử dùng kho tóm tắt cục bộ của Device Lab. Người dùng bật quyền lưu và bấm Lưu kết quả sau lượt 60 giây. Bản ghi chứa thời điểm kết thúc, độ khó, WPM và độ chính xác. Biểu đồ lọc theo độ khó, có chế độ WPM hoặc độ chính xác và hiển thị chênh lệch với lượt trước. Danh sách đưa lượt mới nhất lên đầu. Giới hạn 30 bản tóm tắt dùng chung với các công cụ khác. Nút xóa dữ liệu trong Quyền riêng tư dọn lịch sử này.

File chính gồm `src/features/typing/typing.tsx`, `typing-guide.tsx`, `typing-history.tsx`, `typing.module.css` trong cùng thư mục, `src/lib/typing/`, `src/lib/storage/preferences.ts` và nhãn next-intl VI/EN. [Bản tiếng Việt](http://127.0.0.1:3100/vi/keyboard/vietnamese-typing) · [Bản tiếng Anh](http://127.0.0.1:3100/en/keyboard/vietnamese-typing)

`pnpm build` tạo 126 trang. `pnpm lint` và `pnpm typecheck` đạt. `pnpm test --maxWorkers=2` đạt 583/583 trên 45 file khi chạy riêng. Lượt chạy song song với build có một bài Key Chatter vượt timeout 5 giây. `pnpm exec playwright test --config artifacts/typing-course-playwright.config.ts vietnamese-typing.spec.ts --workers=2` đạt 20/20 trên Chromium, Firefox, WebKit và Chromium mobile. Các ca kiểm tra đồng hồ, mô phỏng EVKey, chín bài luyện, đổi mức, lưu tự nguyện, biểu đồ, tải lại, xóa dữ liệu, axe và bố cục 320 px với chữ 200%. `node scripts/smoke-http.mjs http://127.0.0.1:3100` đạt healthcheck và 54 route.

Đã xem ảnh desktop tối và mobile sáng. Ảnh biểu đồ dùng kết quả từ các lượt gõ tự động trong phiên kiểm thử và lưu ở `artifacts/typing-course-review/`. Lượt này kiểm tra bộ gõ bằng mô phỏng. Bản đang chạy ở loopback để người dùng duyệt bố cục và nội dung bài luyện.

## Đã phát hành Tốc độ gõ tiếng Việt — 25/11/2026

Bản `b4f21ae` đã chạy trên a.ap.vn. Công cụ B06 có bài 60 giây, hai bài luyện tự do và phân tích lỗi dấu, với giao diện VI/EN. Đã xác minh đủ 48 công cụ trước đó cùng B06, tổng 49 công cụ và 98 route công cụ. [Bản tiếng Việt](https://a.ap.vn/vi/keyboard/vietnamese-typing) · [Bản tiếng Anh](https://a.ap.vn/en/keyboard/vietnamese-typing)

CI Linux đạt typecheck, lint, quét secret, 580 unit test, build 126 trang và Docker smoke. Playwright có 522 bài đạt, 6 ca native permission được bỏ qua do runtime Firefox/WebKit thiếu hỗ trợ kiểm tra policy, 0 lỗi và 0 flaky. Riêng công cụ B06 đạt 12/12 trên Chromium, Firefox, WebKit và Chromium mobile, gồm mô phỏng EVKey, thời lượng 60 giây và axe sáng/tối. [CI Linux](https://github.com/anhtruc1803/checkall/actions/runs/45536762126)

Trước khi chuyển website, Lighthouse mobile đo 24 lượt sạch, ba lượt cho mỗi trang. Median Performance đạt 99–100 trên tám trang, riêng B06 đạt 100 ở cả VI và EN. Sau chuyển, 24/24 lượt smoke trên website đạt. [Lighthouse](https://github.com/anhtruc1803/checkall/actions/runs/45536782352) · [Chi tiết triển khai](DEPLOYMENT.md)

## Tốc độ gõ tiếng Việt — bản local để duyệt, 25/11/2026

Thêm B06 vào nhóm Bàn phím, đưa tổng số lên 49 công cụ trên bản local. Bài 60 giây bắt đầu khi có chữ đầu tiên đã nhận vào ô nhập. Luyện tự do có **Luyện dấu tiếng Việt** mặc định và **Gõ văn bản hằng ngày**. Bấm **Kết thúc** để chấm. Cả hai chế độ dùng đoạn mẫu tiếng Việt trên giao diện VI/EN. File chính gồm `src/features/typing/typing.tsx`, `src/lib/typing/score.ts`, `src/lib/typing/lessons.ts`, `src/lib/tools/typing-tool.ts` và nhãn next-intl. [VI](http://127.0.0.1:3100/vi/keyboard/vietnamese-typing) · [EN](http://127.0.0.1:3100/en/keyboard/vietnamese-typing)

Điểm tính từ văn bản cuối lượt sau chuẩn hóa NFC. Độ chính xác lấy số ký tự khớp chia cho số ký tự khớp cộng số lỗi trong phần đã gõ. Khi căn chỉnh hai văn bản, bỏ phần mẫu chưa gõ ở cuối và phân loại lỗi mỗi vị trí vào dấu thanh, dấu chữ, `d/đ`, khoảng trắng hoặc lỗi khác. WPM quy đổi từ ký tự đúng/phút theo 5 ký tự. Văn bản và kết quả ở bộ nhớ của trang. Bài 60 giây chặn dán và kéo thả trong ô gõ.

`pnpm build` tạo 126 trang. `pnpm lint`, `pnpm typecheck`, `pnpm test --maxWorkers=2` đạt, gồm 580/580 unit test. Playwright đạt 24/24 trên Chromium, Firefox, WebKit và Chromium mobile. Các ca gồm bộ đếm 60 giây, chờ IME hoàn tất, mô phỏng `d → Backspace → đ`, chấm lỗi dấu, reflow 320 px với chữ 200% và axe ở hai theme. Lượt Chromium dùng thời gian thật quan sát kết thúc sau 60,508 giây tính từ lúc gửi đầu vào qua Playwright. Smoke HTTP đạt healthcheck và 54 route. Đã đối chiếu đủ 98 route công cụ VI/EN và sitemap 120 URL.

Lượt gõ tay nội bộ với EVKey V + Telex trên câu kiểm tra riêng cho kết quả `dd` thành `đ`, một ký tự đúng và 0 lỗi `d/đ`. Đã bỏ câu kiểm tra riêng khỏi danh sách bài luyện VI/EN. Ca hồi quy Playwright mô phỏng `d → Backspace → đ` tại từ `đọc` trong bài **Gõ văn bản hằng ngày**. Sau khi chỉnh danh sách, build, lint, 7/7 unit test chấm điểm và i18n, 12/12 Playwright và smoke HTTP đều đạt. Bản dành cho duyệt local.

### Tinh gọn giao diện gõ tiếng Việt

Gộp nút chọn chế độ và chọn bài luyện trên cùng hàng khi đủ chỗ. Đặt đoạn mẫu ngay trên ô gõ, đồng hồ và nút thao tác ở cột bên cạnh trên desktop. Trên mobile, đồng hồ nằm trên vùng gõ và nút thao tác nằm bên dưới. Thêm thanh thời gian cho bài 60 giây, biểu tượng cạnh nhãn và làm nổi bật nhóm lỗi có phát sinh. Giữ hai bài luyện VI/EN cùng cách tính điểm và xử lý IME. File chính gồm `src/features/typing/typing.tsx`, `src/features/typing/typing.module.css`, hai bộ nhãn và `tests/e2e/vietnamese-typing.spec.ts`.

`pnpm build` tạo 126 trang. `pnpm lint`, `pnpm typecheck` và `pnpm test tests/typing-score.test.ts tests/i18n.test.ts --maxWorkers=2` đạt, gồm 7/7 unit test. `pnpm exec playwright test --config artifacts/typing-layout-playwright.config.ts vietnamese-typing.spec.ts --workers=2` đạt 12/12 trên Chromium, Firefox, WebKit và Chromium mobile. Phép thử 320 px ở cỡ chữ 200% đã đạt sau khi sửa chiều rộng tối thiểu của lưới. Các ca bao gồm axe Light/Dark, thanh thời gian 60 giây và luồng EVKey mô phỏng. `node scripts/smoke-http.mjs http://127.0.0.1:3100` đạt healthcheck và 54 route.

Ở viewport 1440 × 900, vùng thao tác giảm từ 550 xuống 414 px. Đã xem ảnh desktop tối và mobile sáng, kiểm tra đoạn mẫu tự cuộn theo ký tự và cuộn về đầu khi làm lại. Ảnh bản duyệt ở `artifacts/typing-layout-review/`. Lượt này kiểm tra EVKey qua mô phỏng. Preview VI/EN chạy local để duyệt.

## Giao diện 48 công cụ đã phát hành lên a.ap.vn — 23/11/2026

Bản `5c5cc2c` đưa giao diện Workbench, trang chủ mới, nhóm Tiện ích và icon cùng hình minh họa lên 48 công cụ. Đã đối chiếu đủ 96 route VI/EN, sitemap 118 URL và 24/24 lượt smoke trên website public với đúng mã release. [Màn hình](https://a.ap.vn/vi/screen) · [Tiện ích](https://a.ap.vn/vi/utilities)

CI Linux đạt 576 unit và 510 E2E với sáu ca native policy được skip theo khả năng browser. Đã sửa bước cuộn vùng đo vào viewport cho bài kiểm tra Polling Rate. Bản Docker ứng viên đạt cả restart và shutdown. Lighthouse mobile trước chuyển đạt median 98–100 trên sáu trang, ba lượt sạch mỗi trang. [Chi tiết triển khai](DEPLOYMENT.md) · [CI](https://github.com/anhtruc1803/checkall/actions/runs/45138631487) · [Lighthouse](https://github.com/anhtruc1803/checkall/actions/runs/45134272393)

## Minh họa 48 công cụ — bản local để duyệt, 23/11/2026

Thêm icon và hình minh họa tĩnh theo chức năng cho 48 công cụ trong danh mục VI/EN và mục nổi bật. Ví dụ gồm dải màu, phím, tín hiệu và đầu vào/kết quả của tiện ích. Dùng chung `tool-card.tsx`, `tool-visual.tsx` và `tool-card.module.css`. Trang công cụ dùng icon tương ứng và hiện hình ở đầu trang trên màn hình đủ rộng. Nội dung chi tiết và metadata lấy từ Tool Registry. Hình dùng CSS và Lucide có sẵn. [Màn hình](http://127.0.0.1:3100/vi/screen) · [Tiện ích](http://127.0.0.1:3100/vi/utilities)

`pnpm build` tạo 124 trang, `pnpm lint` và TypeScript đạt. Playwright đạt 20/20 trên Chromium, Firefox, WebKit và Chromium mobile, gồm kiểm tra 48 icon và hình trên danh mục VI/EN, tìm kiếm, reflow 320 px khi chữ 200% và axe ở hai theme. Smoke HTTP đạt 52 route, đối chiếu đủ 96 route công cụ có hình tương ứng. Ảnh kiểm tra lưu trong `artifacts/tool-visuals-review/`. Bản đang chạy local cổng 3100.

## Danh mục Tiện ích — bản local để duyệt, 23/11/2026

Tăng tên thẻ từ 13,6 lên 18 px và mô tả từ 11,2 lên 16 px. Thay hai hàng lọc trùng ngữ cảnh bằng một ô tìm kiếm và ba nhóm **Số và tiền**, **Văn bản**, **Đơn vị và ngày**. Mỗi thẻ dùng mô tả riêng từ Tool Registry. Ở viewport desktop 1440 × 900 px, mép trên thẻ đầu tiên chuyển từ 479 xuống 387 px tính từ đầu trang. Các file chính gồm route danh mục `page.tsx`, `utility-catalog.tsx`, `utility-catalog.module.css`, `catalog-search.tsx` và nhãn VI/EN.

`pnpm build` tạo 124 trang. `pnpm lint`, `pnpm typecheck`, `pnpm test tests/search-index.test.ts` đạt, gồm 2/2 unit test tìm kiếm. Playwright đạt 20/20 trên Chromium, Firefox, WebKit và Chromium mobile, gồm reflow 320 px khi chữ 200% và axe ở hai theme. Smoke HTTP đạt healthcheck và 52 route. Đối chiếu đủ 48 công cụ, 96 route VI/EN và sitemap 118 URL. Bản duyệt chạy local. [VI](http://127.0.0.1:3100/vi/utilities) · [EN](http://127.0.0.1:3100/en/utilities)

## Trang chủ và điều hướng — bản local để duyệt, 23/11/2026

Trang chủ đưa tìm kiếm theo tên hoặc triệu chứng và sáu liên kết theo vấn đề lên đầu. Header tách **Kiểm tra thiết bị** và **Tiện ích**, dùng cùng bố cục điều hướng ở VI/EN và trên mobile. Hình minh họa và bảng thông tin thiết bị xuất hiện sau danh mục. Các file chính gồm `page.tsx` trang chủ, `header.tsx`, `home-tool-search.tsx`, `problem-chooser.tsx`, CSS Module và nhãn VI/EN. [Báo cáo và lệnh kiểm thử](HOME-NAVIGATION-UI.md)

Build 124 trang, lint, typecheck và 576 unit test đạt. Smoke HTTP và đối chiếu đủ 96 route VI/EN xác nhận 48 công cụ. Trên cùng build, 48 kịch bản Playwright đã đạt qua hai lượt trên Chromium, Firefox, WebKit và Chromium mobile. Lượt chạy lại xác minh reflow và vùng bấm từ 44 px sau khi đổi cách đọc kích thước trong test. Bản duyệt chỉ chạy local cổng 3100. [VI](http://127.0.0.1:3100/vi) · [EN](http://127.0.0.1:3100/en)

## Keyboard Event Inspector — bản local để duyệt, 23/11/2026

Thẻ sự kiện gần nhất nằm cạnh sơ đồ bàn phím trên desktop và phía trên sơ đồ trên màn hình nhỏ. Nhật ký hiển thị loại sự kiện, `key`, `code` và thời điểm. Có thể mở chi tiết từng dòng, lọc theo phím hoặc loại sự kiện và sao chép JSON. Các file chính gồm `keyboard.tsx`, `keyboard-event-details.tsx`, `keyboard-event-log.tsx`, `keyboard.css` và nhãn VI/EN qua next-intl. [Báo cáo giao diện và kiểm thử](KEYBOARD-INSPECTOR-UI.md)

Lượt người dùng gõ với EVKey ghi nhận cặp `KeyD` nhấn/thả, cặp `Backspace` nhấn/thả rồi `keydown` có `key=đ` và `code` rỗng. Inspector giữ năm dòng chẩn đoán, báo **Thiếu code** và engine dừng thu, hoàn tác thống kê của lượt này về 0. Lượt thử chỉ xác minh chuỗi đến lúc capture dừng trên cấu hình hiện tại.

Lint, typecheck, build 124 trang, smoke HTTP và đối chiếu 96 route VI/EN cho 48 công cụ đạt. Unit chạy riêng đạt 575/575. Năm tệp Playwright bàn phím đạt 60/60, mỗi cấu hình Chromium, Firefox, WebKit và Chromium mobile đạt 15/15. Đã kiểm tra axe ở Dark/Light và reflow với chữ 200%. Lượt này chưa thử Safari thật hoặc đo lại Lighthouse. Bản hiện tại sẵn sàng để duyệt local, trạng thái website giữ nguyên. [VI](http://127.0.0.1:3100/vi/keyboard/events) · [EN](http://127.0.0.1:3100/en/keyboard/events)

## Giao diện Workbench — bản local để duyệt, 23/11/2026

Đã làm lại giao diện 48 công cụ VI/EN theo hướng bảng điều khiển kỹ thuật. Tiện ích có vùng nhập và kết quả riêng. Các trang có thanh chuyển công cụ trong nhóm, thông số dễ đọc hơn và chỉ dẫn ngay trong khung camera khi chưa mở. Thanh điều hướng giữ link đang focus nhìn thấy khi thu nhỏ cửa sổ. File chính gồm `design.md`, `tokens.css`, `workbench.css`, `tool-navigation.tsx`, template route công cụ và các component trình bày. [Báo cáo giao diện](UI-WORKBENCH.md)

Bản cuối đạt lint, typecheck, quét secret, build 124 trang, HTTP đủ 96 route và 28/28 E2E liên quan trên bốn cấu hình. Bộ unit đạt 575/575. Lượt 488 E2E trước sửa focus có 454 đạt, 19 skip và 15 failure ghi nhận request Kaspersky ở các bài không upload. Lighthouse local dừng vì phát hiện script Kaspersky. Chưa có điểm sạch cho bản mới và Final Acceptance vẫn mở.

Bản production để duyệt đang chạy local. Scope phát hành vẫn cần CI sạch, số đo Lighthouse trên Chromium sạch và QA thiết bị thật. [Đổi đơn vị local](http://127.0.0.1:3100/vi/utilities/unit-converter)

## Đã chuyển sang a.ap.vn — 23/11/2026

Website chính: [VI](https://a.ap.vn/vi), [EN](https://a.ap.vn/en). Giữ nguyên **48 công cụ**, **96 route công cụ VI/EN**, sitemap **118 URL**. App/tests/dependencies không đổi so với Milestone 3; build lại với `SITE_URL=https://a.ap.vn`. Source **6c8252b3a53574cd9283101f0a95219fb3b85a41**. Xem [báo cáo chuyển tên miền](DOMAIN-MIGRATION.md), [QA JSON](qa/domain-migration-2026-11-23.json).

[CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/45101107988) đạt typecheck/lint/secret scan, **575 unit/43 file**, build **124 trang**, **466 E2E đạt/6 native policy skip**, 0 fail/flaky/global error. Docker CI/candidate đạt health/VI/EN/restart/shutdown và Node private. **84/84 public UI smoke** trên Chromium/Firefox/WebKit/mobile đạt; đây là subset chức năng Windows. Full privacy/no-upload lấy từ CI Linux. [Lighthouse trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/45101257370) có 60 mẫu sạch/20 trang ×3, median **98–100**; [Lighthouse public mới](https://github.com/anhtruc1803/checkall/actions/runs/45105593936) có 60 mẫu sạch, median mobile **97–99**. Bộ lab và public khác điều kiện mạng, không quy chênh lệch cho thay đổi code.

Đủ 96 route public đạt H1/canonical/hreflang/policy, sitemap/robots/health dùng tên miền mới, CSP **96/96**. Đủ 96 redirect từ tên miền cũ trả **308**, giữ đường dẫn/query. HTTP tên miền mới được proxy chuyển lên HTTPS bằng **301**; origin vẫn **308**. Đã xác minh TLS/correct release tại origin và cả ba proxy IP. Không sửa DNS/dashboard proxy. Các kết quả tên miền cũ bên dưới là lịch sử.

Chứng chỉ origin `a.ap.vn` đến **21/02/2027**, giữ chứng chỉ cũ cho HTTPS redirect. ACME sau chuyển đạt cả hai hostname ×3 proxy IP; timer Certbot active, chưa chạy renewal dry-run. Runtime healthy/non-root/read-only, Node không publish; giữ release/image cũ và backup để rollback. Phiên SSH đã đóng.

**Đã hoàn thành và xác minh:** tên miền/HTTPS/SEO/redirect, CI/Docker, public UI và Lighthouse mobile ≥90. **Đã triển khai nhưng chưa xác minh đầy đủ:** clipboard/bộ gõ/quyền trên thiết bị thật, renewal dài hạn và rollback khi production lỗi. **Chưa hoàn thành:** xác minh nguồn 503 tài nguyên phụ trong Lighthouse, sáu native policy skip, hai moderate dev tooling glob/minimatch, field Core Web Vitals. **Không thể kiểm chứng lượt này:** Safari/phần cứng thật và chế độ TLS proxy→origin trong dashboard. Audit mới: production 0 advisory, toàn bộ 2 moderate dev tooling. **Final Acceptance tổng thể vẫn mở.**

localStorage/theme/lịch sử và quyền thuộc từng origin; dữ liệu ở tên miền cũ không tự chuyển, browser có thể hỏi lại quyền camera/microphone. Tiếp theo: sử dụng tên miền mới, theo dõi vận hành và hoàn tất manual QA/bảo mật còn mở. Các mục dưới giữ bằng chứng lịch sử.

## Tiện ích Milestone 3 đã triển khai — 20/11/2026

Source **890aa52d9af73d1d36fd96b79d941adcb20296ed**, [CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/44663888110), [Lighthouse trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/44663904488) và [Lighthouse public](https://github.com/anhtruc1803/checkall/actions/runs/44668621145). Đã triển khai **U07 Đổi đơn vị** và **U08 Tính ngày** sau khi người dùng duyệt local: **48 công cụ VI/EN**, giữ nguyên metadata/route/engine/copy của **46 công cụ trước**; **96 route công cụ**, sitemap **118 URL**. Không sửa mã ứng dụng/tests/scripts sau bản đã duyệt; không thêm dependency hoặc viết lại kiến trúc.

Typecheck/lint/secret scan đạt, **575 unit/integration/43 file**, build **124 trang**. Full CI sạch **466 E2E đạt/6 native policy skip**, không fail/flaky/global error; hai công cụ mới **32/32**, văn bản M2 **32/32**, số M1 **24/24**. Chromium/mobile mỗi 118 đạt; Firefox/WebKit mỗi 115 đạt/3 skip. Backend audio ảo qua smoke cả ba engine, không phải phần cứng thật hoặc Safari.

Trước chuyển đủ **60 mẫu sạch/20 trang × 3**, median mobile **98–100**; sau chuyển đủ **60 mẫu sạch/20 trang × 3**, median **96–99**. Median Accessibility/Best Practices/SEO 100 trên mọi trang ở cả hai bộ. Đối chiếu source/path/pageVerified/clean của từng mẫu; đủ 120 mẫu, FCP/LCP/TBT/CLS và byte JS/font/ảnh trong [QA phát hành](qa/deployment-utilities-milestone3-2026-11-20.json). Không lấy điểm Windows 76 có injection làm baseline hoặc nhận chênh lệch lab/public là thay đổi do code.

Docker CI đạt build/health/Nginx/**52 route smoke VI/EN** trước/sau restart/stop-start, Node private, SIGTERM 143/không OOM/Error. Candidate VPS network none, non-root/read-only, 768 MiB/256 PID: đủ **96 route**, sitemap 118 trước/sau restart/stop-start và exit 143; đã dọn candidate. Chỉ sau khi đọc đủ CI/Lighthouse/candidate và sinh gate đúng source mới chuyển website.

Public HTTP→HTTPS308, H1/canonical/release/policy và đủ **96 route** (92 cũ + 4 mới), 48 card, sitemap 118 đạt. **84/84 public smoke** trên Chromium/Firefox/WebKit/mobile, mỗi cấu hình 21 bài, không fail/skip/flaky/global error; gồm tiện ích số/văn bản/đơn vị/ngày, VI/EN, clipboard fixture, theme/reflow/WCAG và EVKey/dd. Đây là subset chức năng trên Windows hiện có; kiểm tra không-upload của full suite được xác minh riêng trong CI sạch. Public Lighthouse đo sau smoke để không có tải QA đồng thời.

VPS current→`/opt/device-lab/releases/890aa52`, image **device-lab:staging-890aa52-20261120**, ID **sha256:9c28cf062a63c875d120cbe4eefc2c8c4549b3c408bd93663d4b2df44cca3de1**, archive Git tracked SHA256 **f52d1bd5429d7c59b6c4d1a3f1a9994162959311ac3f223cc543ff7ecb3c5a54**; không mang .env/secret/cache trong archive/image. Runtime Node.js v24.22.3, healthy/nextjs/read-only, Node 3000 không publish, 768 MiB/256 PID/cap-drop ALL/no-new-privileges, restart unless-stopped.

Giữ release/image `142f807` và backup `/opt/device-lab/shared/nginx.conf.before-text-m3-20261120` để rollback. Nginx chỉ đổi release marker và reload, giữ inode bind mount; đối chiếu backup xác minh routing/policy/quyền và Compose override không đổi. Không sửa DNS/proxy, prune/reboot hoặc chạy renewal mới. Chuyển thành công; không cố gây lỗi production để diễn tập rollback. Phiên SSH đã đóng.

Snapshot runtime `2026-11-20T03:49:37Z`: app tail 80 dòng có **0 error**; Nginx từ app start có **3 rate-limit**, **0 lỗi upstream**, **0 lỗi khác**. Không nới rate limit để lấy pass; Certbot timer active. Chi tiết gate/image/lifecycle/log ở [QA phát hành](qa/deployment-utilities-milestone3-2026-11-20.json).

File chính: hai engine/thuật toán `unit-converter`, `date-calculator`, Registry/ToolRunner/types/messages VI/EN, tests mới và fixture M2 đã được duyệt. Lượt triển khai chỉ thêm bằng chứng, báo cáo nghiệm thu và cập nhật README/ARCHITECTURE/PROGRESS/TESTING/PERFORMANCE/DEPLOYMENT/UTILITIES-MILESTONE-3; raw artifacts/cache/.env/key không commit.

**Đã hoàn thành và xác minh:** phần mềm CI sạch, giữ 46 công cụ cũ, Docker CI/candidate, public HTTP/UI và median mobile ≥90 trên 20 trang đại diện. **Đã triển khai nhưng chưa xác minh đầy đủ:** clipboard quyền hệ thống, screen reader, date picker/bàn phím số/nhập âm/bộ gõ trên điện thoại thật; rollback khi production lỗi chưa diễn tập cố ý. **Chưa hoàn thành:** 6 native policy skip, hai moderate dev tooling glob/minimatch, TLS proxy→origin trong dashboard/field data và các mục manual của nền tảng. CSP có tại app/origin nhưng public chỉ 0/96 route có header; proxy do người dùng quản lý, không tự sửa. **Không thể kiểm chứng lượt này:** Safari/phần cứng thật và mọi phiên bản EVKey; chế độ TLS trong dashboard proxy. Không coi fixture/WebKit automation là thiết bị/Safari thật. **Các gate phát hành phần mềm đạt; Final Acceptance tổng thể vẫn mở.**

Tiếp theo: dùng [Đổi đơn vị](https://nguyenanhtruc.io.vn/vi/utilities/unit-converter) và [Tính ngày](https://nguyenanhtruc.io.vn/vi/utilities/date-calculator), có EN qua bộ đổi ngôn ngữ; hoàn tất manual/native/bảo mật còn mở. Không tự mở milestone tiếp theo. Các phần dưới là lịch sử checkpoint trước phát hành.

## Lịch sử trước phát hành: Tiện ích Milestone 3 — đã duyệt local, chuẩn bị phát hành 20/11/2026

Người dùng đã duyệt U07/U08 và cho phép push GitHub, triển khai sau kiểm thử môi trường sạch và Lighthouse trước cập nhật. Đối chiếu đủ 213 fingerprint source/test/script khớp build local đã duyệt; giữ nguyên 46 công cụ trước. Bắt đầu CI/Linux và Lighthouse đúng source mới; chưa chuyển website. Các kết quả local bên dưới được giữ làm checkpoint, không đổi failure/skip thành pass. Chỉ chuyển ứng dụng sau khi đọc đủ báo cáo CI, Docker smoke, candidate VPS và ít nhất ba lượt Lighthouse sạch/trang đại diện; giữ rollback và cấu hình DNS/proxy của người dùng.

## Lịch sử trước phát hành: Tiện ích Milestone 3 — local để duyệt, 20/11/2026

Candidate local **48 công cụ VI/EN**, giữ nguyên metadata/route/engine/copy của 46 công cụ trước; thêm **U07 Đổi đơn vị** (tám nhóm, phân số BigInt) và **U08 Tính ngày** (khoảng cách và cộng/trừ ngày Gregorian 0001–9999, độc lập DST). Không thêm dependency, API, capability hoặc permission. Chưa commit/push, CI từ xa, SSH hoặc triển khai website; public vẫn M2. Xem [đặc tả M3](UTILITIES-MILESTONE-3.md).

Typecheck/lint/secret scan đạt; **575 unit/integration/43 file** đạt, không fail/skip (baseline trước sửa 494/41). Build cuối **124 trang**, BUILD_ID `53i7Q8tGFzXpfNgRhVJ7k`; health +**52 route smoke VI/EN**/policy đạt; kiểm tra thêm đủ **96 tool route**, canonical/CSP/ngôn ngữ và sitemap **118 URL**. Fixture thiết bị/M1 giữ nguyên; thêm fixture M2 U03–U06 từ committed HEAD, không sinh lại từ candidate. 213 file source/test/script được fingerprint, không đổi từ build cuối trong suốt full suite.

Full **472 E2E: 438 đạt / 19 skip / 15 fail**, không flaky/global error; 1.878.757,726 ms. Nhóm mới **29/32 đạt, 3 fail, 0 skip**. Tất cả failure đã đọc đều là POST do Kaspersky chèn ngoài ứng dụng; đối chứng mới HTML trống không tải app/nhập dữ liệu cũng có script/POST Kaspersky trên Chromium và Firefox. Không lọc request, giảm assertion, tăng timeout hoặc gán failure thành pass. Các skip native/runtime giữ từng lý do trong [QA JSON M3](qa/utilities-milestone3-local-2026-11-20.json); không chứng nhận quyền/phần cứng từ fixture hoặc Safari thật từ WebKit.

Hai engine tải riêng: unit chunk **7.594 byte**, gzip ước tính **2.864 byte**; date chunk **4.761 byte**, gzip ước tính **1.783 byte**. Không tải hai engine trên trang chủ, Keyboard Tester và đọc số trong bảy route runtime graph đã kiểm tra. Đây không phải tổng JS/transfer hoặc kết luận điểm Lighthouse; messages/Registry có overhead chung. Đã xem ảnh desktop/mobile của cả hai công cụ; các bài passed bao gồm VI/EN, tính toán, clipboard fixture, Dark/Light/WCAG và reflow 320px/chữ 200%.

Lighthouse profile mới/extension tắt dừng bởi guard injection; chỉ có **1 mẫu chẩn đoán bị loại**, chưa đủ ba lượt/trang, chưa có median sạch hoặc xác minh mobile ≥90 cho M3. Không lấy điểm public M2 làm bằng chứng. Audit production **0 advisory**, còn **2 moderate dev tooling** glob/minimatch. Docker CLI không có, WSL không khả dụng; không tuyên bố đã thử Docker/Linux candidate.

File chính: `src/lib/utilities/units.ts`, `dates.ts`, `src/lib/tools/conversion-utilities.ts`, `src/features/utilities/unit-converter.tsx`, `date-calculator.tsx`; Registry/types/ToolRunner, messages VI/EN, HTTP smoke, hai file unit/UI, E2E mới và fixture M2. Các test chung chỉ cập nhật tổng công cụ/route và thêm khóa metadata M2; không giảm kiểm thử cũ. README/ARCHITECTURE/PROGRESS/TESTING/PERFORMANCE/DEPLOYMENT và đặc tả/QA M3 được cập nhật tiếng Việt.

Các lệnh đã chạy: `pnpm typecheck`, `pnpm lint`, `pnpm test --maxWorkers=2 --reporter=json --outputFile=artifacts/utilities-m3-unit-final.json`, `pnpm build` với SITE_URL local, `node scripts/smoke-http.mjs http://127.0.0.1:3100`, `pnpm exec playwright test --config artifacts/utilities-m3-playwright.config.ts`, audit production/toàn bộ, Prettier và secret/diff checks. Config QA dùng production server khởi tạo riêng ở loopback và output riêng; giữ bốn project, hai worker, timeout/assertions và các kiểm thử cũ. File E2E M3 chạy múi giờ America/New_York để kiểm tra qua mốc DST; không đổi timezone của các bài cũ.

**Đã hoàn thành và xác minh:** implementation local, khóa 46 định nghĩa cũ, unit/build/HTTP và các bài E2E có trạng thái passed. **Đã triển khai nhưng chưa xác minh đầy đủ:** clipboard quyền hệ thống, date picker/bàn phím số/nhập âm/bộ gõ trên điện thoại thật, screen reader. **Chưa hoàn thành:** full E2E sạch, Lighthouse sạch/mobile ≥90, Docker/Linux candidate, native/runtime skips và hai dev advisory. **Không thể kiểm chứng trong môi trường hiện tại:** browser hoàn toàn sạch script bảo mật trên Windows này, Safari/phần cứng thật, Docker Engine/WSL. Các mục native/manual/bảo mật còn mở của M2 vẫn giữ nguyên. **Final Acceptance và gate phát hành M3 chưa đóng.**

Tiếp theo: người dùng duyệt [Đổi đơn vị local](http://127.0.0.1:3100/vi/utilities/unit-converter) và [Tính ngày local](http://127.0.0.1:3100/vi/utilities/date-calculator); có EN qua bộ đổi ngôn ngữ. Sau duyệt và yêu cầu phát hành mới: CI/browser sạch, Lighthouse ba lượt/trang và Docker/Linux đúng source trước cập nhật website. Không tự mở milestone tiếp theo hoặc triển khai từ lượt local này.

## Tiện ích Milestone 2 đã triển khai — 19/11/2026

Báo cáo hoàn thiện và kiểm tra lại HTTP ngày **20/11/2026**; số liệu CI, Lighthouse và snapshot Docker/runtime bên dưới thuộc đợt phát hành **19/11/2026**. Kết luận và phân loại chi tiết: [Nghiệm thu Milestone 2](ACCEPTANCE-UTILITIES-MILESTONE-2.md).

Source **142f807dbb87374452acb65a8be6e2052caa5367**, [CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/44492926836), [Lighthouse trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/44493548246) và [Lighthouse public](https://github.com/anhtruc1803/checkall/actions/runs/44498282182). Giữ nguyên 42 công cụ trước (40 thiết bị + U01/U02), thêm U03–U06: **46 công cụ VI/EN**, **92 route công cụ**, sitemap **114 URL**. Mã ứng dụng, tests và scripts không đổi từ bản người dùng đã duyệt; các commit sau chỉ chuẩn hóa CI/tài liệu.

Typecheck/lint/secret scan đạt, **494 unit/41 file**, production build **120 trang**; full E2E **434 đạt/6 native policy skip**, không fail/flaky/global error, 1.034.526,065 ms. Chromium/mobile mỗi 110 đạt; Firefox/WebKit mỗi 107 đạt/3 skip. Nhóm văn bản **32/32**, tiện ích số **24/24** sạch. Backend audio ảo qua smoke cả ba engine; không chứng nhận phần cứng thật hoặc Safari.

Trước chuyển đủ **48 mẫu sạch/16 trang × 3**, median mobile **99–100**; sau chuyển đủ **48 mẫu sạch/16 trang × 3**, median **95–98**. Cả hai bộ có median Accessibility/Best Practices/SEO 100 trên mọi trang. Kiểm tra source/path/pageVerified/clean của từng mẫu; không chỉ dựa job success. Giữ toàn bộ 96 sample và median FCP/LCP/TBT/CLS/JS/font/ảnh trong [QA phát hành](qa/deployment-utilities-milestone2-2026-11-19.json). Không lấy mẫu Windows bị Kaspersky chèn hoặc dữ liệu M1 làm baseline tăng điểm M2.

VPS current→`/opt/device-lab/releases/142f807`, image **device-lab:staging-142f807-20261119**, ID **sha256:d75f3fd8a673b27311c3e9f585b5a38a2c2ead7190d7379715e337628124ec10**. Archive Git tracked SHA256 **797d67bdf02804fa4489886396852ba0fefe52689cf52111455861bf004a7571**, không mang .env/secret/cache. Candidate thử network none/non-root/read-only, đủ 92 route/sitemap 114 trước/sau restart/stop-start, SIGTERM 143/không OOM/Error, Node không public. Chỉ sau gate CI/Lighthouse/candidate đạt mới chuyển ứng dụng. Runtime Node.js v24.22.3, healthy/nextjs/read-only, 768 MiB/256 PID/cap-drop ALL/no-new-privileges.

Public HTTP→HTTPS308, H1/canonical/release/policy và toàn bộ 92 route (84 cũ + 8 mới) đạt. **56/56 public smoke** trên Chromium/Firefox/WebKit/mobile, không fail/skip/flaky/global error; gồm VI/EN, chữ/số, ngôn ngữ văn bản độc lập UI, clipboard/IME fixture, theme/reflow/WCAG và EVKey/dd. Đây là subset chức năng Windows hiện có, không phải full privacy sạch trên public; full privacy đã xác minh riêng trong CI.

Nginx chỉ đổi marker release và reload, giữ inode bind mount; DNS/proxy/routing/policy/quyền và Compose override không đổi. Chuyển thành công, giữ release/image `7e3dd0b` và backup `/opt/device-lab/shared/nginx.conf.before-text-m2-20261119`; không prune/reboot hoặc chạy renewal mới. Log Nginx từ app start: 15 bản ghi rate-limit, 0 lỗi upstream; app tail 80 dòng: 0 error; không nới rate limit để lấy pass; Certbot timer active. Phiên SSH đã đóng.

File chính phát hành: Registry/engine text/UI/messages/tests/fixture khóa 42 công cụ đã duyệt; `.github/workflows/ci.yml` pin Ubuntu 24.04/image Playwright 1.64.1+digest, trust đúng workspace, HOME/loopback và audio pwuser. Không sửa assertions/timeout/skip để làm pass. Các lượt bootstrap chưa E2E/không đạt được giữ trong sourceHistory của QA, không tính pass. Tài liệu cập nhật README/ARCHITECTURE/PROGRESS/TESTING/PERFORMANCE/DEPLOYMENT/UTILITIES-MILESTONE-2 và QA JSON; raw artifacts bị ignore.

**Đã hoàn thành và xác minh:** phần mềm qua CI, Docker CI/candidate, public HTTP/UI, median mobile ≥90 trên bộ đại diện. **Đã triển khai nhưng chưa xác minh đầy đủ:** clipboard/bộ gõ/mobile/screen reader thật, rollback khi lỗi production chưa diễn tập cố ý. **Chưa hoàn thành:** 6 native policy skips, 2 moderate dev tooling glob/minimatch, CSP public còn bị proxy bỏ (0/92 route có header), TLS proxy→origin/field data. **Không thể kiểm chứng lượt này:** Safari thật/phần cứng/mọi phiên bản EVKey. Không đồng nhất WebKit automation với Safari thật, fixture/backend ảo với thiết bị thật. Người dùng quản lý proxy; không tự sửa. **Final Acceptance tổng thể vẫn mở.**

Tiếp theo: người dùng dùng bốn tiện ích tại `/vi/utilities` hoặc `/en/utilities`; hoàn tất các mục manual/native/bảo mật còn mở. Không tự mở milestone tiếp theo. Các phần dưới là lịch sử checkpoint trước phát hành.

## Lịch sử trước phát hành: Milestone 2 đã duyệt local, chuẩn bị phát hành 19/11/2026

Người dùng đã duyệt bốn tiện ích văn bản và yêu cầu push GitHub/triển khai sau QA môi trường sạch và Lighthouse trước chuyển. Đang chuẩn bị source đã duyệt, giữ nguyên 42 công cụ trước. Chưa chuyển website; chỉ thực hiện khi đã đọc kết quả CI đầy đủ, Docker smoke và ba lượt Lighthouse sạch trên mỗi trang đại diện. Các checkpoint local và bằng chứng phía dưới được giữ nguyên để đối chiếu; không kế thừa CI/Lighthouse M1 làm xác minh M2.

Lượt đầu source `e0b0e96`: Docker CI và candidate cô lập VPS đạt; Lighthouse đủ 48 mẫu sạch/16 trang ×3, median99–100. CI verify bị dừng để chẩn đoán sau hơn15 phút cài browser: ubuntu-latest đã chọn Ubuntu26.04, log APT mirror tải chậm/thử lại gói media, chưa tới E2E; không ghi lượt này là pass hoặc lỗi ứng dụng. Cố định hai job CI sang Ubuntu24.04 để tái lập môi trường và đồng nhất Lighthouse. Không đổi source ứng dụng, test hoặc assertion; chạy lại CI/Lighthouse/candidate đúng commit mới trước chuyển website.

Source `e825c4c` tiếp tục đạt Docker/candidate và 48 Lighthouse sạch median99–100, nhưng verify vẫn kéo dài hơn20 phút ở cài dependency browser. Chuyển riêng job verify sang image Playwright1.64.1-noble chính thức, pin digest `sha256:2f05f8a734509a7b3f26a912639488ee08f58a7b292d14d62271bcff9038768f`, có sẵn ba browser/thư viện. Giữ Node24, backend audio ảo, full440 và toàn bộ assertions; không đổi ứng dụng. Lượt chưa chạy E2E không được tính pass. Tham khảo [Playwright CI](https://playwright.dev/docs/ci). Gates sẽ dùng lại đúng source commit sau cập nhật CI.

Lượt container `0dbf8f8` qua install/typecheck/lint, nhưng secret scan dừng do Git dubious ownership giữa bind mount của runner và user container. Bổ sung safe.directory chỉ cho `$GITHUB_WORKSPACE` đã checkout, không dùng wildcard hoặc bỏ scan. Không tính lượt này là kiểm thử đã đạt; chạy lại toàn bộ pipeline.

Lượt `8e5c05d` đã qua secret scan và494 unit, dừng ở PulseAudio do HOME GitHub không phù hợp chủ sở hữu home/runtime của daemon. Chạy daemon bằng pwuser không root với HOME và XDG_RUNTIME_DIR riêng; client dùng Unix socket/cookie rõ ràng trong CI. Giữ smoke audio ba engine bắt buộc, không thêm skip hoặc sửa phép đo. Không thay quyền/daemon trên VPS production.

Lượt `53115b7` đã khởi tạo PulseAudio và smoke Chromium, nhưng Firefox từ chối user root với HOME GitHub thuộc pwuser. Đặt HOME đúng `/root` cho user chạy job; daemon audio vẫn pwuser/socket riêng. Không thay launch flags, không bỏ Firefox/WebKit hoặc smoke audio. Chạy lại pipeline trước khi phát hành.

Lượt `4d024e0` qua smoke audio ba engine và build120, dừng trước E2E do webServer không đến được health localhost trong120 giây. Container cấp HOSTNAME tên/IP container trong khi scripts/start.mjs kế thừa biến này. Cố định HOSTNAME127.0.0.1/PORT3000 cho job, bật DEBUG pw:webserver để quan sát startup; không tăng timeout hoặc giảm bài kiểm thử. Website vẫn ở7e3dd0b trong toàn bộ quá trình xử lý môi trường CI.

## Lịch sử trước phát hành: Milestone 2 local để duyệt, 19/11/2026

Theo yêu cầu mới, chỉ làm local: **U03 đếm từ/ký tự, U04 đổi hoa/thường, U05 bỏ dấu/tạo slug, U06 làm sạch văn bản**. Candidate có **46 công cụ VI/EN**, giữ nguyên metadata/copy và engine của 42 công cụ cũ (40 thiết bị + U01/U02). Không thay kiến trúc hoặc dependency, không mở thêm Phase phần cứng; chưa commit/push/CI từ xa/SSH/deploy. Public vẫn Milestone 1 source `7e3dd0b` phía dưới.

Hoàn thành engine `text` tải động, hàm thuần Unicode, UI nhập gốc/kết quả riêng, xử lý sau nút bấm, xóa kết quả cũ khi sửa input/tùy chọn, clipboard chủ động và lỗi/từ chối quyền. Giới hạn 50.000 UTF-16, giữ nguyên input quá dài và không xử lý; composition tạm khóa nút. Bộ đếm grapheme/word dùng Intl.Segmenter, thiếu API thì hiện `—` thay vì bịa kết quả. Đổi hoa/thường có bốn chế độ; bỏ dấu Latin/đ/Đ, slug ASCII/Unicode; bảy tùy chọn làm sạch, các bước xóa dòng/ký tự ẩn/NFC mặc định tắt. Không storage/lịch sử/upload hoặc tài nguyên thiết bị. Đã thu gọn margin checkbox kế thừa CSS chung, chỉ trong tiện ích mới.

File chính: `src/lib/utilities/text.ts`, `src/lib/tools/text-utilities.ts`, `src/features/utilities/text-tool.tsx`, `text-tool.css`, Registry/types/ToolRunner, messages VI/EN và privacy. Thêm ba file unit/UI/E2E cho văn bản và fixture độc lập U01/U02; giữ nguyên fixture 40 thiết bị, đối chiếu fixture U01/U02 với committed HEAD. Mở rộng smoke HTTP cho Docker CI từ 40 lên 48 route VI/EN. Tài liệu README/ARCHITECTURE/DEPLOYMENT/PERFORMANCE/TESTING, [đặc tả M2](UTILITIES-MILESTONE-2.md) và QA JSON ghi rõ candidate/public và giới hạn.

Đã chạy `pnpm typecheck`, `pnpm lint`, `node scripts/scan-secrets.mjs`, `pnpm test --maxWorkers=2 --reporter=json --outputFile=artifacts/text-milestone2-unit.json`, `pnpm build`, HTTP smoke, focused/full và lượt semantic Playwright config local3100, audit production/toàn bộ, Prettier và `git diff --check`. **494 unit/integration/41 file đạt**, không fail/skip; typecheck/lint/secret scan đạt; build **120 trang**, BUILD_ID `c-NDmO-s7fw5rZXNdGwtV`; health +48 route/policy đạt; sitemap 114, 92 tool route. Audit production 0, còn 2 moderate dev tooling glob/minimatch, không ép major override. 210 file source/test/script và BUILD_ID được fingerprint để đối chiếu build cuối.

Full **440 bài: 409 đạt/19 skip/12 fail**, không flaky/global error, 1.596.243,295 ms. Chromium/mobile mỗi 106 đạt/4 fail; Firefox 103 đạt/3 skip/4 fail; WebKit 94 đạt/16 skip. Cả 12 fail ở no-upload camera/gamepad/tiện ích số/văn bản chỉ nhận request Kaspersky; skip native API/policy được ghi từng lý do trong [QA milestone](qa/utilities-milestone2-local-2026-11-19.json). Không giảm assertion/retry/timeout hoặc lọc request để làm pass. Đối chứng HTML trống không tải app/nhập dữ liệu cũng có script/POST Kaspersky trên Chromium/Firefox. Source không upload không đồng nghĩa toàn môi trường đã sạch.

Full dùng build `ElsN5RtI1lhnxp6u9TxJS`, source giữ nguyên trong lượt; bốn tiện ích văn bản 29 đạt/3 fail. Sau đó chỉ thêm hai thuộc tính ngôn ngữ cho textarea để screen reader có thông tin đúng khi ngôn ngữ văn bản khác UI; thêm assertions ở hai file test. Đối chiếu source xác minh không có thay đổi ứng dụng khác, 207 file còn lại khớp checkpoint. Build cuối `c-NDmO-s7fw5rZXNdGwtV` đã unit494/typecheck/lint/build120/HTTP48 và chạy lại **32 bài văn bản: 29 đạt/3 fail**, không skip/flaky/global error, 168.729,403 ms. Chromium/Firefox/mobile mỗi 7 đạt/1 fail do Kaspersky, WebKit 8/8. VI/EN, ngôn ngữ text độc lập UI, clipboard/IME fixture, WCAG Dark/Light và reflow 320px/chữ 200% đạt. Không nhận full440 đã chạy lại trên build cuối sau sửa thuộc tính. Focused đầu 25/28 là checkpoint trước bổ sung điều hướng; lượt đầu chủ động dừng để thu gọn margin checkbox không tính là full hoàn tất. Lỗi typecheck tạm do bản sao QA còn đuôi .tsx đã xử lý bằng đổi bản lưu sang .txt, không đổi tsconfig hoặc loại source thật khỏi kiểm tra; chạy lại đạt.

Runtime graph xác minh text chunk 11.595 byte/gzip ước tính 3.925 byte, không tải trên trang chủ, Keyboard Tester và đọc số; có trên hai route văn bản đại diện. Messages/search vẫn tăng payload chung nên không tuyên bố không overhead. Lighthouse profile mới/extension tắt dừng ngay mẫu đầu vì injection, chưa đủ ba lượt/trang, không có median sạch hoặc xác minh mobile≥90 cho M2; số thô bị loại và điều kiện ở PERFORMANCE. Không lấy M1 public 97–99 làm bằng chứng candidate.

**Đã hoàn thành và xác minh:** thuật toán/UI mới trong những bài passed, VI/EN, bản gốc/lỗi/biên/fallback, metadata42 cũ, unit/build/HTTP/format/secret scan, WCAG automation/reflow và ảnh local. **Đã triển khai nhưng chưa xác minh đầy đủ:** người dùng duyệt local, clipboard/bộ gõ/mobile/screen reader thật và candidate Docker/Linux sạch. **Chưa hoàn thành:** privacy gate toàn môi trường, native skips, ba lượt Lighthouse sạch/trang/mobile≥90 và hai moderate dev tooling. **Không thể kiểm chứng tại đây:** Safari/phần cứng thật, browser không injection và Docker Engine (máy không có CLI/service). WebKit không thay Safari; fixture không thay phần cứng. Không đóng Final Acceptance hoặc release gate.

**Sẵn sàng duyệt local**, chưa đủ gate phát hành. Người dùng xem bốn tiện ích tại `http://127.0.0.1:3100/vi/utilities` hoặc `/en/utilities`. Sau khi có yêu cầu phát hành mới thực hiện Linux sạch/Lighthouse/Docker và push/triển khai. Các checkpoint dưới là lịch sử.

## Tiện ích Milestone 1 đã triển khai — 19/11/2026

Người dùng đã duyệt local và yêu cầu push/triển khai sau QA sạch và Lighthouse trước cập nhật. Source **7e3dd0b119ef9c59da69f3b244787b9f5a9c1d04**, [CI 44445480650](https://github.com/anhtruc1803/checkall/actions/runs/44445480650) success verify/Docker: typecheck/lint/secret scan đạt, **460 unit/39 file**, build 112, **402 E2E đạt/6 native policy skip**, fail/flaky/global error 0. Nhóm tiện ích **24/24** đạt sạch; Chromium/mobile mỗi 102 đạt, Firefox/WebKit mỗi 99 đạt/3 skip. Web Audio smoke ba engine đạt trên backend ảo, không chứng nhận phần cứng thật. [Lighthouse trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/44445554690) đủ 36 lượt sạch/12 trang × 3, median mobile **99–100**. Chỉ sau khi xác minh các bằng chứng này mới chuyển website.

Giữ nguyên 40 công cụ thiết bị, thêm U01/U02: tổng 42 công cụ VI/EN. VPS dùng image **device-lab:staging-7e3dd0b-20261119**, ID **sha256:7f0e4bdbef741ab5964ce7e960b86f8936d6886f11e947da9d5bdd38c691cfbc**, current→/opt/device-lab/releases/7e3dd0b. Archive Git tracked SHA256 **77dd8e7531629400a15077d3ad44ed3516277591a6b573a47e1a52dc9241009a**, không mang .env/secret/cache. Candidate VPS đã thử network none/nonroot/read-only/Node không public, đủ 84 route/sitemap 106 trước/sau restart/stop-start, SIGTERM143/OOM false/Error rỗng. Chuyển thành công lần đầu; giữ release/image 57a5de2 và backup Nginx. Chỉ đổi marker release và reload; không sửa DNS/proxy/routing/quyền, prune/reboot hoặc chạy renewal mới.

Public HTTP→HTTPS308, **84 tool route VI/EN** (80 route của40 công cụ cũ +4 mới), H1/canonical/policy và sitemap 106 đạt. **28/28 public browser smoke** trên Chromium/Firefox/WebKit/mobile, không fail/skip/flaky/global error; có VI/EN/Dark-Light/reflow/WCAG/clipboard fixture/EVKey/dd. Đây là subset chức năng trên Windows hiện có; full clean/no-upload được xác minh riêng trong CI. [Lighthouse public](https://github.com/anhtruc1803/checkall/actions/runs/44449524546) đủ 36 lượt sạch/12 trang × 3, median mobile **97–99**; bốn route mới VI 98/EN 99, median A/BP/SEO100. Giữ toàn bộ72 sample, median và điều kiện đo trong [QA phát hành](qa/deployment-utilities-2026-11-19.json). Không coi khác biệt VM/origin hoặc mẫu Windows bị loại là mức tăng/giảm do code.

Runtime Node.js 24.22.3 healthy/nextjs/read-only, Node nội bộ, 768 MiB/256 PID/cap-drop ALL/no-new-privileges. Nginx từ app start và app tail 80 dòng không có error; Certbot timer active, không nhận đã chạy renewal mới. Phiên SSH đã đóng. File chính phát hành: Registry/nhóm utilities, parser/đọc chữ/phần trăm dùng BigInt, hai giao diện, messages VI/EN, privacy, tests và bản vá Next16.4.6/eslint-config-next16.4.6. Tài liệu cập nhật PROGRESS/PERFORMANCE/TESTING/DEPLOYMENT/UTILITIES-MILESTONE-1/README và QA JSON; raw artifacts không commit.

**Đã hoàn thành và xác minh:** software CI/Docker/candidate/public HTTP/UI và mobile≥90 trên bộ đại diện. **Đã triển khai nhưng chưa xác minh đầy đủ:** quyền clipboard/bàn phím số điện thoại thật và đường rollback chưa diễn tập lỗi production. **Chưa hoàn thành:** 6 native policy skip, 2 moderate dev tooling, CSP public bị proxy bỏ, TLS proxy→origin/field data và manual QA. **Không thể kiểm chứng lượt này:** Safari thật/screen reader/phần cứng/EVKey mọi phiên bản. Không đồng nhất WebKit với Safari hoặc backend ảo với hardware. Người dùng quản lý proxy; không tự sửa. **Final Acceptance tổng thể vẫn mở.** Tiếp theo: dùng hai tiện ích trên domain, hoàn tất các tiêu chí còn mở; không tự mở milestone tiếp theo. Các phần dưới là lịch sử checkpoint trước.

Ngày bắt đầu: 29/10/2026. Workspace ban đầu trống; Node.js 24.11.1, pnpm có sẵn; chưa có Docker CLI.

## Kế hoạch

1. Nền tảng, registry, thuật toán, bộ kiểm thử và cấu hình triển khai.
2. Giao diện ứng dụng, tìm kiếm, song ngữ, theme và tổng quan thiết bị.
3. 11 công cụ màn hình.
4. 5 công cụ bàn phím.
5. 5 công cụ chuột.
6. SEO, dữ liệu cục bộ, accessibility và chất lượng.
7. Kiểm thử cuối, production build và tài liệu vận hành.

## Milestone 1 — Đã xác nhận nền tảng

Đã tạo cấu hình Next.js standalone, TypeScript strict, Tailwind v4, next-intl, ESLint, Vitest, RTL, Playwright và thành phần Button theo shadcn/ui. Registry đủ 21 mục, thuật toán thuần, Docker multi-stage, Compose, Nginx và health endpoint. Package đã khóa phiên bản chính xác và có lockfile.

Lệnh: `pnpm install`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm dev`.

Kết quả: typecheck đạt, 7 unit tests đạt, production build đạt; lint không lỗi (một cảnh báo export PostCSS đã sửa). Development server khởi động thành công. Docker chưa xác minh vì thiếu CLI.

Đã xử lý: ESLint 10 và TypeScript 7 chưa tương thích peer ranges của lint plugins; dùng ESLint 9.39.1 và TypeScript 5.9.3. pnpm 11 cần khai báo allowBuilds cho native dependencies.

Tiếp theo: milestone 2 — application shell, theme, tìm kiếm và tổng quan thiết bị; sau đó các engine kiểm thử thực tế.

## Milestone 2 — Đã xác nhận giao diện nền

Đã tạo header, command search, menu di động, homepage, category, trang quyền riêng tư và shell cho 21 công cụ; VI/EN, theme, dữ liệu thiết bị thực. File chính: `src/components/layout`, `src/components/navigation`, `src/components/tools`, `src/messages`, `src/app/[locale]`, `tokens.css`.

Lệnh: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm exec playwright test tests/e2e/shell.spec.ts --project=chromium`.

Kết quả: typecheck/lint đạt, 9 unit tests đạt, 3 E2E đạt. E2E xác nhận 42 route có nội dung và canonical; tìm PPI; chuyển VI/EN giữ route; theme tồn tại sau reload; không tràn ngang ở 320/375/414/768 px. Development preview phải dùng localhost trong môi trường này do HMR qua 127.0.0.1 bị reset.

Giới hạn tại checkpoint: shell đã hoạt động, engine tương tác được bổ sung tại milestone 3–5, chưa tuyên bố 21 phép thử đã hoàn tất. Docker chưa chạy. Tiếp theo: 11 phép thử màn hình.

## Milestone 3 — Đã triển khai và kiểm tra 11 chức năng màn hình

File chính: `src/features/screen/*`, `src/lib/measurements/frame-sampler.ts`, `src/hooks/use-device.ts`, `src/hooks/use-fullscreen.ts`, `src/components/tools/measurement-ui.tsx`, `tests/e2e/screen.spec.ts`.

Hoàn tất: A01–A11 gồm live Screen/Viewport/DPR, aspect ratio, PPI validation/copy, RAF sampling có warm-up và thống kê, pixel/hở sáng/màu Canvas, Ghosting có cấu hình và frame timing, multi-touch/pen trails. Fullscreen có nút thoát và Esc. Các engine tải riêng theo nhu cầu.

Kiểm tra: typecheck đạt; 11 unit/integration tests đạt; 4 E2E Chromium đạt. Lint đã sửa cảnh báo cleanup ref. E2E kiểm tra tính toán, resize, RAF Start/Reset, chuyển mẫu, Fullscreen exit, Ghosting Start/Stop và touch fallback.

Các lỗi selector trong E2E đã sửa theo DOM thực: Next.js có route announcer role alert; số đo có đơn vị trong cùng definition. Không thay đổi thuật toán để làm test qua.

Chưa kiểm chứng: phần cứng màn hình 60/120/144 Hz, cảm ứng thực, độ chính xác màu/hở sáng do người quan sát. Tiếp theo: 5 công cụ bàn phím.

## Milestone 4 — Đã triển khai và kiểm tra 5 chức năng bàn phím

File chính: `src/features/keyboard/layouts.ts`, `use-keyboard.ts`, `keyboard.tsx`, `tests/keyboard.test.tsx`, `tests/e2e/keyboard.spec.ts`.

Hoàn tất B01–B05: ANSI Full-size, TKL, 75%, 65%, 60%, ISO; held/tested/counter; Rollover max; Chatter theo release→press và repeat riêng; Hold live/release/interruption; Inspector đầy đủ fields, copy và log giới hạn 200. Capture phải kích hoạt, Tab/Esc thoát, blur/hidden xóa held.

Kiểm tra: typecheck/lint đạt; 12 unit/integration tests đạt; 3 E2E bàn phím đạt. Đã xác nhận held/release, nhiều phím, layout/reset, focus loss, event.repeat và thoát Tab.

Đã sửa: label select cần aria-label rõ; React refs được tách khỏi dữ liệu render, không tắt luật lint. Chưa kiểm tra bàn phím vật lý hoặc chứng nhận NKRO; những giới hạn đó có trong UI. Tiếp theo: 5 công cụ chuột.

## Milestone 5 — Đã triển khai và kiểm tra 5 chức năng chuột

File chính: `src/features/mouse/use-mouse.ts`, `mouse.tsx`, `src/lib/measurements/pointer-sampler.ts`, `tests/pointer-sampler.test.ts`, `tests/mouse.test.tsx`, `tests/e2e/mouse.spec.ts`.

Hoàn tất C01–C05: nút trái/phải/giữa/phụ; Double Click với ngưỡng, lịch sử và thống kê; CPS có cửa sổ thời gian/countdown/best/retest; wheel delta/hướng/mode/count; pointermove/coalesced sampling có thống kê, graph, lịch sử lượt và cảnh báo USB polling rate.

Kiểm tra: typecheck/lint đạt; 15 unit/integration tests đạt; 5 E2E chuột đạt. Integration xác nhận wheel preventDefault chỉ trong vùng thử, Reset xóa bộ đệm và unmount dọn listener/timer. E2E xác nhận click ngoài cửa sổ CPS không được tính.

Đã sửa: bộ đệm wheel từng phục hồi giá trị cũ sau Reset; giờ xóa cả ref và state. Test double click dùng ngưỡng điều tra được đặt rõ vì automation delay gồm cả down/up, không được giả định interval phần cứng. Chưa kiểm tra chuột vật lý/USB polling thực. Tiếp theo: SEO, privacy, accessibility và rà soát chất lượng.

## Milestone 6 — Đã xác nhận chất lượng ứng dụng

File chính: `src/app/sitemap.ts`, `robots.ts`, `src/lib/seo`, `src/lib/storage`, `src/messages`, `tests/e2e/quality.spec.ts`, `tokens.css` và CSS responsive.

Hoàn tất: 52 URL công bố có VI/EN alternates; metadata/canonical/Open Graph/Breadcrumb JSON-LD; nội dung/hướng dẫn/giới hạn/FAQ theo từng công cụ; storage có Zod validation; chỉ lưu tóm tắt sau opt-in; xóa dữ liệu riêng ứng dụng; fallback API thực; kiểm tra tab ẩn; giao diện responsive và chế độ sáng/tối. Tổng quan hiển thị ước tính Refresh Rate chỉ sau lượt hoàn tất hợp lệ trong phiên. Các file source đã được format.

Kiểm tra: typecheck/lint đạt; 20 unit/integration tests đạt; 5 E2E chất lượng đạt. Axe không phát hiện vi phạm WCAG A/AA tự động trên 5 trang đại diện ở cả hai theme. Kiểm tra controls tại 320/375/414/768 px đạt. Ảnh desktop/mobile/keyboard đã được xem để kiểm tra bố cục.

Đã sửa: checkbox opt-in trước đây đọc event.target.checked sau dynamic import làm mất trạng thái; dùng handler đồng bộ, bổ sung regression test. Canvas/PointerEvent phải thực sự khả dụng; dữ liệu JSON sai kiểu không làm hỏng lưu lịch sử; click interval dài không bị loại theo ngưỡng frame.

Chưa tuyên bố đạt WCAG đầy đủ hay Lighthouse khi chưa đo production. Docker runtime và ma trận phần cứng thực vẫn cần xác minh. Tiếp theo: production build, toàn bộ E2E desktop/mobile, Lighthouse và tài liệu triển khai.

## Milestone 7 — Bản ứng dụng đã kiểm tra; chưa đóng nghiệm thu production

File chính: `scripts/start.mjs`, `scripts/lighthouse.mjs`, `scripts/check-compose.ps1`, `Dockerfile`, `compose.yaml`, `deploy/nginx.conf`, `deploy/nginx.https.conf.template`, `.github/workflows/ci.yml`, `README.md`, `docs/DEPLOYMENT.md`, `docs/PERFORMANCE.md`, `docs/RELEASE_CHECKLIST.md`.

Đã hoàn tất:

- Production build standalone thành công; 52 URL nội dung công bố (42 URL công cụ), robots, sitemap, icon và health endpoint.
- 40/40 E2E trên production standalone, gồm 20 bài trên Chromium desktop và 20 bài mobile giả lập. Axe kiểm tra trang đại diện ở hai theme đều không phát hiện vi phạm trong tập quy tắc tự động.
- Compose 5.6.1 `config --quiet` đạt. Binary chính thức được đối chiếu SHA-256 từ GitHub release.
- Nginx 1.30.6 `-t` đạt với config kiểm tra Windows, chỉ thay `app:3000` thành loopback và đường dẫn MIME. Đây là kiểm tra cú pháp, chưa thay thế kiểm tra Nginx Linux trong mạng Compose.
- `pnpm install --frozen-lockfile` đạt; `pnpm audit --prod --audit-level high` không ghi nhận lỗ hổng đã biết ở lần chạy.
- Tài liệu phát triển, build, HTTPS lần đầu/gia hạn, upgrade, rollback, log và checklist đầy đủ bằng tiếng Việt. Đã chuẩn bị CI, chưa chạy trên GitHub.
- Git đã khởi tạo cục bộ; chưa commit, push hoặc triển khai lên hạ tầng ngoài.

Hiệu năng thực (Lighthouse mobile simulated, Chrome 156, CPU ×4, RTT 150 ms):

| Trang               | Performance | Accessibility | Best Practices | SEO | CLS |
| ------------------- | ----------: | ------------: | -------------: | --: | --: |
| /vi                 |          78 |           100 |             77 | 100 |   0 |
| /en/screen/ppi      |          75 |           100 |             77 | 100 |   0 |
| /vi/keyboard/tester |          81 |           100 |             77 | 100 |   0 |

Đã sửa layout shift PPI từ 0,202 về 0, nhãn ngôn ngữ, tìm kiếm chữ Đ không dấu và bộ đếm repeat độc lập log 200. CSP áp dụng tài nguyên cùng origin; browser trên máy vẫn nhận script do Kaspersky chèn ngoài source. Performance 90+ chưa đạt, không được đánh dấu đạt. Xem PERFORMANCE.md và báo cáo gốc trong `artifacts/`.

Lỗi E2E mobile con lăn đã được sửa đúng phương pháp: so sánh UI với deltaY của wheel event thực, vì Chromium mobile giả lập chuyển yêu cầu 120 thành event 40. Không sửa dữ liệu hoặc hạ yêu cầu thuật toán để làm test qua.

Rà soát cuối bổ sung: Tab/Esc được ghi nhận vào log và tested counter trước khi thoát capture an toàn. Unit regression và E2E bàn phím được chạy lại sau thay đổi này; kết quả cuối ghi ngay bên dưới.

**Kết quả cuối sau thay đổi Tab/Esc:** `pnpm typecheck` đạt; ESLint 0 lỗi/0 cảnh báo; 21/21 unit/integration tests đạt; production build đạt; 6/6 E2E bàn phím bổ sung (desktop + mobile) đạt. Các phần không đổi đã có lượt 40/40 E2E production trước đó. Health trả `{"status":"ok"}`, robots và sitemap trả HTTP 200. Ảnh production được tạo lại trong `artifacts/`; server QA cục bộ được dừng sau kiểm tra. Chạy `pnpm dev` hoặc `pnpm start` để mở lại.

### Các phần chưa thể nghiệm thu

1. Chưa build/chạy Docker image Linux: không có Docker Engine; WSL báo dịch vụ bị tắt hoặc không có thiết bị khả dụng. Không tự bật dịch vụ hệ thống hoặc triển khai máy chủ ngoài.
2. Performance ≥90 chưa đạt trong môi trường hiện tại. Cần đo staging HTTPS với môi trường browser kiểm soát được và tiếp tục đánh giá bundle/main-thread thực.
3. Chưa kiểm tra Firefox/Safari/WebKit và phần cứng thực 60/120/144 Hz, bàn phím, chuột, cảm ứng và đa màn hình theo ma trận.
4. Chưa có domain, DNS, chứng chỉ HTTPS hoặc VPS được triển khai; các bước đó phải được cho phép rõ ràng trước khi thực hiện.

Trạng thái bàn giao: 21 khả năng đã có implementation thực và kiểm thử tự động; milestone 1–6 hoàn thành. Milestone 7 còn các điều kiện môi trường/vận hành ở trên, vì vậy **chưa tuyên bố Phase 1 đạt toàn bộ final acceptance hoặc sẵn sàng production vô điều kiện**.

## Rà soát Phase 1 bổ sung — 29/10/2026

Phần này cập nhật trạng thái sau bàn giao ở trên, không xóa kết quả lịch sử.

### Đã triển khai và kiểm tra cục bộ

- Đọc lại toàn bộ tài liệu, registry và tám nhóm loader; 21 chức năng vẫn thuộc Phase 1, không thêm Phase 2/3. Bổ sung E2E mount đủ 21 engine/fallback và kiểm tra HTML inert trước capability detection.
- GitHub repository anhtruc1803/checkall ban đầu trống; Git cục bộ chưa có commit hoặc remote. Đã xác nhận tài khoản GitHub CLI phù hợp; không đọc/in token.
- Chuyển validation sang zod/mini, truyền search index gọn và runtime props tối thiểu, dựng kết quả command search khi mở, tránh prefetch hàng loạt. Giảm khoảng 21 KiB JS truyền tải/trang. Không đổi kiến trúc modular monolith, không loại SEO/a11y hoặc chức năng.
- Sửa mất query trước hydration trên WebKit bằng khóa input/filter đến khi hydrate. Bài pointer sampling đặt cửa sổ 20 giây để không phụ thuộc tốc độ mouse automation; không bỏ điều kiện mẫu hợp lệ/Stop/Reset.
- Prerender giao diện công cụ inert để tránh tải engine nối tiếp sau capability check; phép đo vẫn chỉ chạy ở client. Khắc phục LCP capture hint xuất hiện trễ, giữ min-height chống layout shift.
- 29 unit/integration tests đạt, gồm bảy bài cleanup RAF/ResizeObserver/timer/listener và kiểm tra search index. Typecheck/lint/build đã chạy đạt sau thay đổi.
- Dependency audit toàn bộ và production không ghi nhận lỗ hổng đã biết. Secret scan theo rule trên hơn 110 file không có finding; `.env`, key/cert QA, node_modules, cache, artifacts đều bị loại khỏi Git. Không có fetch/sendBeacon/XMLHttpRequest gửi log phím/chuột trong source sản phẩm.

### Performance sạch

HTTPS loopback QA không có request ngoài origin và CSP không bị can thiệp; Chromium profile mới, extension tắt, pin đúng SPKI chứng chỉ tự ký QA, không sửa phần mềm bảo vệ hoặc chặn request. Ba lượt/trang trước và sau, cùng cấu hình mobile RTT 150 ms/CPU ×4. Kết quả từng lượt và median ở PERFORMANCE.md và docs/qa/performance.json.

| Trang               | Median trước | Median cuối | JS trước → sau (byte) | TBT trước → sau (ms) |
| ------------------- | -----------: | ----------: | --------------------: | -------------------: |
| /vi                 |           78 |          84 |       215453 → 194299 |            994 → 640 |
| /en/screen/ppi      |           94 |          87 |       224239 → 203384 |            280 → 500 |
| /vi/keyboard/tester |           83 |          75 |       226554 → 205709 |           695 → 1289 |

Keyboard sau đợt tối ưu giữa có LCP median 3515 ms; trace tìm thấy capture hint render muộn. Prerender inert đưa LCP cuối về median 1073 ms. Cả ba trang trong bộ clean-release chưa đạt 90: TBT còn cao, benchmark CPU dao động 318,5–1437; không quy hết cho antivirus vì trace sạch vẫn ghi nhận chi phí framework/hydration/layout. Điểm giảm ở PPI/Keyboard được giữ nguyên, không thay bằng bộ trung gian tốt hơn. Accessibility/Best Practices/SEO cuối đều 100; CLS median tối đa 0,00081, không tuyên bố mọi lượt CLS bằng 0.

### Đang xác minh trước initial commit

Đã cài và thực chạy Firefox 157 và WebKit 27.2 (automation, không phải Safari thật). Lượt baseline đạt 20/20 Firefox, WebKit 18/20; hai lỗi hydration/đồng bộ pointer test đã được sửa. Đang chạy lại toàn bộ 88 E2E trên Chromium, Firefox, WebKit và Chromium mobile.

Máy hiện không có Docker Engine. Đã chuẩn bị `scripts/docker-smoke.sh` trên Linux và CI: image build, healthcheck, Nginx/VI/EN, Node port riêng, restart, exit code shutdown và logs. Compose config kiểm tra lại đạt; chưa coi smoke script/CI YAML là bằng chứng container đã chạy. Chưa kết nối VPS.

**Xác minh cục bộ cuối trước initial commit:** 88/88 E2E đạt (Chromium 22/22, Firefox 22/22, WebKit 22/22, Chromium mobile 22/22), gồm axe hai theme và mount đủ 21 engine. Native EngineSurface fieldset disabled/inert cho đến hydration riêng của engine đã sửa các lượt nhập liệu sớm. Build/typecheck/lint đạt; 29/29 unit/integration tests, secret scan và dependency audit đạt. Docker Linux chờ kết quả CI sau push; phép đo Performance được kiểm tra lại trên revision này trước khi chốt báo cáo cuối.

### Git và phép đo phát hành

Đã xác minh staged secret scan trên 120 file, git diff --cached --check đạt; không có .env, chứng chỉ/key, cache hay artifacts. Initial commit c82cd20 đã push lên main tại [anhtruc1803/checkall](https://github.com/anhtruc1803/checkall). Không tạo commit chứa credential hoặc thực hiện triển khai VPS. Bộ Lighthouse clean-release gồm đủ chín lượt trên source commit này; số liệu từng lượt/median ở PERFORMANCE.md và qa/performance.json. CI [40815715479](https://github.com/anhtruc1803/checkall/actions/runs/40815715479) đang xác minh độc lập trên Linux; kết quả cuối sẽ ghi bên dưới.

CI đầu tiên đạt 87/88 E2E, riêng axe WebKit phát hiện color-contrast ở một số nút khi chuyển theme; Docker bị bỏ qua vì E2E fail. CSS đổi foreground tức thì nhưng background nút transition 160 ms, tạo trạng thái tương phản trung gian. Đã bỏ background transition của nút, giữ transform và toàn bộ kiểm tra contrast; test xác nhận data-theme đích và ghi rõ failureSummary nếu còn lỗi. Không vô hiệu hóa rule axe. Lần build sau thay đổi ban đầu gặp EBUSY vì production server đang giữ thư mục standalone trên Windows; dừng server QA rồi build lại, không xóa dữ liệu người dùng.

Sau sửa CSS: typecheck/lint/build cục bộ đạt; ba lần lặp axe WebKit trên năm trang × hai theme đều đạt (3/3 bài, khoảng 1 phút). Commit 0e7bb04 đã push; CI [40816398723](https://github.com/anhtruc1803/checkall/actions/runs/40816398723) tách verify và docker-smoke thành hai job độc lập. Bộ Lighthouse c82cd20 được giữ với revision rõ ràng, không tự coi như đã đo lại commit CSS.

Docker job của run 40816398723 đã build image, chạy Compose healthy, nginx -t, kiểm tra health + tám route VI/EN trước/sau restart và xác nhận Node không publish port. Assertion shutdown yêu cầu exit 0 bị sai: container thực sự exited 143, không phải 137. Đối chiếu source Next.js 16.4.3 start-server.js cho thấy đây là exit chủ động sau cleanup khi nhận SIGTERM. Đã sửa smoke test để kiểm tra exited/không Running/không OOM/Error rỗng/exit 143 và lưu shutdown.json; vẫn phải chạy lại để xác minh bước start cuối. Không sửa ứng dụng để che exit code.

Job verify Linux của run 40816398723 **đạt 88/88 E2E (1,7 phút), 29 unit, typecheck/lint/secret scan/build** trên bản sửa contrast. Run toàn bộ vẫn fail do assertion Docker ở trên. Commit d82120b sửa smoke assertion và được push; CI mới [40816709418](https://github.com/anhtruc1803/checkall/actions/runs/40816709418) kiểm tra lại toàn bộ.

**Docker Linux cuối:** job docker-smoke run 40816709418 đạt trong 1 phút 23 giây. Build production image, Compose healthy, nginx -t, health + tám route VI/EN trước/sau restart và sau stop/start đều đạt. Node không publish port; shutdown exited 143, OOMKilled false, Error rỗng; container sau start healthy. Đã tải artifact và đọc log, không thấy lỗi ứng dụng hoặc HTTP 4xx/5xx trong smoke. Dữ liệu gọn ở qa/docker.json. Đã dọn project Compose QA, không đụng VPS. Trạng thái health trong snapshot shutdown có thể là unhealthy vì container đang exited; bằng chứng sau start là healthy, không nhầm hai thời điểm này.

### Chốt đợt rà soát

Toàn CI run 40816709418 của d82120b **success**: verify đạt typecheck/lint/secret scan/build, 29 unit và **88/88 E2E** (22/22 Chromium, Firefox, WebKit, mobile; 2,2 phút E2E); docker-smoke đạt. Không đồng nhất WebKit với Safari thật. CI còn cảnh báo actions v4 khai báo Node 20 được runner ép chạy Node 24, và không có browser artifact khi toàn bộ test đạt (trace chỉ giữ khi fail); E2E có bằng chứng trong job logs, Docker có đủ artifact. Các cảnh báo này không phải lỗi lint hoặc test bị bỏ qua.

File chính của đợt rà soát: registry/search và props ToolRunner, EngineSurface/hydration guard, tám engine, globals.css, schemas zod/mini, Playwright config và tests lifecycle/E2E; scripts Lighthouse/HTTPS/secret scan/Docker smoke, Compose, CI, gitignore và các tài liệu nghiệm thu. Không viết lại kiến trúc, không thêm Phase 2/3.

Tài liệu cập nhật cuối: PROGRESS.md, PERFORMANCE.md, TESTING.md, DEPLOYMENT.md, ARCHITECTURE.md, ACCEPTANCE.md, RELEASE_CHECKLIST.md và qa/\*.json. FINAL_REPORT.md giữ làm báo cáo lịch sử có liên kết sang bản nghiệm thu mới. Commit tài liệu cuối không thay đổi source đã được CI xác minh; không chạy lại toàn bộ suite chỉ vì sửa tài liệu. Secret scan toàn repository 121 file không finding, staged scan và diff whitespace phải đạt trước commit. Server QA/proxy cục bộ đã dừng.

**Kết luận milestone rà soát:** đủ điều kiện kỹ thuật đưa lên staging để QA có kiểm soát; chưa triển khai staging/VPS. Final Acceptance **chưa hoàn tất**, không có ngoại lệ cho Performance được tự chấp nhận. Còn mở: median mobile 84/87/75, manual QA phần cứng/Safari và HTTPS/hạ tầng thật. Tiếp theo đo trên CPU ổn định, phân tích main-thread và thực hiện ma trận manual; chỉ triển khai VPS khi có yêu cầu rõ ràng.

## Phase 2 — Milestone 1: nền tảng registry/capability/permission

Người dùng đã yêu cầu bắt đầu Phase 2 theo từng milestone, làm nền tảng trước và giữ Phase 1. Yêu cầu mới thay thế giới hạn không mở Phase 2 ở checkpoint trước, nhưng không cho phép triển khai VPS hoặc công bố công cụ chưa hoạt động.

### Công việc đã triển khai

- Tách contract Tool/Category/Engine/Capability/ToolPermission; registry có 21 published Phase 1 và 19 draft Phase 2. Draft không được index hoặc truy cập như công cụ thật; chưa thêm engine Phase 2 hoặc Phase 3.
- Publication validation chặn trùng ID/route, draft index, related từ published sang draft, bản dịch rỗng và published thiếu engine. Renderer map có typecheck đầy đủ theo ImplementedEngine.
- Public lookup/search/navigation desktop-mobile/category/homepage/sitemap/related dùng published; category chỉ draft không tạo trang rỗng. Chỉ mục client không mang metadata 19 draft.
- Capability probe theo yêu cầu, SSR trả unknown; giữ đúng tám key adapter Phase 1. Không mở media, tạo AudioContext/WebGL context hay enumerate thiết bị khi dò API.
- Permission observer/hook tách unknown/prompt/granted/denied/unsupported/insecure-context/policy-blocked; query không hỗ trợ giữ unknown, có cleanup và bỏ qua query đến muộn.
- Media session dùng chung: start chủ động, chống yêu cầu trùng, phân loại lỗi không lưu thông tin thiết bị, stop/dispose/hidden/pagehide/track ended và giải phóng late grant. Không thể đóng prompt của browser bằng Stop; không tự suy ra permission denied khi promise chưa trả.
- Bổ sung namespace VI/EN cho quyền/lỗi; mở rộng bài kiểm tra i18n để đối chiếu mọi key lồng nhau, không bỏ yêu cầu nội dung không rỗng.
- Giữ nguyên header chặn camera/microphone trên route public và privacy/localStorage Phase 1. Không thêm dependency, server endpoint, database hoặc route debug.
- CI có JSON E2E kể cả lượt toàn bộ đạt; raw artifacts tiếp tục bị Git bỏ qua.

### File chính

src/lib/tools/{types,catalog,phase2,registry,search}.ts; src/lib/browser/{capability-types,capabilities,permissions,media-session}.ts; src/hooks/use-permission.ts; ToolRunner/Header/Catalog/ToolCard và server route/sitemap; src/messages/{vi,en}.json; unit/SSR/media/permission/registry/E2E tests; Playwright config và CI. Tài liệu chi tiết: [PHASE2-FOUNDATION.md](PHASE2-FOUNDATION.md).

### Kiểm tra hiện tại

Production build đạt, chỉ sinh route Phase 1 (42 route công cụ VI/EN). Typecheck/lint và lượt unit đầu 81/81 đạt; sau bổ sung edge cases đang chạy lại unit và đầy đủ 96 E2E trên Chromium, Firefox, WebKit, Chromium mobile. E2E mới kiểm tra 19 draft × hai locale trả 404, category chỉ draft không public, public pages không gọi getUserMedia/permissions.query và giữ header cũ. Chưa ghi các bài đang chạy là đạt.

Dependency audit production không ghi nhận lỗ hổng đã biết; secret scan 135 file không finding tại checkpoint trước cập nhật tài liệu. Kết quả cuối và CI sẽ bổ sung bên dưới. Docker Windows vẫn không có Engine; kết quả Linux của Phase 1 chỉ là bằng chứng revision cũ, không tự chuyển sang milestone này.

**Kết quả cục bộ:** 86/86 unit/integration tests trên 16 file đạt sau bổ sung edge cases. Typecheck/lint và production build source cuối đạt; toàn bộ **96/96 E2E đạt** trong 7,7 phút: Chromium, Firefox, WebKit và Chromium mobile đều 24/24, không skip/flaky test. Bao gồm axe năm trang × hai theme, đủ 21 engine, 42 route VI/EN và ranh giới 19 draft. JSON raw tại artifacts/playwright/results.json. Header media vẫn nguyên; không có getUserMedia hoặc query quyền từ Phase 1. Secret scan 136 file không finding sau thêm tài liệu. ESLint loại artifacts/\*\* khỏi duyệt output QA, không loại source/tests. Chờ CI Linux độc lập sau push; không lấy kết quả CI cũ làm bằng chứng source mới.

### Phần còn mở và tiếp theo

Đã commit/push source và tài liệu milestone: `5ef7ae1` trên main. Staged secret scan 42 file không finding; diff whitespace đạt, không có .env/key/cache/artifacts trong commit. CI mới [40836651018](https://github.com/anhtruc1803/checkall/actions/runs/40836651018) đang xác minh độc lập. Server production QA do Playwright quản lý đã dừng; không có listener QA ở 3000/3443 sau lượt kiểm tra.

Docker smoke của source 5ef7ae1 trên run 40836651018 đã đạt trong 1 phút 14 giây: build production image, Compose healthy, nginx -t, health + tám route VI/EN ba thời điểm (ban đầu, sau restart, sau stop/start), Node port không publish, SIGTERM exit 143/OOMKilled false. Đã tải và đọc artifact mới; không có lỗi ứng dụng hoặc HTTP 4xx/5xx trong smoke. Image ID cục bộ runner sha256:1a5d67e33dcc64ee9c984b7b0060b6001e1494efb0c8702115ece42b40d242f3, không push image registry hoặc triển khai VPS. Browser job đang hoàn tất E2E; chưa ghi cả run là thành công.

19 công cụ Phase 2 vẫn draft, chưa có engine hoặc kiểm thử phần cứng. Media lifecycle ở milestone này được kiểm tra bằng stream/track giả trong unit, không tuyên bố đã thử microphone/camera thật. Chưa đo lại Lighthouse; các median Phase 1 không phải điểm của revision mới và mục tiêu ≥90 còn mở. Safari thật/thiết bị vật lý/HTTPS production/VPS chưa xác minh.

Tiếp theo chốt unit/E2E/CI, rồi milestone nhóm thông tin thiết bị/browser, touch/pointer, storage/fullscreen, mouse movement/accuracy và GPU theo phạm vi đã đề xuất. Final Acceptance Phase 1 và Phase 2 đều chưa được tự đóng.

### Nghiệm thu milestone nền tảng

**CI mới 40836651018 đã success cho source 5ef7ae1**, cả verify và docker-smoke. Job verify 4 phút 50 giây: typecheck/lint/secret scan/build đạt, 86/86 unit (16 file), **96/96 E2E**. Đã tải browser-qa JSON và đối chiếu Chromium/Firefox/WebKit/mobile đều 24/24; skipped/unexpected/flaky bằng 0; E2E 140343,642 ms. Artifact browser được upload thành công, không còn cảnh báo thiếu browser artifact ở lượt toàn bộ đạt. Docker smoke và việc đọc logs/snapshot source mới đã được xác minh ở trên. Không có camera/microphone hoặc tay cầm vật lý nào được kiểm thử bởi kết quả này.

**Hoàn thành Phase 2 Milestone 1 trong phạm vi đã yêu cầu:** registry draft/publication boundary, capability, permission observer/hook và media session nền tảng, giữ chức năng Phase 1. Tài liệu tiếng Việt và dữ liệu gọn ở PHASE2-FOUNDATION.md, ARCHITECTURE.md, TOOL_SPECIFICATIONS.md, TESTING.md, DEPLOYMENT.md và qa/phase2-foundation.json. Source đã push main; commit tiếp theo chỉ chốt tài liệu/bằng chứng, không thay đổi source đã kiểm thử.

Còn mở: 19 công cụ vẫn draft; chưa có engine Phase 2, chưa xác minh thiết bị/Safari thật, chưa đo Lighthouse revision mới và chưa triển khai HTTPS/VPS. Không đổi trạng thái Final Acceptance Phase 1/2. Công việc tiếp theo là milestone công cụ thông tin/capability và mouse/fullscreen theo lộ trình, với kiểm thử riêng trước khi công bố từng công cụ.

## Phase 2 — Milestone 2, ngày 30/10/2026

Người dùng yêu cầu triển khai thông tin thiết bị/browser/GPU, touch/pointer, storage, fullscreen và mouse movement/accuracy; giữ Phase 1, kiểm thử, tài liệu tiếng Việt và push GitHub.

### Đã triển khai

- Tám engine thật G01–G06, C06–C07; snapshot đọc chủ động, dữ liệu thiếu/không hỗ trợ không có giá trị mẫu thay thế.
- GPU context tạm, WebGL 2/1 fallback, opt-in renderer chi tiết và cleanup. Storage round-trip khóa tạm riêng, kiểm tra cleanup, estimate/persisted đọc độc lập và không gọi persist.
- Pointer/touch nhận event trong vùng, mouse movement tính đoạn CSS và bộ đệm 120 điểm, accuracy chấm mười mục tiêu theo hình học thật. Chỉ primary mouse được chấm, keyboard/touch/pen không tạo điểm giả.
- useTimedTask dừng theo lifecycle/focus/visibility/resize và giới hạn phiên; useInspection bỏ kết quả đến muộn. useFullscreen xử lý late request/ownership, có regression cleanup cho Phase 1.
- Registry 29 published/11 draft, năm category, 58 route công cụ VI/EN, 72 URL nội dung. Đếm homepage động, nội dung SEO/FAQ/phương pháp/giới hạn riêng và bản dịch đầy đủ. Header quyền media không thay đổi.
- UI dùng token/font hiện có, controls trước hydration vẫn inert, menu thích ứng thêm category, không đổi stack hoặc thêm dependency.

### File chính và kiểm tra ban đầu

src/features/{device,browser,mouse}; readers src/lib/browser/{device-details,gpu-details,storage-details}.ts; src/lib/measurements/{pointer-tasks,pointer-observation}.ts; hooks useInspection/useTimedTask/useFullscreen; registry/metadata/VI-EN/CSS, unit/lifecycle/E2E tests và tài liệu milestone.

Typecheck/lint/production build đạt; 118/118 unit/integration tests trên 21 file đã đạt. Mười E2E mới trên Chromium đạt 10/10, gồm axe tám trang × hai theme và responsive năm độ rộng. Bộ hồi quy toàn bộ 136 bài trên Chromium/Firefox/WebKit/mobile đang chạy; chưa coi các bài đang chạy là đạt. Dependency audit production không ghi nhận lỗ hổng đã biết; secret scan 160 file không finding tại checkpoint này.

Ảnh QA và demo tám trạng thái UI ở artifacts/milestone2, không commit. Đọc lại giới hạn đo theo Storage/Fullscreen WHATWG, WebGL Khronos và Pointer Events W3C. Không có kiểm thử thiết bị/Safari thật, không đo lại Lighthouse source này và không triển khai VPS. Chi tiết/ma trận manual ở PHASE2-MILESTONE2.md. Kết quả cuối/CI sẽ cập nhật sau khi thực chạy.

Lượt E2E toàn bộ đầu đạt 135/136; riêng Mouse Movement mobile không nhận mẫu. Probe thực tế xác nhận vùng bắt đầu ở y=624,84 px trong viewport cao 664 px; ba tọa độ automation ở y+50/y+100 nằm ngoài viewport nên browser không gửi PointerEvent. Sau scrollIntoView, vùng ở y=343,84 và nhận đủ ba sự kiện mouse, đúng thuật toán. Đã sửa thao tác test cuộn vùng vào viewport và thêm assertion tọa độ nhìn thấy; giữ nguyên yêu cầu ít nhất ba mẫu/quãng đường 120 CSS px và không sửa dữ liệu engine. Qua ảnh QA còn sửa CSS riêng bảng thông tin thành grid thật, bỏ max-width cũ để mobile chuyển một cột; cần build/QA lại source cuối.

Source cuối đã build/typecheck/lint đạt, unit chạy lại 118/118; bài Mouse Movement mobile sau sửa thao tác đã đạt riêng. Đã commit/push `097404e` lên main; staged secret scan 51 file không finding, diff whitespace đạt, không commit artifacts/cache/.env/key. Lượt 136 E2E cuối đang chạy cùng source này; CI Linux độc lập [41007493526](https://github.com/anhtruc1803/checkall/actions/runs/41007493526) kiểm tra verify và docker-smoke, không dùng pipeline milestone trước.

**Kết quả local cuối source 097404e: 136/136 E2E đạt**, không skip/unexpected/flaky. Đã đọc JSON để đối chiếu: Chromium/Firefox/WebKit/mobile đều 34/34; E2E 340325,84 ms (khoảng 5,7 phút). Bao gồm toàn bộ hồi quy Phase 1, tám công cụ M2, kiểm tra privacy sau thao tác đọc, axe hai theme và responsive năm độ rộng. Build/typecheck/lint/118 unit đều đạt trên source cuối; ảnh QA vùng tác vụ active và bảng GPU cuối được xem lại sau sửa CSS, không có số liệu giả để chụp ảnh.

Docker smoke CI source 097404e đã đạt trong 72 giây: build image, Compose healthy, Nginx, health + tám route VI/EN ban đầu/sau restart/sau stop-start, Node không publish port, shutdown SIGTERM exit 143/OOMKilled false/Error rỗng. Đã tải artifact logs/containers/shutdown và đọc log, không có lỗi ứng dụng hay HTTP 4xx/5xx trong luồng smoke. Docker Windows không có Engine; đây là bằng chứng Linux CI, không phải triển khai VPS. Job verify đang hoàn tất; kết quả tổng run sẽ ghi tiếp bên dưới.

### Nghiệm thu Milestone 2

**CI 41007493526 success cho source 097404e**, cả verify và docker-smoke. Verify đạt build/typecheck/lint/secret scan, 118/118 unit (21 file) và **136/136 E2E**. Đã tải artifact JSON: Chromium/Firefox/WebKit/mobile đều 34/34, skipped/unexpected/flaky bằng 0, E2E 224967,275 ms (khoảng 3,7 phút). Docker source mới đã được kiểm chứng như trên; không dùng pipeline milestone trước thay thế. Các cảnh báo actions v4 dùng runtime cũ bị ép Node 24 vẫn là cảnh báo nền tảng, không phải lỗi lint hoặc bài test bị bỏ qua.

Hoàn thành implementation/automated QA tám công cụ trong phạm vi Milestone 2; giữ 21 chức năng Phase 1 và toàn bộ hồi quy. Tài liệu tiếng Việt: PHASE2-MILESTONE2.md, PROGRESS.md, TESTING.md, ARCHITECTURE.md, TOOL_SPECIFICATIONS.md, DEPLOYMENT.md, RELEASE_CHECKLIST.md và qa/phase2-milestone2.json; PERFORMANCE.md ghi rõ chưa đo revision mới. Ảnh QA actual/demo controls đã xem lại, chỉ nằm trong artifacts. Server QA thuộc tác vụ đã dừng sau kiểm tra; không mở Node public hoặc triển khai VPS.

Còn mở: Safari thật, phần cứng/driver/touch/pen/chuột thật, screen reader và Lighthouse source mới. Không đổi trạng thái Final Acceptance Phase 1/2 hoặc giả định ngoại lệ Performance đã được chấp nhận. Tiếp theo là Milestone 3 audio theo lộ trình (Speaker/Stereo/Frequency Generator trước), còn microphone/camera/gamepad phải có kiểm thử quyền và hardware tương ứng. Không triển khai Phase 3.

## Phase 2 — Milestone 3, ngày 30/10/2026

Đã triển khai D01 Speaker Test, D02 Stereo Channel Test và D04 Frequency Generator. Giữ 21 công cụ Phase 1 và tám công cụ M2, không triển khai microphone/camera/gamepad hoặc Phase 3. Registry hiện 32 published/tám draft, sáu category, 64 route công cụ VI/EN, 80 URL nội dung.

File chính: src/lib/audio/output-session.ts, src/features/audio/output.tsx, src/lib/tools/phase2-milestone3.ts; ToolRunner/registry/Status/icon/CSS và messages VI/EN; tests/audio-output.test.ts, audio-lifecycle.test.tsx, helpers/audio.ts, e2e/milestone3.spec.ts và publication/count regression. scripts/smoke-http.mjs mở rộng health + 18 route VI/EN qua Nginx. Không đổi kiến trúc hoặc dependency.

Context chỉ tạo sau Start; phiên 10 giây, gain mặc định 0,03/tối đa 0,2, stereo qua merger hai input. Validation theo sample rate thực, cleanup cả pending resume, graph cấp phát một phần và context interruption. Stop/Reset/blur/hidden/pagehide/unmount không tự phát lại; không thu âm/upload/lưu log hoặc history. Tần số là cấu hình, sample rate là context, không khẳng định thông số DAC hoặc chất lượng loa.

Build production đạt (86 trang gồm hạ tầng; sitemap 80 URL nội dung). Typecheck đã đạt; lượt unit trước bổ sung cleanup cuối đạt 145/145 trên 23 file, kiểm tra cuối đang chạy. Audit production không có lỗ hổng đã biết; secret scan 169 file không finding ở checkpoint này. E2E audio Chromium đầu 7/8: failure chỉ do locator role=alert trùng Next route announcer, đã scope vào workspace; không thay đổi kỳ vọng lỗi phát bị chặn. Lượt E2E đầy đủ 168 bài đang chạy, chưa ghi là đạt. Có một lượt E2E ban đầu bị dừng do build cũ chưa chứa nhãn audio mới; source cuối đã build lại trước hồi quy.

Tài liệu tiếng Việt cập nhật ở PHASE2-MILESTONE3.md và các tài liệu vận hành/kiểm thử/kiến trúc/tiến độ. Automation audio đặt volume 0 để kiểm tra API thật mà không phát tiếng qua phần cứng; nghe loa/tai nghe/stereo vật lý, Safari thật, screen reader và Lighthouse source mới còn mở. Chưa có Docker Engine Windows sử dụng được; sẽ đọc Docker CI source mới sau push. Không triển khai VPS và không đóng Final Acceptance toàn Phase 1/2.

Probe thực tế WebKit Windows cho thấy AudioContext và webkitAudioContext đều undefined. UI fallback đúng, nhưng các bài kỳ vọng graph thật không thể chạy trên build này; lượt 168 bài được dừng sau khi xác định giới hạn, không báo là đạt. Bổ sung bài fallback độc lập VI/EN/axe hai theme/responsive; bảy bài cần Web Audio ghi skip với lý do chỉ khi native API không có ngoài CI. CI bắt buộc có native AudioContext và phải chạy đủ, không thay bằng mock hoặc skip. Bộ cuối hiện 172 E2E (43/cấu hình). Riêng nhóm audio WebKit local: hai bài fallback/lỗi đạt, bảy bài playback không thể kiểm chứng và ghi skip. Đã sửa lifecycle để blur/hidden/pagehide đóng context ngay, không phụ thuộc timer tab nền. Build/typecheck/lint cuối đạt; unit/hồi quy cuối đang chạy lại sau sửa này. Ảnh QA ba trang VI ở mobile/desktop hai theme và trạng thái phát mức 0/lỗi đã được xem; artifacts không commit.

Source eea659e đã push main, CI 41026207584 bắt đầu xác minh; Docker job của revision này đã success. Rà soát cuối bổ sung oscillator.stop theo audio clock tại deadline 10 giây để tín hiệu vẫn kết thúc nếu main thread làm chậm UI timer; unit xác nhận lịch dừng này. 28/28 test audio/lifecycle, typecheck/lint đạt sau bổ sung; cần CI source tiếp theo để xác minh toàn bộ, không dùng run eea659e làm bằng chứng cho revision có deadline mới.

Docker smoke CI của source cuối 2bd1020 đã success ở run 41026457800, job 123965622361. Đã tải/đọc artifact logs/containers/shutdown và log job: production image build, app healthy, Nginx syntax/proxy, health + 18 route VI/EN qua ba checkpoint ban đầu/restart/stop-start; Node port không publish. SIGTERM exit 143, OOMKilled false, Error rỗng; không có lỗi ứng dụng hoặc HTTP 4xx/5xx trong smoke. Image ID runner sha256:c4b62747dafd35eec46c2d1f97d11e7a978f754d7c23501c884269f164b7158e, không push image registry/VPS. Run 41026207584 của source trước đã được hủy khi source deadline mới thay thế; không dùng run cũ làm nghiệm thu. Job verify cuối đang chạy E2E; chưa ghi cả run success.

CI 41026457800 của 2bd1020: build/typecheck/lint/secret scan/146 unit đạt; E2E 166/172, sáu lỗi đều Firefox Linux chờ resume ở Preparing; Chromium/WebKit Linux/mobile đều 43/43, không skip/flaky. Đã tải JSON và trace/error context, không báo run này success. Local source 2bd1020 đã build lại và nhóm audio đạt 29 bài, bảy skip WebKit Windows; hồi quy toàn bộ build eea659e đạt 165 bài, bảy skip, 403283,617 ms. Source deadline mới có 28/28 unit audio/lifecycle đạt.

Hướng xử lý CI: cung cấp PulseAudio null sink hai kênh trên runner Linux, thêm scripts/smoke-audio.mjs kiểm tra native AudioContext resume/graph/close trên Chromium/Firefox/WebKit trước build/E2E và lưu JSON artifact. Không sửa logic sản phẩm, tăng timeout kỳ vọng E2E, thay API bằng mock hoặc bỏ bài Firefox. Đây là backend ảo của môi trường QA, không kiểm chứng loa thật. Lint và node --check script đạt; chờ CI kiểm chứng giả thuyết thiếu audio backend.

### Nghiệm thu Milestone 3

**Nghiệm thu automated QA source 1066568:** CI [41027637979](https://github.com/anhtruc1803/checkall/actions/runs/41027637979) success cả verify và Docker. Typecheck/lint/build/secret scan đạt; 146/146 unit trên 23 file và 172/172 E2E, Chromium/Firefox/WebKit/mobile đều 43/43, không skip/unexpected/flaky. Đã tải và đọc [browser-qa JSON](https://github.com/anhtruc1803/checkall/actions/runs/41027637979/artifacts/12964761587), E2E 333755,564 ms (khoảng 5,6 phút). Native audio smoke ba browser đều resume/graph/close thành công với output ảo; sample rate context thực là Chromium 44.100, Firefox 48.000, WebKit 44.100 Hz, không phải thông số DAC/loa.

Docker source 1066568 đạt trong 70 giây: image build, healthy, Nginx, health + 18 route VI/EN ở ba checkpoint, Node không publish port, restart/stop-start và SIGTERM exit 143, OOMKilled false/Error rỗng. Đã đọc logs/containers/shutdown của [artifact Docker](https://github.com/anhtruc1803/checkall/actions/runs/41027637979/artifacts/12964093859), không có lỗi ứng dụng hoặc HTTP 4xx/5xx trong smoke. Image ID runner sha256:76b56e0d8a916deddaa5a50cd7449ed3e73817c5f5b084cb6848fd0fe9b08cdd; không push registry/VPS.

Local: unit cuối source 1066568 đạt 146/146; build/typecheck/lint đạt. Hồi quy toàn bộ build eea659e: 165 đạt, bảy skip WebKit Windows, 403283,617 ms. Sau deadline theo audio clock, build lại 2bd1020 và nhóm audio đạt 29, bảy skip WebKit Windows; không failure/flaky. Bảy skip không tính là đã kiểm chứng playback trên Windows WebKit; CI Linux cuối đã chạy đủ các bài này bằng native API. Không dùng kết quả build cũ làm bằng chứng deadline mới.

Lỗi CI Firefox Linux chờ resume ở run 41026457800 (166/172) được xử lý bằng PulseAudio null sink và native audio smoke, không sửa kỳ vọng E2E hoặc dùng mock thay API thật. Profile CI vẫn chạy đủ 172 bài. Null sink chỉ xác minh browser/graph, không xác nhận âm thanh nghe được.

Hoàn thành implementation và automated QA ba công cụ trong phạm vi M3; giữ toàn bộ chức năng cũ. Tài liệu tiếng Việt và QA JSON cập nhật, raw artifacts/cache/.env/key không commit. Server QA thuộc tác vụ đã dừng sau kiểm tra; không triển khai hạ tầng thật.

Đã hoàn thành và xác minh: registry/VI-EN/SEO, engine Web Audio, deadline/lifecycle, hồi quy/a11y tự động/responsive, build/audit/secret scan và Docker CI. Đã triển khai nhưng chưa xác minh bằng phần cứng: trải nghiệm nghe Speaker/Stereo/Generator, mute/output routing/driver/Bluetooth. Không thể kiểm chứng trong môi trường hiện tại: âm thanh vật lý/Safari/thiết bị thật; screen reader và manual QA còn mở. Chưa hoàn thành ở cấp dự án: tám draft Phase 2 còn lại, Lighthouse revision mới và các điều kiện Final Acceptance. Không đánh dấu Final Acceptance Phase 1 hoặc toàn Phase 2 hoàn tất.

Công việc tiếp theo: thực hiện ma trận manual QA trong PHASE2-MILESTONE3.md trước nghiệm thu âm thanh vật lý; milestone microphone/spectrum chỉ bắt đầu theo yêu cầu tiếp theo và cần kiểm thử quyền/capture/phần cứng riêng. Không triển khai Phase 3.

## Phase 2 — Milestone 4, ngày 05/11/2026

Người dùng yêu cầu Microphone Test và Audio Spectrum, đầy đủ permission/lifecycle, giữ chức năng hiện có, kiểm thử, tài liệu tiếng Việt và push GitHub. Working tree ban đầu sạch tại 096268f, remote đồng bộ; không triển khai VPS hoặc Phase 3.

Đã triển khai D03/D05: InputSession dùng media session/permission nền tảng, audio-only capture sau Start; resume trong click ban đầu, kiểm tra context state sau grant, chống duplicate/late result. Stop/Reset/blur/hidden/pagehide/unmount/đổi tool/ended/revoked/context interruption dọn track/node/context/timer/listener; late grant được stop, pending không bị giả thành Denied. Phân tích RMS/peak/dBFS/tỷ lệ mẫu gần full scale và FFT 2048; UI 8 Hz, 64 điểm/dải, không fake sample/PCM/history/upload/monitoring.

Registry 34 published (21 Phase 1 + 13 Phase 2), sáu draft, 68 route công cụ VI/EN, 84 URL nội dung. Policy microphone=self chỉ bốn URL D03/D05; toàn bộ route khác chặn. Thêm PolicyLink tạo document navigation qua ranh giới microphone, vì App Router soft navigation giữ document policy cũ. Không viết lại kiến trúc; thay đổi navigation có lý do kỹ thuật và regression browser cụ thể.

File chính: src/lib/audio/{input-session,input-analysis}.ts, src/features/audio/input.tsx, src/lib/tools/phase2-milestone4.ts, src/components/navigation/policy-link.tsx và src/lib/browser/navigation-policy.ts; registry/ToolRunner/metadata/messages/privacy/CSS/Next headers, tests unit/lifecycle/navigation/E2E và scripts/smoke-http.mjs. HTTP smoke mở rộng 22 route VI/EN kèm assertion policy qua Nginx.

Đã sửa lỗi phân loại sự kiện stopped trung gian của media session che lỗi capture (permission-denied/not-found/busy/abort), thêm hủy chờ resume khi Stop, kiểm tra context suspended sau grant và cleanup khi đổi tool. Unit hiện 193/193 trên 27 file đạt; typecheck/lint/production build đạt (90 trang gồm hạ tầng). Audit production không có lỗ hổng đã biết; secret scan 182 file không finding tại checkpoint trước cập nhật tài liệu.

E2E mới Chromium đạt 11/11, gồm native getUserMedia dùng thiết bị ảo từ homepage, policy chặn thật, analyser native từ tín hiệu tổng hợp 1 kHz và document navigation catalog/related/search. Lượt hồi quy 212 bài trước sửa policy navigation được dừng để bổ sung regression, không báo là hoàn tất. Bộ cuối 216 bài đang chạy; chưa ghi đang chạy là đạt. Thiết bị kiểm thử/fixture được phân biệt với microphone vật lý; chưa nghiệm thu Safari hoặc microphone thật, chưa đo Lighthouse M4, chưa đóng Final Acceptance.

Source 40837d0 đã push main, CI 41948060055 xác minh source mới. Hồi quy local đầu kết thúc 199 đạt/12 skip/5 lỗi trên 216 bài, không coi là đạt. Hai lỗi Firefox liên quan kỳ vọng native policy mà browser chưa triển khai và track.stop không phát ended. Probe trực tiếp thấy policy API không tồn tại/header chặn bị bỏ qua. Ba lỗi WebKit Windows do failure fixture thiếu mediaDevices trên runtime không cung cấp API này.

Bổ sung kiểm tra readyState tại mỗi lần đọc để đóng phiên khi track ended mà không có event; có unit riêng. Chuẩn hóa failure/pending fixtures để chỉ mô phỏng API cần thiết, không coi đó là capture native. Tách capture khỏi bài native header enforcement; bài enforcement ghi skip theo capability thực, không báo Firefox đã chặn header. Các tiêu chí capture/track cleanup và native analyser vẫn bắt buộc. Bộ hiện tại 220 bài (55/cấu hình), cần CI source mới; native policy Firefox tiếp tục là giới hạn mở theo Mozilla bug 1694922.

Unit sau bổ sung readyState đạt 194/194 (27 file), typecheck/lint/build đạt. Nhóm M4 Firefox/WebKit sau sửa đạt 17 bài/bảy skip, không failure; skip gồm native Web Audio thiếu trên WebKit Windows và native policy Firefox không có API. CI source 40837d0 kết thúc failure: 207/216 E2E đạt, chín lỗi (hai Firefox, bảy WebKit Linux); Docker job đạt. Các case synthetic/failure WebKit được chuẩn hóa facade permissions/mediaDevices để trạng thái quyền native không mâu thuẫn với stream fixture. Native capture được kiểm tra riêng, không dùng facade này. Cần CI source sửa cuối; chưa ghi milestone đã nghiệm thu.

### Nghiệm thu Milestone 4 trong phạm vi phần mềm

**Kết quả source 8f6e773:** [CI 41949819465](https://github.com/anhtruc1803/checkall/actions/runs/41949819465) success cả verify và Docker. Typecheck/lint/build/secret scan đạt; **194/194 unit (27 file), 218 E2E đạt, hai skip, không failure/flaky**. Đã tải và đọc [browser-qa JSON](https://github.com/anhtruc1803/checkall/actions/runs/41949819465/artifacts/13381076436); E2E 416482.686 ms (khoảng 6,9 phút).

| Cấu hình CI     | Đạt | Skip |
| --------------- | --: | ---: |
| Chromium        |  55 |    0 |
| Firefox         |  54 |    1 |
| WebKit          |  54 |    1 |
| Chromium mobile |  55 |    0 |

Hai skip chỉ là bài native header enforcement khi runtime không expose policy API. Không coi tiêu chí này đã đạt, không khẳng định Safari thật có cùng hành vi. Native getUserMedia từ input ảo, analyser từ MediaStream tổng hợp, lifecycle, a11y/responsive và hồi quy chức năng cũ đều chạy trên cả bốn cấu hình. Native AudioContext smoke ba browser cũng đạt với context đóng sau kiểm tra. Header HTTP đúng phạm vi bốn URL và qua Nginx đã kiểm tra độc lập; nhánh policy của app có unit coverage.

Docker Linux CI của source này đạt trong 78 giây: production image, Compose healthy, Nginx syntax/proxy, health + 22 route VI/EN và policy ba checkpoint (ban đầu/restart/stop-start), Node port không publish. SIGTERM exit 143, OOMKilled false/Error rỗng. Đã đọc [logs/containers/shutdown](https://github.com/anhtruc1803/checkall/actions/runs/41949819465/artifacts/13379809854), không có lỗi ứng dụng hoặc HTTP 4xx/5xx trong smoke. Image ID runner sha256:5dc19a2adc01b1b6fa93b6ab370ff22258784c732e55af479875f9a4f020e9bf; không push image registry hoặc triển khai VPS.

Local source cuối: build/typecheck/lint và 194 unit đạt. Nhóm M4 cuối 41 đạt/bảy skip, không failure/flaky, 132218.513 ms: Chromium 12, Firefox 11 + một skip policy, WebKit Windows sáu + sáu skip native audio, mobile 12. Đây là lượt M4 riêng, không báo toàn bộ 220 E2E đã đạt cục bộ. Lượt toàn bộ trước sửa source 40837d0 là 199 đạt/12 skip/năm lỗi; CI đầu 207 đạt/chín lỗi. Các lỗi và hướng xử lý đã ghi trong PROGRESS, không bị thay bằng số đạt của source khác.

Đã hoàn thành và xác minh: hai engine/registry/VI-EN/SEO, số đọc digital thật từ luồng, quyền và lifecycle, document navigation qua policy boundary, bảo toàn 32 công cụ cũ, unit/E2E khả dụng, a11y tự động/responsive, audit/secret scan và Docker CI. File chính và phương pháp ở PHASE2-MILESTONE4.md; raw artifacts/cache/.env/key không commit. Server QA thuộc tác vụ đã dừng.

Đã triển khai nhưng chưa xác minh bằng phần cứng: microphone tích hợp/USB/Bluetooth, mute/đổi/rút input và native prompt/OS permission. Không thể xác minh native header enforcement trong runtime Firefox/WebKit hiện tại; giữ hai skip rõ lý do, cần kiểm tra các browser mục tiêu/Safari thật. Chưa hoàn thành: manual screen reader/zoom/reduced motion/BFCache, Lighthouse source mới và sáu draft Phase 2. Final Acceptance Phase 1/2 tiếp tục mở; không đánh dấu nghiệm thu tổng thể hoàn tất. Không triển khai Phase 3 hoặc VPS.

Tiếp theo: thực hiện ma trận manual QA microphone/permission/OS/Safari và đối chiếu hỗ trợ native policy. Các công cụ camera/gamepad chỉ bắt đầu theo yêu cầu milestone tiếp theo.

## Phase 2 — Milestone 5, ngày 05/11/2026

Theo yêu cầu người dùng: Webcam Preview, Camera Resolution, Camera FPS, đầy đủ quyền/lifecycle, giữ chức năng cũ, kiểm thử/tài liệu tiếng Việt và push GitHub. Ban đầu working tree sạch tại f9840c8/main; không triển khai VPS, gamepad hoặc Phase 3.

Đã triển khai E01/E02/E03 qua CameraSession/FrameWindow dùng media session nền tảng. Video-only sau Start, muted/playsInline; getSettings whitelist và kích thước video thật, FPS compositor từ delta presentedFrames/callback time ≥2 giây, không giả phần cứng/rAF/reported FPS. UI 4 Hz, bộ nhớ hằng số, không pixel/record/history/upload/device identifiers. Pending prompt giữ khóa Start, late grant dừng track; play chờ tối đa 10 giây, track ended khi đang chờ cũng cleanup; phiên tối đa 60 giây. Cleanup camera/video/frame callbacks/timer/listener khi Stop/Reset/ended/revoke/blur/hidden/pagehide/đổi tool/locale/unmount, không tự resume.

37 published (21 Phase 1 + 16 Phase 2), ba draft gamepad; 74 route công cụ/92 URL nội dung, build 98 trang gồm hạ tầng. Camera=self chỉ sáu URL; microphone=self bốn URL riêng, các route khác chặn cả hai. PolicyLink document navigation mở rộng camera↔microphone và locale; HTTP smoke qua Nginx mở rộng 28 route VI/EN. Không sửa kiến trúc cũ hoặc thêm dependency.

File chính: src/lib/camera/{camera-session,frame-analysis}.ts, src/features/camera/camera.tsx, src/lib/tools/phase2-milestone5.ts; ToolRunner/registry/navigation-policy/Next headers/VI-EN/privacy/CSS, unit/lifecycle/E2E M5 và scripts/smoke-http.mjs. Tài liệu phương pháp, giới hạn và manual QA ở PHASE2-MILESTONE5.md.

Đã xử lý: namespace camera đụng nhãn danh mục (đổi thành cameraTools, thêm regression nhãn), tên truy cập command search tiếng Việt không chứa nhãn hiển thị, đọc số có unit trong test và câu báo lỗi fixture. Chromium lượt đầu 7/10 đạt, ba lỗi trên được lưu riêng, không báo đạt. Probe timer xác minh microtask jsdom cần drain sau event; không có timer phiên tồn tại sau drain, không bỏ kiểm tra track/frame cleanup. Bổ sung watchdog track ended không event khi đang chờ play và hủy chờ play khi Stop.

Checkpoint cục bộ: build/typecheck/lint đạt, 234 unit/integration trên 30 file đạt; production audit không có lỗ hổng đã biết, secret scan 197 file không finding trước tài liệu mới. Toàn bộ 264 E2E đang chạy; không ghi đang chạy là đạt. Máy không có Docker CLI; chờ Linux CI source M5, không dùng kết quả M4 thay thế. Camera ảo không chứng minh webcam vật lý, WebKit automation không thay Safari. Lighthouse revision mới và Final Acceptance Phase 1/2 tiếp tục mở.

Lượt hồi quy mở rộng phát hiện request POST ngoài origin do Kaspersky chèn vào browser Windows; giữ nguyên assertion không upload và không tính lượt native đó đã đạt privacy. Video/getSettings/rVFC native đã hiển thị số đọc thật từ camera ảo. Cần CI Linux sạch cho kết luận cuối. Bổ sung shortcut ⌘K vào tên truy cập command search vì shortcut cũng là chữ nhìn thấy; cập nhật hai assertion tên chính xác trong M4 tương ứng. Cleanup bài silent ended cần chờ watchdog 250 ms trước khi xác nhận srcObject null; không bỏ assertion giải phóng video. Lượt cũ được dừng để build lại sửa accessibility, không báo là hồi quy toàn bộ đã đạt.

Đã push source 4037478. CI đầu 41954759394: verify failure với 259 E2E đạt, bốn skip native policy và một lỗi selector navigation mobile; unit 234/build/typecheck/lint/secret scan và native audio smoke đạt. Native camera/getSettings/rVFC/không upload đạt cả bốn cấu hình. Trace chỉ ra bài test chọn liên kết desktop bị ẩn trên mobile; sửa test mở menu mobile và bấm liên kết hiển thị, giữ nguyên assertion document request và policy. Không sửa engine hoặc nâng timeout để che lỗi. Lượt full Windows 4037478 dừng sau khi CI chỉ ra lỗi selector, không coi là hồi quy đầy đủ; source sửa được kiểm tra lại nhóm M5 và CI toàn bộ.

Docker CI source 4037478 đạt trong 87 giây: production image, Compose healthy, Nginx syntax/proxy, health + 28 route/policy ba checkpoint, Node không publish cổng, restart và stop-start. SIGTERM exit 143/OOMKilled false/Error rỗng; artifacts logs/containers/shutdown đã đọc, không có lỗi ứng dụng hoặc HTTP 4xx/5xx. Image ID sha256:9b7650b59f3e2ea06dfeeeead910eb8167c8158810836e4efb1b62607ca9facb. Không triển khai VPS/registry.

Audit đầy đủ phát hiện hai advisory moderate ở glob/minimatch của dev dependencies hiện có (ESLint/Lighthouse), trong khi audit production không finding. Chi tiết đường dẫn/phiên bản/nguồn và công việc cập nhật major có kiểm chứng được ghi trong PHASE2-MILESTONE5.md; không tuyên bố toàn bộ dependency sạch.

### Nghiệm thu Milestone 5 trong phạm vi phần mềm

Source f260bfd: [CI 41956011535](https://github.com/anhtruc1803/checkall/actions/runs/41956011535) success cả verify và Docker. Build/typecheck/lint/secret scan, **234 unit/integration trên 30 file** đạt; **260 E2E đạt, 4 skip, không failure/flaky** trong 374144.780 ms. Đã tải/đọc [browser-qa JSON](https://github.com/anhtruc1803/checkall/actions/runs/41956011535/artifacts/13383417308) và ảnh camera ảo; native getUserMedia/video/getSettings/rVFC/không upload chạy trên cả bốn cấu hình. Giữ toàn bộ hồi quy 34 công cụ cũ và 74 route công cụ VI/EN.

| Cấu hình CI | Đạt | Skip |
| ----------- | --: | ---: |
| chromium    |  66 |    0 |
| firefox     |  64 |    2 |
| webkit      |  64 |    2 |
| mobile      |  66 |    0 |

Bốn skip là bài native policy camera/microphone: runtime Firefox/WebKit không expose policy API nên chưa xác minh được enforcement; không coi đã đạt enforcement hoặc Safari thật. HTTP header scope, navigation qua document và nhánh app guard được kiểm tra riêng. Các bài native camera không dùng facade; failure/pending/playback fixture có nhãn riêng. Native audio smoke ba browser vẫn đạt/context đóng, không xác minh thiết bị âm thanh vật lý.

Docker Linux CI source f260bfd đạt trong 70 giây: build production image/Compose healthy/Nginx, health + 28 route VI/EN và policy ở ba checkpoint, cổng Node không publish, restart/stop-start. SIGTERM exit 143, OOMKilled false/Error rỗng. Đã đọc [logs/containers/shutdown](https://github.com/anhtruc1803/checkall/actions/runs/41956011535/artifacts/13382903012), không thấy lỗi ứng dụng hoặc HTTP 4xx/5xx. Image ID runner sha256:4506b859f7205258f51d88e5b4027dc2e4dc4548380dcf39d4a86039655ab9c4; không push image registry hoặc triển khai VPS. Máy Windows không có Docker CLI, không tuyên bố đã kiểm tra Docker cục bộ hoàn chỉnh.

Local nhóm M5 cuối: **38 đạt/ba skip/ba lỗi**, không flaky, 159704.490 ms trên 44 bài. Ba lỗi đều tại assertion mọi POST/PUT/PATCH bằng rỗng do Kaspersky chèn request ngoài ứng dụng (Chromium/Firefox/mobile); giữ nguyên assertion và không tính lượt này đạt privacy sạch. Video/getSettings/rVFC và Stop đã chạy trước assertion cuối. Ba skip gồm native policy Firefox và hai bài native mediaDevices WebKit Windows. Chromium/mobile mỗi cấu hình 10 đạt + một lỗi môi trường; Firefox chín đạt + một skip + một lỗi môi trường; WebKit chín đạt + hai skip. Bài mobile navigation sửa riêng đạt 1/1 trước khi push. Hai lượt full Windows đã dừng để xử lý lỗi, không được báo là full regression đạt; bằng chứng hồi quy đầy đủ là CI source cuối.

**Đã hoàn thành và xác minh:** ba công cụ/registry/VI-EN/SEO, capture video-only sau Start, số đọc browser thật/phân loại FPS, quyền và lifecycle, navigation theo policy, hồi quy/a11y tự động/responsive/keyboard, build/unit/E2E khả dụng, secret scan và Docker CI. File chính và phương pháp trong PHASE2-MILESTONE5.md. Không có raw artifacts/.env/cache/key trong commit.

**Đã triển khai nhưng chưa xác minh bằng phần cứng:** trải nghiệm camera tích hợp/USB/ảo thật, ánh sáng/driver/OS prompt, autoplay/playsInline trên điện thoại, đèn privacy và FPS so với nguồn vật lý. **Không thể kiểm chứng trong môi trường hiện tại:** Safari/thiết bị thật và native enforcement khi Firefox/WebKit runtime thiếu hỗ trợ; privacy trên Windows có script Kaspersky chèn không được coi là sạch. **Chưa hoàn thành:** nâng tooling cho hai dev advisory moderate glob/minimatch, manual screen reader/zoom/reduced motion/BFCache/sleep-wake, Lighthouse revision mới và ba draft gamepad. Audit production không finding; không tuyên bố toàn bộ dependency sạch. Final Acceptance Phase 1/2 tiếp tục mở.

Tiếp theo: thực hiện ma trận webcam/permission/OS/Safari thật, đối chiếu native policy và xử lý tooling/performance còn mở. Gamepad hoặc milestone mới chỉ triển khai theo yêu cầu tiếp theo; không triển khai Phase 3 hoặc VPS.

## Phase 2 — Milestone 6, ngày 05/11/2026

Yêu cầu: Gamepad Tester, Analog Stick Test, Stick Drift Test, capability/lifecycle, giữ chức năng cũ, QA/tài liệu tiếng Việt và push GitHub. Ban đầu working tree sạch tại 32cb7fe/main; không triển khai Phase 3 hoặc hạ tầng thật.

Đã triển khai F01/F02/F03 qua GamepadSession/DriftAccumulator, engine/UI tải động riêng. Chỉ getGamepads sau Start, không query quyền giả/getUserMedia/haptics/history/upload. Capability thụ động phân biệt thiếu API, insecure, policy được quảng bá, SecurityError và API lỗi với danh sách trống chờ tương tác. Standard mặc định trục 0/1; mapping khác phải chọn cả X/Y khác nhau. Trục/nút raw có kiểm tra miền, không clamp/offset/calibration giả; quỹ đạo 120 điểm, UI 8 Hz và giới hạn dữ liệu. Drift chờ 1 giây rồi quan sát 5 giây, ≥30 quan sát trên ≥4,5 giây; raw mean/radii/tỷ lệ ngoài tham chiếu, không chẩn đoán hỏng hoặc USB Polling Rate. Mẫu lỗi/poll gap >250 ms hoặc đổi thiết bị/trục/tham chiếu xóa kết quả.

Phiên tối đa 120 giây. Stop/Reset/blur/hidden/pagehide/focus/disconnect event hoặc slot/mapping/ID/count thay đổi/API lỗi/tool/locale/unmount xóa dữ liệu, RAF/timer/listener, không auto-switch hoặc auto-resume. Guard sau publish chống allocation/dữ liệu stale khi subscriber Stop trong Start/selection; có unit riêng. Native ID chỉ trong phiên/hiển thị, không storage/log/upload.

40 published (21 Phase 1 + 19 Phase 2), không draft Phase 2; tám danh mục/80 route công cụ/100 URL nội dung, build 106 trang gồm hạ tầng. Gamepad=self chỉ sáu URL mới; camera/microphone giữ scope cũ và chặn gamepad. PolicyLink bổ sung document navigation cho gamepad; Nginx smoke health + 34 route VI/EN/policy ba checkpoint. Không viết lại kiến trúc/engine cũ hoặc thêm dependency.

File chính: src/lib/gamepad/{analysis,environment,session}.ts, src/features/gamepad/gamepad.tsx, src/lib/tools/phase2-milestone6.ts; ToolRunner/registry/messages/privacy/CSS/navigation-policy/Next headers, unit/lifecycle/E2E M6, scripts/smoke-http.mjs và artifact CI. Đã cập nhật tài liệu tiếng Việt/matrix manual QA tại PHASE2-MILESTONE6.md.

Checkpoint: lint/typecheck/production build và 275 unit/integration trên 33 file đạt; secret scan 210 file không finding trước tài liệu mới. Audit production không finding, audit toàn bộ còn hai advisory moderate glob/minimatch ở dev tooling đã có từ M5. Máy không có Docker CLI, chờ Linux CI source M6; không dùng kết quả M5 thay M6.

Chromium lượt đầu 8/12 đạt, bốn lỗi: hai timeout nhãn select bao gồm option, heading-order h3 nhảy từ h1 và assertion không upload bắt request Kaspersky chèn. Đã đặt aria-label rõ cho dropdown, sửa heading về h2, thêm regression nhãn truy cập; giữ assertion mọi POST/PUT/PATCH bằng rỗng. Lượt M6 bốn cấu hình đang chạy; chưa báo đạt. Native discovery/fallback/policy khác với fixture nút/trục/drift; không giả fixture thành tay cầm thật. Native policy gamepad test gọi trực tiếp API dưới header deny để tách app guard khỏi enforcement. Không nhận Safari/hardware/Lighthouse hoặc Final Acceptance hoàn tất.

Nhóm M6 cuối cục bộ đã kết thúc: 43 đạt/hai skip/ba lỗi trên 48 bài, khoảng 3,6 phút. Ba lỗi đều ở assertion không upload do request Kaspersky chèn trong Chromium/Firefox/mobile, không phải lỗi số đọc/drift/lifecycle; không lọc request hoặc báo local sạch. WebKit Windows 11 đạt/một skip native policy, Firefox 10 đạt/một skip/một lỗi môi trường; Chromium/mobile mỗi cấu hình 11 đạt/một lỗi môi trường. Bài direct native SecurityError đạt Chromium/mobile; Firefox/WebKit không quảng bá directive nên giữ skip, không tính enforcement đã xác minh. Cần toàn bộ CI Linux source M6, chưa đóng nghiệm thu.

### Nghiệm thu Milestone 6 trong phạm vi phần mềm

Source 76a71ce: [CI 41984091737](https://github.com/anhtruc1803/checkall/actions/runs/41984091737) success cả verify và Docker. **Build/typecheck/lint, 275 unit/integration trên 33 file và secret scan đạt; 306 E2E đạt, 6 skip, không failure/flaky**. E2E 612200.268 ms. Đã tải/đọc [browser-qa JSON](https://github.com/anhtruc1803/checkall/actions/runs/41984091737/artifacts/13395508825), native audio smoke và ảnh fixture gamepad; giữ toàn bộ hồi quy 37 công cụ cũ/80 route công cụ VI/EN. Không dùng kết quả M5 thay thế.

| Cấu hình CI     | Đạt | Skip |
| --------------- | --: | ---: |
| Chromium        |  78 |    0 |
| Firefox         |  75 |    3 |
| WebKit          |  75 |    3 |
| Chromium mobile |  78 |    0 |

Các skip là native policy camera/microphone/gamepad trên runtime Firefox/WebKit không expose policy API hoặc không quảng bá directive gamepad; không tính enforcement đã xác minh. Direct native getGamepads dưới header deny trả SecurityError được kiểm tra trên các runtime quảng bá directive (chromium, mobile). Native API discovery hoặc fallback thật được kiểm tra cả bốn cấu hình, **không** xác nhận thao tác nút/stick vật lý. Các bài nút/trục/drift/lifecycle dùng fixture rõ ràng; clock mô phỏng chỉ phục vụ QA. Native audio smoke ba browser vẫn đạt/context đóng.

Docker Linux CI source này đạt trong 81 giây: production image/Compose healthy/Nginx, health + 34 route VI/EN và policy ba checkpoint, cổng Node không publish, restart/stop-start. SIGTERM exit 143, OOMKilled false/Error rỗng. Đã đọc [logs/containers/shutdown](https://github.com/anhtruc1803/checkall/actions/runs/41984091737/artifacts/13395536270), không có lỗi ứng dụng hoặc HTTP 4xx/5xx. Image ID runner sha256:69b281c7583dc29617d017e0e89d6372c8c4e66c4a5757986b47433965b61e9f; không push registry/VPS. Máy Windows không có Docker CLI nên không tuyên bố đã kiểm tra Docker cục bộ hoàn chỉnh.

Local nhóm M6: **43 đạt/hai skip/ba lỗi**, không flaky, 216147.357 ms trên 48 bài. Ba lỗi là assertion mọi POST/PUT/PATCH bằng rỗng bắt request Kaspersky chèn (Chromium/Firefox/mobile), giữ nguyên assertion và không báo local là môi trường sạch. Hai skip native gamepad policy Firefox/WebKit. Chromium/mobile mỗi cấu hình 11 đạt + một lỗi môi trường; Firefox 10 đạt + một skip + một lỗi môi trường; WebKit 11 đạt + một skip. Native discovery/fallback, dữ liệu fixture, drift/zero, lifecycle và a11y/responsive đã chạy; CI sạch cung cấp bằng chứng privacy và hồi quy đầy đủ. Lượt Chromium đầu 8 đạt/bốn lỗi đã giữ riêng, không thay lịch sử bằng kết quả sau sửa.

**Đã hoàn thành và xác minh:** ba công cụ/registry/VI-EN/SEO, capability/policy handling, Start gating, cặp trục/mapping rõ ràng, dữ liệu thô và cửa sổ drift có điều kiện, RAF/timer/listener/StrictMode/SSR cleanup, navigation theo document policy, build/unit/E2E khả dụng/a11y tự động/responsive/keyboard, secret scan và Docker CI. Registry hiện 40 published (21 Phase 1 + 19 Phase 2), tám danh mục, không draft Phase 2; 100 URL nội dung/106 trang build gồm hạ tầng. File chính và phương pháp ở PHASE2-MILESTONE6.md; không commit .env/secrets/cache/raw artifacts.

**Đã triển khai nhưng chưa xác minh bằng phần cứng:** Gamepad Tester/Analog Stick/Stick Drift trên tay cầm USB/Bluetooth/driver/mapping thực, exposure theo tương tác, neutral position và unplug/reconnect cùng slot/model. **Không thể kiểm chứng trong môi trường hiện tại:** tay cầm/thiết bị/Safari thật, native policy ở runtime không expose hỗ trợ, privacy sạch trên Windows bị Kaspersky chèn script. **Chưa hoàn thành:** manual screen reader/zoom/reduced motion/sleep/BFCache, Lighthouse M6 và nâng tooling cho hai dev advisory moderate glob/minimatch. Audit production không finding; audit toàn bộ không sạch. Final Acceptance Phase 1/2 tiếp tục mở.

Tiếp theo tại checkpoint M6: thực hiện ma trận phần cứng/browser/OS ở PHASE2-MILESTONE6.md, đối chiếu native policy và xử lý các mục performance/tooling còn mở. Đã hoàn thành danh sách triển khai phần mềm 19 công cụ Phase 2; không tự bắt đầu Phase 3 hoặc triển khai hạ tầng.

## Triển khai staging theo yêu cầu, ngày 06/11/2026

Đã triển khai release fca62c6 lên VPS được người dùng chỉ định, tại https://nguyenanhtruc.io.vn/vi và /en. Không triển khai Phase 3, không đổi code hoặc kiến trúc ứng dụng. Mã ứng dụng trùng 76a71ce đã qua CI M6; archive chỉ gồm Git tracked files. Docker production build trên VPS thành công; app healthy, Nginx 80/443, Node 3000 không public. Đã thêm swap/giới hạn app/log rotation phù hợp host 2 GB, cấu hình Nginx upstream Docker DNS và xử lý HTTPS sau trusted proxy. Không thay SSH hoặc dịch vụ quản trị nhà cung cấp.

**Đã hoàn thành và xác minh:** origin HTTPS có chứng chỉ hợp lệ, Certbot timer active và renewal dry-run kèm deploy hook đạt; health trước/sau restart app, Nginx syntax, port private và log khởi động không lỗi; HTTP public 308 → HTTPS, VI/EN 200, canonical đúng và 100 URL sitemap duy nhất; HTTP smoke health + 34 route/policy đạt. E2E public dùng bốn file shell/screen/keyboard/mouse hiện có: 45/45 đạt, Chromium/Firefox/WebKit mỗi cấu hình 15, không skip/failure/flaky, 114678.238 ms. Không coi WebKit là Safari thật hoặc coi smoke là full E2E M6.

Harness staging đầu tiên nhập config sai dạng module, vô tình dùng sáu worker/một project: 14 đạt/một lỗi HTTP 503 do rate limit tại viewport. Đã sửa harness thành ba project rõ ràng/hai worker, giữ nguyên assertion và rate limit; lượt cuối 45 đạt. Không xóa lịch sử lỗi hoặc tính lượt đầu là đa browser. Raw evidence chỉ ở artifacts bị Git ignore.

**Đã triển khai nhưng chưa xác minh đầy đủ:** proxy public vẫn thiếu CSP tại lần đo 15:58 Asia/Saigon, trong khi origin có CSP và scoped Permissions-Policy public đạt. Người dùng yêu cầu giữ proxy, sau đó tự cấu hình tên miền/proxy; không chỉnh dashboard hoặc tuyên bố CSP đã được chuyển tiếp. TLS proxy→origin, reboot host và rollback sang release trước chưa kiểm chứng. Staging đã có thể truy cập để test; chưa đóng nghiệm thu bảo mật/Final Acceptance.

**Không thể kiểm chứng trong lượt này:** thiết bị/Safari thật và các điều kiện manual QA M6. **Chưa hoàn thành:** Lighthouse revision hiện hành, hai dev advisory moderate và manual QA còn mở từ M6. Typecheck/lint chạy lại đạt, Prettier/diff check đạt; secret scan 213 file không finding. QA JSON đã đối chiếu với browser/HTTP evidence. Không chạy lại toàn bộ unit/E2E cho thay đổi tài liệu; build production thực hiện trên VPS, bộ kiểm thử code đầy đủ vẫn dẫn CI source M6, không nhận smoke thay thế.

File tài liệu cập nhật: DEPLOYMENT.md (layout/lệnh vận hành/chứng chỉ/giới hạn), TESTING.md, PROGRESS.md và qa/staging-2026-11-06.json. Không commit credential, origin IP/SSH endpoint, .env, certificate/private key hoặc raw artifact. Tiếp theo: quản trị viên đối chiếu public CSP sau cấu hình proxy, rồi thực hiện ma trận phần cứng và các tiêu chí nghiệm thu còn mở.

## Nâng cấp UI/UX bằng UI/UX Pro Max — 10/11/2026

Theo yêu cầu, đã cài và sử dụng skill UI/UX Pro Max từ repo nextlevelbuilder. Đã tra design system/Next.js/UX, chọn hướng phòng lab kỹ thuật với graphite/cobalt, phân cấp chữ/surface rõ và hai theme đầy đủ. Giữ nguyên 40 công cụ, 80 route công cụ VI/EN, engine, khả năng/quyền/lifecycle và chính sách xử lý cục bộ. Không thêm dependency hoặc tài nguyên font bên ngoài.

Đã sửa trang chủ, header/footer, danh mục, thẻ công cụ, bảng thiết bị và lớp CSS workspace; thêm category shortcut/icon đủ tám nhóm, số đếm registry thật, xóa tìm kiếm giữ bộ lọc và trả focus. Tài liệu/phạm vi/file chính và lệnh tra skill tại UI-UX-REFRESH.md.

Checkpoint: build 106 trang, typecheck/lint, 275 unit/integration trên 33 file đạt. Chromium accessibility đại diện cả hai theme đạt; ba bài UI mới sau sửa grid theo rem đạt 3/3. Lượt đầu có lỗi tràn hai shortcut khi tăng chữ 200%, đã sửa, giữ assertion. Full E2E trước đổi phiên bị gián đoạn, không có report cuối; chưa tính đạt. Đang chạy lại hồi quy giao diện bốn cấu hình và chờ CI đầy đủ source UI mới. Không dùng CI M6 để nhận UI đã nghiệm thu.

Chưa triển khai UI mới lên staging tại checkpoint này; không chỉnh tên miền/proxy người dùng quản lý. Manual hardware/Safari/screen reader, Lighthouse mới và các mục bảo mật/tooling của bàn giao staging còn mở; Final Acceptance chưa hoàn tất.

Checkpoint kế tiếp: source 49bd12f đã đạt 92/92 E2E giao diện local trên Chromium/Firefox/WebKit/mobile, không skip/flaky, 303929.508 ms; Docker CI run 42756963778 đạt, verify đầy đủ chưa kết thúc. Kiểm tra thêm menu mở ở 320px phát hiện nhãn quyền riêng tư có scrollWidth 152px trên ô 140px; đã cho label reflow và mở rộng hai bài responsive/200% để kiểm tra cả menu đang mở. Run CI trên 49bd12f được chủ động hủy để thay bằng source sửa menu; không nhận run đó là full CI đã đạt hoặc dùng image 49bd12f để triển khai.

Source 27f1383: [CI 42757715180](https://github.com/anhtruc1803/checkall/actions/runs/42757715180) Docker đạt 80 giây; verify thất bại với 299 E2E đạt/6 skip/19 lỗi, không triển khai source này. Đã đọc log và tải browser/Docker artifacts: lỗi accessibility tập trung vào aria-label cũ của logo ghi đè tagline mới và color-contrast của kbd khi nền nút chuyển theme trong 160 ms nhưng màu chữ đổi ngay (tỷ lệ đo 2,6–4,06 thay vì 4,5). Đã bỏ aria-label thừa để tên truy cập lấy đầy đủ từ chữ hiển thị, đánh dấu SVG trang trí và bỏ transition màu nền trên control; giữ chuyển động/hover khác và tất cả assertion. Bổ sung kiểm tra tên logo và Axe hai rule sau mỗi lần đổi theme trong UI regression. Chờ CI source sửa accessibility; không dùng kết quả local 92 hoặc Docker đạt để nhận full CI đạt.

### Nghiệm thu giao diện trong phạm vi phần mềm

Source cuối 387c03f: [CI 42759176453](https://github.com/anhtruc1803/checkall/actions/runs/42759176453) **success cả verify và Docker**. Đã đọc log/báo cáo JSON: build 106 trang, typecheck/lint/secret scan và **275 unit trên 33 file đạt; 318 E2E đạt, 6 skip, không failure/flaky**, 681819.829 ms. Chromium/mobile mỗi cấu hình 81 đạt; Firefox/WebKit mỗi cấu hình 78 đạt/ba skip native policy microphone/camera/gamepad. Không tính skip là enforcement đã xác minh hoặc WebKit là Safari thật. Giữ đủ 40 công cụ (21 Phase 1 + 19 Phase 2), 80 route công cụ VI/EN và 100 URL nội dung.

Nhóm local sau sửa hai lỗi accessibility: **32/32 đạt**, không skip/failure/flaky, 316821.173 ms trên bốn cấu hình. Gồm ba bài interface và toàn bộ ma trận từng thất bại ở M2/M3/M5/M6; kiểm tra idle/running/error/fallback, VI/EN/hai theme/responsive, tên truy cập và tương phản ngay sau đổi theme. Nhóm 92/92 của source trước vẫn là checkpoint riêng, không thay kết quả source cuối. Không nới hoặc bỏ assertion.

Docker Linux CI source cuối đạt **87 giây**, đã đọc containers/logs/shutdown: app healthy, Nginx/34 route/policy ở ba checkpoint, Node không publish, restart/stop-start và SIGTERM exit 143/OOMKilled false/Error rỗng. Image runner sha256:c7587f0cdfb32509c0fd366c26d08ce9a55d6c03f60e61d7b878dc910e805d48; không phải image VPS hoặc digest đã push registry.

**Đã triển khai và xác minh trên staging:** https://nguyenanhtruc.io.vn/vi và /en, source 387c03f, tag staging-387c03f-20261110, image VPS sha256:80bd265e58e502158ff4042fb29dbeeedc8e06d6bd9575fff1b4e7ffcc8ea778. Current trỏ releases/387c03f; app healthy/OOMKilled false, Node private, Nginx syntax/log khởi động đạt. Giữ release/image fca62c6 trước đó để có thể phục hồi, chưa diễn tập rollback trên VPS. Không chỉnh dashboard tên miền/proxy; origin Nginx chỉ cập nhật marker release và reload. Certbot timer vẫn active.

Sau chuyển release: HTTP smoke **health + 34 route/policy đạt**; public VI/EN 200, HTTP 308 → HTTPS, canonical đúng, sitemap 100 URL duy nhất, HTML/CSS đúng release mới. **Ba E2E UI qua HTTPS đạt**, một bài trên mỗi Chromium/Firefox/WebKit, không skip/flaky, 38009.247 ms: shortcut/count, tìm kiếm/clear/filter/focus, VI/EN, tên logo và tương phản hai theme. Đã xem ảnh desktop/mobile/Dark/Light từ website sau hydrate; browser data thật và Refresh Rate chưa đo vẫn ghi chưa đo. Đây là smoke public, không thay bộ 324 bài CI.

File chính đã tạo/sửa: interface.css/tokens.css, trang chủ/layout/category, Header/Footer, Catalog/ToolCard/DeviceOverview/CategoryIcon, messages VI/EN, interface.spec.ts; tài liệu UI-UX-REFRESH.md/TESTING.md/DEPLOYMENT.md/PROGRESS.md và qa/ui-ux-refresh.json. Skill cài ở thư mục cá nhân Codex, không vendor vào repo; không thêm dependency hoặc font ngoài, không thay engine/quyền/lifecycle. Raw screenshot/log/trace, .env và credential không nằm trong commit.

**Còn mở:** audit production mới không finding, audit toàn bộ vẫn hai advisory moderate glob/minimatch ở dev tooling; Lighthouse mới chưa chạy, manual hardware/Safari/screen reader/browser zoom/OS cần tiếp tục. CSP public vẫn thiếu khi đo 12:14 Asia/Saigon, origin có policy từ ứng dụng; TLS proxy→origin chưa xác minh. Người dùng tự quản lý proxy, không nhận các tiêu chí đó đã hoàn tất. UI đủ điều kiện tiếp tục test staging; **Final Acceptance Phase 1/2 vẫn mở**. Tiếp theo: manual QA trong UI-UX-REFRESH.md và ma trận từng milestone, performance/tooling và đối chiếu header sau khi quản trị viên cấu hình proxy.

## Lighthouse và tối ưu giao diện mới — 10/11/2026

Yêu cầu: đo sạch, hướng đến Performance mobile ≥90 nếu khả thi, giữ 40 công cụ, kiểm thử đầy đủ/tài liệu Việt/push. Working tree ban đầu sạch tại da680e4. Đã đọc báo cáo/trace lịch sử, cấu hình Next.js, tài liệu bundle/font/Server Components của phiên bản cài và hướng dẫn biến thiên Lighthouse của Google. Không dùng điểm Phase 1 cũ làm baseline UI mới.

Đã thêm workflow performance.yml tách khỏi hồi quy, pin Ubuntu 24.04/Node 24/pnpm lock, browser Chromium của Playwright; mỗi lượt profile mới/tắt extension, không chạy build/E2E đồng thời trong VM đo. Chạy sáu trang, mỗi trang ba lượt luân phiên: /vi, /en/screen/ppi, /vi/keyboard/tester, /en/audio/microphone, /vi/camera/preview, /en/gamepad/tester. Lưu HTML/JSON/browser log và source/môi trường/throttling/benchmark thực. Từ chối trace có external/injected script. Chứng chỉ pin chỉ dành loopback QA; staging HTTPS dùng xác minh TLS thông thường. CI dùng --no-sandbox trong VM tạm, không nhận đó là kiểm chứng sandbox/bảo mật browser.

Lượt đầu [42774515449](https://github.com/anhtruc1803/checkall/actions/runs/42774515449) không tạo báo cáo vì Chromium chưa sẵn sàng và cleanup cũ chờ event của tiến trình đã thoát (exit 13). Đã sửa cleanup theo close promise, kiểm tra exit/signal trước CDP, ghi browser log và dùng cấu hình Chromium CI; không tính lượt này vào số đo. Không tắt phần mềm bảo vệ Windows hoặc sửa trace để báo sạch.

Baseline sạch source da680e4 tại [run 42775192337](https://github.com/anhtruc1803/checkall/actions/runs/42775192337) đạt 18/18 lượt: median Performance theo thứ tự sáu trang **98/100/100/99/99/99**, Accessibility/Best Practices/SEO đều 100. TBT median 58/54,5/51,5/104/108/104 ms; LCP khoảng 909–957 ms. Mọi lượt clean, script ngoài origin bằng rỗng, CPU benchmark 3329,5–3907,5. Đây là lab loopback, không đồng nhất với điểm domain qua proxy và không so trực tiếp với Windows lịch sử như cùng điều kiện.

Bundle analyzer Turbopack trước/sau xác minh tailwind-merge chiếm 27421 byte module client (8444 byte gzip ước tính từng module) trong chunk dùng chung của bốn loại route. Button chỉ dùng class CSS thuần; AST kiểm tra chỉ có menu-toggle/command-trigger truyền thêm class, cva đã tạo chuỗi đầy đủ. Đã bỏ lớp cn thừa ở Button; giữ utility cn và API/cấu hình nút. Analyzer sau không còn tailwind-merge trong client; không thay engine/registry/nội dung/i18n/font/SEO/a11y. Build 106 trang/typecheck/lint/275 unit đạt. Chờ so sánh trước/sau trên cùng VM và CI đầy đủ source tối ưu; chưa tuyên bố đã đo revision tối ưu hoặc domain mới.

### Kết quả cuối Performance và hồi quy

**Đã hoàn thành và xác minh trong phạm vi sáu trang đại diện:** source tối ưu ad25dd12fe10b5c88634d5befe7363a2261f5dfd. [So sánh 42775910647](https://github.com/anhtruc1803/checkall/actions/runs/42775910647) đủ 36 lượt sạch trên cùng VM: trước và sau đều median **100/100/100/99/99/99**; Accessibility/Best Practices/SEO đều 100. JavaScript network giảm chính xác **9551 byte/trang (9,3 KiB)**. CSS/font/image không bị cắt; các font homepage trong lab/public có cùng sáu URL và decoded bytes. TBT thay đổi nhẹ theo lượt/CPU, không nhận đó là mức tăng điểm do một component.

Sau CI đạt đã triển khai source ad25dd1 lên staging, image `sha256:c3df1dca7116c8435399dc79cbe9d31e87bed4c68dd9f7adcb7ecbcb90e5555e`, tag staging-ad25dd1-20261110. App healthy/OOMKilled false, Node 3000 không public, current trỏ releases/ad25dd1; giữ 387c03f và backup Nginx trước chuyển. Chỉ đổi marker release/reload Nginx origin, không chỉnh dashboard tên miền/proxy. HTTP smoke health + **34 route/policy đạt**, HTTP 308→HTTPS, canonical/sitemap 100 URL và CSS đúng revision đạt. Ba UI E2E public Chromium/Firefox/WebKit đạt, không skip/failure/flaky, **38789.722 ms**.

[Lighthouse public 42778723274](https://github.com/anhtruc1803/checkall/actions/runs/42778723274) đủ 18/18 lượt sạch, mỗi lượt xác minh đúng nội dung app/locale, URL và release trước khi đo: median Performance **95/98/97/97/96/97**, theo thứ tự sáu trang đã nêu. Mọi lượt public 95–98, Accessibility/Best Practices/SEO 100. Public LCP/FCP median 966–1297 ms, TBT 177–241,5 ms, CLS 0,00008–0,00603; không ảnh tải riêng, font giữ đủ VI/EN. **Mục tiêu mobile ≥90 đạt trong bộ mẫu Linux và HTTPS này**, không khái quát cho 80 route hoặc mọi phần cứng/runtime. Public chạy VM khác với cặp lab nên số CPU/network/TBT giữa hai nhóm không phải một phép đối chiếu duy nhất.

[CI hồi quy 42775890687](https://github.com/anhtruc1803/checkall/actions/runs/42775890687) success verify/Docker trên đúng source ad25dd1: build 106 trang/typecheck/lint/secret scan, **275 unit/33 file**, **318 E2E đạt/6 skip**, không failure/flaky, **668827.891 ms**. Chromium/mobile mỗi cấu hình 81 đạt; Firefox/WebKit 78 đạt/ba skip native policy microphone/camera/gamepad. Không nới bài hoặc nhận skip là enforcement đã xác minh. Nhóm UI local **44/44 đạt**, không skip/flaky, 183267.522 ms. Giữ 40 công cụ (21 Phase 1 + 19 Phase 2), 80 route công cụ VI/EN và 100 URL nội dung.

Docker Linux CI job đạt **77 giây**; đã đọc logs/containers/shutdown: healthy/private Node port/Nginx/34 route/policy ba checkpoint, restart/stop-start, SIGTERM exit 143/OOMKilled false/Error rỗng. Raw report/trace/browser log chỉ ở artifacts bị ignore; dữ liệu gọn đủ từng lượt tại qa/performance-ui.json, kiểm chứng hồi quy/vận hành tại qa/performance-validation.json. File chính: Button.tsx chỉ bỏ wrapper thừa; scripts/lighthouse.mjs, performance-ci.mjs, report-ui-performance.mjs và performance.yml; tài liệu PERFORMANCE.md/TESTING.md/DEPLOYMENT.md/PROGRESS.md, không thay engine hoặc kiến trúc.

**Giới hạn và mục còn mở:** smoke riêng để kiểm tra harness Windows qua HTTPS /en có Performance **88/97/89**, median 89; TBT median 460,3 ms, benchmark 1133–1440,5, so với lab khoảng 3030–3594,5. Trace không script chèn; lượt cuối Script Evaluation 628 ms/Style & Layout 696 ms. Giữ đủ ba lượt trong báo cáo, không nhận Windows ≥90 hoặc quy mọi chi phí cho Kaspersky. SEO smoke 92 do origin QA khác SITE_URL và không gắn commit tự động; không dùng làm cặp so sánh phát hành. Các trường hợp field data, runtime khi chạy phần cứng, Safari/screen reader/OS thật chưa xác minh. Audit production mới không finding, audit dev vẫn hai moderate glob/minimatch; CSP public còn thiếu/TLS proxy→origin chưa kiểm chứng, người dùng tự quản lý proxy. Không đánh dấu Final Acceptance Phase 1/2 hoàn tất. Tiếp theo: manual QA/field performance và các tiêu chí bảo mật/tooling còn mở.

## Bàn lab tương tác — checkpoint 10/11/2026

Đã thực hiện hero SVG tương tác và tám hình danh mục theo đề xuất được duyệt. Giữ 40 công cụ/VI-EN/engine; bảng thiết bị thật chuyển thành dải tóm tắt, hình có chú thích minh họa và không sinh số đo. Dùng UI/UX Pro Max với hướng dẫn reduced motion, không thêm dependency/font/ảnh ngoài hoặc animation loop. File và thiết kế tại UI-UX-REFRESH.md.

Build production đủ 106 trang, typecheck/lint và 275 unit trên 33 file đạt. Nhóm UI đầu phát hiện gợi ý trong hero không xuống dòng khi chữ 200% do kế thừa quy tắc button cũ; đã sửa, chờ chạy lại production source cuối. Secret scan 225 file không finding. Đang kiểm tra bốn cấu hình browser, chưa nhận CI/Lighthouse mới đạt hoặc đã cập nhật staging. Các tiêu chí hardware/Safari/manual/bảo mật còn mở, Final Acceptance vẫn chưa hoàn tất.

Checkpoint sau sửa reflow: lượt UI đầu 12 đạt/4 lỗi (cùng lỗi white-space ở chữ 200% trên bốn project). Bản production sau sửa đã chạy lại đúng nhóm lỗi: 4/4 đạt Chromium/Firefox/WebKit/mobile, không skip/flaky, 23,9 giây. Đã xem screenshot desktop Dark/Light và mobile/chữ 200%; đang gửi source cuối để chạy toàn bộ CI và đo Lighthouse cùng baseline trên Linux sạch. Không nhận kết quả bản trước làm nghiệm thu bản mới.

### Hồi quy source bàn lab và triển khai staging

Source **882c4d925e95d86672dd5b9469367335fe93c9d5**: [CI 42783852103](https://github.com/anhtruc1803/checkall/actions/runs/42783852103) success verify/Docker. Build đủ 106 trang, typecheck/lint/secret scan, **275 unit trên 33 file đạt; 322 E2E đạt/6 skip**, không failure/flaky, 717456,362 ms. Chromium/mobile mỗi cấu hình 82 đạt; Firefox/WebKit mỗi cấu hình 79 đạt/ba skip native policy microphone/camera/gamepad. Không coi skip là enforcement đã xác minh hoặc WebKit là Safari thật. Lượt local cuối 16/16 đạt, không skip/flaky, 101703,478 ms; lượt đầu 12 đạt/bốn lỗi reflow và lượt chạy lại riêng bốn lỗi vẫn được lưu, không bỏ lịch sử lỗi.

Docker job 81 giây (bước smoke 73 giây) đạt: image production, healthy/Nginx, 34 route/policy ba checkpoint, Node private, restart/stop-start; SIGTERM exit 143/OOMKilled false/Error rỗng. Đã đọc containers JSONL/logs/shutdown và native audio smoke ba browser (context đóng). Máy Windows không có Docker CLI, bằng chứng container là Linux CI/VPS.

[Lighthouse 42783870665](https://github.com/anhtruc1803/checkall/actions/runs/42783870665) đủ 36 lượt sạch trên cùng VM: trước source 571bd19 (code app ad25dd1), sau 882c4d9. Median trước **98/99/99/98/96/97**, sau **99/99/99/98/97/98** theo /vi, /en/screen/ppi, /vi/keyboard/tester, /en/audio/microphone, /vi/camera/preview, /en/gamepad/tester. A/BP/SEO đều 100; mọi lượt sau 97–99. FCP/LCP sau 913–929 ms, TBT median 105–196 ms; CLS tối đa theo median 0,00467. JavaScript tăng 1272 byte trên ba trang đầu, ba công cụ media/gamepad không đổi; CSS dùng chung tăng 923 byte. Font giữ nguyên, ảnh tải riêng 0 byte vì SVG inline được tính trong HTML/JS. Không nhận chênh lệch TBT/điểm nhỏ là lợi ích tốc độ do minh họa.

Đã chuyển staging sau khi CI và lab đạt: current → releases/882c4d9, tag staging-882c4d9-20261110, image VPS **sha256:9de7c5069c43af6e9e6f5f19fd5975d12e68e0546d8c758c3bfcb90fc582aa44**. Archive chỉ file Git tracked đã đối chiếu SHA256; .env ở host. App healthy/read-only/user nextjs, OOM false/Error rỗng, Node 3000 không public; Nginx syntax/startup đạt, Certbot timer active. Giữ source/image ad25dd1 và backup Nginx before-lab-20261110 để có thể phục hồi; chưa diễn tập rollback/reboot/renewal lại. Chỉ đổi release marker tại origin, không chỉnh DNS/dashboard proxy.

HTTP public lúc 16:07 Asia/Saigon: health + **34 route/policy đạt**, VI/EN 200 đúng release và có minh họa, HTTP 308→HTTPS, canonical đúng, sitemap 100 URL duy nhất. **6/6 UI E2E public** Chromium/Firefox/WebKit đạt, không skip/failure/flaky: category/filter/search/locale, tên truy cập/tương phản hai theme, pointer/keyboard/aria-pressed/reduced motion và Refresh Rate vẫn chưa đo. CSP public vẫn thiếu, người dùng tự quản lý proxy; TLS proxy→origin chưa kiểm chứng. Đang chờ Lighthouse HTTPS public source này; không dùng kết quả public source ad25dd1 để nghiệm thu bản bàn lab.

### Kết quả Lighthouse public và kết thúc milestone bàn lab

[Lighthouse HTTPS 42788047041](https://github.com/anhtruc1803/checkall/actions/runs/42788047041) hoàn tất 18 lượt sạch trên source 882c4d9: median Performance **99/99/99/99/99/99**, mọi lượt 97–99, A/BP/SEO đều 100. Public FCP median 961–1269 ms/LCP 967–1269 ms, TBT 113–128 ms, CLS 0,00025–0,00466. Benchmark public 2902–3414,5 khác VM lab, không quy chênh lệch điểm cho minh họa/proxy. Dữ liệu đầy đủ 54 lượt/median/settings/source ở qa/lab-scene-2026-11-10.json; PERFORMANCE.md ghi chi phí tăng thật của SVG/JS/CSS, không cắt nội dung hoặc font để tăng điểm. Sáu UI E2E public đạt trong 76275,86 ms.

**Đã hoàn thành và xác minh:** hero tương tác, tám minh họa, VI/EN/Dark-Light, giữ 40 công cụ/registry, chữ 200%/responsive/reduced motion và accessibility tự động, build/unit/đa browser/Docker Linux CI, deploy và smoke public, Lighthouse mobile ≥90 trong bộ mẫu. File chính mới LabScene/CategoryArt, trang chủ/interface.css/messages, interface.spec.ts; tài liệu UI-UX-REFRESH.md/PROGRESS.md/TESTING.md/DEPLOYMENT.md/PERFORMANCE.md và QA JSON. Đã push source; raw screenshot/log/trace, .env/credential vẫn bị ignore.

**Đã triển khai nhưng chưa xác minh bằng thiết bị thật:** tương tác touch/browser zoom/screen reader/Safari và toàn bộ ma trận phần cứng từ các milestone. **Chưa hoàn thành:** hai advisory moderate dev tooling, field performance và các tiêu chí bảo mật/manual đã ghi. **Không thể kiểm chứng trong lượt này:** Safari/OS/thiết bị thật và TLS proxy→origin do chưa có bằng chứng; không tự chỉnh proxy người dùng quản lý. Final Acceptance Phase 1/2 vẫn mở. Tiếp theo: anh trải nghiệm giao diện trên thiết bị thật, thực hiện manual QA tại UI-UX-REFRESH.md và ma trận hardware; không tự bắt đầu Phase 3.

## Chọn công cụ theo vấn đề — checkpoint 10/11/2026

Theo yêu cầu mới, bổ sung mục ngay dưới hero với ba dấu hiệu VI/EN: Màn hình bị giật → A05 Refresh Rate/A10 Ghosting; Phím bị lặp → B03 Key Chatter/B01 Keyboard Tester; Microphone không hoạt động → D03 Microphone/D05 Audio Spectrum. Tên/URL công cụ lấy từ published registry qua toolHref; thiếu công cụ sẽ làm build báo lỗi thay vì tạo liên kết hỏng. Không thêm công cụ hoặc thay engine/capability/permission/lifecycle.

Dùng UI/UX Pro Max và hướng dẫn focus visible; đọc tài liệu Server Components/CSS của Next.js cài trong repo. ProblemChooser là Server Component, CSS Module riêng trang chủ, sáu PolicyLink không prefetch để giữ đúng document policy và tránh tải engine khi chưa chọn. Có heading/nhãn VI-EN, mô tả phạm vi quan sát, link tối thiểu44 px, reflow và focus; không tự đo/chẩn đoán hoặc yêu cầu microphone. File chính: problem-chooser.tsx/problem-chooser.module.css, trang chủ/messages và problem-chooser.spec.ts. Workflow Lighthouse thêm tùy chọn paths, giữ mặc định sáu trang và cho phép đo thêm homepage EN trong lượt này.

Checkpoint local: build 106 trang/275 unit33 file đạt. TypeScript ban đầu bắt guard kiểm tra getUserMedia luôn có theo DOM type trong harness; đã đổi sang typeof để kiểm tra runtime đúng và typecheck/lint chạy lại đạt. Bài mới đang kiểm tra sáu link bằng Enter ở cả VI/EN, keyboard capture vẫn idle, spy không có yêu cầu getUserMedia, Axe hai theme, Tab order, 320/375/768/1024/1440 px và chữ 100/200%. Chưa nhận CI/Lighthouse source mới đạt hoặc đã cập nhật website; kết quả cuối sẽ bổ sung. Giữ đủ 40 công cụ, không thêm dependency/font/ảnh ngoài, không đóng Final Acceptance hoặc bắt đầu Phase 3.

Kiểm tra local đầu: 7/8 đạt; WebKit Windows thất bại ở thứ tự Tab vì anchor tự nhiên bị bỏ qua tới ô INPUT, trong khi Enter mở route đúng. Debug riêng xác minh Tab/Alt+Tab cùng bỏ qua link; đặt tabindex=0 rõ cho anchor thì Tab đi từ Refresh Rate sang Ghosting đúng. Đã thêm tabIndex=0 cho sáu PolicyLink mới (không dùng tabindex dương hoặc bỏ assertion). Ảnh Dark/Light/mobile/chữ200% đã xem; bổ sung icon microphone đúng cho thẻ âm thanh. Đang chạy lại production source cuối trên bốn project.

Sau sửa tabindex: nhóm mới **8/8 đạt** trên Chromium/Firefox/WebKit/mobile, không skip/failure/flaky; giữ kiểm tra thực Tab order đủ sáu link. Build 106/typecheck/lint/275 unit đạt. Audit production mới 0 finding, toàn bộ còn hai moderate dev glob/minimatch như trước. Đã xem ảnh cuối hai theme/mobile/chữ200%. Chuẩn bị gửi source cuối chạy full CI và đo 7 trang (thêm /en homepage), ba lượt/trang trên Linux sạch; chưa dùng điểm Lighthouse của source882c4d9 để nhận tính năng mới đạt.

### Lighthouse candidate và Docker

Source ca2344f: [Lighthouse 42790638550](https://github.com/anhtruc1803/checkall/actions/runs/42790638550) success, đủ 42 lượt sạch cùng VM (21 trước f6446bf/21 sau), gồm /vi, /en, /en/screen/ppi, /vi/keyboard/tester, /en/audio/microphone, /vi/camera/preview, /en/gamepad/tester. Median trước 99/100/100/100/99/99/99, sau100/100/100/100/99/99/100; mọi lượt sau99–100, A/BP/SEO100. Giữ baseline có lượt94, không chọn bỏ lượt xấu. JavaScript/font/image transfer không đổi; homepage VI/EN thêm 1468 byte CSS và1822/1788 byte document. Homepage FCP/LCP median tăng khoảng150/148 ms trong mô hình simulated; không nhận chênh lệch điểm/TBT nhỏ là tốc độ tăng nhờ section mới. CSS Module có import riêng nhưng bundler chia chunk: bốn route đầu tải 14755 byte CSS, ba route media/gamepad13292 byte; trước 13287 byte. Không mô tả CSS chỉ tải ở homepage.

Docker CI source mới đã đạt; đã đọc trạng thái healthy/private Node port, Nginx/logs/34 route/policy/restart và shutdown SIGTERM 143 không OOM/Error. Image mới trên VPS đã build riêng, chưa phục vụ, chờ toàn bộ hồi quy. Bản đang chạy 882c4d9 được giữ nguyên cho đến lúc chuyển.

### Kết quả cuối chọn công cụ theo vấn đề

Source ca2344f: [CI 42790611051](https://github.com/anhtruc1803/checkall/actions/runs/42790611051) success cả verify/Docker. Build 106 trang/typecheck/lint/secret scan, 275 unit trên 33 file và 330 E2E đạt/6 skip, không failure/flaky. Local mới 8/8 và public 6/6 đạt; giữ đủ 40 công cụ/VI-EN. Không nhận WebKit là Safari thật hoặc skip native policy là enforcement đã xác minh. E2E 762292.843 ms; Chromium/mobile 84 đạt mỗi cấu hình, Firefox/WebKit 81 đạt/ba skip mỗi cấu hình. Đã đọc JSON/log/native audio smoke/context đóng. Public 6/6 đạt trong 131672.631 ms.

Đã triển khai tag device-lab:staging-ca2344f-20261110, image sha256:3046844a77a6ef24435cdef1e4ab69aac630d5d634070ab5bfe2cc6aa186c8a1; current→releases/ca2344f, giữ 882c4d9/backup Nginx. Healthy/private Node/read-only/logs/certbot timer đạt. Public VI/EN 200/canonical/sitemap100 URL/health+34 route/policy đạt. [Lighthouse public](https://github.com/anhtruc1803/checkall/actions/runs/42794779483) đủ 21 lượt sạch, median 98/99/99/99/99/98/98, A/BP/SEO100; lab 42 lượt đủ 7 trang. QA JSON lưu 63 lượt/settings/median cùng hồi quy. Không sửa proxy của người dùng; CSP public/TLS proxy→origin vẫn chưa đóng, không chạy lại renewal/reboot/diễn tập rollback.

**Đã hoàn thành và xác minh:** ba lối vào vấn đề/sáu công cụ registry, VI-EN/Dark-Light, link/focus/tabindex0/reflow/a11y tự động, build/unit/E2E đa browser/Docker CI, deploy/smoke và Performance≥90 trong bộ mẫu. File mới ProblemChooser/CSS Module, problem-chooser.spec.ts; page/messages, performance workflow/runner; docs PROGRESS/TESTING/PERFORMANCE/DEPLOYMENT/UI-UX-REFRESH và qa/problems-2026-11-10.json. Không commit .env/secret/cache/raw artifact.

**Đã triển khai nhưng chưa xác minh thực tế:** Safari/thiết bị/screen reader/OS zoom và ma trận hardware/quyền thật. **Chưa hoàn thành:** hai moderate dev advisory, field data và các tiêu chí manual/bảo mật đã ghi. **Không thể kiểm chứng trong lượt này:** Safari/OS/thiết bị thật và TLS proxy→origin. Final Acceptance Phase 1/2 vẫn mở. Tiếp theo: trải nghiệm/QA phần cứng và quyền thực theo UI-UX-REFRESH.md; không tự bắt đầu Phase 3.

## Rà soát và phát triển B01–B05 — 11/11/2026

Đã kiểm tra code/hook/layout/registry/privacy/lifecycle của năm công cụ. Đề xuất và thực hiện: coverage theo layout, sơ đồ đọc được/cuộn có focus, tổ hợp rollover cực đại, Chatter cộng dồn tách log 200 sự kiện và ngắt cặp qua gián đoạn, đồng hồ chỉ B04, cờ event thực/lọc và xóa log riêng. Giữ 40 công cụ/VI-EN, không thêm Phase 3; chi tiết kỹ thuật/giới hạn và manual QA tại KEYBOARD-IMPROVEMENTS.md.

Checkpoint: build 106 trang/288 unit34 file đạt; nhóm thuật toán/lifecycle sau thêm privacy đạt31/31. Chromium đầu 6 E2E đạt/một lỗi field layout co xuống8 px ở chữ 200%, đã sửa reflow và giữ assertion. Nhóm bốn project trên snapshot trước sơ đồ cuộn28/28 đạt, không skip/flaky. Đang chạy lại source cuối sau thay đổi sơ đồ cuộn, raw flags và code rỗng; chưa nhận CI/Lighthouse/deploy đã hoàn tất cho source mới. Không dùng kết quả website ca2344f cũ thay thế.

Phát hiện bổ sung qua Chromium native input: sau click Exit, data-active vẫn true do blur đổi cùng nút thành Activate trước click hoàn tất. Đã tách nút Kích hoạt/Thoát có nhãn và handler cố định, disable theo trạng thái; thêm regression blur→click và tăng assertion E2E cũ để yêu cầu capture=false. Không nới kiểm tra. Lượt local28 đang chạy trước sửa này chỉ là checkpoint, chưa nhận source cuối nghiệm thu.

Checkpoint source cuối: typecheck/lint, build 106 trang và 292 unit/integration trên 34 file đạt. Nhóm keyboard cuối 28/28 đạt Chromium/Firefox/WebKit/mobile, không skip/failure/flaky, gồm native Stop không tái kích hoạt, sơ đồ cuộn bằng bàn phím, click keycap không tạo kết quả, IME fixture/unknown code, phiên Chatter dài và Axe/reflow chữ 200% cả5 tool VI/EN. Audit production0 finding, toàn bộ vẫn hai moderate dev glob/minimatch. Source được giữ nguyên để gửi full CI/Lighthouse; chưa triển khai source mới hoặc đóng Final Acceptance.

Snapshot7b067ba đã gửi CI/Lighthouse và build image riêng nhưng chưa phục vụ. Khi rà câu chữ, thông báo code thiếu/IME chung có nhắc log dù B01/B02/B04 không bật log. Đã rút thông báo thành mô tả loại trừ thống kê, không đổi engine. Hủy run đang dở và đo/kiểm tra lại source có copy cuối; không nhận các run bị hủy là full CI hoặc performance đã đạt.

Lighthouse candidate db864dd đã hoàn tất42 lượt sạch: Performance 99–100, nhưng Accessibility chỉ98–99 ở rollover/chatter/hold/events do h3 nhảy cấp từ h1. Chatter/Hold/Events đã có lỗi này trong baseline; Rollover mới lộ lỗi ở phần bổ sung. Axe với WCAG tags không bao gồm rule best-practice heading-order. Đã sửa các heading section thànhh2, giữ kích thước trình bày, thêm assertion heading-order toàn trang; không giảm kiểm tra. Không đưa image db864dd vào phục vụ; đang kiểm chứng source sửa heading trước lần đo cuối.

Sau sửa heading: bài Chromium đầy đủ cả5 tool/VI-EN/Dark-Light, WCAG và heading-order toàn trang, reflow/reduced motion/chữ 200% đạt1/1 (59,8 giây); nhóm thuật toán/lifecycle33/33 và build 106/typecheck/lint đạt. Chuẩn bị gửi revision heading cuối; CI source db chưa kết thúc nên sẽ hủy thay vì nhận nó là source nghiệm thu.

## Nghiệm thu phần mềm source 4e26811

[CI 42983550339](https://github.com/anhtruc1803/checkall/actions/runs/42983550339) success cả verify/Docker. Build 106 trang/typecheck/lint/secret scan, **292 unit trên 34 file và 346 E2E đạt/6 skip**, không failure/flaky. Chromium/mobile 88 đạt mỗi cấu hình; Firefox/WebKit 85 đạt/ba skip native microphone/camera/gamepad policy mỗi cấu hình. E2E 941394.031 ms. Đã đọc log/JSON, giữ đủ 40 công cụ/80 route công cụ/100 URL nội dung; bộ kiểm thử không bị giảm. Local chức năng28 ở snapshot db và bốn bài accessibility toàn nhóm ở source 4e đều đạt; full CI là bằng chứng source cuối. Public keyboard **18/18 đạt** trên Chromium/Firefox/WebKit, không skip/failure/flaky, 61862.528 ms. Không coi WebKit là Safari thực tế hoặc skip native policy là enforcement đã xác minh.

Lighthouse cuối 42 lượt so sánh cùng VM/21 lượt HTTPS public: lab 99/100/100/99/100/99/100, public 97/95/97/97/95/97/97, A/BP/SEO 100. Candidate db trước sửa heading có Performance 99–100 nhưng A98–99; chỉ dùng nó làm bằng chứng tìm lỗi, không thay số đo nghiệm thu. Byte/CPU/metric thực và 63 lượt của bộ cuối ở PERFORMANCE.md/qa/keyboard-2026-11-11.json; không nhận giảm CPU định lượng hoặc mọi trạng thái hardware đã được benchmark.

Đã triển khai device-lab:staging-4e26811-20261111, image sha256:8beca3e61a465ffd72bcf0921c880f9db284fb4ab9b8cfc01706e68d8100e458; current→releases/4e26811, giữ ca2344f/backup Nginx. Healthy/private Node/read-only/logs/Certbot timer, public VI-EN/canonical/sitemap 100/health+34 route/policy và 10 route keyboard đạt. Không đổi DNS/proxy, prune/reboot, renewal lại hoặc diễn tập rollback. CSP public vẫn thiếu trên VI/EN; người dùng tự quản lý proxy, TLS proxy→origin chưa kiểm chứng.

**Đã hoàn thành và xác minh:** sửa Stop race, coverage/sơ đồ/rollover/Chatter cộng dồn/IME/flags/event filter, timer/cleanup/privacy component, build/unit/E2E đa browser/a11y tự động, Docker CI, deploy/smoke và Performance≥90 trong bộ mẫu. File chính tại KEYBOARD-IMPROVEMENTS.md; đã cập nhật PROGRESS/TESTING/PERFORMANCE/DEPLOYMENT và QA JSON. Không commit .env/secret/raw artifacts.

**Đã triển khai nhưng chưa xác minh bằng thiết bị thật:** Fn/shortcut/IME/lock keys/layout thực, NKRO/chatter/hold của bàn phím USB-Bluetooth, Safari/OS/screen reader. **Chưa hoàn thành:** field performance, hai moderate dev advisory và các tiêu chí manual/bảo mật đã ghi. **Không thể kiểm chứng trong lượt này:** phần cứng thật/Safari/OS và TLS proxy→origin. Final Acceptance Phase 1/2 tiếp tục mở. Tiếp theo: ma trận phần cứng/IME/keyboard navigation thật; chỉ mở rộng JIS/mapping khi có bằng chứng, không tự bắt đầu Phase 3.

## Sửa lỗi D/Backspace với UniKey/EVKey — đang kiểm chứng, 11/11/2026

Đã rà ảnh và xác nhận người dùng bật UniKey/EVKey tiếng Việt. Sửa nhận sự kiện để dừng và loại aggregate của lượt kích hoạt bị IME/unknown can thiệp, giữ các lượt trước; không đoán D từ dữ liệu thiếu và không bỏ qua Backspace thật. Thêm checkpoint Chatter độc lập; cleanup Hold/capture; raw keyCode chẩn đoán trong Inspector; hướng dẫn, cảnh báo, legend VI/EN; sửa focus/hint chồng nhau. Chi tiết và giới hạn tại KEYBOARD-IMPROVEMENTS.md. Giữ40 công cụ, không đổi Registry/kiến trúc/dependency.

Đã chạy typecheck/lint/secret scan (0 finding), build106 trang và toàn bộ303 unit ở checkpoint trước hai regression bổ sung; nhóm bàn phím cuối32/32 đạt. E2E đầu vướng selector alert trùng Next.js route announcer, đã scope lại cảnh báo và chạy lại. Chưa nhận CI/full E2E/Lighthouse/deploy của bản sửa là hoàn tất. Chưa có manual QA UniKey/EVKey thực tế; Final Acceptance vẫn mở.

Bổ sung kiểm tra: native input D lặp và Backspace thật hoạt động đúng trên Chromium; fixture rollback và IME229 đạt ở cả browser được chạy. Phát hiện Firefox không luôn áp dụng :focus-visible sau kích hoạt bằng chuột; đã đổi riêng vùng thu sang :focus để giữ chỉ báo focus nhất quán, không bỏ assertion. Bài VI/EN có bốn lượt Axe được cấp timeout90 giây, giữ nguyên toàn bộ kiểm tra. Đang build lại và chạy bộ cuối; các checkpoint thất bại/timeout không được nhận là nghiệm thu.

Checkpoint bản sửa cuối: build106 trang/typecheck/lint/Prettier/secret scan đạt; toàn bộ305 unit trên34 file và nhóm bàn phím32/32 đạt. Hai bài regression mới × Chromium/Firefox/WebKit/mobile đạt8/8 sau sửa focus Firefox, không skip. Bao gồm D ba lần, Backspace thật, rollback Backspace trước unknown, IME229 không isComposing, loại22 Backspace sau dừng, retry, Axe cảnh báo VI/EN Dark/Light và hình học focus/hint. Raw JSON giữ tại artifacts (không commit). Chưa dùng kết quả này thay thế full CI/Lighthouse/public QA.

## Kết quả bản sửa 3191485 trên CI và website — 11/11/2026

Đã push source 3191485048bc024c00376db258f5b939b426e39a. CI 42991483325 success: build 106/typecheck/lint/secret scan, 305 unit trên 34 file, 354 E2E pass/6 skip, không failure/flaky; Docker smoke đạt. Local bàn phím 36/36, public 24/24 ba browser đạt; VI/EN, Dark/Light, responsive/chữ 200%, cảnh báo IME, D lặp/Backspace thật, raw flags và rollback đầy đủ. Firefox/WebKit mỗi cấu hình 3 skip native permission-policy vẫn là chưa kiểm chứng, WebKit không phải Safari thật.

Lighthouse lab 42991541981 đủ 18 lượt, baseline 097da5e→3191485 median 97/98/99 giữ nguyên; A/BP/SEO 100. Đã triển khai image 9db253df/current→3191485, giữ 4e26811/backup Nginx. Healthy/private Node/read-only/user nextjs/logs/HTTP/policy/canonical/sitemap 100 đạt, không đổi DNS/proxy. Public CSP vẫn thiếu, TLS proxy→origin chưa xác minh.

Đã chốt Lighthouse public 42994636551: 9 lượt sạch, median 95/96/95, mọi lượt 93–96, A/BP/SEO 100. QA JSON tại qa/keyboard-input-method-2026-11-11.json giữ 27 phép đo và bằng chứng CI/local/public/Docker/deploy; đã cập nhật PROGRESS/TESTING/PERFORMANCE/DEPLOYMENT/KEYBOARD-IMPROVEMENTS. Không coi fixture là xác minh UniKey/EVKey thật, không kết luận switch hỏng hoặc khôi phục được D bị bộ gõ chặn. Final Acceptance tiếp tục mở; tiếp theo manual QA bộ gõ/keyboard/Safari/screen reader.

**Đã hoàn thành và xác minh:** nhận tín hiệu IME/unknown, dừng và rollback lượt nhiễu, giữ lượt trước, không đổi D từ code thiếu; Backspace thật/repeat/Chatter/Hold/rollover, UI/focus VI/EN, kiểm thử phần mềm đa browser/a11y/responsive/privacy, build 106, CI/Docker/deploy/public và Performance ≥90 trong bộ mẫu.

**Đã triển khai nhưng chưa xác minh thực tế:** cơ chế bảo vệ khi dùng các phiên bản UniKey/EVKey/OS của người dùng; chưa kiểm thử trên bộ gõ thật. **Chưa hoàn thành:** manual QA/field performance và các tiêu chí Final Acceptance đang mở. **Không thể kiểm chứng trong lượt này:** bàn phím vật lý/Safari thật/screen reader/OS zoom, lớp nhập liệu chỉ phát Backspace thường không có tín hiệu khác, TLS proxy→origin. Không kết luận lỗi phần cứng hoặc tự chứng nhận Phase 1/2 hoàn tất.

Tiếp theo: người dùng chuyển UniKey/EVKey từ V sang E, tải lại trang và kiểm tra D/Backspace trên keyboard thật; ghi phiên bản nếu còn bất thường. Không tự thay cấu hình bộ gõ/OS của người dùng.

## Khảo sát D với EVKey V + Telex — 12/11/2026

Chỉ khảo sát local theo yêu cầu, không thay engine/UI/Registry/dependency, không push/SSH/deploy. Source ứng dụng giữ nguyên 97fd2eb. Đã đọc cấu hình EVKey x64 6.0.4.0/Unicode/Telex, Windows 10 Pro 10.0.19045 và Edge 157.0.4341.42. Lượt tự động Windows đổi dd→đ nhưng code của D rỗng nên tách khỏi bằng chứng phím vật lý. Computer Use từng chặn đọc vì URL không đủ tin cậy; đã dừng thao tác. Sau khi người dùng báo Xong, lượt đọc mới xác minh lại đúng cửa sổ/URL localhost và dữ liệu hai lượt bằng tay.

Vùng capture giống website: 22 sự kiện, KeyD down 1/up 3; textarea: 141 sự kiện, KeyD down 2/up 7. Có 2/5 keyup D không ghép được down trước đó và 2/6 keyup D tới sau unknown đầu tiên; không có composition/isComposing=true, sự kiện bàn phím đều isTrusted=true. Có Unicode keyCode 231 và Backspace; người dùng xác nhận thao tác thêm, log textarea có Space và repeat Backspace. Không coi 3/7 up là số lần nhấn vật lý đã đối chứng hoặc mọi Backspace là do EVKey.

**Đã xác minh trong hai mẫu:** keyup KeyD có thể còn tới sau khi down tương ứng bị mất; có cơ sở cho nhận diện D qua sự kiện thả riêng. **Chưa triển khai:** chế độ tương thích và mọi thay đổi website. **Chưa xác minh:** độ đúng số lần nhấn vật lý, hold/rollover/chatter cho các cặp thiếu down, phiên bản/browser/layout khác. Không tạo down hoặc thời gian phần cứng giả; Final Acceptance vẫn mở.

File tài liệu: KEYBOARD-IME-SURVEY.md và qa/keyboard-ime-survey-2026-11-12.json chỉ chứa tóm tắt; probe/trace dữ liệu D/đ/Space/Backspace trong artifacts bị ignore, không upload hoặc thêm vào lịch sử sản phẩm. Đã chạy analyzer/assertions, typecheck, lint và 32/32 kiểm thử bàn phím (hai file), đều đạt. Không chạy build/full E2E/Lighthouse/Docker mới vì không thay mã ứng dụng; không nhận chế độ tương thích đã được kiểm thử hoặc Performance của nó đã đạt. Đã dừng vùng thu, đóng browser probe riêng và server localhost sau khi lưu bằng chứng có giới hạn.

Tiếp theo nếu triển khai: opt-in trạng thái nhận qua keyup tách khỏi phép đo chính xác; kiểm tra với số lần nhấn biết trước/giữ D/modifier/mất focus và nhiều browser. Giữ bảo vệ thống kê và local privacy hiện có; không tự triển khai lên website.

## Triển khai local chế độ EVKey keyup cho B01 — 12/11/2026

Đã thêm opt-in mặc định tắt, riêng B01 và mã chữ KeyA–KeyZ. Hook use-keyboard-release chỉ giữ tập mã/cờ tín hiệu nhập liệu; không press/repeat/hold/rollover/chatter, timestamp, raw log, storage hoặc upload. Bỏ Backspace/số/modifier và tín hiệu thiếu code/Unidentified/composition/Process/229/231/repeat. Tiếp tục chờ keyup hợp lệ sau nhiễu; có lifecycle Stop/Tab/Esc/blur/hidden/unmount. Không sửa use-keyboard/keyboard-chatter, Registry, dependency hoặc hạ tầng; giữ 40 công cụ.

UI VI/EN: checkbox có label/helper và cảnh báo đổi mode xóa phiên; tiến độ theo 26 mã chữ khác nhau, badge nguồn↑/viền đứt, không badge số lần nhấn hoặc thẻ đo giả 0. Hai luồng được nối handler riêng; workspace key theo toolId tránh trạng thái rò sang B02–B05. File chính: use-keyboard-release.ts, keyboard.tsx/CSS, messages VI/EN, tests/keyboard-release.test.tsx và E2E keyboard-release.spec.ts; tài liệu KEYBOARD-EVKEY-COMPATIBILITY/TESTING/PERFORMANCE/DEPLOYMENT và QA JSON. Báo cáo khảo sát trước được giữ nguyên, thêm chú thích lịch sử.

Typecheck/lint/build 106 đạt, 328 unit trên 35 file đạt (bàn phím 55/55). Targeted E2E mới 12/12, full nhóm bàn phím 48/48 trên Chromium/Firefox/WebKit/mobile, không skip/fail. Đủ VI/EN/Dark-Light/a11y/heading-order/reflow 320–1440/chữ 200%, Reset/mode/layout/exit/privacy và tách phép đo. Replay hai trace khảo sát 6/6 ba browser đạt, không phải live hardware mới. HTTP smoke health+34 route/policy đạt; ảnh Light/mobile đã xem.

Full local 372 bài: 345 pass/18 skip/9 fail, không flaky. Sáu failure camera/gamepad no-upload do assertion thấy POST Kaspersky; control HTML trắng không mã ứng dụng cũng có script/POST vendor. Ba failure khác ở đóng context Firefox; lượt chẩn đoán riêng 2 pass/1 skip không tái hiện, không xóa failure full suite hoặc kết luận nguyên nhân gốc. Native audio Chromium/Firefox pass, Windows WebKit thiếu AudioContext;18 skip theo điều kiện có sẵn, không coi là native API đã xác minh. Không đổi assertion/skip/retry cũ hoặc tắt phần mềm bảo vệ.

Lighthouse preset 3 lượt×3 trang nhưng dừng ở lượt 1 vì clean=false, không có median sạch hoặc chứng minh ≥90; không dùng điểm nhiễu 71 hay số đo source cũ để nghiệm thu. WSL unavailable/disabled, không đổi hệ thống hoặc push CI. Fingerprint source/test giữ nguyên trong lúc E2E, tại qa/keyboard-release-local-2026-11-12.json; đây là working tree trên nền 97fd2eb, không phải commit mới.

**Đã triển khai và xác minh phần mềm:** chế độ nhận A–Z qua keyup, unique code, source hiển thị rõ, tách thống kê, không đánh dấu Backspace, opt-in/reset/lifecycle/VI-EN/a11y và hồi quy bàn phím. **Chưa xác minh:** UI bản mới bằng phím thật/EVKey mọi phiên bản, các phím ngoài D/bộ gõ/browser khác, screen reader/Safari thật. **Chưa hoàn tất:** full suite sạch, native media bị skip và Performance sạch. Final Acceptance vẫn mở.

Preview production bind 127.0.0.1:3100 giữ cho người dùng review, manual feedback đang chờ; không coi thời gian chờ là xác nhận. Chưa commit/push/SSH/deploy hoặc cập nhật website. Tiếp theo: kiểm tra sạch trước khi đề xuất triển khai, giữ tách nhận diện keyup khỏi phép đo chính xác và raw dữ liệu local.

Kiểm tra cuối: source ứng dụng giữ nguyên theo fingerprint từ trước E2E. Prettier chuẩn hóa một file E2E sau QA; TypeScript parser xác nhận AST tương đương. Giữ fingerprint tested/final riêng trong QA JSON; ESLint và Prettier file cuối đạt. Preview 3100 healthy, có mode ở VI/EN B01 và không có ở Chatter.

## Cảnh báo dd khi thử Keyboard Tester — local 12/11/2026

Theo phản hồi người dùng, đã thêm lưu ý **dd → đ** luôn hiển thị cạnh lựa chọn EVKey. Nếu browser nhận hai keyup KeyD liên tiếp đủ điều kiện trong B01 active, hiện lời nhắc VI/EN theo chế độ. Không suy đoán số lần nhấn vật lý, không tự nhận diện EVKey, không chuyển đ/Backspace thành D. Hướng dẫn cố định vẫn có khi bộ gõ chặn mất sự kiện nên detector không thể hiện nhắc. Cờ nhắc chỉ phục vụ UI, không tham gia press/hold/rollover/Chatter, log, storage hoặc upload; không đổi engine thường/tương thích hay Registry/40 công cụ.

File mới `src/features/keyboard/use-keyboard-d-warning.ts`; sửa keyboard.tsx/CSS, messages VI/EN và hai file unit/E2E keyboard-release. Đã cập nhật KEYBOARD-EVKEY-COMPATIBILITY/TESTING/PERFORMANCE/DEPLOYMENT và qa/keyboard-dd-warning-local-2026-11-12.json với fingerprint tám file + BUILD_ID; checkpoint trước giữ nguyên.

**Đã hoàn thành và xác minh local:** typecheck/lint/Prettier/secret scan, build106, 333 unit/35 file; nhóm release28/28. Hồi quy keyboard **52/52 E2E** trên Chromium/Firefox/WebKit/mobile Chromium, mỗi cấu hình13 pass, không skip/fail/flaky/global error, 321097.852 ms. Bài cảnh báo mới có VI/EN/Dark-Light/WCAG/reflow 320/chữ200%; giữ toàn bộ bài B01–B05/heading-order/cleanup/IME/metrics trước đó. HTTP health+34 route/policy đạt, đã xem ảnh mobile Light/Dark. Preview production build đã khởi động lại, chỉ bind127.0.0.1:3100.

**Đã triển khai nhưng chưa xác minh bằng bộ gõ thật:** lời nhắc/UI mới trên EVKey V+Telex; browser có thể không cung cấp hai D để phát hiện tự động. **Chưa hoàn thành:** manual QA, Lighthouse sạch và các tiêu chí nghiệm thu rộng đang mở. **Không thể kiểm chứng trong lượt này:** Safari thật/phần cứng/screen reader và Performance≥90 trong môi trường bị chèn script; không dùng điểm public trước thay thế. Không chạy lại full E2E toàn website cho phần cảnh báo nhỏ này, không xóa kết quả full trước 345pass/18skip/9fail. Không push/commit/SSH/deploy hoặc cập nhật website. Tiếp theo: người dùng review local và xác minh EVKey thật; cần môi trường sạch trước nghiệm thu rộng. Final Acceptance vẫn mở.

## Rà soát và tinh gọn toàn bộ nội dung website — local 12/11/2026

Người dùng xác nhận bản EVKey/dd local trước ổn và yêu cầu bỏ thông tin dư thừa/không liên quan. Đã rà trang chủ, danh mục, 40 công cụ/80 route VI/EN, quyền riêng tư và lỗi; rút gọn 170 trường registry/87 thông báo mỗi ngôn ngữ. Bỏ FAQ lặp, badge không cần quyền và mã nội bộ ở thẻ; lịch sử dùng tên công cụ VI/EN/fallback an toàn. Giữ hướng dẫn/giới hạn/SEO, xin quyền trước Bắt đầu, âm lượng thấp, dd/keyup tách phép đo và lưu opt-in. Không đổi engine, route, capability, permission hay dependency; đối chiếu AST/placeholder/hash xác minh phạm vi.

File chính: tool page, registry/phase2-milestone2–6, messages VI/EN, privacy page/PrivacySettings, ToolCard, globals.css/keyboard.css; thêm tests/e2e/user-content.spec.ts. Sửa reflow nút xóa dữ liệu và câu cảnh báo dd ở 320 px/chữ 200%, giữ assertion. Test cũ chỉ cập nhật selector câu chữ. Tài liệu: CONTENT-REVIEW/TESTING/PERFORMANCE/DEPLOYMENT và qa/content-review-local-2026-11-12.json.

**Đã hoàn thành và xác minh local:** typecheck/lint/Prettier/secret scan, build 106 trang, 333 unit trên 35 file; full 384 E2E **359 pass/19 skip/6 fail**, flaky 0, global error 0; 1.532.870,849 ms. Nhóm nội dung 8/8 và bàn phím 52/52 đạt trên Chromium/Firefox/WebKit/mobile. HTTP health+34 route/policy và ảnh Light/Dark/mobile/chữ 200% đạt. Source giữ nguyên trong full run, fingerprint 24 file+BUILD_ID ở QA JSON.

**Chưa hoàn thành:** full gate chưa đạt do Request từ script Kaspersky chèn ngoài ứng dụng; các skip native API chưa kiểm chứng. Control HTML trắng vẫn có script/POST Kaspersky, không tắt bảo vệ hoặc lọc request để lấy pass. **Chưa xác minh trong môi trường hiện tại:** Lighthouse sạch/mobile≥90, Safari/thiết bị/bộ gõ thật/screen reader và các tiêu chí Final Acceptance đang mở. Không dùng source public cũ thay dữ liệu mới. Phản hồi người dùng chấp nhận preview trước không được gán cho mọi phần cứng hoặc bản tinh gọn chưa duyệt.

Preview production chỉ bind 127.0.0.1:3100 để review. Chưa commit/push/CI từ xa/SSH/deploy hoặc cập nhật website. Tiếp theo: người dùng review nội dung local, xác minh môi trường sạch và manual QA trước nghiệm thu rộng; không tự mở Phase 3. Final Acceptance vẫn mở.

## Triển khai EVKey/dd và nội dung VI/EN — 16/11/2026

Người dùng yêu cầu triển khai lên web; đã commit/push 57a5de2 gồm chế độ EVKey keyup B01, cảnh báo dd và nội dung đã duyệt, giữ 40 công cụ. Source **57a5de29307418c9d060f50e7e1e527bb1626eba**, [CI 43804594079](https://github.com/anhtruc1803/checkall/actions/runs/43804594079) success verify/Docker. Typecheck/lint/secret scan, build 106 trang, 333 unit trên 35 file đạt; full **378 E2E đạt/6 skip**, không fail/flaky/global error, 774.698,232 ms. Không đổi assertion/retry hoặc nhận skip là xác minh quyền native. [Lighthouse lab 43804641819](https://github.com/anhtruc1803/checkall/actions/runs/43804641819) đủ 48 lượt sạch và [public 43807789325](https://github.com/anhtruc1803/checkall/actions/runs/43807789325) đủ 24 lượt sạch; tám trang, ba lượt/trang/nguồn.

Đã chuyển VPS sang device-lab:staging-57a5de2-20261116, image sha256:18ae5b5a3840fdc737f92334ba9cff9ee387cb03b7c8e0e1615cae4e9bc16131, current→/opt/device-lab/releases/57a5de2. Giữ 3191485/backup Nginx; thử candidate cô lập trước khi chuyển. Lần đầu tự rollback do header/body chưa đồng bộ sau reload, xác minh old healthy; lần sau đợi đúng marker có giới hạn rồi chuyển thành công. Không sửa DNS/proxy/routing/quyền, prune/reboot hoặc renewal lại. Runtime nonroot/read-only/Node nội bộ/healthy/OOMKilled=false, Nginx có 9 sự kiện rate limit trong khoảng chạy QA public, không nới giới hạn, Certbot timer active.

Public VI/EN/HTTPS/canonical/sitemap 100/health+34 route/policy đạt. Public 32 bài có 31 pass/1 lỗi truyền kết nối WebKit trước assertion EN; giữ failure, chạy lại riêng 3/3 đạt, không hạ test. Lab median 98–100/public 94–97 trên 8 trang × 3 lượt; giữ toàn bộ 72 số đo. Không nhận WebKit là Safari hoặc backend ảo là hardware thật.

File chính đã phát hành: keyboard hooks/UI/CSS, messages VI/EN, registry copy, tool/privacy page, ToolCard/PrivacySettings và regression tests. Đã cập nhật PROGRESS/TESTING/PERFORMANCE/DEPLOYMENT và qa/deployment-content-2026-11-16.json; raw artifacts/logs/.env/secret không commit. **Đã hoàn thành và xác minh:** phần mềm CI, Docker, triển khai/HTTP và bộ Performance đại diện. **Chưa hoàn thành/chưa xác minh:** CSP public bị proxy bỏ dù origin có, chế độ TLS proxy→origin, manual hardware/EVKey mọi phiên bản/Safari/screen reader/field data. Người dùng quản lý proxy; không tự sửa. Tiếp theo review thiết bị thật/các tiêu chí mở; Final Acceptance vẫn mở.

## Tiện ích — Milestone 1, local 19/11/2026

Theo yêu cầu chỉ làm local để người dùng duyệt: đã thêm nhóm **Kiểm tra thiết bị / Tiện ích hằng ngày**, category utilities, U01 số/số tiền VND thành chữ và U02 tính phần trăm. Tổng 42 công cụ; đối chiếu metadata 40 công cụ gốc với committed HEAD ab82abf khớp hoàn toàn, giữ 21 Phase 1/19 Phase 2, toàn bộ engine/quyền/route cũ. `phase: null` dành cho nhánh tiện ích riêng, không triển khai Phase 3 thiết bị. VI/EN đầy đủ; ngôn ngữ kết quả U01 tách khỏi giao diện và định dạng nhập. Dùng chuỗi/BigInt giữ độ chính xác, giới hạn đầu vào, không đoán dấu phân cách, không làm tròn phần lẻ VND, năm phép phần trăm với quy tắc làm tròn rõ. Không lưu/upload số liệu, không xin quyền thiết bị; copy chỉ theo thao tác.

**File chính:** `src/lib/tools/{groups,utilities,types,registry}.ts`, `src/lib/utilities/{decimal,number-words}.ts`, `src/features/utilities/`, Catalog/icon/art/ToolRunner, messages VI/EN và privacy page. Thêm bốn file unit, `tests/e2e/utilities.spec.ts`, fixture metadata 40 công cụ; cập nhật các tổng số/search label trong test tổng thể, smoke HTTP mở rộng health + 40 route/policy. Tài liệu: UTILITIES-MILESTONE-1/ARCHITECTURE/TESTING/PERFORMANCE/DEPLOYMENT/README và [qa/utilities-milestone1-local-2026-11-19.json](qa/utilities-milestone1-local-2026-11-19.json). QA JSON giữ dữ liệu thật, danh sách fail/skip, 189 fingerprint tested/final và BUILD_ID `yU_4PHC86m2i-ZXVA4Lcr`; sau full run chỉ format E2E/fixture với AST/JSON tương đương. Không commit raw trace, report, cache hoặc secret.

**Đã hoàn thành và xác minh local:** typecheck/lint/Prettier/secret scan, build 112 trang, sitemap 106 URL nội dung, **460/460 unit trên 39 file** (128.314,84 ms), 11/11 i18n/UI sau chỉnh nhãn và 2/2 Registry sau format fixture. Full **408 E2E: 380 đạt/19 skip/9 fail**, flaky 0/global error 0, 1.463.932,291 ms. Chromium 99/0/3, Firefox 96/3/3, WebKit 86/16/0, mobile 99/0/3 (đạt/skip/fail). Nhóm tiện ích 21/24 (3 fail đều no-upload), hồi quy bàn phím **52/52**. Chức năng/VI-EN/precision/clipboard fixture/WCAG AA Dark-Light/reflow 320px/chữ 200% đạt, đã xem ảnh mobile và desktop. HTTP/policy đạt; graph request thực xác minh homepage/keyboard không tải hai file JS tiện ích, mỗi tiện ích chỉ tải engine tương ứng.

Build đầu bị chặn SecurityFatalError; audit xác nhận hai advisory Next.js moderate nên đã vá **Next.js/eslint-config-next 16.4.3 → 16.4.6** và cập nhật lockfile. Audit production sau vá 0 advisory, audit toàn bộ còn 2 moderate dev tooling glob/minimatch; không ép major override hoặc nhận toàn bộ dependency sạch. Một lượt build sau đó gặp EBUSY vì preview giữ `.next/standalone`; đã dừng đúng tiến trình preview, build lại thành công và khởi động lại loopback. Không đổi cấu hình build/guard để lấy pass.

**Đã triển khai nhưng chưa xác minh đầy đủ:** người dùng duyệt local, Clipboard/quyền hệ thống và bàn phím số điện thoại thật, quy cách đọc tiền của chứng từ, Docker/Linux CI của candidate. Không dùng automation fixture thay phần cứng thật.

**Chưa hoàn thành:** full release gate sạch, 19 native skip, 9 assertion không upload bị POST từ Kaspersky chèn ngoài ứng dụng (camera/gamepad/tiện ích trên Chromium/Firefox/mobile), Lighthouse sạch ba lượt/trang và xử lý 2 moderate dev tooling. Giữ nguyên assertion/retry/timeout; control HTML trắng mới vẫn có script/POST dù không có mã app hoặc nhập dữ liệu. Lighthouse lập lịch 6 trang × 3, dừng ở lượt đầu bị chèn: Performance 84, A11y 100, Best Practices 81, SEO 92, FCP/LCP 2.843,139 ms, TBT 303 ms, CLS 0, JS 385.064 byte, font 56.135, ảnh 0, document 84.857, CSS 16.552. Đây là mẫu **bị loại**, không phải median hoặc baseline sạch. Local HTTP/canonical localhost:3000 khác preview cũng không đại diện HTTPS production; không loại tính năng/nội dung/a11y để tăng điểm.

**Không thể kiểm chứng trong môi trường hiện tại:** median mobile ≥90 trên candidate, môi trường Chromium/Firefox không bị chèn, Docker Engine local (không có CLI/Engine dùng được), Safari/screen reader/thiết bị/bộ gõ thật trong lượt này. Docker smoke CI đã có, HTTP scope mới được bổ sung nhưng chưa chạy CI/image candidate; quy trình Linux ở DEPLOYMENT. Không nhận WebKit Windows tương đương Safari.

Preview production healthy chỉ bind **127.0.0.1:3100**, route `/vi/utilities/number-to-words` và `/vi/utilities/percentage` (có EN). **Đủ để review local; chưa nghiệm thu phát hành/Final Acceptance**. Chưa commit/push/CI từ xa/SSH/deploy, không cập nhật website hoặc proxy. Tiếp theo: người dùng review local; hoàn tất QA sạch/Linux/Docker/Lighthouse và manual QA trước khi được phép phát hành.

## Tiện ích Milestone 1 — chuẩn bị phát hành 19/11/2026

Người dùng đã duyệt bản local và yêu cầu push GitHub/triển khai, với điều kiện QA môi trường sạch và Lighthouse trước khi cập nhật. Đã kiểm tra 189 fingerprint cuối khớp candidate được duyệt, working tree chỉ chứa phạm vi milestone, remote main không có thay đổi mới và secret scan 268 file không có phát hiện. Bắt đầu commit/push để chạy Linux CI và Docker smoke; website chưa được cập nhật ở checkpoint này. Chỉ chuyển release sau khi xem bằng chứng kiểm thử sạch và ba lượt Lighthouse/trang đại diện, giữ đường rollback và 40 công cụ gốc. Các kết quả local Windows trước đây vẫn là lịch sử, không bị thay bằng kết quả CI chưa chạy.
