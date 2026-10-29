# Phase 2 — Milestone 1: registry, capability và permission

Ngày thực hiện: 29/10/2026. Phạm vi được người dùng cho phép là nền tảng trước khi triển khai từng nhóm công cụ. Tài liệu này không đóng Final Acceptance Phase 1 hoặc công bố 19 công cụ mới.

## Kết quả triển khai

Registry có 40 định nghĩa: 21 công cụ Phase 1 published và 19 công cụ Phase 2 draft. Định nghĩa draft chỉ là roadmap có kiểu dữ liệu, không có trang thử hoặc số đo giả. Không có mục Phase 3 mới.

- `src/lib/tools/types.ts`: category, engine và Tool dùng chung; danh sách tám engine thực sự đã triển khai.
- `src/lib/tools/phase2.ts`: ID, category, slug dự kiến, capability, permission và tên VI/EN của 19 công cụ draft. Nội dung/phân loại đo của draft là thông tin dự kiến, phải xác minh lại khi làm từng engine.
- `src/lib/tools/catalog.ts`: bộ lọc published, category đang công bố và validation registry. Trùng ID/route, draft được index, related link từ published sang draft, bản dịch rỗng hoặc published chưa có engine đều làm kiểm tra thất bại trước khi build công bố.
- `registry.ts`: giữ nguyên nội dung và metadata của 21 công cụ cũ, ghép roadmap Phase 2 rõ ràng. Public search, lookup, category, route, sitemap và related links chỉ sử dụng published.
- `ToolRunner`: renderer map có kiểu đầy đủ cho các engine đã triển khai; bổ sung tên engine vào danh sách phải có renderer tương ứng để typecheck đạt. Engine chưa triển khai có thông báo VI/EN, không trả vùng thử trống.

Navigation desktop/mobile và catalog lấy category từ chỉ mục công cụ published; không cần thêm category vào nhiều danh sách riêng. Category chỉ có draft không tạo trang rỗng. Số công cụ công khai vẫn là 21, sitemap vẫn có 52 URL nội dung VI/EN.

## Capability không phải permission hoặc phần cứng

`inspectCapabilities(requested)` chỉ kiểm tra những capability được yêu cầu. Trạng thái là available/unavailable; khi SSR chưa có môi trường browser thì unknown. `detectCapabilities()` giữ giao diện boolean và đúng tám key Phase 1 để không phá Device Overview.

Nhóm mới: secureContext, mediaDevices, audioContext, gamepad, webgl, storage và permissions. Các phép kiểm tra này chỉ xác định API có được browser cung cấp. Không gọi getUserMedia, getGamepads, storage.estimate, permissions.query, tạo AudioContext hoặc tạo WebGL context khi dò sự hiện diện API. Canvas 2D vẫn dùng probe cục bộ như Phase 1 và xử lý trường hợp getContext bị chặn.

API tồn tại không chứng minh có camera/tay cầm, context WebGL có thể tạo được, quyền đã cấp, storage còn dung lượng hoặc GPU cụ thể. Không enumerate thiết bị hoặc truy vấn renderer trong milestone này.

## Permission handling

`inspectPermissionEnvironment('camera' | 'microphone')` kiểm tra môi trường và policy, không hỏi cấp quyền. `observePermission` là thao tác đọc trạng thái có cleanup; `usePermission` là adapter React, chỉ dùng khi một công cụ cần hiển thị trạng thái quyền. Chưa được gắn vào các trang Phase 1.

| Trạng thái       | Ý nghĩa                                                                       |
| ---------------- | ----------------------------------------------------------------------------- |
| unknown          | SSR, chưa truy vấn, API query thiếu/bị chặn hoặc descriptor không được hỗ trợ |
| prompt           | Browser có thể hỏi khi thực sự yêu cầu thiết bị                               |
| granted          | Quyền đã cấp nhưng truy cập vẫn có thể thất bại                               |
| denied           | Browser/hệ thống từ chối; không khẳng định người dùng vừa bấm từ chối         |
| unsupported      | API media capture không được cung cấp                                         |
| insecure-context | Môi trường không phải secure context                                          |
| policy-blocked   | API policy xác nhận document không được phép sử dụng tính năng                |

Nếu browser không cung cấp API đọc policy, không tự suy ra policy đã cho phép. Nếu Permissions API không query được camera/microphone, giữ unknown; không biến thành denied hoặc kết luận camera không hoạt động. Observer xử lý change để cập nhật khi quyền thay đổi, tháo listener khi dispose/unmount và bỏ qua kết quả query đến muộn.

Thông báo trạng thái và lỗi có đầy đủ VI/EN. Không lưu permission, deviceId, tên thiết bị hoặc lỗi thô vào localStorage; không log/upload media hay sự kiện.

## Phiên media dùng chung cho milestone sau

`createMediaSession(permission)` cung cấp getSnapshot, subscribe, start, stop và dispose. Constructor/subscribe không truy cập thiết bị. start phải do nút của công cụ gọi từ thao tác chủ động; nếu browser báo userActivation không active hoặc trang đang ẩn thì yêu cầu bị chặn trước capture. API browser thiếu userActivation không được coi là đã xác nhận một thao tác tin cậy; caller vẫn chịu trách nhiệm gắn start vào thao tác người dùng.

