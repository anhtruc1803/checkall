# Triển khai và vận hành

## Bản chọn công cụ theo vấn đề đang phục vụ — 10/11/2026

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
