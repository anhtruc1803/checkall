# Phase 2 — Milestone 5: camera

Ngày 05/11/2026. Phạm vi theo yêu cầu: Webcam Preview (E01), Camera Resolution (E02), Camera FPS (E03). Giữ nguyên 34 công cụ trước đó, không triển khai gamepad, Phase 3 hoặc VPS. Kết quả QA cuối và CI được ghi tại cuối PROGRESS.md và qa/phase2-milestone5.json; không suy ra bài đang chạy đã đạt.

## Công cụ và dữ liệu

| ID  | Route sau locale  | Dữ liệu thực tế                                                                      |
| --- | ----------------- | ------------------------------------------------------------------------------------ |
| E01 | camera/preview    | Video cục bộ từ getUserMedia, muted và playsInline                                   |
| E02 | camera/resolution | videoWidth/videoHeight và width/height của getSettings                               |
| E03 | camera/fps        | Các kích thước trên, frameRate được báo và FPS quan sát từ requestVideoFrameCallback |

Registry có 37 published (21 Phase 1 + 16 Phase 2), ba draft gamepad. Có 74 route công cụ VI/EN, 92 URL nội dung và 98 trang khi build gồm hạ tầng. Search, danh mục, related tools, sitemap và SEO đều lấy từ registry. Engine camera tải động qua ToolRunner; không thêm dependency, endpoint hoặc dịch vụ production.

Camera Resolution đọc **cấu hình luồng hiện tại** mà browser mặc định chọn, không thử mọi chế độ hay suy ra độ phân giải tối đa/cảm biến. Kích thước video là videoWidth/videoHeight, không phải kích thước CSS. Thuộc tính thiếu/không hữu hạn/không dương hiển thị —. Chỉ đọc whitelist width, height, frameRate; không giữ deviceId/groupId/label hoặc enumerate thiết bị.

Camera FPS dùng chênh lệch metadata.presentedFrames chia thời gian callback trong cửa sổ ít nhất 2 giây. Khung bị bỏ qua giữa các callback vẫn được phản ánh qua bộ đếm, không đếm số lần callback. UI cập nhật 4 Hz, bộ nhớ hằng số. Bộ đếm/timestamp lùi hoặc không hợp lệ được reset; lặp lại cùng bộ đếm không làm số đọc cũ tồn tại mãi. Mute và gián đoạn trên 2 giây xóa kết quả; phải tích lũy lại cửa sổ hợp lệ. Thiếu requestVideoFrameCallback/cancelVideoFrameCallback: preview/settings vẫn hoạt động, FPS quan sát là — kèm giải thích. Không dùng requestAnimationFrame hoặc frameRate được báo thay kết quả đo.

Đây là tốc độ khung browser gửi tới compositor, chịu ảnh hưởng Refresh Rate, tải máy và pipeline. Không chứng nhận tốc độ cảm biến, độ trễ capture hoặc chất lượng camera. Hai nhãn “FPS luồng được báo” và “FPS quan sát tại compositor” luôn tách biệt. Không upload, ghi hình, chụp ảnh, đọc pixel, lưu video/history, microphone hoặc telemetry thiết bị.

