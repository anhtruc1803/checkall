# Chuyển tên miền sang a.ap.vn — 23/11/2026

Người dùng yêu cầu chuyển website trên VPS hiện có sang `https://a.ap.vn` và đã tự cấu hình DNS qua proxy. Giữ nguyên 48 công cụ, giao diện VI/EN và toàn bộ engine/test của Milestone 3. Không sửa DNS hoặc dashboard proxy.

## Trước chuyển

Baseline trước khi chuyển là source `890aa52d9af73d1d36fd96b79d941adcb20296ed`; repository tại `fcc2c91c788ffb41938f1f35261b84c18307920e` chỉ bổ sung báo cáo. Git working tree sạch khi bắt đầu. DNS từ VPS qua hai resolver công cộng đã trả ba IP proxy hiện có trong allowlist. Cả ba IP đã chuyển đúng token HTTP ACME về VPS; truy vấn CAA trả NOERROR, không có CAA hạn chế. Lỗi SERVFAIL ban đầu được ghi nhận trước khi DNS cập nhật, không phải trạng thái xác minh cuối.

`SITE_URL` được dùng trong metadata, sitemap và robots khi build. Cần build image mới với `SITE_URL=https://a.ap.vn`, không chỉ đổi biến môi trường runtime. Tệp `.env` ở host, quyền 600; không đưa vào Git/archive. Chứng chỉ mới được cấp qua webroot của Nginx, giữ chứng chỉ cũ để phục vụ redirect HTTPS.

## Quy trình và rollback

1. Xác minh DNS, HTTP ACME qua từng proxy và cấp chứng chỉ mới.
2. Kiểm tra typecheck/lint/unit, CI sạch đầy đủ; build Docker và kiểm tra candidate cô lập đủ 96 route công cụ, canonical và sitemap 118 URL. Kiểm tra restart/shutdown, Node private và quyền runtime.
3. Lưu baseline image/release, hash và bản sao Nginx; đối chiếu locations/Compose override không đổi. Chỉ thay SITE_URL và RELEASE_TAG ở env mới. Giữ nguyên inode tệp Nginx bind mount khi ghi; kiểm tra `nginx -t` trước reload.
4. Chuyển app và Nginx sang tên miền mới; tên miền cũ redirect 308, giữ đường dẫn/query và ngoại lệ ACME. Giữ allowlist proxy và giới hạn điều hướng; tách hạn mức RSC/static theo kết quả kiểm thử.
5. Xác minh HTTPS public, VI/EN, health, canonical/hreflang/sitemap/robots, redirect cũ/mới, policy, browser smoke và Lighthouse sạch. Ghi lại kết quả thật ở phần nghiệm thu; không lấy điểm tên miền cũ làm kết quả mới.

Nếu chuyển lỗi: khôi phục app image/env của release `890aa52`, nội dung Nginx từ backup và symlink current; kiểm tra health/HTTPS rồi reload. Không prune release/image cũ. Không cố gây lỗi production để diễn tập rollback.

## Phạm vi và giới hạn

Lighthouse chỉ cho phép hai origin HTTPS được người dùng ủy quyền và loopback; workflow cho chọn origin khi đo public, vẫn kiểm tra marker đúng commit. Không mở đo tùy ý hoặc bỏ kiểm tra injection.

localStorage và quyền camera/microphone thuộc từng origin: lịch sử/theme ở tên miền cũ không tự chuyển sang tên miền mới, browser có thể hỏi quyền lại. Không upload hoặc tự chuyển dữ liệu người dùng giữa hai origin.

Các hạn chế nghiệm thu nền tảng vẫn giữ nguyên: Safari/phần cứng thật, clipboard/bộ gõ/điện thoại thật, native policy skips và audit dev tooling. CSP và TLS qua proxy phải báo theo bằng chứng mới; dashboard proxy do người dùng quản lý. Không đánh dấu Final Acceptance tổng thể chỉ từ việc chuyển tên miền.

## Nghiệm thu

