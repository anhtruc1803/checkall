# Phase 2 — Milestone 4: Microphone Test và Audio Spectrum

Ngày 05/11/2026. Phạm vi D03, D05; giữ 32 công cụ đã công bố. Sáu mục camera/gamepad tiếp tục draft; không triển khai Phase 3 hoặc hạ tầng thật.

## Chức năng

| ID  | Route sau locale | Hành vi                                                           |
| --- | ---------------- | ----------------------------------------------------------------- |
| D03 | audio/microphone | RMS, peak, RMS dBFS, tỷ lệ mẫu gần full scale và waveform đầu vào |
| D05 | audio/spectrum   | Cùng số đọc đầu vào, phổ FFT 64 dải log và bin mạnh nhất ước tính |

Registry hiện có 40 định nghĩa, 34 published (21 Phase 1 + 13 Phase 2), sáu draft, sáu category. Có 68 route công cụ VI/EN và 84 URL nội dung trong sitemap; Next build sinh 90 trang gồm hạ tầng. Nội dung SEO/hướng dẫn/phương pháp/giới hạn và UI đều có VI/EN. Không thêm dependency hoặc endpoint.

Microphone dùng thiết bị browser/OS lựa chọn, chỉ yêu cầu `getUserMedia({audio:true, video:false})` sau Bắt đầu. Không enumerate thiết bị, đọc hoặc lưu tên/deviceId. Luồng đi qua MediaStreamAudioSourceNode và AnalyserNode, không nối ra destination. Không nghe lại qua loa, ghi file, MediaRecorder, lưu PCM/phổ vào history/localStorage hoặc upload audio. Dừng/Reset xóa các số đọc/đồ thị đang giữ trong bộ nhớ. Privacy page cũng được cập nhật.

## Quyền và policy

Policy mặc định tiếp tục `camera=(), microphone=(), geolocation=()`. Chỉ `/vi|en/audio/microphone` và `/vi|en/audio/spectrum` có `camera=(), microphone=(self), geolocation=()`. Nginx chuyển tiếp header ứng dụng; không mở wildcard hoặc camera. HTTP smoke kiểm tra policy qua proxy trên 22 route VI/EN đại diện ở ba thời điểm.

**Policy gắn với document:** App Router soft navigation không cập nhật policy document hiện tại. PolicyLink dùng điều hướng document khi vào hoặc rời hai công cụ microphone; các chuyển trang khác vẫn dùng NextLink. Áp dụng cho catalog, tool cards, related links, header/locale, footer và command search. Đây là thay đổi cần thiết để route mặc định chặn microphone không làm hỏng truy cập công cụ, và policy được thu hẹp lại khi rời công cụ. Regression test kiểm tra request document/header thật qua catalog → microphone → spectrum → search → keyboard → microphone.

Permission observer chỉ đọc trạng thái; mount/subscription không mở thiết bị hoặc AudioContext. Phân biệt unknown/prompt/granted/denied/unsupported/insecure-context/policy-blocked. Browser không hỗ trợ descriptor query thì giữ unknown, vẫn cho thử capture bằng thao tác chủ động. API thiếu hoặc insecure/policy chặn hiển thị nguyên nhân riêng; metadata dùng optionalCapabilities để giao diện giải thích lỗi thay vì bị generic fallback che khuất.

Lỗi capture phân loại permission-denied/device-not-found/device-busy/constraints-unavailable/aborted/unknown, không lưu nguyên văn tên thiết bị hoặc thông báo lỗi. Browser hoặc hệ điều hành từ chối có thể cùng trả NotAllowedError; UI không khẳng định người dùng đã bấm Deny. Cần HTTPS hoặc localhost và quyền hệ điều hành phù hợp.

## Lifecycle

InputSession dùng media session nền tảng của Milestone 1, có snapshot qua useSyncExternalStore. AudioContext.resume được gọi trong click ban đầu trước khi hộp hỏi quyền có thể kéo dài quá user activation. Không khởi động graph nếu context không chạy. Resume quá 10 giây được xử lý thành lỗi; Stop hủy việc chờ resume nội bộ, đóng context và ngăn kết quả đến muộn khởi tạo graph.