Snapshot gồm status idle/requesting/active/error/stopped, stream trong bộ nhớ và mã lỗi ngắn. Các lỗi: thiếu API, insecure context, policy chặn, quyền/hệ thống từ chối, không có thiết bị, không đọc được/đang bận, constraint không đáp ứng, bị gián đoạn và unknown. Không lưu message hoặc thông tin nhận dạng thiết bị từ DOMException.

Vòng đời bắt buộc:

1. Không mở hai yêu cầu đồng thời khi start lặp; phiên active được dùng lại.
2. Stop, dispose, pagehide, trang ẩn hoặc track ended đều dừng phiên và tháo listener.
3. Nếu người dùng cấp quyền sau Stop/dispose, stream trả về được stop ngay, không chuyển sang active.
4. Không tạo thêm yêu cầu khi prompt cũ chưa kết thúc. Có thể retry bằng thao tác mới sau khi promise cũ hoàn tất.
5. Không thể đóng hộp hỏi quyền của browser bằng Stop; Stop hủy ý định sử dụng của ứng dụng và giải phóng kết quả đến muộn. Không tạo timeout giả để tuyên bố browser đã từ chối.
6. Component/engine sử dụng phiên phải gọi dispose khi unmount. AudioContext/oscillator/analyser sẽ được quản lý và kiểm thử trong milestone audio, chưa triển khai trong lớp media capture này.

Các bài unit dùng stream/track giả xác định trong tests/helpers, chỉ để xác minh vòng đời; chúng không phải số đo hoặc bằng chứng đã thử camera/microphone thật.

## Policy và quyền riêng tư của bản công bố

Headers vẫn là `camera=(), microphone=(), geolocation=()` trên các route hiện tại. Không mở quyền camera/microphone toàn website chỉ để chuẩn bị nền tảng. Không có route QA/debug công khai hoặc endpoint cấp quyền mới. Chưa có giao diện media và không capture khi người dùng mở Phase 1.

Trước khi công bố một công cụ media phải thiết kế policy phù hợp từng route, thử secure context và các luồng cấp/từ chối quyền trong browser thật. Không dùng chứng chỉ QA loopback làm bằng chứng HTTPS production.

## Kiểm thử và nghiệm thu milestone

Kết quả chạy thực tế ghi tại PROGRESS.md. Bộ kiểm tra gồm:

Kết quả cục bộ cuối: typecheck/lint/production build source cuối đạt, 86/86 unit/integration tests và 96/96 E2E trên bốn cấu hình (24/24 mỗi cấu hình), không skip/flaky. Kết quả CI của revision mới phải đối chiếu riêng trong PROGRESS.md; không thay bằng pipeline Phase 1 cũ.

- Unit registry: 21 published + 19 draft, metadata VI/EN, loại draft khỏi search/lookup/sitemap, category mới chỉ draft và publication guard.
- Unit capability/SSR: không dò thiết bị hoặc khởi tạo context ngầm, key Phase 1 giữ nguyên, probe lỗi không làm hỏng probe khác.
- Unit/integration permission và media: query không hỗ trợ, quyền thay đổi, cleanup hook, late grant/rejection, start trùng, retry, stream rỗng/ended, lỗi DOMException, stop/dispose/pagehide/hidden/track ended.
- E2E hồi quy Phase 1 trên Chromium, Firefox, WebKit và Chromium mobile; đủ 21 engine/fallback, 42 route công cụ VI/EN, theme/locale/fullscreen/responsive/axe.
- E2E bổ sung: 19 draft × hai locale trả 404, category chỉ draft trả 404, không có link/search/sitemap draft; các trang Phase 1 không gọi getUserMedia hoặc permissions.query và giữ header chặn media.

CI lưu JSON E2E kể cả khi tất cả test đạt trong artifacts/playwright/results.json. Trace vẫn giữ khi lỗi; không commit artifacts vào Git. Docker smoke Linux được chạy lại bởi CI; không suy ra đã đạt trước khi có kết quả job.

Milestone này không xác minh camera, microphone, loa, gamepad hoặc Safari thật. Không công bố Phase 2 hoàn tất. Các mục Performance và manual QA Phase 1 còn mở, không tự được miễn trừ.

## Công việc tiếp theo

Triển khai nhóm thông tin thiết bị/browser, touch/pointer, storage/fullscreen, mouse movement/accuracy và GPU/WebGL theo từng capability, với giới hạn đo và fallback rõ ràng. Sau đó mới audio, microphone/webcam và gamepad. Chỉ chuyển từng draft sang published sau khi engine, bản dịch/nội dung, cleanup, quyền riêng tư và kiểm thử tương ứng đạt.

## Nguồn kỹ thuật

- [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading), đối chiếu thêm tài liệu đúng phiên bản trong node_modules/next/dist/docs trước khi sửa loader.
- [W3C Permissions — query và permission change](https://www.w3.org/TR/permissions/).
- [W3C Media Capture and Streams — vòng đời và policy](https://www.w3.org/TR/mediacapture-streams/).
