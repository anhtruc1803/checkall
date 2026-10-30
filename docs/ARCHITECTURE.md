# Kiến trúc Device Lab

Milestone hiện hành: Phase 2 Milestone 2, ngày 30/10/2026. Registry có 29 published (21 Phase 1 + 8 Phase 2) và 11 draft. Các đoạn mô tả checkpoint nền tảng bên dưới giữ lại để đối chiếu; chi tiết triển khai mới ở [PHASE2-MILESTONE2.md](PHASE2-MILESTONE2.md).

Engine mới vẫn dynamic import theo công cụ. Phần đọc device/GPU/storage tách trong src/lib/browser; thuật toán pointer tách trong src/lib/measurements. useInspection quản lý promise/lifetime cho snapshot, useTimedTask quản lý bộ đo trong ref và snapshot UI bốn lần/giây. Các phép ghi storage/context GPU chỉ chạy sau thao tác chủ động; không mở capability nhạy cảm khi dựng UI. useFullscreen bổ sung ownership và xử lý request đến muộn sau unmount, có regression test cho Phase 1.

Ứng dụng modular monolith dùng Next.js App Router, React, TypeScript strict, Tailwind CSS, các thành phần shadcn/ui, Lucide và next-intl. Không có tài khoản, database hay upload log thiết bị.

- `src/app/[locale]`: trang server và metadata song ngữ.
- `src/lib/tools`: registry duy nhất cho 21 chức năng published và 19 mục Phase 2 draft, phân loại phép đo, nội dung và khả năng trình duyệt.
- `src/lib/measurements`: thuật toán thuần, không phụ thuộc React.
- `src/features`: các engine client tải theo nhóm, quản lý vòng đời sự kiện và tài nguyên.
- `src/lib/storage`: tùy chọn và bản tóm tắt opt-in, giới hạn kích thước.
- `src/messages`: chuỗi giao diện Việt/Anh; tên biến và API bằng tiếng Anh.
- `tests`: Vitest, React Testing Library và Playwright.

Các mô-đun tương lai được ghi trong roadmap, không công bố route hay endpoint mạng. Mỗi công cụ mới khai báo registry và loader nhóm, không sửa danh sách điều hướng thủ công.

## Quyết định triển khai

- Registry có 21 mục Phase 1 đã công bố. Mỗi mục tham chiếu `engine`; `ToolRunner` ánh xạ engine sang dynamic import. Loader nằm riêng để metadata server không kéo engine client vào render.
- Không cần Zustand: trạng thái phép đo nằm trong hook, theme/preference dùng `useSyncExternalStore` cho localStorage; Refresh Rate gần nhất trong phiên dùng external store nhỏ có kiểu `MeasurementResult`.
- RAF thu mẫu sau warm-up 500 ms, cập nhật UI tối đa 4 lần/giây; frame interval không hữu hạn, không dương hoặc từ 1000 ms bị loại. Kết quả chỉ xuất hiện sau tối thiểu 30 khoảng hợp lệ và 1 giây. Độ lệch chuẩn lớn hơn 20% median tạo cảnh báo, không tạo confidence score.
- PointerSampler bỏ timestamp trùng hoặc không tăng, dùng coalesced events nếu có, giữ tối đa 100.000 timestamp; UI Polling Rate cập nhật 4 lần/giây. Graph dùng 120 khoảng gần nhất; nếu chạm giới hạn, thống kê phản ánh cửa sổ cuối trong bộ đệm. Tần suất cần ít nhất 20 timestamp trên khoảng từ 500 ms.
- Log bàn phím/click được giới hạn 200 sự kiện; hold history 50; lịch sử lượt Polling Rate 10; tóm tắt opt-in trong localStorage tối đa 30. Không lưu log thô, không lưu ngầm bản tóm tắt.
- TypeScript 5.9.3 và ESLint 9.39.1 được chọn theo peer ranges của các lint plugins ở lần cài đặt. ESLint 9 hiện có cảnh báo vòng đời từ registry; cần nâng đồng bộ khi bộ plugin hỗ trợ ESLint mới hơn, không bỏ luật kiểm tra để nâng số phiên bản.
- Font Geist/Geist Mono được self-host từ package, không yêu cầu Google Fonts runtime. Không có analytics hoặc third-party tracking trong sản phẩm.
- CSP sản phẩm chỉ khai báo tài nguyên và kết nối cùng origin; static Next.js cần inline bootstrap/style. Không coi CSP này là nonce policy nghiêm ngặt, hoặc bảo đảm chống mọi can thiệp bởi extension/phần mềm cài trên máy. Chi tiết đo đạc thực tế trong PERFORMANCE.md.

