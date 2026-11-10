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

Source 49bd12f: nhóm giao diện local 92/92 đạt, không skip/failure/flaky. Kiểm tra bổ sung menu mở phát hiện label quyền riêng tư tràn ở 320px; đã sửa white-space/overflow-wrap và mở rộng bài responsive/200% để kiểm tra menu. CI 42756963778 được hủy khi verify còn chạy, Docker của source này đã đạt; chờ CI mới cho source sau sửa menu. Image chuẩn bị từ 49bd12f chưa được đưa vào phục vụ.

CI 42757715180 trên source 27f1383 phát hiện hai lỗi dùng chung: tên truy cập logo không chứa tagline hiển thị và tương phản kbd giảm trong lúc nền nút chuyển theme. Kết quả 299 đạt/6 skip/19 lỗi; Docker đạt 80 giây. Đã sửa semantic của logo và đổi màu nền/chữ đồng thời, thêm regression trực tiếp hai rule Axe; giữ nguyên các bài kiểm thử cũ. Source thất bại không được triển khai.

Ảnh trước/sau và raw QA chỉ lưu trong artifacts bị Git ignore. Bằng chứng screenshot dùng dữ liệu browser thật sau hydrate; Refresh Rate chưa chạy vẫn ghi chưa đo. Không tuyên bố đã kiểm tra Safari/thiết bị thật, screen reader hoặc Lighthouse mới. Các mục bảo mật proxy, hai advisory dev tooling và Final Acceptance còn mở như bàn giao staging trước.

## Manual QA còn cần thực hiện

- NVDA/VoiceOver ở VI/EN: thứ tự heading, tên nhóm thiết bị, trạng thái filter và thông báo số kết quả; focus sau xóa tìm kiếm và đóng dialog/menu. Axe không thay kiểm tra screen reader thật.
- Browser zoom 200%/400%, cỡ chữ hệ thống lớn và landscape trên điện thoại thật. Automation tăng root font 200% không tương đương mọi cơ chế zoom/OS.
- Touch/keyboard thật trên Safari iOS/macOS và browser Android: menu, theme/locale, fullscreen và thao tác vùng đo. Giữ ma trận phần cứng và lifecycle của từng milestone.
- Lighthouse sạch trên sáu trang đại diện đã được bổ sung ở đợt Performance bên dưới; field data và runtime khi chạy phần cứng vẫn cần đo riêng. Không suy ra điểm Performance từ việc build hoặc E2E đạt.
- Sau khi quản trị viên thay cấu hình proxy, kiểm tra lại CSP public và chế độ TLS proxy→origin. Đây là tiêu chí vận hành riêng, không mặc định đạt qua đợt đổi giao diện.

## Kết quả cuối và bản đang phục vụ