Website chính: [VI](https://a.ap.vn/vi), [EN](https://a.ap.vn/en). Giữ nguyên **48 công cụ**, **96 route công cụ VI/EN**, sitemap **118 URL**. App/tests/dependencies không đổi so với Milestone 3; build lại với `SITE_URL=https://a.ap.vn`. Source **6c8252b3a53574cd9283101f0a95219fb3b85a41**. Bằng chứng: [QA JSON](qa/domain-migration-2026-11-23.json).

[CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/45101107988) đạt typecheck/lint/secret scan, **575 unit/43 file**, build **124 trang**, **466 E2E đạt/6 native policy skip**, 0 fail/flaky/global error. Docker CI/candidate đạt health/VI/EN/restart/shutdown và Node private. **84/84 public UI smoke** trên Chromium/Firefox/WebKit/mobile đạt; đây là subset chức năng Windows. Full privacy/no-upload lấy từ CI Linux. [Lighthouse trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/45101257370) có 60 mẫu sạch/20 trang ×3, median **98–100**; [Lighthouse public mới](https://github.com/anhtruc1803/checkall/actions/runs/45105593936) có 60 mẫu sạch, median mobile **97–99**. Bộ lab và public khác điều kiện mạng, không quy chênh lệch cho thay đổi code.

Đủ 96 route public đạt H1/canonical/hreflang/policy, sitemap/robots/health dùng tên miền mới, CSP **96/96**. Đủ 96 redirect từ tên miền cũ trả **308**, giữ đường dẫn/query. HTTP tên miền mới được proxy chuyển lên HTTPS bằng **301**; origin vẫn **308**. Đã xác minh TLS/correct release tại origin và cả ba proxy IP. Không sửa DNS/dashboard proxy.

Chứng chỉ origin `a.ap.vn` đến **21/02/2027**, giữ chứng chỉ cũ cho HTTPS redirect. ACME sau chuyển đạt cả hai hostname ×3 proxy IP; timer Certbot active, chưa chạy renewal dry-run. Runtime healthy/non-root/read-only, Node không publish; giữ release/image cũ và backup để rollback. Phiên SSH đã đóng.

**Đã hoàn thành và xác minh:** tên miền/HTTPS/SEO/redirect, CI/Docker, public UI và Lighthouse mobile ≥90. **Đã triển khai nhưng chưa xác minh đầy đủ:** clipboard/bộ gõ/quyền trên thiết bị thật, renewal dài hạn và rollback khi production lỗi. **Chưa hoàn thành:** xác minh nguồn 503 tài nguyên phụ trong Lighthouse, sáu native policy skip, hai moderate dev tooling glob/minimatch, field Core Web Vitals. **Không thể kiểm chứng lượt này:** Safari/phần cứng thật và chế độ TLS proxy→origin trong dashboard. Audit mới: production 0 advisory, toàn bộ 2 moderate dev tooling. **Final Acceptance tổng thể vẫn mở.**

localStorage/theme/lịch sử và quyền thuộc từng origin; dữ liệu ở tên miền cũ không tự chuyển, browser có thể hỏi lại quyền camera/microphone. Tiếp theo: sử dụng tên miền mới, theo dõi vận hành và hoàn tất manual QA/bảo mật còn mở.

Image **device-lab:domain-a-ap-6c8252b-20261123**, ID **sha256:23dac97dd884317964b8fd46df7ab0c04d7511709425c4dd6d790675a0900dba**, current→`/opt/device-lab/releases/domain-a-ap-6c8252b`. Giữ release/image `890aa52` và `/opt/device-lab/shared/nginx.conf.before-domain-a-ap-20261123`. Inode bind mount, locations và Compose override giữ nguyên; env mới chỉ đổi SITE_URL/RELEASE_TAG, quyền 600. Archive SHA256 `d46990c774238e54169702042846dda02dc15b5f9a5e3c15fa7d22095b8a4af6`. Không đưa env/secret/cache/raw artifacts vào Git/archive; không prune/reboot.

Snapshot **2026-11-23T03:33:38Z**: app error **6**; Nginx error từ app start **88**, phân loại `{'rate_limit': 88}`. Runtime 768 MiB/256 PID/cap-drop ALL/no-new-privileges; candidate network none, restart/stop-start đạt 96 route/canonical/hreflang/sitemap 118, SIGTERM143/không OOM. Nhánh rollback có sẵn, chưa cố gây lỗi production để diễn tập. Sau cấu hình tài nguyên cuối có 0 Nginx error; app có 6 thông báo Server Reference ID không hợp lệ, access log có 6 POST400; chưa xác minh nguồn gửi.

## Lưu ý tài nguyên phụ trong Lighthouse

Lighthouse public có 13/60 mẫu ghi nhận 503 ở favicon/prefetch; median Best Practices 96–100, Accessibility/SEO 100 và Performance 97–99. Các mẫu vẫn giữ nguyên, không bỏ request/error để tăng điểm. Snapshot VPS sau toàn bộ 60 mẫu ghi nhận 0 Nginx error từ sau cấu hình tài nguyên cuối. Kiểm tra lại từ Windows qua 3 proxy IP: favicon 200, RSC đơn giản sau redirect hash 307→200; đây không phải replay đầy đủ state/browser của runner. Nguồn503 chưa xác minh, cần đối chiếu proxy/runner; không coi lỗi này đã xử lý xong hoặc xác nhận Best Practices 100 toàn bộ. Người dùng quản lý proxy, không sửa dashboard trong lượt này. Đây là mục theo dõi bổ sung bên cạnh các hạn chế manual/native còn mở.

## Số liệu Lighthouse mới theo trang

Mỗi trang có ba lượt Chromium mới, extension tắt và mobile simulated throttling như cấu hình lưu trong QA JSON. Bộ trước chạy production loopback CI; bộ sau chạy HTTPS qua proxy public. Dữ liệu từng lượt, FCP/LCP/TBT/CLS và byte tài nguyên của cả hai bộ nằm trong QA JSON. Bảng dưới ghi median sau chuyển; JS/font/ảnh là transferSize trong network-requests của Lighthouse, gồm overhead truyền tải được browser ghi nhận.

| Trang                               | Trước (lab) | Sau (public) | FCP ms | LCP ms | TBT ms |     CLS | JS byte | Font byte | Ảnh byte |
| ----------------------------------- | ----------: | -----------: | -----: | -----: | -----: | ------: | ------: | --------: | -------: |
| `/vi`                               |         100 |           98 | 1450.2 | 1450.2 |  107.5 | 0.00185 |  190658 |    103058 |        0 |
| `/en`                               |         100 |           98 | 1438.6 | 1438.6 |  138.0 | 0.00168 |  190658 |     53781 |        0 |
| `/vi/keyboard/tester`               |         100 |           97 | 1368.3 | 1368.4 |  112.5 | 0.00000 |  201526 |     79480 |        0 |
| `/en/audio/microphone`              |          98 |           99 | 1438.2 | 1438.2 |  105.0 | 0.00621 |  189595 |     52667 |        0 |
| `/vi/camera/preview`                |          99 |           99 | 1461.6 | 1461.6 |  106.0 | 0.00050 |  189249 |     77303 |        0 |
| `/en/gamepad/tester`                |          99 |           99 | 1379.3 | 1379.3 |  106.0 | 0.01514 |  189690 |     52667 |        0 |
| `/vi/utilities/number-to-words`     |          99 |           99 | 1315.0 | 1315.0 |  103.5 | 0.00000 |  196991 |     55749 |        0 |
| `/en/utilities/percentage`          |         100 |           98 | 1334.4 | 1334.4 |  100.5 | 0.00000 |  196150 |     30040 |        0 |
| `/vi/utilities/word-counter`        |          99 |           99 | 1335.1 | 1335.1 |   97.0 | 0.00000 |  197656 |     55752 |        0 |
| `/en/utilities/word-counter`        |         100 |           99 | 1296.6 | 1296.6 |  105.0 | 0.00007 |  197633 |     38637 |        0 |
| `/vi/utilities/case-converter`      |         100 |           98 | 1344.0 | 1344.0 |  106.5 | 0.03196 |  197655 |     55748 |        0 |
| `/en/utilities/case-converter`      |         100 |           98 | 1246.2 | 1246.2 |  111.0 | 0.00007 |  197633 |     38639 |        0 |
| `/vi/utilities/remove-accents-slug` |          99 |           99 | 1285.0 | 1285.0 |  108.0 | 0.00000 |  197633 |     55751 |        0 |
| `/en/utilities/remove-accents-slug` |         100 |           99 | 1314.6 | 1430.6 |  100.5 | 0.00007 |  197632 |     47124 |        0 |
| `/vi/utilities/text-cleaner`        |          99 |           99 | 1363.4 | 1363.4 |  104.5 | 0.00000 |  197632 |     55740 |        0 |
| `/en/utilities/text-cleaner`        |          99 |           99 | 1286.6 | 1286.6 |  107.0 | 0.00000 |  197633 |     30037 |        0 |
| `/vi/utilities/unit-converter`      |         100 |           99 | 1334.3 | 1334.3 |   97.0 | 0.00000 |  196665 |     55751 |        0 |
| `/en/utilities/unit-converter`      |         100 |           98 | 1343.8 | 1343.8 |  112.0 | 0.00000 |  196641 |     30046 |        0 |
| `/vi/utilities/date-calculator`     |          99 |           99 | 1280.4 | 1280.4 |  102.0 | 0.00000 |  195602 |     55752 |        0 |
| `/en/utilities/date-calculator`     |         100 |           99 | 1306.9 | 1306.9 |  101.0 | 0.00000 |  195602 |     30039 |        0 |

## Sửa rate-limit đã xác minh

Smoke public đầu đạt 83/84; một bài Chromium bị 503 khi chuyển VI/EN và công cụ. Chạy riêng tái hiện 1 fail/3 pass; trace ghi nhận 300 request trong khoảng 11 giây, có 112 static và 133 RSC. Nginx ghi nhận rate_limit; không có lỗi upstream. Tách static trước vẫn tái hiện 1 fail/3 pass với 101 RSC. Cấu hình cuối tách ba nhóm: điều hướng HTML 20 r/s, burst 60, RSC 100 r/s, burst 200 và static 100 r/s, burst 200; theo IP, không bỏ giới hạn. Map key rỗng không tính RSC vào nhóm điều hướng. Trust proxy, TLS, policy và app giữ nguyên. Bài tái hiện sau cấu hình cuối đạt 4/4, sau đó chạy lại đủ 84 smoke public. Giữ các lượt thất bại trong QA JSON, không đổi timeout/assertion/test ứng dụng.

Template vận hành được lưu ở `deploy/nginx.a.ap.vn.conf.template`. Chỉ thay marker `__RELEASE_SHORT__` bằng đúng SHA bảy ký tự đã kiểm tra; không dùng envsubst mở rộng mọi biến Nginx. Template được đối chiếu byte với cấu hình VPS sau thay marker, nginx -t và kiểm thử public. CI dẫn ở trên kiểm tra app source 6c8252b; cấu hình host cuối được xác minh riêng trên VPS. Giữ thêm backup trước tách static/RSC. Các lỗi rate-limit trước cấu hình cuối và các request Server Action không hợp lệ được ghi riêng ở runtime JSON.

## Chẩn đoán và lệnh đã chạy

SERVFAIL ban đầu đã hết sau khi người dùng cấu hình DNS. Kiểm tra HTTP public đầu tiên kỳ vọng 308 nhưng nhận 301 từ proxy; đã xác minh riêng strict 308 tại origin/tên miền cũ và strict 301 tại proxy mới, giữ path/query. Lượt nginx -t cô lập đầu tiên thiếu CHOWN cho cache; bổ sung CHOWN chỉ trong container kiểm tra tạm thời, chạy lại đạt; quyền production giữ nguyên. Helper gate sửa đường dẫn context rồi đối chiếu đầy đủ artifact trước chuyển.

Đã chạy `pnpm typecheck`, `pnpm lint`, `node scripts/scan-secrets.mjs`, `pnpm test --maxWorkers=2 --reporter=json --outputFile=artifacts/domain-a-ap-unit.json`, `pnpm audit --prod --json`, `pnpm audit --json`; `node --check` và ba guard âm tính cho audit scripts. CI chạy lại build/unit/full E2E/Docker smoke. Lighthouse workflow chạy 20 route ×3 trước/sau chuyển đúng source. Public chạy `node artifacts/domain-a-ap-public-check.mjs`, `pnpm exec playwright test --config artifacts/domain-a-ap-public-playwright.config.ts`; đã chụp và xem ảnh desktop/mobile.

VPS chạy Certbot webroot, Docker Compose config/build/up với health wait, candidate cô lập, restart/stop/start/SIGTERM, nginx -t/reload và curl --resolve kiểm tra TLS/redirect/ACME từng proxy IP/origin. Không dùng --insecure. ACME QA chỉ xác minh đường dẫn challenge sau chuyển; chưa chứng nhận một chu kỳ gia hạn tự động. Không đồng nhất WebKit với Safari thật hoặc backend ảo với phần cứng thật.
