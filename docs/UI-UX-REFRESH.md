# Nâng cấp giao diện Device Lab

Ngày cập nhật: 10/11/2026. Phạm vi: giao diện cho 40 công cụ hiện có; không thêm Phase 3 hoặc thay engine đo/quyền truy cập.

## Skill và hướng thiết kế

Đã cài [UI/UX Pro Max từ nextlevelbuilder](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), tại thư mục skill cá nhân của Codex. Không chép toàn bộ skill vào repository và không thêm dependency runtime. Đã đọc SKILL.md, pro-rules.md, các mục accessibility/touch/performance của quick-reference.md và tài liệu CSS/Server Components của Next.js đang cài.

Lệnh tra cứu đã chạy:

```text
python <skill-dir>/scripts/search.py "hardware diagnostic developer tools" --design-system -p "Device Lab"
python <skill-dir>/scripts/search.py "diagnostic tools dashboard" --design-system -p "Device Lab"
python <skill-dir>/scripts/search.py "responsive server components" --stack nextjs
python <skill-dir>/scripts/search.py "filter selected count" --domain ux -n 2
```

Lượt đầu gợi ý FAQ/Documentation Landing không phù hợp trọng tâm công cụ nên không áp dụng. Truy vấn hẹp hơn trả về Minimalism & Swiss Style, hỗ trợ cả hai theme, thứ bậc chữ rõ, grid và tương tác nhẹ. Áp dụng các nguyên tắc phù hợp, không sao chép nguyên palette/font hoặc khuyến nghị analytics. Giữ Geist/Geist Mono tự host để hỗ trợ tiếng Việt và tránh thêm tài nguyên font. Không cài GSAP hoặc thư viện hiệu ứng.

## Những thay đổi chính

- Trang chủ: tiêu đề hai cấp màu, CTA duyệt danh mục/đo Refresh Rate, bảng thông tin browser và các số đếm lấy trực tiếp từ registry. Không đặt thông số phần cứng mẫu vào trang thật.
- Điều hướng: lối vào tám nhóm thiết bị, số công cụ theo registry, icon đúng cho camera/gamepad; desktop đánh dấu nhóm đang xem. Header mobile tự reflow, menu và locale giữ hành vi cũ.
- Danh mục: trường tìm kiếm có label, nút xóa từ khóa đưa focus về input, giữ bộ lọc đang chọn, số kết quả hiển thị và thông báo bằng status region. Nhóm filter có semantics và trạng thái aria-pressed.
- Thẻ công cụ: icon/màu nhóm, đường viền và hover/focus nhất quán. Màu không thay nhãn chữ. Danh mục không dùng icon màn hình thay cho camera/gamepad.
- Workspace: surface, metric và vùng hướng dẫn có phân cấp rõ hơn; không thay canvas/mẫu màu chuẩn, thuật toán, Start gating hoặc lifecycle engine.
- Token dùng chung: graphite/cobalt ở Dark Mode, nền sáng ở Light Mode, border cho control riêng, shadow/radius và font dùng biến. SVG trang trí mới có aria-hidden.
- Responsive: bố cục 320/375/414/768/1024/1440 px, nhóm thiết bị dùng auto-fit/minmax theo rem để reflow cả khi tăng chữ 200%. Không dùng overflow để che label bị tràn. Reduced motion bỏ transform khi hover/nhấn.

File chính: tokens.css; src/app/interface.css; layout/trang chủ/trang category; Header/Footer; Catalog/ToolCard/DeviceOverview/CategoryIcon; messages VI/EN; tests/e2e/interface.spec.ts. CSS mới là lớp trình bày chung nhập sau globals.css ở locale layout; không đổi cơ chế tải động của engine hoặc document navigation theo Permissions-Policy.

## Kiểm chứng

Checkpoint trước khi gửi CI: production build đủ 106 trang đạt, lint/typecheck đạt và 275 unit/integration trên 33 file đạt. Accessibility đại diện ở hai theme trên Chromium đạt. Ba bài UI mới kiểm tra category count/link, tìm kiếm/xóa/focus, reflow VI/EN/hai theme và chữ 200%/reduced motion; lượt đầu phát hiện hai shortcut tràn ở chữ 200%, đã sửa grid theo rem và chạy lại 3/3 đạt. Giữ lịch sử lỗi, không giảm assertion.

Lượt full E2E Windows trước khi đổi phiên làm việc bị gián đoạn, không có báo cáo kết thúc; không coi đạt. Đang chạy lại nhóm hồi quy giao diện qua production standalone và chờ toàn bộ Linux CI của source mới. Kết quả cuối sẽ bổ sung tại PROGRESS.md/TESTING.md, không kế thừa CI M6 cho UI mới.

Ảnh trước/sau và raw QA chỉ lưu trong artifacts bị Git ignore. Bằng chứng screenshot dùng dữ liệu browser thật sau hydrate; Refresh Rate chưa chạy vẫn ghi chưa đo. Không tuyên bố đã kiểm tra Safari/thiết bị thật, screen reader hoặc Lighthouse mới. Các mục bảo mật proxy, hai advisory dev tooling và Final Acceptance còn mở như bàn giao staging trước.