Chỉ một yêu cầu capture đang chờ. Stop/Reset không thể đóng prompt browser hoặc hủy promise getUserMedia; Start tiếp tục bị khóa tới khi promise kết thúc. Nếu grant trả về sau Stop/unmount, toàn bộ track được stop ngay. Không suy ra Denied khi promise chưa trả. Nút Stop có thể bị browser modal che; quyền/prompt phải được xử lý qua UI browser.

Stop, Reset, blur, hidden, pagehide, thay tool, unmount, track ended, permission revoked và context interruption đều giải phóng track, nodes, context, timers và listeners. Track mute xóa số đọc tạm; unmute chờ mẫu thật mới. Blur trong lúc prompt đang chờ cũng hủy phiên; sau khi xử lý prompt cần bấm Bắt đầu lại, không tự capture khi trở về.

Timer giới hạn phiên 60 giây kể từ Start (gồm thời gian chờ quyền); thời gian phân tích hiển thị tính từ graph bắt đầu chạy. Timer phụ thuộc event loop, không phải deadline phần cứng. Đọc dữ liệu mỗi 125 ms; giữ hai buffer cố định 2048/1024 float, waveform 64 điểm và 64 mức phổ hiện tại, không có log tăng vô hạn. Stop/cleanup không phụ thuộc timer tab nền để giải phóng context.

## Ý nghĩa số đọc

- RMS = căn trung bình bình phương mẫu số, peak = max |x|. RMS dBFS = 20 log10(RMS); im lặng thật hiển thị −∞, trước Start là —. Giá trị không hữu hạn bất thường gây lỗi, không bị thay bằng số mẫu.
- Tỷ lệ mẫu gần full scale đếm |x| ≥ 0,99 trong cửa sổ hiện tại; không khẳng định clipping analog hoặc microphone hỏng. Peak số giữ giá trị >1 nếu có; hình waveform giới hạn ở ±1.
- FFT size 2048, smoothing 0,6; khoảng cách bin = sampleRate/2048. Phổ lấy cực đại từng dải log 20 Hz tới min(20.000 Hz, Nyquist), dải không có bin để trống. Trục dọc −100 tới −10 dBFS dùng cho hiển thị; không phải dB SPL.
- Bin mạnh nhất chỉ hiển thị khi RMS > 0,00001 và bin > −100 dBFS. Đây không phải thuật toán nhận dạng fundamental/pitch; sample rate là AudioContext, không xác nhận DAC/ADC hoặc thông số microphone.
- AGC, noise suppression, echo cancellation, OS/driver, browser processing hoặc mute có thể ảnh hưởng dữ liệu. Không có thiết bị đo hiệu chuẩn; im lặng không chứng minh phần cứng hỏng, không có điểm “microphone đạt” tự động.

## Kiểm thử và bằng chứng

