# Chuyển tên miền sang a.ap.vn — 23/11/2026

Người dùng yêu cầu chuyển website trên VPS hiện có sang `https://a.ap.vn` và đã tự cấu hình DNS qua proxy. Giữ nguyên 48 công cụ, giao diện VI/EN và toàn bộ engine/test của Milestone 3. Không sửa DNS hoặc dashboard proxy.

## Trước chuyển

Baseline đang phục vụ là source `890aa52d9af73d1d36fd96b79d941adcb20296ed`; repository tại `fcc2c91c788ffb41938f1f35261b84c18307920e` chỉ bổ sung báo cáo. Git working tree sạch khi bắt đầu. DNS từ VPS qua hai resolver công cộng đã trả ba IP proxy hiện có trong allowlist. Cả ba IP đã chuyển đúng token HTTP ACME về VPS; truy vấn CAA trả NOERROR, không có CAA hạn chế. Lỗi SERVFAIL ban đầu được ghi nhận trước khi DNS cập nhật, không phải trạng thái xác minh cuối.

`SITE_URL` được dùng trong metadata, sitemap và robots khi build. Cần build image mới với `SITE_URL=https://a.ap.vn`, không chỉ đổi biến môi trường runtime. Tệp `.env` ở host, quyền 600; không đưa vào Git/archive. Chứng chỉ mới được cấp qua webroot của Nginx, giữ chứng chỉ cũ để phục vụ redirect HTTPS.

## Quy trình và rollback

1. Xác minh DNS, HTTP ACME qua từng proxy và cấp chứng chỉ mới.
2. Kiểm tra typecheck/lint/unit, CI sạch đầy đủ; build Docker và kiểm tra candidate cô lập đủ 96 route công cụ, canonical và sitemap 118 URL. Kiểm tra restart/shutdown, Node private và quyền runtime.
3. Lưu baseline image/release, hash và bản sao cấu hình Nginx/locations/Compose override. Chỉ thay SITE_URL và RELEASE_TAG ở env mới. Giữ nguyên inode tệp Nginx bind mount khi ghi; kiểm tra `nginx -t` trước reload.
4. Chuyển app và Nginx sang tên miền mới; tên miền cũ redirect 308, giữ đường dẫn/query và ngoại lệ ACME. Giữ allowlist proxy và giới hạn truy cập hiện có.
5. Xác minh HTTPS public, VI/EN, health, canonical/hreflang/sitemap/robots, redirect cũ/mới, policy, browser smoke và Lighthouse sạch. Ghi lại kết quả thật ở phần nghiệm thu; không lấy điểm tên miền cũ làm kết quả mới.

Nếu chuyển lỗi: khôi phục app image/env của release `890aa52`, nội dung Nginx từ backup và symlink current; kiểm tra health/HTTPS rồi reload. Không prune release/image cũ. Không cố gây lỗi production để diễn tập rollback.

## Phạm vi và giới hạn

Lighthouse chỉ cho phép hai origin HTTPS được người dùng ủy quyền và loopback; workflow cho chọn origin khi đo public, vẫn kiểm tra marker đúng commit. Không mở đo tùy ý hoặc bỏ kiểm tra injection.

localStorage và quyền camera/microphone thuộc từng origin: lịch sử/theme ở tên miền cũ không tự chuyển sang tên miền mới, browser có thể hỏi quyền lại. Không upload hoặc tự chuyển dữ liệu người dùng giữa hai origin.

Các hạn chế nghiệm thu nền tảng vẫn giữ nguyên: Safari/phần cứng thật, clipboard/bộ gõ/điện thoại thật, native policy skips và audit dev tooling. CSP và TLS qua proxy phải báo theo bằng chứng mới; dashboard proxy do người dùng quản lý. Không đánh dấu Final Acceptance tổng thể chỉ từ việc chuyển tên miền.

## Trạng thái

Chứng chỉ a.ap.vn đã cấp thành công, hết hạn 21/02/2027. Đang chuẩn bị build và các gate kiểm thử; chưa xác nhận chuyển production hoàn tất. Báo cáo nghiệm thu sẽ bổ sung sau khi quan sát trạng thái thực tế.
