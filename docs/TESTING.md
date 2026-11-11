# Kiểm thử

## Sửa D/Backspace và giao diện — source 3191485, 11/11/2026

[CI 42991483325](https://github.com/anhtruc1803/checkall/actions/runs/42991483325) success verify/Docker: build 106 trang, typecheck/lint/secret scan, **305 unit trên 34 file, 354 E2E pass/6 skip**, không failure/flaky. Chromium/mobile 90 pass mỗi cấu hình; Firefox/WebKit 87 pass và 3 skip native microphone/camera/gamepad policy mỗi cấu hình. E2E 937530.787 ms; Docker job 84 giây, health/private Node/Nginx/34 route-policy/restart/stop-start đạt. Shutdown SIGTERM 143, OOM false/Error rỗng; trạng thái health sau khi container dừng không phải health đang chạy. Native audio smoke ba browser pass và context closed, không phải loa/microphone thật.

Local bản cuối: toàn bộ 305 unit/nhóm bàn phím 32, regression mới 8/8 (80837.953 ms), bộ bàn phím 36/36 (274237.126 ms). Trên HTTPS public đúng source 3191485: **24/24 pass**, không skip/flaky/failure (106732.597 ms), Chromium/Firefox/WebKit. Đã xem ảnh UI Light/Dark/mobile từ domain. Giữ 40 công cụ, 80 route công cụ và 100 URL sitemap.

Ca mới kiểm tra D ba lần, Backspace thật tách riêng, auto-repeat/maximum/hold rollback, Backspace trước unknown, IME 229 khi isComposing=false, compositionstart, Process, key/code Unidentified, bỏ 22 Backspace tiếp sau dừng, giữ lượt trước và retry. Checkpoint Chatter kiểm tra copy histogram độc lập. Có Axe cảnh báo VI/EN Dark/Light, hình học focus/hint; giữ bộ năm công cụ responsive/chữ 200%/heading-order và privacy/cleanup hiện có. Raw inspector giữ keyCode, key/code/isComposing không sửa thành dữ liệu tưởng tượng.

Các fixture có chú thích; không xác nhận UniKey/EVKey/keyboard vật lý. Lượt đầu vướng selector alert trùng Next.js; đã scope cảnh báo riêng. Rà tiếp phát hiện Firefox không luôn áp dụng focus-visible sau click, sửa focus cho vùng capture thay vì bỏ assertion. Một timeout WebKit xảy ra khi hai suite chạy đồng thời; bài hai locale/bốn Axe có timeout 90 giây, giữ đủ assertion. Kết quả checkpoint không thay thế run cuối. Manual QA cụ thể tại KEYBOARD-IMPROVEMENTS.md; Safari/IME thật/screen reader/OS zoom và Final Acceptance tiếp tục mở.

[Lighthouse public 42994636551](https://github.com/anhtruc1803/checkall/actions/runs/42994636551): chín lượt sạch đúng source 3191485, median **95/96/95** cho /vi, /vi/keyboard/tester, /en/keyboard/events; mọi lượt 93–96, A/BP/SEO 100. Kết quả thật và giới hạn tại [QA JSON](qa/keyboard-input-method-2026-11-11.json).

## Cải tiến bàn phím — 11/11/2026

Source 4e26811: [CI 42983550339](https://github.com/anhtruc1803/checkall/actions/runs/42983550339) success verify/Docker. Build 106 trang/typecheck/lint/secret scan, **292 unit trên 34 file và 346 E2E đạt/6 skip**, không failure/flaky. Chromium/mobile 88 đạt mỗi cấu hình; Firefox/WebKit 85 đạt/ba skip native microphone/camera/gamepad policy mỗi cấu hình. Full E2E 941394.031 ms. Không dùng CI bị hủy của7b/db hoặc local snapshot cũ nhận source mới đã nghiệm thu.

Kiểm tra bao phủ: native keydown/keyup/repeat, Exit không tự kích hoạt lại sau blur, Tab/Esc, coverage theo layout/ngoài layout, max combination thực nhận, Chatter vượt200 sự kiện/xóa log không mất aggregate, không nối cặp qua gián đoạn, ngưỡng và orphan/duplicate, các cờ event nguyên bản, IME/code thiếu fixture rõ, filter local, timer/hidden/unmount/giới hạn bộ nhớ. Unit storage/fetch spies xác nhận component không tự ghi/gửi phím; không suy rộng thành mọi request browser đều trống.

Local functional snapshot db28/28 đạt (206467.946 ms); sau sửa heading, bốn bài bao phủ đủ 5 tool/VI-EN/Dark-Light/WCAG+heading-order/zoom200%/responsive đạt4/4 (204373.368 ms). Full CI source cuối đã chạy cả các ca chức năng và heading. Fixture IME/clock/code không khả dụng không phải phần cứng thật; isTrusted=true của automation không chứng nhận phím vật lý.

Public keyboard **18/18 đạt** trên Chromium/Firefox/WebKit, không skip/failure/flaky, 61862.528 ms. Không coi WebKit là Safari thực tế hoặc skip native policy là enforcement đã xác minh. Native browser input kiểm tra Stop và các trường sự kiện; không test keyboard phần cứng. Docker CI job81 s: healthy/Nginx/34 route/policy ba checkpoint/private Node port/restart/stop-start, SIGTERM 143/OOM false/Error rỗng. Đã đọc JSON/log/native audio smoke context đóng; không thay engine audio/camera/gamepad.

Lighthouse cuối 42 lượt cùng VM và 21 lượt public, median≥90 đủ 7 trang, A/BP/SEO 100; số đo và môi trường tại PERFORMANCE.md/qa/keyboard-2026-11-11.json. Production audit 0 finding; audit toàn bộ còn 2 moderate dev tooling. Manual hardware/IME/Safari/screen reader/OS zoom còn mở ở KEYBOARD-IMPROVEMENTS.md. Final Acceptance chưa đóng.

## Chọn công cụ theo vấn đề — 10/11/2026

Source ca2344f: [CI 42790611051](https://github.com/anhtruc1803/checkall/actions/runs/42790611051) success verify/Docker. Build 106 trang/typecheck/lint/secret scan, 275 unit trên 33 file và 330 E2E đạt/6 skip, không failure/flaky. Local mới 8/8 và public 6/6 đạt; giữ đủ 40 công cụ/VI-EN. Không nhận WebKit là Safari thật hoặc skip native policy là enforcement đã xác minh. E2E toàn bộ 762292.843 ms; Chromium/mobile mỗi cấu hình 84 đạt, Firefox/WebKit 81 đạt/ba skip native microphone/camera/gamepad policy. Unit/native audio smoke đều giữ bộ kiểm tra hiện có, không đổi engine hoặc nới assertion.

Bộ mới kiểm tra ba dấu hiệu/hai link mỗi dấu hiệu ở cả VI/EN: Enter mở đúng sáu route và có workspace, keyboard capture còn idle, spy không có gọi getUserMedia trước Start. Spy chỉ xác nhận không tự yêu cầu capture, không kiểm chứng microphone thật. Có kiểm tra semantic region/heading/link, Axe hai theme, 320/375/768/1024/1440 px/chữ100–200%, reduced motion, target≥44 px và Tab order đủ sáu link.

Local đầu 7 đạt/một lỗi WebKit Windows: Tab bỏ anchor tự nhiên tới input. Debug Tab/Alt+Tab xác nhận, tabindex=0 rõ trên link khắc phục; đã sửa code và giữ assertion. Local cuối 8/8 đạt, 91483.840 ms, không skip/failure/flaky. Public 6/6 trên Chromium/Firefox/WebKit, 131672.631 ms, không skip/failure/flaky; không thay full CI bằng public smoke.

Docker Linux CI đã đọc containers/logs/shutdown: healthy, Nginx/34 route/policy ba checkpoint, private Node port, restart/stop-start, SIGTERM 143/OOM false/Error rỗng. Production audit 0 finding; toàn bộ vẫn hai moderate dev glob/minimatch, không thêm dependency. Lighthouse mới 42 lượt cùng VM/21 lượt public giữ median≥90 cả bảy trang; số đo tại PERFORMANCE.md/qa/problems-2026-11-10.json.

Manual còn Safari/điện thoại thật/screen reader/OS zoom và quyền microphone trên thiết bị thật; xem UI-UX-REFRESH.md cùng ma trận từng milestone. Không đóng Final Acceptance tổng thể.

## Performance giao diện mới — 10/11/2026

Source ad25dd1: [CI 42775890687](https://github.com/anhtruc1803/checkall/actions/runs/42775890687) success verify/Docker, build 106 trang/typecheck/lint/secret scan và **275 unit/33 file đạt**. **318 E2E đạt/6 skip**, không failure/flaky, 668827.891 ms. Chromium/mobile mỗi cấu hình 81 đạt, Firefox/WebKit 78 đạt/ba skip native policy; giữ toàn bộ 324 bài/40 công cụ/80 route công cụ. Không coi WebKit là Safari thật hoặc skip là enforcement đã đạt.

Nhóm UI local source tối ưu **44/44 đạt**, không skip/failure/flaky, 183267.522 ms; ba UI public Chromium/Firefox/WebKit **3/3 đạt**, 38789.722 ms. Sau triển khai app healthy/private Node port, smoke health + 34 route/policy, canonical/sitemap 100 URL và CSS/release marker đúng. Docker CI job 77 giây kiểm tra ba checkpoint, restart/stop-start, SIGTERM 143 không OOM/Error; artifacts đã đọc.

Lighthouse Linux: 18 lượt baseline đầu và 36 lượt so sánh trước/sau cùng VM đều sạch; sau có median 100/100/100/99/99/99. HTTPS public sau chuyển release 18 lượt sạch, median 95/98/97/97/96/97, mọi lượt ≥95. Mỗi lượt profile mới/extension tắt, mobile simulated/RTT 150 ms/1638,4 Kbps/CPU ×4; public xác minh TLS và nội dung app thật, không dùng trang challenge làm kết quả. Chi tiết số thực/điều kiện tại PERFORMANCE.md và qa/performance-ui.json; hồi quy tại qa/performance-validation.json.

Smoke riêng kiểm tra harness Windows /en giữ đủ 88/97/89, median 89; CPU/TBT khác runner Linux và SEO 92 do origin QA khác SITE_URL, không nhận Windows ≥90. Không dùng nhóm này tính mức tăng trước/sau. Hardware/Safari/screen reader/field data và các mục bảo mật/tooling cũ còn mở; Final Acceptance vẫn chưa hoàn tất. Không chạy Lighthouse đồng thời build/E2E trong VM đo hoặc tạo số phần cứng giả.

## Nâng cấp UI/UX — 10/11/2026

Thêm interface.spec.ts: shortcut và count lấy theo registry trong VI/EN; filter/search/clear giữ category và trả focus; hai theme ở 320/375/414/768/1024/1440 px; tăng chữ 200%, reduced motion và keyboard activation. Giữ toàn bộ bài cũ; bộ đầy đủ hiện 324 E2E (81/cấu hình). Không sửa engine hoặc nới assertion để đổi giao diện.

Checkpoint ban đầu: 275 unit/33 file, build 106 trang, typecheck/lint đạt. Lượt Chromium interface + quality 7 đạt/một lỗi reflow shortcut khi chữ 200%; đã sửa auto-fit/minmax theo rem, chạy lại ba bài interface đạt. Full E2E khi đổi phiên bị gián đoạn, không có report cuối. Source 49bd12f đạt 92 local; source 27f1383 bị 19 lỗi accessibility trong CI, lịch sử/nguyên nhân/sửa được giữ tại PROGRESS.md.

**Kết quả cuối source 387c03f:** [CI 42759176453](https://github.com/anhtruc1803/checkall/actions/runs/42759176453) đạt build/typecheck/lint/secret scan, 275 unit/33 file; **318 E2E đạt/6 skip**, không failure/flaky, 681819.829 ms. Chromium/mobile mỗi cấu hình 81 đạt, Firefox/WebKit mỗi cấu hình 78 đạt/ba skip native policy. Không giả skip thành enforcement đã đạt. Nhóm local sau sửa logo và tương phản theme **32/32 đạt** trên bốn cấu hình, 316821.173 ms, gồm toàn bộ ma trận accessibility từng lỗi; giữ assertion.

Docker CI source cuối đạt 87 giây: healthy/private Node port/Nginx/health + 34 route/policy ba checkpoint, restart/stop-start và SIGTERM 143, không OOM/Error. Đã đọc artifacts. Sau triển khai VPS: HTTP smoke 34 route/policy đạt; public HTML/CSS release mới, canonical, sitemap 100 URL và HTTPS đạt; **ba UI E2E public đạt** trên Chromium/Firefox/WebKit, không skip/failure/flaky, 38009.247 ms. Public smoke không thay full CI hoặc Safari/thiết bị thật. CSP public vẫn thiếu; không chỉnh dashboard proxy của người dùng. QA tổng hợp tại [qa/ui-ux-refresh.json](qa/ui-ux-refresh.json), manual QA tại UI-UX-REFRESH.md. Final Acceptance còn mở.

## Smoke staging ngày 06/11/2026

Release fca62c6 đã build/chạy Docker trên VPS theo yêu cầu, tại https://nguyenanhtruc.io.vn. Không thay code hoặc assertion của ứng dụng. `node scripts/smoke-http.mjs https://nguyenanhtruc.io.vn` đạt health + 34 route VI/EN và scope Permissions-Policy, chạy lại đạt sau restart app. Nginx syntax/health/Node port private đạt; Certbot renewal dry-run kèm deploy hook đạt. HTTP → HTTPS 308, canonical VI/EN đúng và sitemap 100 URL duy nhất cùng domain.

Nhóm E2E public: `shell.spec.ts`, `screen.spec.ts`, `keyboard.spec.ts`, `mouse.spec.ts`, cấu hình tạm không khởi động webServer local, hai worker và ba project. **45 đạt**, Chromium/Firefox/WebKit mỗi browser 15, không skip/failure/flaky, 114678.238 ms. Bao gồm navigation các route công cụ, locale/theme/responsive, Refresh Rate/fullscreen, keyboard và mouse. Đây là smoke qua domain thực, không thay bộ 306 E2E M6 trên CI và không xác minh camera/microphone/gamepad vật lý hoặc Safari thật. Các giới hạn môi trường Windows/Kaspersky đã ghi ở checkpoint M6 vẫn còn; không suy ra privacy sạch chỉ từ smoke staging này.

Lượt harness đầu nhập base config sai dạng module: 14 đạt/một lỗi 503 từ rate limit, chỉ một project/sáu worker. Sau khi sửa harness thành ba project/hai worker, chạy lại 45 đạt; không đổi rate limit hoặc giảm assertion. Raw log/JSON ở artifacts bị ignore, bản tổng hợp không chứa credential tại [qa/staging-2026-11-06.json](qa/staging-2026-11-06.json).

CSP **có ở origin nhưng thiếu ở response public** khi đo lại 15:58 Asia/Saigon, kể cả URL có query mới. Người dùng tự quản lý proxy/tên miền; không chỉnh dashboard và không đánh dấu tiêu chí này đạt. Scoped Permissions-Policy public được kiểm tra độc lập, không chứng minh mọi browser enforce directive. Chưa chạy Lighthouse mới, reboot host, rollback release cũ hoặc manual hardware QA. Final Acceptance tiếp tục mở.

## Checkpoint M6 trước staging

Milestone hiện hành: Phase 2 Milestone 6 (05/11/2026). Checkpoint cục bộ build/typecheck/lint và 275 unit/integration trên 33 file đạt. [CI 41984091737](https://github.com/anhtruc1803/checkall/actions/runs/41984091737) source 76a71ce: 306 E2E đạt/6 skip native policy, không failure/flaky; 612200.268 ms, tổng 312 bài (78/cấu hình). Local M6 43 đạt/hai skip/ba lỗi do request Kaspersky chèn; không tính là môi trường sạch. Native discovery/fallback và native policy tách khỏi fixture nút/trục/drift. Fixture/Playwright Clock không phải phần cứng hoặc native gamepad injection. Axe VI/EN hai theme/idle-running-disconnected, responsive/keyboard/document navigation. Kết quả/source/skip/CI thật ghi cuối PROGRESS.md và qa/phase2-milestone6.json; manual QA trong PHASE2-MILESTONE6.md.

Checkpoint lịch sử: Phase 2 Milestone 5 (05/11/2026). Bộ hiện tại 234 unit/integration trên 30 file; [CI 41956011535](https://github.com/anhtruc1803/checkall/actions/runs/41956011535) source f260bfd: 260 E2E đạt/4 skip, không failure/flaky, trong 374144.780 ms; tổng 264 (66/cấu hình). Chromium/mobile mỗi cấu hình 66 đạt; Firefox/WebKit mỗi cấu hình 64 đạt/hai skip native policy. Local nhóm M5: 38 đạt/ba skip/ba lỗi assertion do request Kaspersky chèn, không tính là môi trường sạch. Giữ hồi quy 34 công cụ cũ, thêm 11 bài camera/cấu hình. Native getUserMedia dùng camera ảo, video/getSettings/rVFC thật; fixture riêng kiểm tra lỗi/pending/playback/lifecycle, không thay native capture. Axe toàn trang VI/EN hai theme, idle/running/error, responsive và keyboard. Windows WebKit thiếu mediaDevices ghi skip riêng; CI yêu cầu native API. Native header enforcement khi runtime không expose policy API ghi skip riêng, không coi là đạt. Chi tiết phương pháp/manual QA ở [PHASE2-MILESTONE5.md](PHASE2-MILESTONE5.md). Kết quả cuối từng lượt/source/CI ở PROGRESS.md và qa/phase2-milestone5.json.

## Phase 2 Milestone 4 — 05/11/2026

Cập nhật sau checkpoint: bộ mở rộng 220 E2E (55/cấu hình), native capture và native header enforcement là hai bài độc lập. Firefox không expose policy API và probe vẫn capture khi header khai báo microphone=(); đối chiếu [Mozilla bug 1694922](https://bugzilla.mozilla.org/show_bug.cgi?id=1694922). Capture/Stop và analyser vẫn bắt buộc chạy. Bài native header enforcement ghi skip theo capability khi browser chưa triển khai; không tính skip là tiêu chí bảo mật đã đạt. Header scope HTTP/Nginx và nhánh policy của ứng dụng vẫn được kiểm tra. Yêu cầu native Web Audio trên CI giữ nguyên. InputSession bổ sung kiểm tra readyState khi track ended nhưng không có event; kết quả cuối ở PROGRESS/JSON.

Bộ unit hiện 194 bài trên 27 file; kiểm tra InputSession, thuật toán RMS/FFT, permission/media failures, late grant/denial/resume, lifecycle/StrictMode và policy navigation. Mười hai E2E mới mỗi cấu hình, tổng 220 (55/cấu hình), giữ hồi quy 32 công cụ cũ. Kiểm tra policy tất cả non-media tool routes, capture native với input ảo, analyser native từ MediaStream tổng hợp 1 kHz, Stop/Reset/revocation/mute/ended/late cleanup và chuyển document qua catalog/related/search. Không gán tín hiệu QA thành số đo phần cứng.

Axe hai theme cho chạy/lỗi/fallback; responsive VI/EN 320/375/414/768/1024/1280 px. WebKit Windows thiếu Web Audio phải ghi skip native riêng, không giả API để báo capture đạt; CI bắt buộc native API. WebKit automation và Chromium mobile emulation không thay Safari/thiết bị thật. Manual QA và nguồn phương pháp ở [PHASE2-MILESTONE4.md](PHASE2-MILESTONE4.md). Kết quả/source/CI cuối ở PROGRESS.md và qa/phase2-milestone4.json; các đoạn M3 bên dưới là lịch sử.

Kết quả cuối source 8f6e773: [CI 41949819465](https://github.com/anhtruc1803/checkall/actions/runs/41949819465) success, 194 unit/27 file; 218 E2E đạt, hai skip native policy, không failure/flaky. Chromium/mobile đều 55; Firefox/WebKit đều 54 + một skip. Native capture/analyser/lifecycle chạy đủ cả bốn cấu hình; skip không tính là tiêu chí chặn policy đã đạt. JSON và annotations đã đọc. Local M4 cuối 41 đạt/bảy skip (WebKit Windows thiếu native audio, Firefox policy thiếu API); không tuyên bố toàn bộ 220 đạt cục bộ. Chi tiết timing/source/attempts ở qa/phase2-milestone4.json.

## Phase 2 Milestone 3 — 30/10/2026

Ba công cụ Speaker/Stereo/Frequency Generator dùng Web Audio thật. Bộ unit/lifecycle mở rộng thêm validation/Nyquist, stereo graph, timer/late resume/cleanup và StrictMode; E2E thêm chín bài mỗi cấu hình, tổng 172 (43 × Chromium/Firefox/WebKit/Chromium mobile). Automation phát ở mức 0, xác minh API/graph/lifecycle, không xác nhận nghe được hoặc stereo vật lý. Axe chạy ba công cụ ở Dark/Light; responsive VI/EN ở 320/375/414/768/1024/1150/1280 px. Toàn bộ hồi quy Phase 1/M2 được giữ. Chi tiết và manual QA ở [PHASE2-MILESTONE3.md](PHASE2-MILESTONE3.md); số đạt/source/CI cuối ở PROGRESS.md và qa/phase2-milestone3.json. Các kết quả M2 bên dưới là checkpoint lịch sử.

WebKit Windows hiện không expose AudioContext hoặc webkitAudioContext (probe trực tiếp); bảy bài cần playback thật ghi skip có lý do, không giả API để báo đạt. Có bài fallback riêng cho cả ba công cụ ở VI/EN, hai theme và responsive. Trên CI, thiếu native AudioContext làm test fail trước khi có thể skip; cần đủ 172 bài không skip để xác nhận graph thật đa browser. WebKit automation vẫn không tương đương Safari thật.

CI Linux audio cần backend output: workflow cài/chạy PulseAudio và tạo null sink hai kênh, không cần thiết bị thật. scripts/smoke-audio.mjs kiểm tra resume, graph mức 0 và close bằng native API của ba browser trước E2E; nếu backend không hoạt động, gate thất bại và lưu artifacts/audio-smoke/results.json. Không thay bằng mock hoặc bỏ bài phát âm. CI 41026457800 trước cấu hình backend đạt 166/172, sáu lỗi Firefox resume pending; sau cấu hình, CI 41027637979 source 1066568 đạt 172/172, mỗi cấu hình 43/43, không skip/flaky; native audio smoke ba browser đạt.

Kết quả cuối: build/typecheck/lint, 146/146 unit (23 file), 172/172 E2E trên [CI source 1066568](https://github.com/anhtruc1803/checkall/actions/runs/41027637979); E2E 333755,564 ms. Đã đọc JSON và xác nhận Chromium/Firefox/WebKit/mobile đều 43/43, không skip/flaky. Local 146 unit cuối đạt; hồi quy build eea659e 165 đạt/bảy skip, nhóm audio build deadline 2bd1020 29 đạt/bảy skip. Các skip đều do WebKit Windows không có native API, đã được CI Linux kiểm tra đủ; không gọi là 172 bài đạt cục bộ. Chi tiết nguồn/bằng chứng ở qa/phase2-milestone3.json.

## Phase 2 Milestone 2 — 30/10/2026

Tám công cụ mới có readers/thuật toán tách khỏi UI. Bộ unit/lifecycle hiện 118 bài trên 21 file; E2E mở rộng từ 24 lên 34 bài mỗi cấu hình, tổng 136 bài dự kiến. Số đạt thực và run/commit cuối nằm ở cuối PROGRESS.md, không suy ra đã đạt chỉ từ số bài dự kiến.

Kiểm tra mới: device/browser đọc chủ động và Reset; GPU không tự tạo context, opt-in driver details, WebGL 2/1/lost/blocked và cleanup; Web Storage ghi/đọc/xóa đúng khóa riêng, collision/cleanup failure, estimate/persisted thiếu hoặc lỗi; pointer thật, path break/buffer cap, hit/miss và giới hạn tác vụ; timer/blur/hidden/unmount/Fullscreen late request/ownership/ResizeObserver/pointer capture cleanup. Failure fixtures dùng dữ liệu kiểm thử xác định, không phải số đo phần cứng.

E2E vẫn giữ 21 engine Phase 1 và 42 route cũ, kiểm tra tổng 58 route công cụ/72 URL nội dung, 11 draft còn lại không public. Bổ sung tám engine, thao tác click/move/touch mà browser automation nhận thực, primary mouse scoring, keyboard không tạo điểm giả, storage không xóa dữ liệu khác, GPU/storage fallback. Published non-media pages được theo dõi getUserMedia/permissions.query và header, kể cả sau thao tác đọc snapshot.

Axe chạy tám trang mới ở Dark/Light; responsive kiểm tra 320/375/414/768/1024 px và language switch giữ route. Fullscreen chỉ thử vào/thoát khi browser hỗ trợ, nếu không phải có fallback. Không coi WebKit automation hoặc Chromium iPhone emulation là Safari/thiết bị cảm ứng thật. Ma trận manual chi tiết ở [PHASE2-MILESTONE2.md](PHASE2-MILESTONE2.md).

**Kết quả cuối source 097404e:** local 118/118 unit trên 21 file và 136/136 E2E (340325,84 ms); CI [41007493526](https://github.com/anhtruc1803/checkall/actions/runs/41007493526) success cả verify và docker-smoke, cùng 118 unit/136 E2E (224967,275 ms). Mỗi cấu hình 34/34, không skip/flaky. Đã tải [browser-qa JSON](https://github.com/anhtruc1803/checkall/actions/runs/41007493526/artifacts/12956800342) và đối chiếu thống kê. Lượt đầu local 135/136 do tọa độ mobile nằm ngoài viewport, được sửa bằng scrollIntoView và assertion viewport, không giảm số mẫu/quãng đường cần nhận. Sau sửa, toàn bộ source cuối đã chạy lại đạt.

## Tự động

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm exec playwright install chromium firefox webkit
pnpm build
pnpm test:e2e
```

Playwright hiện có bốn cấu hình: `chromium`, `firefox`, `webkit` và `mobile` (Chromium giả lập iPhone). Chạy riêng bằng `pnpm exec playwright test --project=firefox` hoặc `--project=webkit`. **WebKit automation trên Windows/Linux không phải kiểm tra Safari thật trên macOS/iOS.**

Ngoài các luồng tương tác, `registry.spec.ts` lần lượt mount đủ 21 engine/capability fallback và kiểm tra HTML ban đầu có giao diện inert trước hydration. `lifecycle.test.tsx` kiểm tra cleanup các RAF, ResizeObserver, timers và listeners. Bài Polling Rate dùng cửa sổ 20 giây để chuỗi mouse automation không chạy hết thời gian trên WebKit chậm; vẫn yêu cầu mẫu thực, kết quả hợp lệ, Stop và Reset.

## Kết quả rà soát ngày 29/10/2026

- Windows production standalone: 29/29 unit/integration tests, 88/88 E2E (22 bài cho mỗi cấu hình), typecheck/lint/build đạt.
- Sau sửa background transition của nút, lặp riêng axe WebKit ba lần: 3/3 đạt trên năm trang × hai theme. Không tắt color-contrast hoặc bỏ phần tử khỏi audit.
- Job verify Linux của [run 40816398723](https://github.com/anhtruc1803/checkall/actions/runs/40816398723) đạt 29 unit và 88 E2E, gồm axe hai theme, trong 1,7 phút E2E. Toàn run này vẫn fail do assertion Docker exit 0 sai với Next.js; không gán nhãn toàn pipeline đạt.
- CI cuối [40816709418](https://github.com/anhtruc1803/checkall/actions/runs/40816709418), commit d82120b: **cả verify và docker-smoke success**; 29 unit, 88 E2E (22/22 mỗi cấu hình, 2,2 phút E2E), typecheck/lint/secret scan/build đạt. Docker smoke đầy đủ đạt; bằng chứng ở qa/docker.json và artifact Docker. E2E thành công được lưu trong job logs; trace chỉ giữ khi fail nên bước upload browser có cảnh báo không có file trong lượt toàn bộ đạt.
- Bộ Lighthouse sạch cuối có ba lượt cho mỗi trang; Performance chưa đạt 90. Dữ liệu trước/sau và revision đo ở PERFORMANCE.md.

Fullscreen chỉ được thử nhánh vào/thoát khi API khả dụng. Refresh dùng RAF thật của browser; input tests dùng event automation thật mà browser nhận, không suy ra tần số panel hoặc USB. Safari thật, giao diện màn hình thử màu, cảm ứng nhiều ngón, tổ hợp phím hệ thống và screen reader vẫn cần manual QA.

Playwright chạy production server nếu chưa có server tại `http://localhost:3000`. Khi development server đang chạy, cấu hình sẽ dùng lại server đó; dừng dev trước khi đo production. `localhost` cần thiết trong môi trường Windows hiện tại vì HMR qua 127.0.0.1 bị reset. Bản release phải chạy E2E trên production build.

Vitest dùng dữ liệu tổng hợp xác định cho aspect ratio, PPI, frame intervals, pointer rate, chatter, double click và CPS. Kiểm thử tích hợp kiểm tra validation và vòng đời tài nguyên. E2E không chứng minh phần cứng thực.

## Ma trận phần cứng cần làm thủ công

Các mục dưới đây **chưa được xác minh bằng phần cứng thực**, không được đánh dấu đạt chỉ dựa trên automation.

| Thiết bị                   | Thao tác                                            | Cần ghi nhận                                                        |
| -------------------------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| Màn hình 60/120/144 Hz     | Chạy A05 ba lượt 10 giây khi tab ở phía trước       | Median, độ lệch chuẩn, tải CPU, OS, browser, màn hình đang dùng     |
| Nhiều màn hình / scaling   | Di chuyển cửa sổ, đổi scaling và zoom               | CSS dimensions, viewport, DPR, khác biệt native resolution          |
| LCD / IPS / OLED           | A06–A09 toàn màn hình, phòng sáng và tối            | Người quan sát ghi chú; không tự chẩn đoán pixel/hở sáng            |
| Màn hình gaming            | A10 ở nhiều tốc độ, tương phản và hướng             | Vệt bóng quan sát được, frame timing; không suy ra GTG/MPRT         |
| Thiết bị cảm ứng           | 1, 2, 5 và nhiều ngón; pointercancel; xoay màn hình | Dấu chạm, số active, trail và reset                                 |
| Bàn phím ANSI / ISO        | Từng phím, các layout, numpad và modifier           | code nhận được, tổ hợp bị OS chặn                                   |
| Bàn phím cơ / laptop       | Hold, auto-repeat, nhiều phím, nhấn nhanh           | Phân biệt repeat/chatter; mất focus xóa held; không chứng nhận NKRO |
| Chuột 3/5 nút              | Từng nút, nhấp đơn/đôi, giữ rồi kéo ra ngoài        | Counter, release, pointercancel, context menu trong/ngoài vùng thử  |
| Chuột có polling khác nhau | C05 nhiều lượt, di chuyển liên tục                  | Coalesced support, mẫu hợp lệ; không xác nhận USB polling rate      |
| Con lăn / touchpad         | Cuộn dọc/ngang ở các deltaMode                      | Hướng, delta, vùng thử chặn cuộn; ngoài vùng vẫn cuộn trang         |
| Browser engines            | Chromium, Firefox, Safari/WebKit                    | Fullscreen, visualViewport, clipboard, coalesced và fallback        |

## Accessibility và giao diện

- Chỉ dùng bàn phím đi qua menu, tìm kiếm, form, FAQ; focus luôn thấy được.
- Capture bàn phím có nút kích hoạt, Tab/Esc thoát; mất focus không để phím kẹt.
- Fullscreen có nút thoát và Esc; không có nhấp nháy nhanh.
- Thử light/dark, prefers-reduced-motion, zoom 200%, độ rộng 320/375/414/768 px.
- Kiểm tra chuỗi VI/EN, metadata và language switcher giữ route.
- Không coi Lighthouse 90+/95+/95+ là đạt nếu chưa có báo cáo thực.

## Dữ liệu và vòng đời

- Không bật lưu: reload không có lịch sử. Bật lưu và bấm lưu: tối đa 30 tóm tắt.
- Xóa dữ liệu chỉ xóa key `device-lab:*` và cookie ngôn ngữ liên quan.
- Rời route: RAF, timers, pointer capture, listener và Fullscreen phải được dọn.
- Tab ẩn: dừng các lượt lấy mẫu, không hiển thị kết quả như thông số phần cứng chắc chắn.
- Chặn localStorage, clipboard hoặc Fullscreen: thông báo rõ, công cụ còn lại vẫn dùng được.

Kết quả chạy thực tế từng milestone và lần xác minh cuối nằm trong `docs/PROGRESS.md`.

## Công cụ QA bổ sung

- `node scripts/inspect-browser.mjs`: lưu ảnh desktop/mobile/capture keyboard trong `artifacts/` và báo lỗi browser nhận được.
- `node scripts/lighthouse.mjs --label clean-release --runs 3`: đo ba trang production, mỗi trang ít nhất ba lượt, lưu raw metrics và median. Xem PERFORMANCE.md để tạo origin HTTPS QA sạch trên Windows; không chạy đồng thời với E2E/build.
- Trên Windows: `./scripts/check-compose.ps1` tải Compose CLI 5.6.1 từ release chính thức, đối chiếu SHA-256 rồi kiểm tra cấu hình; không build/chạy image.
- `.github/workflows/ci.yml` chạy ba browser engines và Chromium mobile trên Linux, secret scan, unit/build và `scripts/docker-smoke.sh`. Kết quả thực thi của từng lần audit được ghi trong PROGRESS.md, không suy ra workflow đã đạt chỉ vì có file YAML.
- `node scripts/scan-secrets.mjs` rà file Git theo rule token/private key và file nhạy cảm; `--staged` kiểm tra đúng blob sắp commit, không in giá trị secret. Đây là kiểm tra theo mẫu, không bảo đảm phát hiện mọi loại secret.

Kết quả Lighthouse tại máy phát triển có ảnh hưởng từ JavaScript do phần mềm bảo vệ của máy chèn vào HTTP. Xem PERFORMANCE.md để đọc số liệu thật và phần còn chưa đạt, không suy ra điểm khi đã loại bỏ yếu tố môi trường.

## Phase 2 — Milestone nền tảng

Bộ unit bổ sung registry draft/publication guard, capability/SSR, permission observer và media session. Các lỗi DOMException dùng dữ liệu giả xác định; kiểm tra late grant/rejection sau dispose, start trùng, retry, stream rỗng/ended, Stop/pagehide/hidden/track ended và cleanup listener. Đây không phải kiểm thử camera/microphone thật.

Bộ E2E tăng từ 22 lên 24 bài cho mỗi cấu hình, tổng 96 bài dự kiến. Giữ toàn bộ hồi quy Phase 1; thêm bài kiểm tra 19 draft × VI/EN trả 404 và không xuất hiện ở search/navigation/sitemap, cùng bài xác nhận public pages không gọi media/permission và header chặn vẫn nguyên. Kết quả thực chạy ở cuối PROGRESS.md, không lấy số bài dự kiến làm số đã đạt.

Kết quả cục bộ milestone: **86/86 unit/integration tests (16 file), 96/96 E2E (24/24 mỗi browser), typecheck/lint đạt**. E2E 7,7 phút; WebKit không được tính là Safari thật. JSON raw có đủ project/results/statistics. Bằng chứng CI sẽ được ghi theo revision/run riêng, không dùng lại kết quả Phase 1.

CI Linux cuối của source 5ef7ae1: [run 40836651018](https://github.com/anhtruc1803/checkall/actions/runs/40836651018) success, cả verify và docker-smoke. 86 unit, 96 E2E, typecheck/lint/secret scan/production build đạt. Đã đọc artifact JSON: Chromium/Firefox/WebKit/mobile mỗi cấu hình 24 passed/0 failed/0 skipped; flaky 0, E2E 140343,642 ms (khoảng 2,3 phút). Browser artifact [12880917721](https://github.com/anhtruc1803/checkall/actions/runs/40836651018/artifacts/12880917721) đã được upload kể cả khi không có failure. Docker smoke source này đạt trong 74 giây; không cần lấy pipeline cũ làm bằng chứng.

Playwright lưu artifacts/playwright/results.json cho cả lượt thành công. CI upload artifact browser-qa chứa JSON cùng trace/test-results khi có; không còn phụ thuộc vào việc phải có failure mới có bằng chứng browser. Không commit JSON raw/artifacts vào Git.

Trước khi công bố công cụ media ở milestone sau, bổ sung E2E phù hợp cho cấp/từ chối quyền trong secure context, route policy thực và thiết bị giả của browser; đồng thời manual QA microphone/webcam/loa/gamepad và Safari thật. Không nới header toàn website để làm bài kiểm thử dễ đạt.

## Bàn lab tương tác — 10/11/2026

Source 882c4d9: [CI 42783852103](https://github.com/anhtruc1803/checkall/actions/runs/42783852103) success, build 106 trang/typecheck/lint/secret scan, 275 unit/33 file và **322 E2E đạt/6 skip**, không failure/flaky, 717456,362 ms. Chromium/mobile 82 đạt mỗi cấu hình; Firefox/WebKit 79 đạt/ba skip native policy mỗi cấu hình. Giữ nguyên lý do skip, không coi là Safari thực tế. Bộ UI local 16/16 đạt trên bốn cấu hình; public sáu bài category/search và minh họa trên ba browser đạt, không skip/failure/flaky. Lượt đầu 12 đạt/bốn lỗi chữ 200% do white-space kế thừa, đã sửa reflow và chạy lại, không nới assertion.

Bài mới kiểm tra VI/EN, chú thích không phải kết quả đo, SVG trang trí, nút aria-pressed, click/tap/Space/Enter, pointer reset, reduced motion và Refresh Rate không đổi thành số giả. Ma trận cũ mở rộng selector hero/summary ở 320/375/414/768/1024/1440 px, hai theme và chữ 200%; Axe kiểm tra thêm vùng mới. Không gọi camera/microphone/gamepad khi tương tác hero; không thêm timer, listener toàn cục hoặc ghi sự kiện.

Docker Linux CI job 81 giây đạt 34 route/policy ba checkpoint/restart/stop-start/private port/SIGTERM143 không OOM. Production dependency audit 0 finding; audit toàn bộ còn hai moderate dev glob/minimatch. Lighthouse mới: 36 lượt so sánh cùng VM đạt median sau 99/99/99/98/97/98; 18 lượt HTTPS public đạt median sáu trang đều 99, A/BP/SEO đều 100. Từng lượt và môi trường tại PERFORMANCE.md/qa/lab-scene-2026-11-10.json. Public UI 76275,86 ms. Manual QA mới tại UI-UX-REFRESH.md; vẫn cần thiết bị/Safari/screen reader/OS zoom thật. Giữ đủ 40 công cụ, 80 route công cụ VI/EN/100 URL nội dung và Final Acceptance mở.
