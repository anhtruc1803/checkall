# Phase 2 — Milestone 2: thông tin thiết bị và tác vụ pointer

Ngày thực hiện: 30/10/2026. Phạm vi gồm tám công cụ, giữ nguyên 21 chức năng Phase 1 và không triển khai audio, camera, gamepad hoặc Phase 3.

## Công cụ được triển khai

| ID  | Route sau locale            | Chức năng thực tế                                                                                                    |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| G01 | device/information          | Snapshot navigator/screen/window sau thao tác người dùng; ngôn ngữ, viewport/DPR, các gợi ý tài nguyên và User-Agent |
| G02 | browser/compatibility       | Feature detection và đọc policy media khi browser có API, không hỏi cấp quyền                                        |
| G03 | device/gpu                  | Tạo WebGL 2/1 context theo yêu cầu, đọc thông tin context và giải phóng; opt-in riêng cho renderer chi tiết          |
| G04 | device/pointer-capabilities | Media queries pointer/hover, maxTouchPoints và PointerEvent thực trong vùng kích hoạt                                |
| G05 | browser/storage             | Round-trip localStorage/sessionStorage bằng khóa tạm; estimate/persisted; IndexedDB/CacheStorage chỉ kiểm tra API    |
| G06 | browser/fullscreen          | Vào/thoát Fullscreen và kích thước CSS của vùng; fallback khi API bị chặn                                            |
| C06 | mouse/movement              | Đường đi, vị trí, dịch chuyển và tốc độ trung bình theo PointerEvent loại mouse trong vùng                           |
| C07 | mouse/accuracy              | Mười mục tiêu, hit/miss, tỷ lệ trúng và sai lệch tâm bằng hình học CSS thật                                          |

Registry vẫn có 40 định nghĩa: 21 Phase 1 và 19 Phase 2. Sau milestone có 29 published, 11 draft; năm category có công cụ thật, 58 route công cụ VI/EN và 72 URL nội dung trong sitemap. Draft audio/camera/gamepad tiếp tục trả 404, không có navigation/search/sitemap công khai.

## Quy tắc độ chính xác

Device Information đọc thuộc tính browser, không suy ra model CPU, RAM lắp đặt hoặc native panel resolution. hardwareConcurrency/deviceMemory có thể bị giảm/làm tròn; trường thiếu hiển thị —. Browser/OS từ User-Agent được ghi rõ suy đoán. Không dùng high-entropy Client Hints, device enumeration hoặc serial number.

Browser Compatibility kiểm tra API theo yêu cầu, không dùng whitelist tên browser. API tồn tại không chứng minh thao tác thành công hay có thiết bị. Phép quét không gọi permissions.query/getUserMedia, không tạo AudioContext/WebGL context; Canvas 2D vẫn được probe như Phase 1. Policy không đọc được giữ trạng thái chưa xác định.

GPU chỉ tạo context sau khi bấm Đọc dữ liệu. Dữ liệu version/vendor/renderer có thể bị che hoặc mô tả software renderer; không có chỉ số VRAM, benchmark hoặc xác nhận GPU vật lý. WEBGL_debug_renderer_info chỉ được truy vấn sau opt-in và thao tác đọc. Cleanup dùng WEBGL_lose_context khi extension khả dụng; lỗi/lost context không tạo thông số mẫu thay thế.

Storage usage/quota là ước tính của origin, không phải dung lượng hoặc phần trống ổ đĩa. Hai phép Web Storage thực sự ghi/đọc/xóa khóa tạm riêng và kiểm tra đã xóa; không clear storage hoặc xóa key khác. Nếu cleanup không xác minh được thì báo lỗi riêng. Không gọi persist(), không tạo IndexedDB/CacheStorage để giả định I/O của chúng đã được thử.

Touch/pointer chỉ báo dữ liệu nhận từ browser. maxTouchPoints, pressure và hình học contact có thể bị tổng hợp hoặc giới hạn; không quy đổi thành lực vật lý hoặc chứng nhận panel. Chỉ giữ contact hiện tại trong phép thử, tối đa 32 contact đang theo dõi; không lưu lịch sử pointer thô.

Mouse Movement cộng đoạn Euclid giữa các mẫu trong vùng; rời vùng sẽ ngắt đoạn để không nối qua phần không quan sát được. Chỉ nhận pointerType mouse. Đơn vị CSS px; tốc độ trung bình gồm cả thời gian nghỉ. Không suy ra DPI/CPI, khoảng cách vật lý, USB Polling Rate hoặc sensor latency.

Mouse Accuracy là tác vụ người dùng, không chẩn đoán chuột. Chỉ nút chính của pointer mouse được chấm ở pointerdown. Mục tiêu là mười vị trí hình học định trước, không phải kết quả đo mẫu. Hit nằm trong hình tròn thực của button; miss giữ nguyên mục tiêu. Keyboard/touch/pen không tạo điểm; UI có giải thích thay vì tự tính hit.

## Vòng đời, giới hạn và quyền riêng tư