Source 387c03f, [CI 42759176453](https://github.com/anhtruc1803/checkall/actions/runs/42759176453) success: 275 unit/33 file, build 106 trang, typecheck/lint/secret scan; **318 E2E đạt, 6 skip native policy**, không failure/flaky. Chromium/mobile 81 đạt mỗi cấu hình; Firefox/WebKit 78 đạt/ba skip mỗi cấu hình. Thời gian E2E 681819.829 ms. Sau sửa, nhóm local interface + các ma trận accessibility từng thất bại đạt 32/32, không skip/flaky, 316821.173 ms. Không nhận CI thất bại trước đó là đạt.

Docker CI đạt 87 giây, đầy đủ private port/health/Nginx/route/policy/restart/stop-start; SIGTERM 143 không OOM/Error. Đã triển khai source này lên [staging VI](https://nguyenanhtruc.io.vn/vi) và [staging EN](https://nguyenanhtruc.io.vn/en). App healthy, Node không public; giữ source/image cũ để phục hồi. Public smoke 34 route/policy và ba E2E UI trên Chromium/Firefox/WebKit đạt, gồm cả tên logo và tương phản hai theme; 38009.247 ms. Đã đọc/đối chiếu HTML, CSS, marker release, canonical, sitemap 100 URL và ảnh website thật sau hydrate.

Ảnh/raw artifact ở artifacts bị ignore; bản số liệu tại [qa/ui-ux-refresh.json](qa/ui-ux-refresh.json). Không thay dashboard tên miền/proxy. CSP public vẫn thiếu khi kiểm tra 12:14 Asia/Saigon; audit production không finding, audit dev vẫn hai advisory moderate. Những mục manual/performance ở trên tiếp tục mở; không đánh dấu Final Acceptance hoàn tất.

## Đo Performance tiếp theo — 10/11/2026

Source ad25dd1 chỉ tối ưu wrapper class tại Button, giữ giao diện/40 công cụ/VI-EN. CI mới đạt 275 unit, 318 E2E/6 skip và Docker; public healthy/34 route/policy cùng UI ba browser đạt. Lighthouse đo ba lượt/trang trên sáu trang đại diện: median lab 100/100/100/99/99/99, HTTPS public 95/98/97/97/96/97; JS truyền tải giảm 9551 byte/trang trong cặp cùng VM. Phạm vi Performance này đã xác minh, còn manual/hardware/field data và bảo mật nêu trong [PERFORMANCE.md](PERFORMANCE.md), gồm cả smoke Windows riêng median 89; không nhận mọi môi trường đạt 90 hoặc đóng Final Acceptance tổng thể.

## Bàn lab tương tác và minh họa nhóm — 10/11/2026

Theo đề xuất đã được người dùng đồng ý, bổ sung hero bàn lab bằng SVG và hình vẽ riêng cho tám danh mục. Dùng UI/UX Pro Max, tra `decorative motion reduced motion --domain ux`: chỉ tạo phản hồi khi người dùng tương tác và tôn trọng prefers-reduced-motion. Đọc tài liệu Server/Client Components và CSS của Next.js cài trong repository trước khi sửa.

Hero là một Client Component nhỏ: con trỏ mouse dịch hình tối đa 5 px ngang/4 px dọc; rời vùng hoặc blur trả vị trí gốc. Chạm/click/Enter/Space đổi ánh sáng minh họa qua nút aria-pressed. Không có timer, RAF loop, listener toàn cục, quyền media, âm thanh tự chạy, storage hoặc event logging. Reduced motion vô hiệu transform bằng CSS, handler cũng không cập nhật tọa độ khi chế độ này đang bật. Hình vẫn đọc được khi JavaScript chưa hydrate; SVG trang trí được ẩn khỏi accessibility tree. Nút có tên bao gồm cả chữ hiển thị, focus ring và chú thích rõ không phải kết quả đo thiết bị.

Tám CategoryArt được render ở server; icon dùng chung của registry/menu/filter giữ nguyên. Hover/focus chỉ dịch nhẹ hình của danh mục được chọn trên thiết bị có hover và cho phép chuyển động. Không thêm dependency, ảnh tải ngoài hoặc font. DeviceOverview giữ nguyên hook/dữ liệu/nhãn ước đoán; đổi vị trí thành dải tóm tắt bên dưới nhóm thiết bị, reflow 4/2/1 cột theo không gian và cỡ chữ. Giữ đủ 40 công cụ, VI/EN, SEO, quyền và lifecycle engine.

File chính: `src/components/tools/lab-scene.tsx`, `category-art.tsx`, trang chủ locale, `interface.css`, messages VI/EN và `tests/e2e/interface.spec.ts`. Thêm kiểm thử pointer/keyboard/touch, aria-pressed, reset, chú thích minh họa, Refresh Rate vẫn chưa đo, Axe hai theme; mở rộng ma trận responsive và chữ 200% cho hero/thông tin thật. Lượt đầu phát hiện nút kế thừa white-space nowrap làm cắt gợi ý ở chữ 200%; đã sửa reflow, không bỏ assertion. Kết quả cuối được ghi ở PROGRESS.md/TESTING.md và QA JSON, không dùng kết quả Lighthouse bản cũ nhận cho giao diện này.

### Manual QA dành cho minh họa

- Trên điện thoại thật, chạm nút đổi ánh sáng rồi cuộn dọc qua vùng hero; không được chặn cuộn hoặc yêu cầu quyền thiết bị.
- Dùng screen reader xác nhận nút được đọc tên/trạng thái bật tắt, hình trang trí không tạo hàng chục phần tử và chú thích không bị hiểu là số đo thật.
- Bật reduced motion ở hệ điều hành, kiểm tra cả khi trang đang mở; vị trí hình phải đứng yên, nút đổi màu vẫn hoạt động. Kiểm tra zoom browser/OS và chế độ tương phản cao thực tế.
- Kiểm tra Safari trên macOS/iOS thật; WebKit automation chỉ là bằng chứng runtime tự động.

Kết quả cuối source 882c4d9: build 106/typecheck/lint/275 unit đạt, 322 E2E đạt/6 skip native policy (không failure/flaky), local UI16/16 và public UI6/6 đạt. Lighthouse sạch 36 lượt so sánh/18 lượt HTTPS: median sau lab 99/99/99/98/97/98 và public sáu trang đều99, A/BP/SEO100. Đã phục vụ staging; chi tiết/số đo thực ở PERFORMANCE.md/TESTING.md/qa/lab-scene-2026-11-10.json. Các mục manual ở trên chưa được coi hoàn tất; Final Acceptance tổng thể vẫn mở.

## Lối vào theo vấn đề — 10/11/2026

Dùng cùng thiết kế UI/UX Pro Max, thêm section ngay dưới hero: ba thẻ dấu hiệu, mỗi thẻ có link nên thử trước và kiểm tra thêm. Screen → Refresh Rate/Ghosting; Keyboard → Key Chatter/Keyboard Tester; Microphone → Microphone/Audio Spectrum. Không mô tả các công cụ này như chẩn đoán tự động; giữ cơ chế kích hoạt và quyền của từng engine. Bản đầu truy vấn `descriptive link navigation` trả sticky navigation không phù hợp trọng tâm; truy vấn hẹp `keyboard focus visible --domain ux` trả hướng dẫn focus states phù hợp và đã áp dụng. Không tạo design system mới.

ProblemChooser render server, CSS Module riêng, tên/URL lấy từ published registry. PolicyLink giữ document navigation sang media; prefetch=false. Không thêm JS tương tác, ảnh/font/dependency hoặc event logging; link có chữ đầy đủ, icon trang trí aria-hidden, focus rõ, vùng chạm≥44px, hỗ trợ hai theme/VI-EN/chữ200%. Giữ hero/tám minh họa, DeviceOverview, featured/catalog/SEO cùng40 công cụ. File: problem-chooser.tsx, problem-chooser.module.css, page.tsx/messages và problem-chooser.spec.ts; kết quả thực ở PROGRESS.md/TESTING.md/PERFORMANCE.md sau kiểm thử.

Manual QA tiếp theo: screen reader đọc tên/thứ tự link và quan hệ dấu hiệu→công cụ; Safari/điện thoại thật/zoomOS; quyền microphone vẫn chỉ hỏi khi người dùng chủ động bắt đầu phiên. Không coi spy API của E2E là kiểm tra phần cứng hoặc khả năng microphone thật.
