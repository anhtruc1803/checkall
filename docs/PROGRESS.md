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

Dùng UI/UX Pro Max và hướng dẫn focus visible; đọc tài liệu Server Components/CSS của Next.js cài trong repo. ProblemChooser là Server Component, CSS Module riêng trang chủ, sáu PolicyLink không prefetch để giữ đúng document policy và tránh tải engine khi chưa chọn. Có heading/nhãn VI-EN, mô tả phạm vi quan sát, link tối thiểu44px, reflow và focus; không tự đo/chẩn đoán hoặc yêu cầu microphone. File chính: problem-chooser.tsx/problem-chooser.module.css, trang chủ/messages và problem-chooser.spec.ts. Workflow Lighthouse thêm tùy chọn paths, giữ mặc định sáu trang và cho phép đo thêm homepage EN trong lượt này.

Checkpoint local: build106 trang/275 unit33 file đạt. TypeScript ban đầu bắt guard kiểm tra getUserMedia luôn có theo DOM type trong harness; đã đổi sang typeof để kiểm tra runtime đúng và typecheck/lint chạy lại đạt. Bài mới đang kiểm tra sáu link bằng Enter ở cả VI/EN, keyboard capture vẫn idle, spy không có yêu cầu getUserMedia, Axe hai theme, Tab order, 320/375/768/1024/1440px và chữ100/200%. Chưa nhận CI/Lighthouse source mới đạt hoặc đã cập nhật website; kết quả cuối sẽ bổ sung. Giữ đủ40 công cụ, không thêm dependency/font/ảnh ngoài, không đóng Final Acceptance hoặc bắt đầu Phase3.

Kiểm tra local đầu: 7/8 đạt; WebKit Windows thất bại ở thứ tự Tab vì anchor tự nhiên bị bỏ qua tới ô INPUT, trong khi Enter mở route đúng. Debug riêng xác minh Tab/Alt+Tab cùng bỏ qua link; đặt tabindex=0 rõ cho anchor thì Tab đi từ Refresh Rate sang Ghosting đúng. Đã thêm tabIndex=0 cho sáu PolicyLink mới (không dùng tabindex dương hoặc bỏ assertion). Ảnh Dark/Light/mobile/chữ200% đã xem; bổ sung icon microphone đúng cho thẻ âm thanh. Đang chạy lại production source cuối trên bốn project.

Sau sửa tabindex: nhóm mới **8/8 đạt** trên Chromium/Firefox/WebKit/mobile, không skip/failure/flaky; giữ kiểm tra thực Tab order đủ sáu link. Build106/typecheck/lint/275 unit đạt. Audit production mới0 finding, toàn bộ còn hai moderate dev glob/minimatch như trước. Đã xem ảnh cuối hai theme/mobile/chữ200%. Chuẩn bị gửi source cuối chạy full CI và đo 7 trang (thêm /en homepage), ba lượt/trang trên Linux sạch; chưa dùng điểm Lighthouse của source882c4d9 để nhận tính năng mới đạt.