Nguồn API: [requestVideoFrameCallback](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback), [getSettings](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getSettings), [đặc tả video frame callback](https://wicg.github.io/video-rvfc/). Không coi tên gọi Camera FPS là phép đo phần cứng đã hiệu chuẩn.

## Quyền, policy và vòng đời

CameraSession tái sử dụng createMediaSession('camera') và observePermission của Milestone nền tảng. SSR/constructor/render/mount không capture; query quyền chỉ là quan sát thụ động. Không suy ra Denied khi browser không hỗ trợ descriptor camera; Start vẫn có thể yêu cầu qua getUserMedia khi API khả dụng. Chặn trước capture với insecure context, document policy không cho phép, thiếu API, thiếu user activation hoặc trang ẩn.

Start mới yêu cầu {video:true,audio:false}. Phân loại permission denied/system refusal, không có thiết bị, thiết bị bận, constraints, abort và lỗi chưa biết; không lưu thông báo lỗi driver. Không yêu cầu microphone hoặc enumerate camera. Yêu cầu gốc được khóa để không phát sinh nhiều prompt; nếu Stop/Reset/unmount xảy ra lúc prompt chưa kết thúc, UI giữ Start disabled tới khi promise kết thúc. Browser có thể để prompt mở vô hạn; không giả trạng thái Denied hoặc tự coi yêu cầu đã hủy. Mọi luồng cấp muộn đều được stop và không gắn vào video.

Sau grant, video.play() được theo dõi với giới hạn 10 giây và cơ chế hủy chờ khi Stop/ended. Toàn phiên tối đa 60 giây tính từ Start. Khi play chưa hoàn tất vẫn kiểm tra readyState track mỗi 250 ms vì track.stop() không bắt buộc phát ended. Không tự Start/resume khi quay lại trang.

Stop/Reset, track ended (event hoặc readyState), quyền bị thu hồi, mute, video error/pause, blur, hidden, pagehide, đổi tool/locale và unmount đều có xử lý riêng. Mute chỉ xóa số đọc FPS tới khi unmute; các trường hợp kết thúc phiên dọn toàn bộ track, frame callback, timer và listener của phiên. Video.pause(), srcObject=null, bỏ src và load() xóa ảnh đã decode. Cleanup effect tháo permission observer/listener, có regression React StrictMode. Watchdog/timer dùng slot cố định, không tích lũy log mỗi frame.

Chỉ sáu URL E01/E02/E03 VI/EN có `camera=(self), microphone=(), geolocation=()`. Bốn URL microphone/spectrum vẫn `camera=(), microphone=(self), geolocation=()`. Mọi route khác chặn cả hai. Nginx chuyển tiếp header Next.js. PolicyLink tạo document navigation khi vào/rời camera hoặc microphone, bao gồm đổi locale; soft navigation không thay document policy. Không mở quyền cho toàn website.

Giới hạn native Permissions-Policy Firefox/WebKit đã ghi ở M4 tiếp tục là tiêu chí mở. Header đúng không chứng minh browser đã cưỡng chế. Bài native enforcement tách riêng và ghi skip nếu runtime không expose policy support; không giả policy API trong bài native để báo đạt. Safari thật chưa kiểm chứng.

## Kiểm thử tự động

- Unit: thuật toán FPS bằng delta bộ đếm, thời gian/counter lỗi, duplicate/stale, không có số liệu giả; whitelist giá trị và namespace danh mục.
- Session: chặn môi trường/quyền, duplicate Start, lỗi capture được bảo toàn, grant muộn, play bị chặn/chờ, track kết thúc trong lúc chờ play, thiếu frame callback, callback/settings lỗi, mute/revoke/ended không event, blur/hidden/pagehide/pause/error/timeout, timer và video cleanup.
- React StrictMode: idle trước Start, cleanup khi đổi tool/unmount và grant muộn; SSR không chạm API browser.
- Native E2E: browser getUserMedia với thiết bị **ảo của Playwright/browser**; video thật, kích thước/getSettings, rVFC thật, Stop và whitelist video-only. Không mở webcam vật lý của người dùng. Chromium/Firefox dùng cờ input giả chỉ cho worker file M5; WebKit dùng nguồn kiểm thử của automation.
- Fixture E2E: facade có chủ ý cho pending/failure/playback/lifecycle/mute/revocation, không dùng làm bằng chứng capture hoặc FPS native. Fixture không tạo số đo FPS. CI yêu cầu native mediaDevices ở bài capture riêng.
- HTTP: policy sáu route camera, bốn route microphone và route ngoài phạm vi; document navigation catalog/related/locale/nhóm công cụ. Không thay kỳ vọng chặn thành cho phép để test đạt.
- Axe toàn trang VI/EN Dark/Light, trạng thái idle/running/error; responsive 320/375/768/1280 px; Start bằng Enter và Stop bằng Space. Đã sửa tên truy cập nút tìm kiếm VI khớp nhãn hiển thị, giữ shortcut qua aria-keyshortcuts.
- Giữ toàn bộ hồi quy Phase 1/M2/M3/M4. Docker smoke mở rộng health + 28 route VI/EN với policy trước/sau restart và stop-start; không publish Node port.

Build/typecheck/lint và unit đã chạy cục bộ; số cuối, E2E, Docker và CI phải đối chiếu checkpoint nghiệm thu, không lấy số của M4 làm bằng chứng M5. Lượt Chromium đầu 7 đạt/3 lỗi được giữ trong artifacts bỏ qua Git; lỗi gồm parse số kèm unit trong test, kỳ vọng câu báo bận chưa khớp và accessibility thật ở command search. Các lỗi đã được xử lý trước lượt hồi quy tiếp theo.

## Manual QA bắt buộc còn mở

| Nhóm              | Cần kiểm tra trên thiết bị thật                                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quyền             | Allow/Deny/dismiss/ignore prompt; quyền OS chặn; browser không expose camera descriptor; grant sau Stop/đổi trang; không tự mở lại                                      |
| Phần cứng         | Camera tích hợp/USB/ảo, tháo cáp/driver/thiết bị bận, đèn privacy tắt sau Stop; đối chiếu cấu hình luồng với ứng dụng OS                                                |
| Video             | Camera trước/sau theo lựa chọn mặc định browser; autoplay/playsInline trên điện thoại; định hướng/ánh sáng/load/Refresh Rate; không nhầm kích thước CSS với pixel video |
| FPS               | Đối chiếu bộ đếm video ở nhiều nguồn thật; thiếu rVFC; camera gián đoạn, giảm FPS trong tối; không nghiệm thu FPS cảm biến chỉ bằng số browser                          |
| Vòng đời          | Native prompt gây mất focus, sleep/wake, background, rời trang, Back/Forward/BFCache; camera tắt và phải Start lại                                                      |
| Khả năng truy cập | Screen reader thật, zoom/reduced motion, bàn phím trên Safari và mobile thật; audit tự động không thay manual QA                                                        |
| Chính sách        | Native enforcement trên Firefox/WebKit/browser mục tiêu; iframe/policy OS và HTTPS staging sau khi được phép                                                            |

Chưa đo Lighthouse revision này; không nhận ≥90 và không sử dụng điểm Phase 1 làm điểm M5. Không đánh dấu Final Acceptance Phase 1 hoặc toàn Phase 2 hoàn tất. Ba mục gamepad vẫn draft; chỉ tiếp tục milestone sau khi có yêu cầu.

## Dependency audit và môi trường cục bộ

`pnpm audit --prod --json` không có finding. `pnpm audit --json` ngày 05/11/2026 báo hai advisory moderate ở dependency phát triển có sẵn, không phải dependency được thêm bởi camera:

| Package   | Đường dẫn trong audit                               | Bản đang dùng / bản vá theo advisory |
| --------- | --------------------------------------------------- | ------------------------------------ |
| glob      | lighthouse → @sentry/node → @sentry/bundler-plugins | 13.0.6 / ≥14.0.2                     |
| minimatch | ESLint/TypeScript parser và Lighthouse → glob       | 10.2.6 / ≥11.0.1                     |

Nguồn: [glob GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), [minimatch GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). Vấn đề liên quan tiêu thụ tài nguyên khi duyệt filesystem bị abort hoặc xử lý pattern glob do bên tấn công kiểm soát. Cây production được audit riêng không chứa hai finding này. Không kết luận toàn repository không có lỗ hổng. Chưa thay major transitive ngoài phạm vi M5; cần cập nhật đồng bộ công cụ lint/Lighthouse và kiểm chứng tương thích, không dùng override major chưa kiểm tra chỉ để xóa cảnh báo audit. Không chạy các công cụ phát triển này với pattern/đường dẫn không tin cậy.

Browser Windows có script Kaspersky chèn vào và phát POST tới domain của phần mềm đó. Bài native camera theo dõi **mọi** POST/PUT/PATCH, không lọc bỏ domain này để báo đạt. Kết quả privacy của lượt cục bộ có request chèn không được tính là môi trường sạch; CI Linux xác minh riêng. Không tắt hoặc chỉnh phần mềm bảo mật của người dùng.

## Kết quả nghiệm thu phần mềm

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
