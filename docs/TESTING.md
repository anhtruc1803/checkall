# Kiểm thử

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
- `node scripts/lighthouse.mjs --label clean-final --runs 3`: đo ba trang production, mỗi trang ít nhất ba lượt, lưu raw metrics và median. Xem PERFORMANCE.md để tạo origin HTTPS QA sạch trên Windows; không chạy đồng thời với E2E/build.
- Trên Windows: `./scripts/check-compose.ps1` tải Compose CLI 5.6.1 từ release chính thức, đối chiếu SHA-256 rồi kiểm tra cấu hình; không build/chạy image.
- `.github/workflows/ci.yml` chạy ba browser engines và Chromium mobile trên Linux, secret scan, unit/build và `scripts/docker-smoke.sh`. Kết quả thực thi của từng lần audit được ghi trong PROGRESS.md, không suy ra workflow đã đạt chỉ vì có file YAML.
- `node scripts/scan-secrets.mjs` rà file Git theo rule token/private key và file nhạy cảm; `--staged` kiểm tra đúng blob sắp commit, không in giá trị secret. Đây là kiểm tra theo mẫu, không bảo đảm phát hiện mọi loại secret.

Kết quả Lighthouse tại máy phát triển có ảnh hưởng từ JavaScript do phần mềm bảo vệ của máy chèn vào HTTP. Xem PERFORMANCE.md để đọc số liệu thật và phần còn chưa đạt, không suy ra điểm khi đã loại bỏ yếu tố môi trường.
