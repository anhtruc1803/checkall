# Phase 2 — Milestone 3: Speaker, Stereo và Frequency Generator

Ngày 30/10/2026. Phạm vi chỉ D01, D02, D04; giữ 21 công cụ Phase 1 và tám công cụ Milestone 2. Microphone, spectrum, camera và gamepad chưa công bố; không triển khai Phase 3 hoặc VPS.

## Chức năng và giới hạn

| ID  | Route sau locale          | Hành vi                                                          |
| --- | ------------------------- | ---------------------------------------------------------------- |
| D01 | audio/speaker             | Sine 440 Hz, cả hai kênh, nghe kiểm tra thủ công                 |
| D02 | audio/stereo              | Sine 440 Hz, chọn trái/phải/cả hai khi đang phát                 |
| D04 | audio/frequency-generator | 20–20.000 Hz, sine/triangle/square/sawtooth, đổi tần số khi phát |

Registry có 40 định nghĩa, 32 published (21 Phase 1 + 11 Phase 2), tám draft; sáu category, 64 route công cụ VI/EN, 80 URL nội dung trong sitemap. Nội dung hướng dẫn, phương pháp, giới hạn, related links và giao diện đều có VI/EN. Draft không có route/index/search. Classification observation mô tả trạng thái browser và tác vụ tự nghe, không chứng nhận phần cứng.

Chỉ tạo AudioContext và gọi resume sau Bắt đầu. Không gọi getUserMedia, permissions.query hoặc enumerateDevices. Không tải file audio, thu microphone, gửi dữ liệu, lưu localStorage/history hay tạo server endpoint. Header camera=()/microphone=()/geolocation=() giữ nguyên. Mức mặc định 3%, giới hạn 0–20% **biên độ số**, không phải phần trăm độ lớn cảm nhận hoặc dB SPL; cần giảm âm lượng hệ thống trước khi thử.

Deadline oscillator.stop được đặt theo audio clock để không phụ thuộc độ trễ timer UI. Oscillator nối hai GainNode vào input 0/1 của ChannelMergerNode, qua master GainNode rồi tới output browser chọn. Gain/tần số chuyển bằng setTargetAtTime; dừng giảm gain ngắn rồi stop/disconnect/close. Không tự chọn thiết bị hoặc hứa định tuyến vật lý chính xác: mono, spatial audio, driver và output mute có thể làm khác trải nghiệm.

Mỗi phiên tối đa 10 giây. Preparing chờ resume tối đa 10 giây rồi báo bị chặn, không tự phát lại. Stop, Reset, blur, hidden, pagehide và unmount vô hiệu hóa phiên cũ; resume resolve/reject đến muộn không thể khởi tạo oscillator hoặc ghi đè phiên mới. Reset/unmount dọn cả timer đóng context đang chờ. Lỗi cấp phát một phần và context bị suspended/interrupted được xử lý rõ. Các thay đổi cấu hình khi preparing bị khóa để tránh ghi đè lựa chọn trong lúc resume chờ.

Tần số phải hữu hạn, từ 20 tới min(20.000, sampleRate/2 − 1) Hz; cấu hình không hợp lệ dừng phiên. Sample rate chỉ lấy từ AudioContext đã tạo, trước đó hiển thị —. Tần số là cấu hình OscillatorNode, không phải tần số âm thanh đo bằng microphone. Các dạng sóng khác sine có harmonic, browser có thể giới hạn chúng; không dùng làm bài kiểm tra thính lực hoặc đáp tuyến. Đang phát chỉ xác nhận graph hoạt động; Hoàn thành chỉ xác nhận tín hiệu kết thúc.

Thiết kế giữ tokens/font/spacing hiện có; thêm controls trong EngineSurface và icon audio. Không đổi kiến trúc. Status dùng nhãn audio riêng khi phát, không đổi trạng thái các engine cũ; lỗi tần số liên kết aria-describedby và aria-invalid. Demo tám trạng thái/ảnh QA chỉ ở artifacts, không commit.

## Kiểm thử tự động

