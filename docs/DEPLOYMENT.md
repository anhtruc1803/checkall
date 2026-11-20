# Triển khai và vận hành

## Tiện ích Milestone 2 đang phục vụ — 19/11/2026

Báo cáo hoàn thiện và kiểm tra lại HTTP ngày **20/11/2026**; số liệu CI, Lighthouse và snapshot Docker/runtime bên dưới thuộc đợt phát hành **19/11/2026**. Kết luận và phân loại chi tiết: [Nghiệm thu Milestone 2](ACCEPTANCE-UTILITIES-MILESTONE-2.md).

Source **142f807dbb87374452acb65a8be6e2052caa5367**, [CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/44492926836), [Lighthouse trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/44493548246) và [Lighthouse public](https://github.com/anhtruc1803/checkall/actions/runs/44498282182). Giữ nguyên 42 công cụ trước (40 thiết bị + U01/U02), thêm U03–U06: **46 công cụ VI/EN**, **92 route công cụ**, sitemap **114 URL**. Mã ứng dụng, tests và scripts không đổi từ bản người dùng đã duyệt; các commit sau chỉ chuẩn hóa CI/tài liệu.

Typecheck/lint/secret scan đạt, **494 unit/41 file**, production build **120 trang**; full E2E **434 đạt/6 native policy skip**, không fail/flaky/global error, 1.034.526,065 ms. Chromium/mobile mỗi 110 đạt; Firefox/WebKit mỗi 107 đạt/3 skip. Nhóm văn bản **32/32**, tiện ích số **24/24** sạch. Backend audio ảo qua smoke cả ba engine; không chứng nhận phần cứng thật hoặc Safari.

Trước chuyển đủ **48 mẫu sạch/16 trang × 3**, median mobile **99–100**; sau chuyển đủ **48 mẫu sạch/16 trang × 3**, median **95–98**. Cả hai bộ có median Accessibility/Best Practices/SEO 100 trên mọi trang. Kiểm tra source/path/pageVerified/clean của từng mẫu; không chỉ dựa job success. Giữ toàn bộ 96 sample và median FCP/LCP/TBT/CLS/JS/font/ảnh trong [QA phát hành](qa/deployment-utilities-milestone2-2026-11-19.json). Không lấy mẫu Windows bị Kaspersky chèn hoặc dữ liệu M1 làm baseline tăng điểm M2.

VPS current→`/opt/device-lab/releases/142f807`, image **device-lab:staging-142f807-20261119**, ID **sha256:d75f3fd8a673b27311c3e9f585b5a38a2c2ead7190d7379715e337628124ec10**. Archive Git tracked SHA256 **797d67bdf02804fa4489886396852ba0fefe52689cf52111455861bf004a7571**, không mang .env/secret/cache. Candidate thử network none/non-root/read-only, đủ 92 route/sitemap 114 trước/sau restart/stop-start, SIGTERM 143/không OOM/Error, Node không public. Chỉ sau gate CI/Lighthouse/candidate đạt mới chuyển ứng dụng. Runtime Node.js v24.22.3, healthy/nextjs/read-only, 768 MiB/256 PID/cap-drop ALL/no-new-privileges.

Giữ `/opt/device-lab/releases/7e3dd0b`, image `device-lab:staging-7e3dd0b-20261119` và backup `/opt/device-lab/shared/nginx.conf.before-text-m2-20261119` để rollback. Nginx chỉ đổi release marker trong file hiện có rồi reload; .env ở host chỉ đổi RELEASE_TAG, không đổi giá trị khác. Không sửa DNS/proxy/routing/policy/quyền/Compose override, không prune/reboot hoặc chạy renewal mới. Chuyển thành công; nhánh rollback có sẵn nhưng không cố gây lỗi trên production để diễn tập.

Public HTTP→HTTPS308, H1/canonical/release/policy và toàn bộ 92 route (84 cũ + 8 mới) đạt. **56/56 public smoke** trên Chromium/Firefox/WebKit/mobile, không fail/skip/flaky/global error; gồm VI/EN, chữ/số, ngôn ngữ văn bản độc lập UI, clipboard/IME fixture, theme/reflow/WCAG và EVKey/dd. Đây là subset chức năng Windows hiện có, không phải full privacy sạch trên public; full privacy đã xác minh riêng trong CI.

Log Nginx từ app start 15 bản ghi rate-limit và 0 lỗi upstream, app tail 80 dòng 0 error; không nới rate limit; Certbot timer active. Origin TLS dùng xác minh certificate bình thường, không --insecure; origin app có CSP, proxy public vẫn bỏ header. Không nhận đã xác minh chế độ TLS proxy→origin trong bảng điều khiển. Phiên SSH kết thúc; proof/gates/runtime/source/sample ở [QA phát hành](qa/deployment-utilities-milestone2-2026-11-19.json).

**Đã hoàn thành và xác minh:** phần mềm qua CI, Docker CI/candidate, public HTTP/UI, median mobile ≥90 trên bộ đại diện. **Đã triển khai nhưng chưa xác minh đầy đủ:** clipboard/bộ gõ/mobile/screen reader thật, rollback khi lỗi production chưa diễn tập cố ý. **Chưa hoàn thành:** 6 native policy skips, 2 moderate dev tooling glob/minimatch, CSP public còn bị proxy bỏ (0/92 route có header), TLS proxy→origin/field data. **Không thể kiểm chứng lượt này:** Safari thật/phần cứng/mọi phiên bản EVKey. Không đồng nhất WebKit automation với Safari thật, fixture/backend ảo với thiết bị thật. Người dùng quản lý proxy; không tự sửa. **Final Acceptance tổng thể vẫn mở.**

Các phần dưới là lịch sử, không phải bản đang phục vụ.

## Lịch sử trước phát hành: Milestone 2 candidate local, chưa phát hành 19/11/2026

Đợt này chỉ chuẩn bị local để người dùng duyệt: bốn tiện ích văn bản U03–U06, tổng 46 công cụ. Preview production ở `http://127.0.0.1:3100/vi/utilities`; bind loopback, không mở Node ra mạng. Build cuối 120 trang, BUILD_ID `c-NDmO-s7fw5rZXNdGwtV`. HTTP smoke health +48 route VI/EN đạt; script dùng trong Docker CI đã thêm cả tám route văn bản mới và giữ phạm vi quyền thiết bị hiện có.

**Chưa commit/push, chạy CI từ xa, SSH hoặc cập nhật website trong milestone này.** Website vẫn bản Milestone 1 source `7e3dd0b`; lịch sử phát hành phía dưới không phải QA của candidate mới. Không thay DNS/proxy, Docker/Nginx production hoặc hạ tầng thật.

Máy local thiếu Docker CLI/Engine: chưa build image/Compose/healthcheck/Nginx/restart/shutdown cho source M2. CI Ubuntu hiện có job Docker smoke, nhưng chưa được chạy cho candidate. Khi người dùng duyệt và yêu cầu phát hành, chạy môi trường Linux sạch với `pnpm install --frozen-lockfile`, typecheck/lint/unit/build, Playwright đủ bốn project và `bash scripts/docker-smoke.sh`. Giữ nguyên assertions privacy/policy; không lọc request phần mềm bảo mật để làm test đạt. Docker smoke phải qua trước/sau restart/stop-start và xác minh Node không publish như script hiện có.

Trước chuyển website còn cần Lighthouse sạch ít nhất ba lượt/trang đại diện gồm VI/EN của bốn công cụ mới và trang cũ, kiểm tra median/mobile≥90 nếu khả thi. Local hiện bị Kaspersky chèn script nên không có median sạch. Kiểm tra metadata/policy/sitemap 114, giữ rollback release cũ và thử candidate tách biệt trước khi chuyển; kiểm tra lại sau chuyển. Không lấy kết quả CI/Lighthouse/Docker của M1 làm bằng chứng M2. Xem [đặc tả](UTILITIES-MILESTONE-2.md) và [TESTING](TESTING.md); Final Acceptance vẫn mở.

## Tiện ích Milestone 1 đang phục vụ — 19/11/2026

Source **7e3dd0b119ef9c59da69f3b244787b9f5a9c1d04**, [CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/44445480650) success verify/Docker,460 unit,402 E2E đạt/6 native policy skip, build 112. Trước chuyển đã xem 36 lượt Lighthouse sạch median 99–100 trên 12 trang; candidate VPS kiểm tra84 route/sitemap 106 và restart/stop-start/exit143. Gates đạt mới thay app. Tag **device-lab:staging-7e3dd0b-20261119**, image **sha256:7f0e4bdbef741ab5964ce7e960b86f8936d6886f11e947da9d5bdd38c691cfbc**, current→/opt/device-lab/releases/7e3dd0b. Archive tracked SHA256 **77dd8e7531629400a15077d3ad44ed3516277591a6b573a47e1a52dc9241009a**, .env ở host chỉ đổi tag.

Giữ release/image 57a5de2 và `/opt/device-lab/shared/nginx.conf.before-utilities-20261119` để rollback. Chuyển thành công lần đầu; nhánh phục hồi tự động đã chuẩn bị nhưng không cố gây lỗi/diễn tập trên production. Nginx chỉ đổi marker/reload, giữ inode bind mount; đối chiếu backup xác minh không đổi routing/policy/DNS/proxy. Không prune/reboot hoặc chạy renewal mới. App nextjs/read-only/healthy/không OOM/Error, Node 3000 không public, Node.js 24.22.3, giới hạn768 MiB/256 PID/cap-drop ALL/no-new-privileges. Nginx từ app start không có error; app tail 80 dòng không có error, Certbot timer active.

Sau chuyển: HTTPS/canonical/84 route công cụ VI/EN/policy/sitemap 106 đạt, public 28/28 browser smoke, [Lighthouse public](https://github.com/anhtruc1803/checkall/actions/runs/44449524546)36 lượt sạch/12 trang × 3 median 97–99, median A/BP/SEO100. Dữ liệu đầy đủ và phân biệt lab/public ở [QA phát hành](qa/deployment-utilities-2026-11-19.json). Không nhận đã chạy full 408 trên VPS hoặc WebKit là Safari thật.

CSP được xác minh trực tiếp trong app, public VI/EN vẫn bị proxy bỏ; người dùng quản lý proxy nên không tự sửa. TLS proxy→origin, manual hardware/Safari/screen reader/field data,6 native policy skips và 2 moderate dev tooling còn mở. Không đóng Final Acceptance. Phiên SSH kết thúc. Các phần dưới là lịch sử, không phải source đang phục vụ.

## Bản EVKey và nội dung VI/EN đã triển khai — 16/11/2026

Source **57a5de29307418c9d060f50e7e1e527bb1626eba**, [CI 43804594079](https://github.com/anhtruc1803/checkall/actions/runs/43804594079) success verify/Docker. Typecheck/lint/secret scan, build 106 trang, 333 unit trên 35 file đạt; full **378 E2E đạt/6 skip**, không fail/flaky/global error, 774.698,232 ms. Không đổi assertion/retry hoặc nhận skip là xác minh quyền native. [Lighthouse lab 43804641819](https://github.com/anhtruc1803/checkall/actions/runs/43804641819) đủ 48 lượt sạch và [public 43807789325](https://github.com/anhtruc1803/checkall/actions/runs/43807789325) đủ 24 lượt sạch; tám trang, ba lượt/trang/nguồn.

Đang phục vụ [VI](https://nguyenanhtruc.io.vn/vi) và [EN](https://nguyenanhtruc.io.vn/en). Tag **device-lab:staging-57a5de2-20261116**, image **sha256:18ae5b5a3840fdc737f92334ba9cff9ee387cb03b7c8e0e1615cae4e9bc16131**, current→/opt/device-lab/releases/57a5de2. Archive tracked SHA256 **5c4750b26f3b654ba5801453a7b58fc33f34bd08b6155354985ee611a150f657** được kiểm trước giải nén; .env chỉ ở host. Giữ release/image 3191485 và backup /opt/device-lab/shared/nginx.conf.before-content-20261116-retry1.

Chỉ thay app và marker release trong Nginx, giữ inode file bind mount; không sửa routing/policy/DNS/proxy, prune/reboot hoặc chạy lại renewal dry-run. Lần chuyển đầu đã tự rollback vì header cũ còn xuất hiện ngay sau reload trong khi body đã mới; đã xác minh 3191485 healthy. Lần sau thêm chờ có giới hạn, vẫn yêu cầu header/body đúng, chuyển 57a5de2 thành công. Không coi đây là diễn tập mọi tình huống rollback.

Runtime healthy, user nextjs/read-only, Node không public, giới hạn 768 MiB/256 PID, cap drop ALL/no-new-privileges; OOMKilled=false/Error rỗng, log Nginx ghi 9 lần giới hạn tần suất trong khoảng chạy QA public, không nới rate limit để lấy pass. Certbot timer active; curl origin --resolve dùng xác minh TLS thông thường. Origin VI/EN có CSP, public vẫn thiếu; chế độ TLS proxy→origin chưa chứng minh, giữ quyền quản lý proxy của người dùng.

HTTP 308→HTTPS, public VI/EN/canonical/sitemap 100 URL và health+34 route/policy đạt. Public E2E đầu 31 pass/1 fail (kết nối WebKit); bài đó chạy riêng 3/3 đạt, không sửa code/assertion và không xóa failure đầu. Kết quả chi tiết tại [QA triển khai](qa/deployment-content-2026-11-16.json). Final Acceptance phần cứng/Safari/screen reader/bảo mật còn mở.

## Rà nội dung website — local 12/11/2026

Nguồn mới tinh gọn nội dung toàn bộ VI/EN, giữ đủ 40 công cụ và chế độ EVKey local. Chỉ production build ở http://127.0.0.1:3100; chưa commit/push/chạy CI từ xa, không cập nhật website hoặc sửa VPS/Docker/Nginx/DNS/proxy. Không dùng phản hồi người dùng chấp nhận UI trước làm yêu cầu triển khai hạ tầng.

Metadata, route, engine, permission và capability giữ nguyên qua đối chiếu AST. Lịch sử dùng tên công cụ thay ID, dữ liệu lưu cũ không đổi schema. Báo cáo kiểm thử/fingerprint bản này tách riêng tại qa/content-review-local-2026-11-12.json và CONTENT-REVIEW.md; các kết quả bên dưới là checkpoint trước. Cần kết quả môi trường sạch và các manual QA đang mở trước nghiệm thu rộng, không đóng Final Acceptance chỉ vì nội dung đã tinh gọn.

## Cảnh báo dd bổ sung — chỉ local 12/11/2026

Preview http://127.0.0.1:3100/vi/keyboard/tester và route EN đã được build lại cùng lưu ý dd → đ/lời nhắc thử D. Chỉ bind loopback; chưa commit/push, chạy CI từ xa hoặc cập nhật website. Không SSH, sửa VPS/Docker/Nginx/DNS/proxy. Kết quả và fingerprint source mới tại qa/keyboard-dd-warning-local-2026-11-12.json; số liệu 328 unit/48 E2E trong checkpoint phía dưới thuộc bản trước cảnh báo dd. Manual EVKey trên UI mới và Lighthouse sạch vẫn chưa xác nhận; không đóng Final Acceptance.

## EVKey keyup đang ở local — 12/11/2026

Chế độ mới B01 chưa được push GitHub hoặc triển khai website. Preview production build chỉ bind 127.0.0.1:3100 để người dùng review, không mở cổng public hay thay Docker/Nginx/DNS/proxy/VPS. Source còn trong working tree; fingerprint tại qa/keyboard-release-local-2026-11-12.json.

Build 106/unit 328/nhóm keyboard E2E 48 đạt, nhưng full E2E local có 9 failure liên quan Kaspersky/context Firefox và 18 skip; Lighthouse bị loại vì script chèn, chưa có median sạch. Không coi đây là full acceptance hoặc bằng chứng đủ mọi điều kiện cập nhật website. Khi có yêu cầu triển khai tiếp, cần xác minh lại trong môi trường sạch và manual EVKey UI mới. Các release/image/CI ở phần dưới là lịch sử đã bàn giao, không chứa chế độ tương thích local này.

## Bản sửa IME đang phục vụ — 11/11/2026

Source **3191485048bc024c00376db258f5b939b426e39a**. Image device-lab:staging-3191485-20261111, ID **sha256:9db253dfdf080fb1f4379351bdcc54bc0ced34c4702ea7716a1e7abd58370e55**. Current→/opt/device-lab/releases/3191485. Archive Git tracked kiểm SHA256 **0f3bb84858740f2d78211d410c23b81141039f56e905ac548d226b508d405d42**; .env chỉ trên host. Chuyển sau khi CI source đúng và Lighthouse lab đạt; kiểm đúng image/RELEASE_COMMIT trước thay.

Giữ release/image 4e26811 và backup /opt/device-lab/shared/nginx.conf.before-keyboard-ime-20261111. Chỉ recreate app, kiểm health, cập nhật release marker trong cùng inode của file Nginx, syntax/reload và TLS origin qua curl resolve loopback; xác nhận body có keyboard-input-help rồi mới chuyển symlink. Có trap phục hồi nếu activation thất bại; không nhận đây là diễn tập rollback đã chạy.

Kiểm lúc 09:20:21 UTC: healthy, OOM false/Error rỗng, user nextjs, read-only, capDrop ALL/no-new-privileges, memory 805306368 byte/PID 256. Node 3000 không publish; Nginx giữ 80/443, logs startup và nginx -t đạt, Certbot timer active. Public HTTP308→HTTPS, VI/EN/canonical/10 route bàn phím đủ giao diện mới, health+34 route/policy, sitemap 100 URL; public E2E24/24 pass. Không đổi DNS/proxy/dashboard, prune/reboot, không chạy lại renewal dry-run hoặc restart/shutdown VPS để thay bằng chứng Docker CI.

CSP public vẫn thiếu trên hai homepage ở 09:20:10 UTC; origin giữ cấu hình CSP. Proxy do người dùng quản lý, TLS proxy→origin chưa kiểm chứng. Không suy rộng origin TLS thành kiểm chứng chế độ của proxy. Thiết bị thật/Safari/manual và Final Acceptance còn mở.

[Lighthouse public 42994636551](https://github.com/anhtruc1803/checkall/actions/runs/42994636551): chín lượt sạch đúng source 3191485, median **95/96/95** cho /vi, /vi/keyboard/tester, /en/keyboard/events; mọi lượt 93–96, A/BP/SEO 100. Kết quả thật và giới hạn tại [QA JSON](qa/keyboard-input-method-2026-11-11.json).

## Lịch sử bản bàn phím 4e26811 — 11/11/2026

Source **4e26811527f5c05e1bbc0ef421597505e14d47fc**, tag `device-lab:staging-4e26811-20261111`, image VPS `sha256:8beca3e61a465ffd72bcf0921c880f9db284fb4ab9b8cfc01706e68d8100e458`. Current trỏ tới `/opt/device-lab/releases/4e26811`; giữ ca2344f và backup `/opt/device-lab/shared/nginx.conf.before-keyboard-20261111`. Hai image candidate 7b/db chưa đưa vào phục vụ; không nhận chúng là bản rollback đang dùng trước đó. Archive Git tracked kiểm SHA256 trước build, .env chỉ trên host; chuyển sau CI source 4e/lab đạt.

Ứng dụng healthy/read-only/user nextjs, OOM false/Error rỗng, Node 3000 không public, Nginx syntax/log startup đạt; Certbot timer active. Không đổi DNS/dashboard proxy, chỉ release marker origin/reload. Public VI/EN 200/đủ 10 route bàn phím có progress/diagram mới/canonical đúng, health+34 route/policy và sitemap 100 URL đạt; keyboard E2E 18/18 ba browser đạt, Lighthouse HTTPS 21 lượt sạch median 97/95/97/97/95/97/97. Đã xem UI Dark/Light/mobile từ domain; không coi WebKit là Safari thật.

Giữ release/image trước để có thể phục hồi, không prune/reboot hoặc chạy lại renewal dry-run/diễn tập rollback. CSP public vẫn thiếu trên VI/EN; người dùng tự quản lý proxy, TLS proxy→origin chưa kiểm chứng. Manual/hardware và Final Acceptance còn mở. Chi tiết QA/số đo tại KEYBOARD-IMPROVEMENTS.md/PERFORMANCE.md/qa/keyboard-2026-11-11.json; những trạng thái phía dưới là lịch sử.

## Lịch sử bản chọn công cụ theo vấn đề — 10/11/2026

Source **ca2344f2bfdc5ed65d324d480b663da6db3d5e53**, tag `device-lab:staging-ca2344f-20261110`, image VPS `sha256:3046844a77a6ef24435cdef1e4ab69aac630d5d634070ab5bfe2cc6aa186c8a1`. Current trỏ tới `/opt/device-lab/releases/ca2344f`; giữ source/image 882c4d9 và backup `/opt/device-lab/shared/nginx.conf.before-problems-20261110`. Archive Git tracked đối chiếu SHA256 trước build, .env chỉ ở host; chuyển sau CI/lab đạt. Không thay DNS/dashboard proxy, chỉ marker origin/reload Nginx.

App healthy/read-only/user nextjs, OOM false/Error rỗng; Node 3000 không public, Nginx syntax/log startup đạt, Certbot timer active. Public VI/EN 200 đúng source/có section mới, HTTP 308→HTTPS, canonical đúng/sitemap100 URL, health+34 route/policy đạt; sáu E2E public ba browser đạt. Lighthouse HTTPS đủ 21 lượt, median **98/99/99/99/99/98/98**, A/BP/SEO100. Chi tiết tại PERFORMANCE.md/qa/problems-2026-11-10.json.

Không prune/reboot hoặc chạy lại renewal dry-run/diễn tập rollback. CSP public vẫn thiếu tại smoke 2026-11-10T09:55:32.191Z; người dùng tự quản lý proxy, TLS proxy→origin chưa kiểm chứng. Manual/hardware/Safari và Final Acceptance còn mở. Những source và trạng thái phía dưới là lịch sử.

## Lịch sử bản bàn lab — 10/11/2026

Source **882c4d925e95d86672dd5b9469367335fe93c9d5**, tag `device-lab:staging-882c4d9-20261110`, image VPS `sha256:9de7c5069c43af6e9e6f5f19fd5975d12e68e0546d8c758c3bfcb90fc582aa44`. Current trỏ `/opt/device-lab/releases/882c4d9`; giữ source/image ad25dd1 và `/opt/device-lab/shared/nginx.conf.before-lab-20261110`. Archive Git tracked đã kiểm SHA256; không mang .env, cache hoặc credential từ máy phát triển. Chuyển sau khi [CI 42783852103](https://github.com/anhtruc1803/checkall/actions/runs/42783852103) success verify/Docker và cặp Lighthouse Linux trước/sau đạt.

App healthy, user nextjs/read-only, OOMKilled false/Error rỗng, Node 3000 private; Nginx syntax/startup đạt và Certbot timer active. Chỉ cập nhật marker release origin/reload, không đổi dashboard DNS/proxy. Sau chuyển: VI/EN 200 đúng source, HTTP 308→HTTPS, canonical/sitemap 100 URL đạt, health +34 route/policy đạt; sáu UI E2E public Chromium/Firefox/WebKit đạt, không skip/failure/flaky (76275,86 ms). Đã xem ảnh Dark/Light/mobile từ domain sau hydrate. Không nhận WebKit là Safari thực tế.

Không prune/reboot hoặc chạy lại renewal dry-run/diễn tập rollback. Public CSP vẫn thiếu lúc 16:07 Asia/Saigon, TLS proxy→origin chưa xác minh; người dùng tự quản lý proxy. [Lighthouse HTTPS 42788047041](https://github.com/anhtruc1803/checkall/actions/runs/42788047041) đủ 18 lượt sạch, median sáu trang đều 99/A-BP-SEO 100; số đo tại PERFORMANCE.md; các kết quả source ad25dd1 phía dưới là lịch sử. Final Acceptance còn manual/hardware/bảo mật đã nêu trong PROGRESS.md.

## Lịch sử bản Performance — 10/11/2026

Tại checkpoint trước bàn lab, source **ad25dd12fe10b5c88634d5befe7363a2261f5dfd**, tag `device-lab:staging-ad25dd1-20261110`, image VPS `sha256:c3df1dca7116c8435399dc79cbe9d31e87bed4c68dd9f7adcb7ecbcb90e5555e`. Current trỏ `/opt/device-lab/releases/ad25dd1`; giữ source/image 387c03f trước đó và backup `/opt/device-lab/shared/nginx.conf.before-perf-20261110`. Archive Git tracked đã kiểm SHA256 trước build, .env chỉ ở host. Đổi sau khi [CI 42775890687](https://github.com/anhtruc1803/checkall/actions/runs/42775890687) success; image build trước nhưng không đưa vào phục vụ khi hồi quy chưa đạt.

Ứng dụng healthy/OOMKilled false, Node 3000 chỉ nội bộ; Nginx publish 80/443, syntax/log startup và public health đạt. Chỉ cập nhật marker `X-Device-Lab-Release: ad25dd1` và reload; không chỉnh dashboard DNS/proxy. Smoke 34 route/policy và ba E2E UI public đạt, canonical/sitemap 100 URL/CSS đúng source. Lighthouse public [42778723274](https://github.com/anhtruc1803/checkall/actions/runs/42778723274) đủ 18 lượt sạch trên đúng release, median 95/98/97/97/96/97. Bộ so sánh lab cùng VM riêng đạt 99–100; không ghép hai môi trường để tính mức tăng.

Không mở thêm cổng, prune image, reboot hoặc diễn tập rollback trên VPS. Chứng chỉ/gia hạn theo lần triển khai trước; không nhận renewal dry-run đã chạy lại lần này. CSP public vẫn thiếu tại smoke 14:53 Asia/Saigon, TLS proxy→origin chưa xác minh; người dùng tự quản lý proxy. QA/phạm vi còn mở trong PROGRESS.md và PERFORMANCE.md; Performance đạt trên sáu trang đại diện, Final Acceptance tổng thể tiếp tục mở.

## Cập nhật giao diện staging ngày 10/11/2026

Bản UI trước đợt tối ưu Performance phục vụ [VI](https://nguyenanhtruc.io.vn/vi) và [EN](https://nguyenanhtruc.io.vn/en): source **387c03fdbbecb565239f3a32ce1bd957b705ce76**, tag `device-lab:staging-387c03f-20261110`, image VPS `sha256:80bd265e58e502158ff4042fb29dbeeedc8e06d6bd9575fff1b4e7ffcc8ea778`. Archive Git tracked files được đối chiếu SHA256 trước khi build. Chỉ chuyển ứng dụng sau [CI 42759176453](https://github.com/anhtruc1803/checkall/actions/runs/42759176453) success cả verify và Docker; không triển khai source UI thất bại trước đó.

Tại checkpoint UI, `/opt/device-lab/current` trỏ `/opt/device-lab/releases/387c03f`. Giữ `.env` trên host và cấu hình shared; app healthy/OOMKilled false, Node 3000 không publish. Nginx chỉ cập nhật header marker `X-Device-Lab-Release: 387c03f` và reload sau syntax check; không chỉnh dashboard tên miền/proxy. Bản config trước chuyển ở `/opt/device-lab/shared/nginx.conf.before-ui-20261110`; giữ source/image fca62c6 cũ. Script chuyển bản có nhánh phục hồi khi bước kiểm tra thất bại, nhưng không diễn tập rollback trên VPS trong lượt này. Không prune hoặc reboot host.

Sau chuyển bản: origin/public health đạt, app log khởi động không lỗi, HTTP 308 → HTTPS, VI/EN 200, HTML/CSS đúng release, canonical và sitemap 100 URL đạt; HTTP smoke 34 route/policy đạt, ba E2E UI public Chromium/Firefox/WebKit đạt. CI source này có 275 unit, 318 E2E đạt/6 skip native policy; Docker Linux CI 87 giây có restart/stop-start/SIGTERM 143 không OOM/Error. Kết quả CI không thay việc xác minh Safari/thiết bị thật. Certbot timer vẫn active; dry-run gia hạn được ghi ở lần triển khai đầu bên dưới, không tuyên bố chạy lại ở lần cập nhật UI.

**Còn mở:** CSP có ở origin nhưng response public vẫn thiếu tại 12:14 ngày 10/11/2026 (Asia/Saigon); người dùng tự quản lý proxy. Chế độ TLS proxy→origin, reboot host, rollback thực tế, Lighthouse mới và manual QA chưa nghiệm thu. Không thay hoặc nới Permissions-Policy để làm bài kiểm thử đạt. Chi tiết tại PROGRESS.md, UI-UX-REFRESH.md và qa/ui-ux-refresh.json; Final Acceptance tiếp tục mở.

## Lần triển khai đầu ngày 06/11/2026

Đã triển khai theo yêu cầu lên VPS, phục vụ [tiếng Việt](https://nguyenanhtruc.io.vn/vi) và [tiếng Anh](https://nguyenanhtruc.io.vn/en). Giữ proxy hiện có; người dùng tự quản lý cấu hình tên miền/proxy. Không chỉnh bảng điều khiển proxy trong lượt triển khai này. Các checkpoint trước đây ghi “chưa VPS” là lịch sử tại thời điểm milestone đó.

Source phát hành: fca62c61f192b0098e55e1e17e44534109982132; phần code ứng dụng giống source M6 76a71ce đã qua CI. Tag `device-lab:staging-fca62c6-20261106`; image ID tại VPS `sha256:98c6449904d5dd5522322d06e13a93120c7669acd78efbab3fa4397e70d4bd52` (không phải digest đã push registry). Source được chuyển bằng archive của các file Git tracked, không mang `.git`, `.env`, secret, cache hoặc node_modules từ máy phát triển.

Ubuntu 24.04, Docker Engine 29.9.3 và Compose 5.7.0. App chạy user không đặc quyền, filesystem read-only và network nội bộ; `3000/tcp` không có published port. Chỉ Nginx publish 80/443. Host 2 GB RAM có swap 2 GB; app giới hạn 768 MiB và 256 PID. Log container xoay vòng 10 MB × ba file. Docker được bật khi khởi động máy; không thay cấu hình SSH hoặc dịch vụ quản trị của nhà cung cấp.

Layout thực tế:

- `/opt/device-lab/releases/fca62c6`: source release và `.env` cấu hình public tại host.
- `/opt/device-lab/current`: symlink đến release đang chạy.
- `/opt/device-lab/shared/compose.staging.yaml`: override tài nguyên, HTTPS, mount Nginx/ACME và log rotation.
- `/opt/device-lab/shared/nginx.conf` và `locations.conf`: cấu hình staging riêng, không phải cấu hình mặc định trong Git. Nginx dùng Docker DNS cho upstream để phục hồi sau app restart. Chỉ tin X-Forwarded-Proto/real IP từ các IP proxy đã đối chiếu; giữ HTTP → HTTPS mà không tạo redirect loop.
- `/opt/device-lab/shared/acme`: webroot HTTP-01; `/etc/letsencrypt`: chứng chỉ và private key chỉ ở VPS.

Chứng chỉ origin hợp lệ, hết hạn ngày 04/02/2027; kết nối trực tiếp origin được kiểm tra với xác minh TLS, không bỏ qua certificate validation. `certbot.timer` active; `certbot renew --dry-run --run-deploy-hooks` đạt, hook kiểm tra Nginx rồi reload. Chứng chỉ ở proxy do nhà cung cấp quản lý riêng; chưa xác minh chế độ TLS giữa proxy và origin, không suy ra end-to-end TLS từ việc cả hai đầu có chứng chỉ.

Kết quả: production image build thành công; app healthy trước/sau restart chủ động; Nginx syntax đạt, health qua origin/public đạt. Sau restart OOMKilled=false, Error rỗng và port Node vẫn private. HTTP public 308 sang HTTPS, VI/EN 200, canonical đúng domain và sitemap 100 URL duy nhất. HTTP smoke health + 34 route/policy đạt; 45 E2E staging đạt trên Chromium/Firefox/WebKit. Chi tiết và giới hạn trong [TESTING.md](TESTING.md) và [qa/staging-2026-11-06.json](qa/staging-2026-11-06.json).

**Tiêu chí bảo mật còn mở:** lúc 15:58 ngày 06/11/2026 (Asia/Saigon), CSP có ở origin nhưng không có ở response public VI/EN dù dùng query mới; Permissions-Policy vẫn đúng. Đã báo người dùng và giữ nguyên cấu hình proxy theo chỉ dẫn, không ghi nhận việc chuyển tiếp CSP đã được xác minh. Khi quản trị viên hoàn tất cấu hình, cần đo lại public header và đối chiếu policy động của route camera/microphone/gamepad. Chưa đóng Final Acceptance.

Lệnh vận hành tại VPS (không chứa thông tin đăng nhập):

```bash
cd /opt/device-lab/current
docker compose -f compose.yaml -f /opt/device-lab/shared/compose.staging.yaml ps
docker compose -f compose.yaml -f /opt/device-lab/shared/compose.staging.yaml logs --tail=100 app nginx
docker compose -f compose.yaml -f /opt/device-lab/shared/compose.staging.yaml exec -T nginx nginx -t
curl --fail https://nguyenanhtruc.io.vn/api/health
sudo certbot renew --dry-run --run-deploy-hooks
```

Nâng cấp/rollback phải dùng **cả hai file Compose** như trên; ghi lại tag/image ID, giữ image cũ và kiểm tra health sau thay đổi. Không chạy `down` hoặc prune trong quy trình smoke public. Không có release ứng dụng cũ trên VPS để kiểm chứng rollback lần đầu; chưa thử reboot host hoặc drain request dài. Các cấu hình staging ngoài Git cần được quản trị viên sao lưu cùng `/etc/letsencrypt` theo quy trình vận hành riêng; không đưa private key, `.env` hoặc raw log vào repository.

## Checkpoint milestone trước triển khai

Phase 2 Milestone 6 (05/11/2026). Permissions-Policy thêm gamepad=() mặc định; chỉ sáu URL gamepad VI/EN có gamepad=(self), vẫn chặn camera/microphone. Các route camera/microphone giữ quyền self riêng và chặn gamepad. PolicyLink tải document mới khi vào/rời cả ba nhóm; Nginx chuyển tiếp header Next.js. [CI 41984091737](https://github.com/anhtruc1803/checkall/actions/runs/41984091737) source 76a71ce đạt Docker trong 81 giây: HTTP smoke health + 34 route VI/EN/policy ba checkpoint, private Node port/restart/stop-start, SIGTERM exit 143/OOMKilled false/Error rỗng; artifacts logs/containers/shutdown đã đọc, không lỗi ứng dụng hoặc HTTP 4xx/5xx. Image ID runner sha256:69b281c7583dc29617d017e0e89d6372c8c4e66c4a5757986b47433965b61e9f. Máy Windows không có Docker CLI; không tuyên bố Docker cục bộ hoàn chỉnh hoặc kế thừa kết quả M5 cho M6. Không thêm backend/haptics/service, không triển khai VPS/registry tại checkpoint M6; enforcement phụ thuộc browser và được kiểm tra riêng. Kết quả source M6 ở PROGRESS/qa JSON.

Checkpoint lịch sử: Phase 2 Milestone 5 (05/11/2026). Sáu URL camera VI/EN khai báo camera=(self), microphone=(), geolocation=(); bốn URL microphone/spectrum khai báo camera=(), microphone=(self), geolocation=(); route khác chặn cả hai. PolicyLink tải document mới vào/rời mỗi nhóm, kể cả locale; Nginx chuyển tiếp header Next.js. HTTP smoke hiện health + 28 route VI/EN kèm policy ở ba checkpoint. Máy Windows không có lệnh Docker; không tuyên bố Docker cục bộ hoàn chỉnh. [CI 41956011535](https://github.com/anhtruc1803/checkall/actions/runs/41956011535) source f260bfd đạt Docker smoke trong 70 giây; đã đọc artifacts: production build/healthy/Nginx, 28 route/policy ba checkpoint, private Node port/restart/stop-start, SIGTERM exit 143/OOMKilled false/Error rỗng, không lỗi ứng dụng hoặc HTTP 4xx/5xx. Image ID runner sha256:4506b859f7205258f51d88e5b4027dc2e4dc4548380dcf39d4a86039655ab9c4. Chi tiết trong PROGRESS.md/qa/phase2-milestone5.json. Không triển khai VPS hoặc HTTPS production, không push image registry. WebKit automation không thay Safari; native header enforcement chưa xác minh được trong runtime hiện tại vẫn là tiêu chí mở.

Checkpoint lịch sử: Phase 2 Milestone 4 (05/11/2026). Chỉ hai route microphone/spectrum ở VI/EN có microphone=(self); mọi route khác vẫn camera=(), microphone=(), geolocation=(). Nginx chuyển tiếp policy của Next.js. PolicyLink tải document mới khi đi vào/rời nhóm microphone; tránh policy cũ tồn tại sau soft navigation. HTTP smoke qua Nginx mở rộng health + 22 route VI/EN và assertion policy ở ba checkpoint. Đã xác minh CI source 8f6e773 như ghi bên dưới, không kế thừa Docker M3. Không thêm dịch vụ production, database hoặc endpoint capture; PulseAudio chỉ thuộc môi trường CI. Kết quả thật ở PROGRESS.md và qa/phase2-milestone4.json; chưa triển khai VPS/HTTPS production.

Source 8f6e773 đã đạt Docker Linux CI [41949819465](https://github.com/anhtruc1803/checkall/actions/runs/41949819465) trong 78 giây: build/healthy/Nginx, 22 route VI/EN với policy ba checkpoint, private Node port, restart/stop-start và SIGTERM exit 143/OOMKilled false/Error rỗng. Artifact logs/containers/shutdown đã đọc, không có lỗi ứng dụng hoặc HTTP 4xx/5xx trong smoke. Image ID runner sha256:5dc19a2adc01b1b6fa93b6ab370ff22258784c732e55af479875f9a4f020e9bf, không phải digest đã push registry. E2E standalone kiểm tra đủ 68 route công cụ; proxy smoke là 22 route đại diện. Browser phải tự hỗ trợ enforcement của Permissions-Policy; việc gửi đúng header không chứng minh Firefox/WebKit runtime đã chặn, hai case đó được ghi skip. Không tuyên bố kiểm tra Docker cục bộ hoàn chỉnh hoặc triển khai VPS/HTTPS production.

Checkpoint lịch sử: Phase 2 Milestone 3. Ba công cụ audio chỉ chạy browser-local; không cần microphone/camera hoặc sửa Permissions-Policy. Docker HTTP smoke mở rộng lên 18 route VI/EN (gồm ba audio) qua Nginx, kiểm tra trước/sau restart và stop/start. Windows không có Docker Engine sử dụng được; bằng chứng job Linux source 1066568 được ghi bên dưới, không kế thừa run M2. Kết quả thực tế đã chốt cuối PROGRESS.md và qa/phase2-milestone3.json. Không triển khai VPS, push image registry hoặc xác minh HTTPS production trong tác vụ này.

Source 1066568 đã đạt Docker smoke Linux [41027637979](https://github.com/anhtruc1803/checkall/actions/runs/41027637979) trong 70 giây. Đã tải/đọc logs/containers/shutdown: build/healthy/Nginx, health + 18 route VI/EN ba checkpoint, Node không publish port, restart và stop/start, SIGTERM exit 143/OOMKilled false/Error rỗng. Không có lỗi ứng dụng hoặc HTTP 4xx/5xx trong smoke; image ID runner sha256:76b56e0d8a916deddaa5a50cd7449ed3e73817c5f5b084cb6848fd0fe9b08cdd, không phải digest đã push registry. E2E standalone bao phủ đủ 64 route công cụ; proxy smoke là 18 route đại diện, không phải toàn bộ 64. Native audio CI dùng PulseAudio null sink trên runner, không thêm dịch vụ này vào production Compose. Không xác nhận thiết bị audio/HTTPS production hoặc triển khai VPS.

Checkpoint lịch sử: Phase 2 Milestone 2, ngày 30/10/2026. Tám công cụ bổ sung chỉ chạy browser-local; không thêm backend endpoint, quyền camera/microphone hoặc thay đổi kiến trúc Docker/Nginx. Policy camera=()/microphone=()/geolocation=() giữ nguyên. Docker smoke cần xác minh lại image/source mới trên CI Linux; kết quả run/commit được ghi ở cuối PROGRESS.md, không tự kế thừa kết quả milestone trước.

Source 097404e đã đạt Docker smoke ở [run 41007493526](https://github.com/anhtruc1803/checkall/actions/runs/41007493526) trong 72 giây, cùng job verify thành công. Đã kiểm tra image build, healthy, Nginx, health + tám route VI/EN đại diện ba thời điểm, private Node port, restart và SIGTERM stop/start; đọc artifact logs/containers/shutdown không có lỗi trong smoke. Image ID cục bộ runner sha256:04000eaac12e8cdb4a7ab2d6a8608dcc3a79207a89d9cfaf9a6716fe89f2eb5b, không phải image digest đã push registry. Các route công cụ đủ 58 URL được E2E trên standalone app; smoke qua proxy không bao phủ toàn bộ 58. Chưa triển khai VPS/HTTPS production.

## Điều kiện

VPS Linux có Docker Engine và Docker Compose plugin; DNS A/AAAA trỏ về VPS hoặc reverse proxy có origin đúng; tường lửa chỉ mở cổng web cần thiết, SSH theo chính sách của quản trị viên. Không mở cổng Node 3000 công khai. Staging đã triển khai như mục đầu; các bước tổng quát bên dưới cần điều chỉnh theo layout thực tế khi áp dụng.

Ứng dụng dùng Node.js 24 LTS, Next.js standalone, user UID/GID 1001, filesystem read-only với cache/tmp riêng. Nginx reverse proxy là cổng truy cập duy nhất. Không có database, secrets hoặc thông tin đăng nhập mặc định.

## Chuẩn bị bản phát hành

```bash
cp .env.example .env
```

Sửa `.env`:

```dotenv
SITE_URL=https://YOUR_DOMAIN
RELEASE_TAG=YOUR_IMMUTABLE_RELEASE_TAG
```

`YOUR_DOMAIN` và tag chỉ là ký hiệu phải thay. `SITE_URL` không có dấu `/` cuối và phải khớp origin truy cập. Giá trị được truyền vào build vì metadata/sitemap được prerender; thay domain phải build lại. Nên khóa digest base images và lưu image release trong registry nội bộ của bạn khi chốt bản production.

```bash
docker compose config --quiet
docker compose build app
docker compose up -d --wait
docker compose ps
docker compose exec nginx nginx -t
curl -f http://localhost/api/health
```

`compose.yaml` ban đầu chỉ phục vụ HTTP ở cổng 80 để bootstrap chứng chỉ. HTTP không phải cấu hình phát hành Internet cuối cùng; hoàn tất HTTPS bên dưới trước khi công bố.

## Cấp chứng chỉ HTTPS lần đầu

1. Xác nhận DNS trỏ về VPS và cổng 80/443 có thể truy cập từ Internet. Dừng các dịch vụ khác đang chiếm cổng 80 của VPS do bạn quản lý theo quy trình riêng.
2. Cài Certbot theo hướng dẫn chính thức của hệ điều hành. Chưa giả định có chứng chỉ.
3. Tạo thư mục `deploy/acme` và `deploy/certificates` trên VPS. Thêm volume chỉ đọc `./deploy/acme:/var/www/acme:ro` vào service nginx. Thêm location ACME vào server HTTP trong `nginx.conf`:

```nginx
location ^~ /.well-known/acme-challenge/ {
    root /var/www/acme;
    default_type text/plain;
}
```

4. Kiểm tra `nginx -t` rồi reload. Cấp chứng chỉ bằng webroot, thay domain và email thật:

```bash
sudo certbot certonly --webroot -w ./deploy/acme -d YOUR_DOMAIN --email YOUR_EMAIL --agree-tos
```

5. Dùng `deploy/nginx.https.conf.template` làm cấu hình mới. Thay `YOUR_DOMAIN` bằng domain thật, giữ nguyên các biến Nginx `$host`, `$scheme`, `$remote_addr`, `$proxy_add_x_forwarded_for` và `$request_uri`. Mount `/etc/letsencrypt:/etc/letsencrypt:ro` vào container Nginx, thêm mapping `443:443` và volume ACME. File HTTPS dùng đường dẫn live của Certbot; chứng chỉ và private key chỉ ở VPS, không đưa vào Git.
6. `docker compose config --quiet`, `docker compose exec nginx nginx -t`, rồi reload Nginx. Sau khi cập nhật port mapping cần `docker compose up -d nginx` để tạo lại container. Nếu nginx mới không khởi động, xem log và phục hồi HTTP config trước đó để sửa chứng chỉ.

## Gia hạn

Bật systemd timer của Certbot hoặc lịch được quản trị viên duyệt. Chạy thử `sudo certbot renew --dry-run`. Dùng deploy hook để chạy `docker compose exec -T nginx nginx -t` rồi `docker compose exec -T nginx nginx -s reload` **chỉ sau khi gia hạn thành công**, với working directory tuyệt đối của bản triển khai. Webroot ACME và cổng 80 phải vẫn truy cập được. Theo dõi lỗi gia hạn và ngày hết hạn; không giả định timer đã được bật.

Nguồn vận hành: [Certbot](https://certbot.eff.org/instructions), [Nginx HTTPS](https://nginx.org/en/docs/http/configuring_https_servers.html), [Compose](https://docs.docker.com/compose/).

## Nâng cấp

1. Ghi lại source revision, `RELEASE_TAG` và image ID đang chạy; giữ image cũ, không prune ngay.
2. Chạy typecheck/lint/unit/build/E2E trong môi trường kiểm tra. Build image với tag mới, không ghi đè tag release cũ.
3. Đặt `.env` về tag mới; `docker compose up -d --no-build --wait app`.
4. Kiểm tra health, trang VI/EN, calculator, capture bàn phím, CPS và log. Reload Nginx nếu cấu hình đổi.
5. Một replica có thể có khoảng gián đoạn ngắn; nếu cần zero-downtime phải thiết kế thêm blue/green trước khi cam kết.

## Rollback

Đổi `RELEASE_TAG` về tag bất biến trước đó và chạy:

```bash
docker compose up -d --no-build --wait app
docker compose ps
curl -f http://localhost/api/health
```

Nếu cấu hình Nginx thay đổi, phục hồi bản config đã kiểm tra, chạy `nginx -t`, rồi reload. Không cần migration dữ liệu server. Dữ liệu localStorage thuộc browser của người dùng; code giữ schema validation và fallback cho dữ liệu cũ.

## Xử lý sự cố

| Triệu chứng                | Kiểm tra và xử lý                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 502 Bad Gateway            | `docker compose logs --tail=200 app nginx`; kiểm tra app healthy và port nội bộ 3000; app phải bind 0.0.0.0 |
| Container restart liên tục | Kiểm tra image, quyền cache UID 1001, giới hạn RAM và health endpoint                                       |
| Static assets 404          | Dockerfile phải copy `.next/static` bên cạnh standalone; chạy local dùng `pnpm start`                       |
| Canonical sai domain       | Sửa SITE_URL và build lại app, vì metadata được tạo lúc build                                               |
| API bị hạn chế             | HTTPS, Permissions-Policy, Fullscreen support; không cấp camera/microphone cho Phase 1                      |
| Không lưu được kết quả     | Browser chặn localStorage hoặc hết quota; UI có thông báo và vẫn cho phép dùng công cụ                      |
| Nginx không khởi động      | `nginx -t`, đường dẫn chứng chỉ/MIME, DNS service app trong Compose, volume và lỗi cấu hình                 |
| Không qua được rate limit  | Xem mã 503/429 và điều chỉnh limit theo tải thực; không bỏ toàn bộ kiểm soát tài nguyên                     |

Nginx access log chỉ ghi request HTTP theo mặc định, không chứa log phím/chuột vì ứng dụng không gửi chúng. Đặt thời hạn lưu log phù hợp trên VPS. Các giới hạn kiểm chứng tại máy phát triển được ghi trong `PROGRESS.md`.

## QA Linux có Docker Engine

Không cần kết nối VPS để kiểm tra image. Trên máy Linux/runner tạm có Docker, Node.js 24 và Compose:

```bash
bash scripts/docker-smoke.sh
```

Script dùng project Compose riêng `device-lab-qa-*`, bind Nginx vào loopback cổng 8080 và đặt SITE_URL đúng origin QA. Các bước bắt buộc: build image; chờ healthcheck healthy; `nginx -t`; health và tám route VI/EN qua proxy; xác nhận app không có published port; restart app rồi kiểm tra lại; SIGTERM shutdown phải có exit code 143 theo Next.js 16.4.3, không OOM hoặc SIGKILL 137; start và chờ healthy lần nữa. Lưu trạng thái shutdown vào artifacts/docker/shutdown.json. Cuối lượt luôn thu log/trạng thái vào `artifacts/docker/` rồi dọn đúng project QA. Script không dùng volume database và không kết nối hạ tầng production.

Đã đối chiếu tài liệu self-hosting và source Next.js cài trong node_modules: start-server đóng HTTP/Next server và cleanup listeners trước khi gọi process.exit(143) cho SIGTERM. Vì vậy exit 143 trong lượt stop chủ động này không được coi là crash chỉ vì khác 0. Kiểm thử smoke hiện không chứng minh drain một request dài đang xử lý, vì Phase 1 chưa có endpoint tác vụ dài.

`HTTP_BIND` và `HTTP_PORT` có thể cấu hình ở Compose; mặc định triển khai vẫn là Nginx `0.0.0.0:80`, Node 3000 chỉ được expose trong network nội bộ. Không dùng giá trị loopback QA làm cấu hình Internet nếu muốn phục vụ người dùng ngoài VPS.

CI chạy cùng script và upload bằng chứng khi thành công hoặc lỗi. Chỉ ghi Docker đã xác minh sau khi job thực sự hoàn tất; kiểm tra config bằng Compose CLI trên Windows không tương đương build/chạy container Linux. HTTPS công khai, DNS, chứng chỉ và gia hạn vẫn cần kiểm tra trong môi trường staging được cho phép.

### Kết quả thực chạy

Milestone nền tảng Phase 2 giữ nguyên policy camera=()/microphone=() trên các route công bố, không mở API media chỉ vì đã có helper permission/session. Khi một công cụ media thực sự được công bố mới thiết kế policy theo route và kiểm thử HTTPS/quyền tương ứng; không cấu hình camera/microphone=(\*) toàn website. Kết quả Docker của revision Phase 2 phải dẫn CI mới ở cuối PROGRESS.md, không mặc định kế thừa run Phase 1 dưới đây.

Job docker-smoke của [run 40816709418](https://github.com/anhtruc1803/checkall/actions/runs/40816709418) trên commit d82120b đạt trong 1 phút 23 giây. Image ID cục bộ runner: sha256:e5c59bd5abf564c3bdb24ed7b9e0a97022580f3748f6bb0c47b9f07e690df9a8 (không phải digest image đã push registry). Nginx syntax, health và tám route VI/EN qua proxy đạt trước/sau restart và sau stop/start. Port app không publish, trạng thái sau start healthy, shutdown chủ động exited 143/OOMKilled false/Error rỗng. Đã tải và đọc log: không có lỗi ứng dụng hay HTTP 4xx/5xx trong luồng smoke. Artifact CI giữ logs.txt, containers.json và shutdown.json; đây là QA runner, chưa phải kiểm thử VPS hoặc HTTPS production.

## Candidate tiện ích Milestone 1 — chỉ local, 19/11/2026

Người dùng yêu cầu làm local để duyệt. Candidate có 42 công cụ (40 thiết bị cũ + U01/U02), category `/utilities`, 106 URL nội dung trong sitemap và build tạo 112 trang; chưa commit/push/CI từ xa/SSH/deploy. Bản public gần nhất đã bàn giao ngày 16/11 có 40 công cụ; nhiệm vụ này không cập nhật website công khai. Không chỉnh DNS/proxy/CSP/VPS trong lượt này.

Đã nâng Next.js và eslint-config-next chính xác từ 16.4.3 lên 16.4.6 trong local, cập nhật lockfile, do build đầu tiên bị SecurityFatalError và audit báo hai advisory Next.js moderate. [Advisory cache qua unstable_cache](https://github.com/vercel/next.js/security/advisories/GHSA-mfr8-8qww-v76h) và [advisory nested use cache](https://github.com/vercel/next.js/security/advisories/GHSA-vc7v-qv4w-wrv8) công bố bản vá từ 16.4.5. Không khẳng định đã có khai thác trên ứng dụng. Audit production sau cập nhật không còn advisory; audit toàn bộ vẫn có hai moderate trong glob/minimatch của công cụ lint/Lighthouse, cần xử lý bảo trì riêng, không nhận toàn bộ dependency sạch.

`scripts/smoke-http.mjs` đã mở rộng health + 40 route/policy VI/EN, gồm danh mục và hai tiện ích; job Docker smoke hiện có sẽ tự chạy phạm vi mới khi được push sau này. Máy local không có Docker CLI/Engine sử dụng được; chưa build/chạy image candidate và chưa xác minh shutdown/restart của Next.js 16.4.6 trong container. Không kế thừa kết quả Docker của commit public cũ. Linux QA trước phát hành: `pnpm install --frozen-lockfile`, typecheck/lint/unit/build/full E2E trên ba engine và mobile; `bash scripts/docker-smoke.sh`; kiểm tra log/health/Nginx/Node nội bộ/restart/shutdown. Giữ assertion exit code hiện tại, điều tra nếu khác thay vì sửa để pass. Đo Lighthouse sạch ít nhất ba lượt trên homepage và hai tiện ích VI/EN trước khi kết luận ≥90.

Preview candidate chỉ bind `127.0.0.1:3100`. Dừng đúng tiến trình preview trước khi build lại trên Windows: để server giữ thư mục `.next/standalone` có thể gây EBUSY. Trong lượt này đã gặp và khắc phục bằng dừng đúng PID preview rồi chạy lại build thành công, không xóa source hoặc thay cấu hình build. Sau build chạy lại `HOSTNAME=127.0.0.1 PORT=3100 pnpm start` (cú pháp biến môi trường tùy shell). Link review: `/vi/utilities/number-to-words`, `/vi/utilities/percentage`, thêm `/en` tương ứng. Người dùng duyệt local không thay cho nghiệm thu release, phần cứng thật hoặc Safari thật.
