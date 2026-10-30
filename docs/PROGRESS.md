# Tiến độ Phase 1

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