Probe WebKit Windows cục bộ trả AudioContext và webkitAudioContext đều undefined; fallback thật đã được xác nhận. Bảy bài cần graph thật ghi skip kèm lý do trên build này, không chạy với mock thay thế và không tính là đã kiểm chứng playback. Hai bài còn lại kiểm tra lỗi có kiểm soát và fallback VI/EN/axe hai theme/responsive. Hook CI bắt buộc native AudioContext trước bảy bài: nếu thiếu API, CI phải fail, không được skip. Linux CI cần chạy đủ 172 bài không skip để chốt automated QA.

Các lệnh: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, `pnpm audit --prod`, `node scripts/scan-secrets.mjs`. Kết quả cuối và source/CI cụ thể được chốt ở PROGRESS.md và qa/phase2-milestone3.json; không coi bài đang chạy là đạt.

Unit kiểm tra validation/Nyquist, gain/channel graph, cập nhật một oscillator, thời hạn phiên, timeout resume, từ chối autoplay, context suspended, lỗi cấp phát/close, Stop/Reset/unmount và kết quả đến muộn. React StrictMode kiểm tra mount không phát, không có số đọc mẫu và cleanup sự kiện/timer.

Chín bài E2E mới mỗi cấu hình, tổng bộ hồi quy dự kiến 172 bài (43 × 4). API thật được quan sát qua wrapper AudioContext trong test; UI đặt mức 0 trước Start để không phát tiếng trên máy QA. Kiểm tra state/context close, tần số/dạng sóng thật, gain trái/phải, không tạo thêm oscillator khi chỉnh, auto-stop 10 giây thật, focus/navigation cleanup, permission failure fixtures, storage không bị ghi, axe hai theme và responsive 320/375/414/768/1024/1150/1280 px cả hai locale. Failure fixtures không phải đo phần cứng. Không suy ra chất lượng âm thanh từ gain value hoặc API state.

Docker smoke được mở rộng thành health + 18 route VI/EN qua Nginx ở ba thời điểm: ban đầu, restart, stop/start; gồm Speaker/Stereo/Generator. Cần đọc CI source mới để xác nhận build/healthy/private Node port/shutdown/logs. Windows hiện không có Docker Engine sử dụng được; không tuyên bố kiểm thử Docker cục bộ hoàn chỉnh.

## Manual QA bắt buộc còn mở

| Tình huống                 | Cách kiểm tra và tiêu chí                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Loa/tai nghe thật          | Âm lượng hệ thống thấp, Start/Stop/Reset; tự nghe tiếng, không gán trạng thái graph thành pass phần cứng                               |
| Stereo vật lý              | Tai nghe trái/phải hoặc hai loa, lần lượt Left/Right/Both; ghi thiết lập mono/spatial audio và kết quả nghe thật                       |
| Tần số/dạng sóng           | Kiểm tra vùng nghe thoải mái, chuyển tần số/dạng sóng; không suy ra thính lực/đáp tuyến, không tăng âm lượng để tìm âm không nghe được |
| Mute/output routing        | System mute, đổi output, tai nghe Bluetooth/USB, ngắt thiết bị; đối chiếu hành vi và khả năng browser báo lỗi                          |
| Autoplay và gián đoạn thật | Profile/policy chặn âm thanh, tab nền, khóa màn hình, phone call/interruption trên mobile; không tự phát lại sau khi trở về            |
| Safari thật                | macOS/iOS thật, user activation, resume, chuyển kênh, lifecycle; WebKit automation chưa thay thế QA này                                |
| Accessibility thủ công     | Screen reader VI/EN, keyboard/range/select, zoom, reduced motion và đọc thông báo lỗi/trạng thái                                       |

## Phân loại nghiệm thu

