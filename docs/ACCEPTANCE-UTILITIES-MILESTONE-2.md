# Nghiệm thu tiện ích Milestone 2

Hoàn thiện báo cáo ngày **20/11/2026**. Đợt triển khai và kiểm thử đầy đủ diễn ra ngày **19/11/2026**; kiểm tra lại HTTP và dependency audit ngày 20/11. Source đang phục vụ: [`142f807`](https://github.com/anhtruc1803/checkall/commit/142f807dbb87374452acb65a8be6e2052caa5367).

## Phạm vi và kết luận

Milestone 2 đã triển khai lên [website VI](https://nguyenanhtruc.io.vn/vi/utilities) và [website EN](https://nguyenanhtruc.io.vn/en/utilities), gồm đếm từ/ký tự, đổi hoa/thường, bỏ dấu/tạo slug và làm sạch văn bản. Tổng **46 công cụ**, giữ nguyên metadata, route, engine và chức năng của **42 công cụ trước**. Không triển khai milestone tiếp theo hoặc thay kiến trúc ứng dụng.

**Các gate phát hành phần mềm đã đạt.** Mục tiêu median Lighthouse Performance mobile ≥90 đạt trên 16 trang đại diện. **Chưa đóng Final Acceptance tổng thể** vì còn các mục native/manual và bảo mật bên dưới; không tính skip là đã xác minh.

## Kết quả kiểm thử thực tế

| Hạng mục                     | Kết quả                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| Typecheck, lint, quét secret | Đạt trong CI sạch                                                                   |
| Unit/integration             | 494 bài đạt trên 41 file                                                            |
| Production build             | Đạt, 120 trang                                                                      |
| Full E2E sạch                | 434 đạt, 6 skip; không fail/flaky/global error                                      |
| Chromium / mobile Chromium   | Mỗi cấu hình 110 bài đạt                                                            |
| Firefox / WebKit             | Mỗi engine 107 đạt, 3 native policy skip                                            |
| Bốn tiện ích văn bản         | 32/32 bài E2E đạt                                                                   |
| Hai tiện ích số trước đó     | 24/24 bài E2E đạt                                                                   |
| Public smoke sau chuyển      | 56/56 bài đạt trên bốn cấu hình browser                                             |
| HTTP public                  | 92 route công cụ, H1/canonical/release/policy, sitemap 114 URL và HTTP→HTTPS308 đạt |
| Kiểm tra lại ngày 20/11      | Release `142f807`, health HTTP200/status OK; toàn bộ 92 route tiếp tục đạt          |

Bằng chứng: [CI sạch](https://github.com/anhtruc1803/checkall/actions/runs/44492926836), [QA phát hành](qa/deployment-utilities-milestone2-2026-11-19.json), [TESTING.md](TESTING.md). Public smoke là subset chức năng trên Windows hiện có; xác minh không-upload của toàn bộ suite được thực hiện riêng trong CI sạch. Clipboard/IME/gamepad/media fixture và backend audio ảo không chứng nhận quyền hệ thống hoặc phần cứng thật. WebKit automation không tương đương Safari thật.

## Performance trước và sau chuyển

| Bộ đo sạch                                       | Số mẫu                    | Median mobile theo trang |
| ------------------------------------------------ | ------------------------- | ------------------------ |
| Candidate trước chuyển                           | 48 mẫu, 16 trang × 3 lượt | 99–100                   |
| Website HTTPS public sau chuyển                  | 48 mẫu, 16 trang × 3 lượt | 95–98                    |
| Tám route VI/EN của bốn tiện ích mới trên public | 24 mẫu                    | 97–98                    |

Median Accessibility/Best Practices/SEO đều 100 trên mọi trang ở cả hai bộ. [Lighthouse trước chuyển](https://github.com/anhtruc1803/checkall/actions/runs/44493548246), [Lighthouse public](https://github.com/anhtruc1803/checkall/actions/runs/44498282182), bảng median FCP/LCP/TBT/CLS trong [PERFORMANCE.md](PERFORMANCE.md); đủ 96 mẫu và kích thước JS/font/ảnh được lưu trong QA JSON.

Hai bộ khác VM và origin/HTTP/HTTPS proxy, nên chênh lệch điểm không chứng minh mức tăng/giảm do code. Mẫu Windows bị Kaspersky chèn trước đây không được dùng làm baseline. Không bỏ công cụ, nội dung SEO hoặc accessibility để lấy điểm; không coi Lighthouse lab là field data.

## Docker và vận hành

Docker CI đạt build, healthcheck, Nginx, 48 route smoke VI/EN, restart/stop-start và SIGTERM143, không OOM/Error, Node không publish. Candidate VPS được thử riêng với network none, non-root/read-only; đủ 92 route trước/sau chuỗi restart/stop-start và sitemap 114 URL.

Image đang phục vụ: `device-lab:staging-142f807-20261119`; Node.js 24.22.3, user `nextjs`, read-only, giới hạn 768 MiB/256 PID, cap-drop ALL/no-new-privileges. Snapshot runtime ngày 19/11 ghi health tốt, 0 lỗi app/upstream; có 15 bản ghi rate-limit trong khoảng QA, không nới giới hạn để làm test đạt. Kiểm tra HTTP ngày 20/11 tiếp tục đạt; không kết nối SSH lại trong lượt hoàn thiện tài liệu.

Giữ release/image `7e3dd0b` và backup Nginx để rollback. Chỉ đổi ứng dụng, release marker và RELEASE_TAG; không đổi DNS/proxy/routing/policy/quyền hoặc Compose override, không prune/reboot hay chạy renewal mới. Không cố gây lỗi production để diễn tập rollback. Xem [DEPLOYMENT.md](DEPLOYMENT.md) để biết image ID, archive SHA256, đường dẫn và giới hạn xác minh TLS.

## Vấn đề phát hiện và đã xử lý

- Windows có script/request Kaspersky chèn: chuyển xác minh sang CI sạch, giữ nguyên assertion không-upload và giữ kết quả local không sạch trong lịch sử.
- APT mirror cài browser chậm và `ubuntu-latest` thay phiên bản: pin Ubuntu 24.04 và image Playwright 1.64.1 theo digest, có sẵn browser/thư viện.
- Git ownership, HOME của audio/Firefox và HOSTNAME trong container: chỉ trust đúng workspace, chạy daemon audio bằng `pwuser` với runtime riêng, đặt HOME đúng user job và server loopback.
- Các lượt bị hủy hoặc lỗi bootstrap không được tính là pass. Không thay ứng dụng/tests hoặc tăng timeout/skip để che lỗi; sourceHistory giữ từng lượt trong QA JSON.

File chính đã hoàn thiện: README, ARCHITECTURE, PROGRESS, PERFORMANCE, TESTING, DEPLOYMENT, đặc tả UTILITIES-MILESTONE-2, báo cáo này và QA JSON. Mã ứng dụng/tests không đổi trong lượt chốt tài liệu.

## Phân loại nghiệm thu và phần còn mở

| Trạng thái                               | Phạm vi                                                                                                                          |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Đã hoàn thành và xác minh                | 46 công cụ VI/EN; giữ 42 công cụ cũ; CI sạch, Docker/candidate, HTTP/public smoke và median mobile ≥90 trên bộ đại diện          |
| Đã triển khai nhưng chưa xác minh đầy đủ | Clipboard/quyền hệ thống, bộ gõ/điện thoại/screen reader thật; đường rollback khi production lỗi chưa diễn tập cố ý              |
| Chưa hoàn thành                          | 6 native policy skip, 2 moderate dev tooling `glob`/`minimatch`, CSP public bị proxy bỏ, xác minh TLS proxy→origin và field data |
| Không thể kiểm chứng trong đợt này       | Safari thật, phần cứng và mọi phiên bản EVKey; chế độ TLS trong bảng điều khiển proxy do người dùng quản lý                      |

Sáu skip thuộc native Permissions-Policy microphone/camera/gamepad của Firefox và WebKit. Header scope và app guard đã được kiểm tra riêng; không suy thành native enforcement đã đạt. Audit production kiểm tra lại ngày 20/11 không có advisory. CSP có tại app nhưng public vẫn thiếu trên 92/92 route; giữ cấu hình proxy của người dùng.

Tiếp theo: dùng bốn tiện ích trên domain, hoàn tất danh sách manual/native/bảo mật còn mở. Không tự triển khai milestone tiếp theo. **Release checks passed: có; Final Acceptance complete: chưa.**