- Snapshot chỉ đọc khi người dùng yêu cầu. Reset/rời route vô hiệu hóa kết quả promise đến muộn; chưa có số liệu thì hiển thị —.
- Tác vụ pointer giới hạn 60 giây, UI cập nhật bốn lần/giây, dừng khi mất focus, tab ẩn hoặc resize. Movement giữ tối đa 120 điểm vẽ/100.000 mẫu tổng; Accuracy tối đa 1.000 lần nhấn hoặc mười hit.
- Timer/listener/pointer capture được dọn khi dừng hoặc unmount. Không đưa từng mousemove qua React state, không có animation loop nền vô hạn.
- Fullscreen chỉ thoát element do công cụ sở hữu, kể cả request hoàn tất muộn sau unmount. ResizeObserver và fullscreenchange listener có cleanup. Esc/cử chỉ thoát vẫn do browser quản lý.
- Không upload hoặc tự động lưu các snapshot GPU/device/pointer. Storage chỉ dùng khóa probe tạm; không ghi hardware identity vào lịch sử. Chính sách camera=()/microphone=()/geolocation=() giữ nguyên trên mọi route công bố.
- Nội dung, hướng dẫn, phương pháp, giới hạn, lỗi và SEO có VI/EN. Công cụ mới tải riêng theo route; header/catalog dùng category published, số lượng công cụ lấy từ registry.

## Thiết kế và kiểm thử giao diện

Giữ font Geist/Geist Mono và token màu/spacing của Device Lab. Dùng EngineSurface để khóa controls trước hydration. Nút, focus, loading, disabled, lỗi/fallback và hoàn tất dùng thành phần hiện có; không thêm theme/framework mới. Menu thích ứng năm category, bảng dữ liệu dài cho phép xuống dòng, vùng tác vụ dùng CSS pixels và target tối thiểu 48 px.

Ảnh QA thực và demo tám trạng thái controls nằm trong artifacts/milestone2, không commit. Demo controls không phải dữ liệu đo. Các trang công cụ được kiểm tra bằng axe ở Dark/Light và các độ rộng 320/375/414/768/1024 px; không coi axe là chứng nhận WCAG thủ công.

## Kiểm thử tự động

Kết quả thực chạy cuối cùng nằm ở PROGRESS.md và qa/phase2-milestone2.json, không suy ra đã đạt chỉ từ danh sách bài thử.

- Unit readers: dữ liệu thiếu, API bị chặn, context fallback/lost/error, opt-in renderer, context release, probe collision/cleanup failure, quota thực bằng 0 và số liệu không hợp lệ.
- Unit thuật toán: quãng đường, path break, bộ đệm, hit/miss và sai lệch tâm, giới hạn mẫu/lần nhấn.
- Integration lifecycle: đọc chủ động, Reset/unmount khi promise chưa trả, timer/blur/time limit, ResizeObserver, Fullscreen ownership/late request, release pointer capture.
- E2E giữ toàn bộ luồng Phase 1 và thêm mười bài cho mỗi browser: tám công cụ, failure fixtures, pointer input, tác vụ chuột, Fullscreen/fallback, hai theme và responsive/locale.
- CI kiểm tra source mới trên Linux, build production image và Docker smoke; không dùng kết quả milestone trước làm bằng chứng revision hiện tại.

## Manual QA còn phải thực hiện

| Tình huống                      | Cần kiểm tra thật                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| Safari macOS/iOS                | Fullscreen/cử chỉ thoát, API fallback, storage policy; WebKit automation không thay thế    |
| GPU/driver và software renderer | Chuỗi có/không bị che, WebGL bị tắt/context loss; không xác nhận model chỉ qua chuỗi       |
| Private Mode / quota đầy        | Storage bị chặn, khóa tạm được dọn hoặc báo cleanup chưa xác minh                          |
| Touch/pen nhiều contact         | pressure mặc định, pointercancel, mất capture, contact ra ngoài vùng                       |
| Chuột/OS scaling                | Đổi zoom/scaling, rời/quay lại vùng, nhấn primary/secondary, hit/miss với nhiều kích thước |
| Màn hình/zoom/browser chrome    | CSS dimensions, Fullscreen vào/thoát, chuyển route trong lúc request chưa xong             |
| Accessibility thủ công          | Screen reader, zoom 200%, reduced motion, keyboard-only và focus khi target di chuyển      |

Chưa có phần cứng thật/Safari thật được xác minh trong milestone chỉ bằng automation. Không thay đổi trạng thái Final Acceptance còn mở của Phase 1/2; Lighthouse của revision cũ không phải số đo source mới. Không triển khai VPS, DNS hoặc HTTPS production.

## Nguồn kỹ thuật

- [WHATWG Storage](https://storage.spec.whatwg.org/): estimate theo origin và persistent storage.
- [Khronos WEBGL_debug_renderer_info](https://registry.khronos.org/webgl/extensions/WEBGL_debug_renderer_info/): dữ liệu driver, giới hạn và riêng tư.
- [WHATWG Fullscreen](https://fullscreen.spec.whatwg.org/): yêu cầu người dùng, trạng thái và thoát Fullscreen.
- [W3C Pointer Events](https://www.w3.org/TR/pointerevents/): pointer geometry và dữ liệu browser quan sát.