- Đã hoàn thành và xác minh: ba engine public dùng graph thật, VI/EN, registry/SEO/lifecycle, 146 unit/172 E2E và Docker CI source 1066568.
- Đã triển khai nhưng chưa xác minh bằng phần cứng: nghe Speaker/Stereo/Generator, mute/output routing và gián đoạn trên thiết bị thật.
- Chưa hoàn thành: tám draft còn lại; Final Acceptance toàn Phase 1/2 vẫn mở.
- Không thể kiểm chứng bằng automation hiện tại: âm thanh nghe được, stereo vật lý, chất lượng loa/DAC, Safari/thiết bị thật. Lighthouse source mới chưa đo; không tái sử dụng điểm cũ như kết quả mới.

Nguồn phương pháp: [Web Audio API W3C](https://www.w3.org/TR/webaudio/) cho OscillatorNode/GainNode/ChannelMergerNode, AudioContext resume/close và giới hạn sample rate; [Autoplay Policy Detection W3C](https://www.w3.org/TR/autoplay-detection/) nêu policy phụ thuộc user agent. Ứng dụng xử lý resume/state thực tế, không phụ thuộc API autoplay detection đang ở dạng dự thảo.

## Backend audio của Linux CI

CI đầu source 2bd1020 đạt 166/172 E2E; sáu bài Firefox không vượt qua resume/Preparing, trong khi Chromium/WebKit Linux/mobile đều 43/43. Workflow bổ sung PulseAudio với module-null-sink hai kênh và native audio smoke ba browser, lưu JSON kết quả rồi mới chạy E2E. Không thay browser API bằng mock và không tăng timeout để che lỗi. Run cuối 41027637979 source 1066568 đã xác minh backend và đủ 172 bài không skip. Null sink là output ảo; các số sample rate trong QA không phải thông số phần cứng. Tham khảo [mã nguồn module-null-sink của PulseAudio](https://github.com/pulseaudio/pulseaudio/blob/master/src/modules/module-null-sink.c).

## Kết quả chốt

**Nghiệm thu automated QA source 1066568:** CI [41027637979](https://github.com/anhtruc1803/checkall/actions/runs/41027637979) success cả verify và Docker. Typecheck/lint/build/secret scan đạt; 146/146 unit trên 23 file và 172/172 E2E, Chromium/Firefox/WebKit/mobile đều 43/43, không skip/unexpected/flaky. Đã tải và đọc [browser-qa JSON](https://github.com/anhtruc1803/checkall/actions/runs/41027637979/artifacts/12964761587), E2E 333755,564 ms (khoảng 5,6 phút). Native audio smoke ba browser đều resume/graph/close thành công với output ảo; sample rate context thực là Chromium 44.100, Firefox 48.000, WebKit 44.100 Hz, không phải thông số DAC/loa.

Docker source 1066568 đạt trong 70 giây: image build, healthy, Nginx, health + 18 route VI/EN ở ba checkpoint, Node không publish port, restart/stop-start và SIGTERM exit 143, OOMKilled false/Error rỗng. Đã đọc logs/containers/shutdown của [artifact Docker](https://github.com/anhtruc1803/checkall/actions/runs/41027637979/artifacts/12964093859), không có lỗi ứng dụng hoặc HTTP 4xx/5xx trong smoke. Image ID runner sha256:76b56e0d8a916deddaa5a50cd7449ed3e73817c5f5b084cb6848fd0fe9b08cdd; không push registry/VPS.

Local: unit cuối source 1066568 đạt 146/146; build/typecheck/lint đạt. Hồi quy toàn bộ build eea659e: 165 đạt, bảy skip WebKit Windows, 403283,617 ms. Sau deadline theo audio clock, build lại 2bd1020 và nhóm audio đạt 29, bảy skip WebKit Windows; không failure/flaky. Bảy skip không tính là đã kiểm chứng playback trên Windows WebKit; CI Linux cuối đã chạy đủ các bài này bằng native API. Không dùng kết quả build cũ làm bằng chứng deadline mới.

Lỗi CI Firefox Linux chờ resume ở run 41026457800 (166/172) được xử lý bằng PulseAudio null sink và native audio smoke, không sửa kỳ vọng E2E hoặc dùng mock thay API thật. Profile CI vẫn chạy đủ 172 bài. Null sink chỉ xác minh browser/graph, không xác nhận âm thanh nghe được.
