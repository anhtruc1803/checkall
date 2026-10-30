# Kiểm thử

## Phase 2 Milestone 3 — 30/10/2026

Ba công cụ Speaker/Stereo/Frequency Generator dùng Web Audio thật. Bộ unit/lifecycle mở rộng thêm validation/Nyquist, stereo graph, timer/late resume/cleanup và StrictMode; E2E thêm chín bài mỗi cấu hình, dự kiến tổng 172 (43 × Chromium/Firefox/WebKit/Chromium mobile). Automation phát ở mức 0, xác minh API/graph/lifecycle, không xác nhận nghe được hoặc stereo vật lý. Axe chạy ba công cụ ở Dark/Light; responsive VI/EN ở 320/375/414/768/1024/1150/1280 px. Toàn bộ hồi quy Phase 1/M2 được giữ. Chi tiết và manual QA ở [PHASE2-MILESTONE3.md](PHASE2-MILESTONE3.md); số đạt/source/CI cuối ở PROGRESS.md và qa/phase2-milestone3.json. Các kết quả M2 bên dưới là checkpoint lịch sử.

WebKit Windows hiện không expose AudioContext hoặc webkitAudioContext (probe trực tiếp); bảy bài cần playback thật ghi skip có lý do, không giả API để báo đạt. Có bài fallback riêng cho cả ba công cụ ở VI/EN, hai theme và responsive. Trên CI, thiếu native AudioContext làm test fail trước khi có thể skip; cần đủ 172 bài không skip để xác nhận graph thật đa browser. WebKit automation vẫn không tương đương Safari thật.

CI Linux audio cần backend output: workflow cài/chạy PulseAudio và tạo null sink hai kênh, không cần thiết bị thật. scripts/smoke-audio.mjs kiểm tra resume, graph mức 0 và close bằng native API của ba browser trước E2E; nếu backend không hoạt động, gate thất bại và lưu artifacts/audio-smoke/results.json. Không thay bằng mock hoặc bỏ bài phát âm. CI 41026457800 trước cấu hình backend đạt 166/172, sáu lỗi Firefox resume pending; kết quả sau cấu hình được ghi ở PROGRESS/JSON.

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