## Rà soát Phase 1 bổ sung

- `getToolSearchIndex` sinh chỉ mục gọn từ registry duy nhất. Client tìm kiếm cả VI/EN nhưng chỉ nhận tên hiển thị và chuỗi tìm kiếm, không cần tải hướng dẫn/phương pháp/giới hạn của cả 21 công cụ. Nội dung SEO đầy đủ vẫn render tại server.
- Client chỉ nhận `id`, `engine`, `requiredCapabilities` cho ToolRunner. Các engine vẫn dynamic import theo công cụ; HTML giao diện ban đầu được prerender ở trạng thái `inert`. EngineSurface dùng native fieldset disabled/inert và aria-busy cho đến hydration của chính engine; capability detection ở ToolRunner quyết định fallback. Không có RAF, sự kiện đầu vào hoặc số đo phần cứng được tạo ở server.
- Validation chuyển sang API `zod/mini` cùng phiên bản Zod; giới hạn dữ liệu không thay đổi. Hộp tìm kiếm chỉ dựng kết quả khi mở; catalog không prefetch hàng loạt các công cụ chưa được chọn. Không loại nội dung hoặc chức năng để tăng điểm.
- Catalog khóa thao tác trước hydration để không làm mất truy vấn nhập sớm trên WebKit. Capability của Device Overview được kiểm tra một lần cho mỗi lần mount; các giá trị Screen/Viewport/DPR vẫn được đọc cập nhật và dọn listener/timer khi unmount.
- Bộ kiểm thử lifecycle kiểm tra RAF, ResizeObserver, keyboard hold timer, mouse/CPS/pointer timers và wheel listener; dữ liệu high-frequency tiếp tục có bộ đệm giới hạn.

## Nền tảng Phase 2

Theo yêu cầu tiếp tục của người dùng, milestone nền tảng Phase 2 đã mở. `types.ts` tách contract khỏi metadata; `catalog.ts` xác minh publication boundary, ID/route/translation/related/engine và sinh category published. Chỉ mục client tiếp tục chỉ chứa metadata của 21 công cụ công bố, không mang theo 19 draft. Renderer map bắt buộc bao phủ toàn bộ ImplementedEngine ở thời điểm typecheck.

`inspectCapabilities` là probe theo yêu cầu, tách khỏi `observePermission`/`usePermission` đọc quyền thụ động. `createMediaSession` quản lý yêu cầu media chủ động và cleanup/lần trả kết quả muộn; chưa được gắn vào route public. Header Phase 1 vẫn chặn camera/microphone. Chi tiết contract, trạng thái, giới hạn và nghiệm thu ở [PHASE2-FOUNDATION.md](PHASE2-FOUNDATION.md).

## Giới hạn thiết kế tiếp tục áp dụng

Các màu RGB thuần và thang xám trong Canvas là dữ liệu phép thử, không phải màu trang trí UI. Các số liệu mẫu mặc định 1920×1080/24 inch chỉ là đầu vào calculator có thể sửa, không phải thông số thiết bị được phát hiện. UI dark/light dùng semantic tokens riêng.

Layout ANSI/ISO dùng KeyboardEvent.code để định vị. Các bàn phím có Fn, firmware remap hoặc layout vendor riêng có thể không gửi code tương ứng; không suy ra lỗi switch khi code không xuất hiện. Các bố cục compact là mô hình phổ biến, không cam kết khớp mọi sản phẩm.