Cập nhật sau checkpoint ban đầu: 12 E2E mới/cấu hình, tổng 220 (55/cấu hình). Bài native capture tách khỏi native header enforcement. Firefox hiện không có API policy và không chặn capture theo header trong probe; bài enforcement ghi skip có lý do, không tính là đã đạt. Tham khảo [Mozilla bug 1694922](https://bugzilla.mozilla.org/show_bug.cgi?id=1694922). Native capture, analyser và cleanup vẫn bắt buộc. InputSession kiểm tra readyState trong vòng đọc để dọn track đã kết thúc cả khi không có event ended; giới hạn browser này vẫn cần được ghi trong nghiệm thu.

Các lệnh: pnpm typecheck, pnpm lint, pnpm test, pnpm build, pnpm test:e2e, pnpm audit --prod, node scripts/scan-secrets.mjs. Số chạy thật/source/CI cuối được chốt trong PROGRESS.md và qa/phase2-milestone4.json. Không dùng kết quả Milestone 3 làm bằng chứng source này.

Unit mới kiểm tra thuật toán với dữ liệu đầu vào xác định, silence/NaN/Nyquist/empty bands; quyền, lỗi và cleanup, duplicate requests, late grant/denial/resume, context suspended, graph cấp phát một phần, mute/ended, timer 60 giây, StrictMode và thay tool. Bộ hiện tại 194 bài trên 27 file đã đạt tại checkpoint trước hồi quy browser cuối.

E2E bổ sung 12 bài/cấu hình; tổng hiện tại 220 bài (55 × Chromium/Firefox/WebKit/Chromium mobile). Capture native dùng thiết bị kiểm thử ảo, không mở microphone vật lý: Chromium fake-media device, Firefox fake stream/permission preferences, WebKit runner dùng môi trường kiểm thử của Playwright. Phân tích tín hiệu 1 kHz dùng getUserMedia fixture trả **MediaStream tổng hợp**, còn AudioContext/source/analyser/FFT chạy native; kết quả fixture không phải phép đo microphone thật. Failure/pending fixtures riêng không được tính thành capture phần cứng.

Kiểm tra mới gồm capture native từ homepage, policy chặn thật, policy tất cả route công cụ cũ, reset/stop/late grant, pagehide, revocation, mute/ended, blur, deadline với clock automation, no storage/upload, axe hai theme ở trạng thái chạy/lỗi/fallback, responsive VI/EN 320/375/414/768/1024/1280 px. Browser thiếu native Web Audio ngoài CI ghi skip có lý do; CI bắt buộc native API, không được skip phần này. WebKit automation không tương đương Safari thật; Chromium mobile là emulation.

## Manual QA còn mở

| Mục                  | Cần kiểm tra trên thiết bị thật                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Permission prompt    | Allow/Deny, dismiss/ignore, quyền tạm thời, OS block, modal làm mất focus, retry sau late grant                                |
| Input thật           | Microphone tích hợp/USB/Bluetooth, đổi/nhổ thiết bị, system mute, input OS đang chọn, browser indicator tắt sau Stop/rời trang |
| Tín hiệu/đồ thị      | Nói/tạo âm thanh, silence và quá tải; đối chiếu AGC/noise suppression, không suy ra chất lượng hoặc dB SPL                     |
| Lifecycle hệ thống   | Khóa màn hình, tab nền, sleep/wake, cuộc gọi/interruption mobile, back/forward/BFCache và browser đóng trang                   |
| Safari/Accessibility | Safari macOS/iOS thật, screen reader VI/EN, keyboard, zoom, reduced motion                                                     |

## Trạng thái nghiệm thu

- Đã triển khai: hai công cụ, permission/lifecycle, policy document navigation, VI/EN và các bài kiểm thử mới.
- Đã xác minh automated QA khả dụng trên CI source 8f6e773: 194 unit, 218 E2E đạt/hai skip policy, Docker và artifacts đã đọc. Hai skip không được tính là tiêu chí native policy đã đạt.
- Chưa xác minh bằng phần cứng: microphone/driver/OS/native prompt thực tế và Safari thật; xem ma trận manual.
- Chưa hoàn thành ở cấp dự án: sáu draft Phase 2, Lighthouse revision mới và Final Acceptance Phase 1/2. Không tự đánh dấu Final Acceptance hoàn tất.

Nguồn phương pháp: [Media Capture and Streams W3C](https://www.w3.org/TR/mediacapture-streams/), [Web Audio API W3C](https://www.w3.org/TR/webaudio/), [Permissions Policy W3C](https://www.w3.org/TR/permissions-policy/). Hướng dẫn Next.js lazy-loading/headers được đọc từ đúng node_modules/next/dist/docs của repository.

Giới hạn native policy ghi riêng: Firefox và runtime WebKit Linux ở CI đầu vẫn capture với header deny trong bài automation. Không khẳng định Safari thật có cùng hành vi. Native header enforcement chưa xác nhận ở runtime thiếu API introspection; bài tương ứng ghi skip, không coi tiêu chí này đã đạt. Ứng dụng chỉ gọi capture từ hai engine sau Start; header được kiểm tra độc lập và bài native capture/analyser vẫn bắt buộc.

## Kết quả chốt

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
