# Triển khai và vận hành

## Điều kiện

VPS Linux có Docker Engine và Docker Compose plugin; DNS A/AAAA trỏ về VPS; tường lửa chỉ mở cổng web cần thiết, SSH theo chính sách của quản trị viên. Không mở cổng Node 3000 công khai. Chưa có máy chủ production nào được cấu hình trong tác vụ này.

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

Script dùng project Compose riêng `device-lab-qa-*`, bind Nginx vào loopback cổng 8080 và đặt SITE_URL đúng origin QA. Các bước bắt buộc: build image; chờ healthcheck healthy; `nginx -t`; health và tám route VI/EN qua proxy; xác nhận app không có published port; restart app rồi kiểm tra lại; SIGTERM shutdown phải có exit code 0; start và chờ healthy lần nữa. Cuối lượt luôn thu log/trạng thái vào `artifacts/docker/` rồi dọn đúng project QA. Script không dùng volume database và không kết nối hạ tầng production.

`HTTP_BIND` và `HTTP_PORT` có thể cấu hình ở Compose; mặc định triển khai vẫn là Nginx `0.0.0.0:80`, Node 3000 chỉ được expose trong network nội bộ. Không dùng giá trị loopback QA làm cấu hình Internet nếu muốn phục vụ người dùng ngoài VPS.

CI chạy cùng script và upload bằng chứng khi thành công hoặc lỗi. Chỉ ghi Docker đã xác minh sau khi job thực sự hoàn tất; kiểm tra config bằng Compose CLI trên Windows không tương đương build/chạy container Linux. HTTPS công khai, DNS, chứng chỉ và gia hạn vẫn cần kiểm tra trong môi trường staging được cho phép.
