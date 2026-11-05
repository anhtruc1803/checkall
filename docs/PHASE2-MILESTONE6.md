# Phase 2 — Milestone 6: gamepad

Ngày 05/11/2026. Phạm vi: Gamepad Tester (F01), Analog Stick Test (F02), Stick Drift Test (F03). Giữ 37 công cụ cũ; không triển khai Phase 3, backend thiết bị, VPS hoặc image registry. Kết quả nghiệm thu cuối ở PROGRESS.md và qa/phase2-milestone6.json; bài đang chạy không được ghi là đạt.

## Công cụ và phương pháp

| ID  | Route sau locale     | Dữ liệu hiển thị                                                                              |
| --- | -------------------- | --------------------------------------------------------------------------------------------- |
| F01 | gamepad/tester       | Index/ID/mapping do browser báo; pressed/touched/value từng nút; trục thô                     |
| F02 | gamepad/analog-stick | Cặp trục rõ ràng, X/Y thô, bán kính và tối đa 120 điểm quỹ đạo                                |
| F03 | gamepad/stick-drift  | Mean X/Y, mean/RMS/max bán kính và tỷ lệ quan sát ngoài deadzone tham chiếu trong cửa sổ nghỉ |

Registry có 40 published (21 Phase 1 + 19 Phase 2), không còn draft Phase 2. Có tám danh mục, 80 route công cụ VI/EN và 100 URL nội dung; production build tạo 106 trang gồm hạ tầng. Đây là hoàn thành danh sách triển khai phần mềm Phase 2, **không** đồng nghĩa Final Acceptance hoặc nghiệm thu phần cứng hoàn tất.

GamepadSession đọc navigator.getGamepads mỗi requestAnimationFrame sau Start, chụp snapshot dữ liệu và cập nhật UI tối đa 8 Hz. Danh sách có thể rỗng hoặc chứa slot null; không coi đó là thiết bị hỏng hoặc API không được hỗ trợ. Browser có thể chỉ expose tay cầm sau khi người dùng nhấn nút/chạm stick khi trang có focus. Không query một quyền gamepad giả, không gọi getUserMedia, không kích hoạt rung/haptics.

Mapping standard mặc định trục 0/1; người dùng có thể chọn 2/3 cho stick phải. Mapping khác **không** tự gán trục: cần chọn cả X và Y khác nhau. Các trục/nút đều hiển thị theo index, không tự gán nhãn vật lý A/B/X/Y cho mapping chưa biết. Giữ giá trị thô [-1,1] và nút [0,1]; số không hữu hạn/ngoài miền hiển thị —, không ép thành giá trị hợp lệ. pressed/touched chỉ dùng giá trị boolean do API cung cấp. Y dương hướng xuống. Góc vuông có bán kính tới √2; không clamp bán kính về 1 để tạo số đẹp.

Deadzone 0–0,5 là **tham chiếu hiển thị**, mặc định 0,1. Nó không sửa deadzone của thiết bị, không trừ offset, không hiệu chuẩn và không thay đổi dữ liệu thô. Dữ liệu bị giới hạn ở 16 slot, 64 trục, 128 nút, 120 điểm; có thông báo nếu cắt bớt. ID browser chỉ hiển thị trong phiên, tối đa 256 ký tự; không lưu ID/log/trục/nút/thống kê vào localStorage/history/server.

## Stick Drift

Người dùng bấm Đo vị trí nghỉ, buông stick và giữ tay cầm ổn định. Có 1 giây chờ ổn định, sau đó thu quan sát trong 5 giây. Thuật toán tích lũy tổng X/Y/r/r², max r và số quan sát r lớn hơn deadzone tham chiếu; không giữ log mẫu không giới hạn. Kết quả cần ít nhất 30 quan sát trên khoảng từ 4,5 giây. Mẫu không hợp lệ, timestamp callback không tăng hoặc khoảng poll trên 250 ms làm hủy cửa sổ và xóa kết quả. Đổi thiết bị/trục/deadzone cũng xóa thống kê cũ.

Các lần poll có thể lặp cùng dữ liệu Gamepad API; số quan sát **không** phải số mẫu phần cứng độc lập, tần số USB hoặc Polling Rate. Driver/browser có thể áp dụng deadzone/mapping/calibration trước khi website đọc. Không có điểm đạt/trượt hoặc chẩn đoán hỏng. Giá trị 0 là quan sát thật khi API trả 0, không phải bằng chứng cảm biến hoàn hảo. Người dùng chạm stick trong cửa sổ có thể làm thay đổi kết quả; browser không thể tự xác nhận tay đang thực sự buông. Không tự loại chuyển động lớn để tạo kết quả drift thấp.

## Capability, policy và lifecycle

SSR/constructor/render/mount chỉ kiểm tra sự hiện diện API và môi trường; không gọi getGamepads. Start yêu cầu secure context, getGamepads, requestAnimationFrame/cancelAnimationFrame, trang hiển thị/có focus và user activation khi API này được expose. API không có → fallback unsupported; danh sách rỗng khi API khả dụng → chờ tương tác. SecurityError khi đọc → browser/policy từ chối, không gán thành hỏng tay cầm. Lỗi khác xóa phiên và báo không đọc được, không đưa raw driver error vào UI/log.

Directive gamepad còn phụ thuộc browser. Chỉ tin kết quả allowsFeature('gamepad') từ policy có danh sách features() **quảng bá** gamepad; directive chưa biết có thể trả false và không được diễn giải nhầm thành Denied. Khi không có introspection, vẫn xử lý lỗi thật từ getGamepads. Bài native enforcement gọi trực tiếp API dưới header deny trước khi kiểm tra UI; không thay API thật bằng fixture trong bài đó.

Permissions-Policy mặc định chặn camera/microphone/geolocation/gamepad. Chỉ sáu URL gamepad VI/EN khai báo gamepad=(self), vẫn chặn media; sáu URL camera giữ camera=self, bốn URL microphone giữ microphone=self và đều chặn gamepad. PolicyLink bổ sung document navigation vào/rời gamepad, kể cả locale/camera/microphone. Lý do: App Router soft navigation giữ policy của document cũ. HTTP scope và enforcement native là hai tiêu chí riêng; không coi header đúng là browser đã cưỡng chế.

Phiên tối đa 120 giây tính từ Start. Stop/Reset, blur, hidden, pagehide, mất focus được phát hiện trong poll, ngắt kết nối event hoặc mất slot không event, đổi ID/mapping/số trục/số nút tại slot, lỗi API và unmount/đổi tool/locale đều hủy RAF, timer, listener của phiên và xóa dữ liệu. Không tự đổi sang tay cầm khác khi ngắt kết nối, không tự resume khi quay lại. Chọn thiết bị mới là thao tác chủ động và bắt đầu dữ liệu riêng. Listener lifecycle thụ động được tháo khi unmount; React StrictMode có regression. Guard sau publish ngăn tạo timer hoặc phát dữ liệu cũ nếu subscriber đã Stop/unmount ngay trong Start/selection.

Không thể xác nhận hai thiết bị vật lý giống hệt nhau chỉ từ cùng ID/mapping/slot. Cần manual QA sự kiện unplug/reconnect/driver, không gọi ID browser là định danh phần cứng đã chứng nhận.

## Kiểm thử và giới hạn automation

- Unit: dữ liệu thô/giới hạn/invalid values, công thức drift/zero/corner, thời gian/chất lượng cửa sổ, non-standard mapping, thay thiết bị/trục/deadzone, fallback/policy/SecurityError, cleanup/late RAF/early Stop/StrictMode/SSR và nhãn truy cập.
- Native E2E: kiểm tra getGamepads không gọi trước Start, gọi API runtime thật khi khả dụng và dừng sau Stop; thiếu API phải hiện fallback thật. Bài này **không** kiểm chứng nút/stick vật lý khi không có thiết bị. Native gamepad policy denial có bài độc lập, skip rõ lý do nếu runtime không quảng bá directive.
- Fixture E2E: thiết bị “QA simulated controller”, dữ liệu nút/trục/offset biết trước, slot trống/non-standard/disconnect/replacement, blocked/unsupported/insecure/policy, không capture/query quyền/haptics/storage/upload. Đây là mô phỏng API, không giả là kết quả phần cứng hoặc native controller injection. Playwright Clock chỉ dùng cho cửa sổ drift/deadline trong bài fixture; không gọi clock mô phỏng là thời gian đo phần cứng thật.
- UI: axe toàn trang VI/EN Dark/Light, idle/running/disconnected; responsive 320/375/768/1024/1150/1280 px, keyboard Start/Stop, locale và menu mobile/related/catalog qua document boundary. Tên truy cập dropdown được đặt rõ để không gộp tên option; heading trong engine bắt đầu ở h2.
- Hồi quy: giữ toàn bộ Phase 1/M2/M3/M4/M5, 80 route công cụ, các policy media trước đó. Docker smoke health + 34 route VI/EN/policy tại ba checkpoint, private Node port và restart/shutdown. Không gọi full regression đạt khi mới chạy nhóm M6.

Build/typecheck/lint và 275 unit/integration trên 33 file đã đạt tại checkpoint cục bộ. Lượt Chromium đầu: 8 đạt/4 lỗi; lỗi gồm nhãn select, heading-order và request Kaspersky chèn vào bài không upload. Nhãn/heading đã sửa, assertion privacy giữ nguyên; kết quả lượt sau/CI ghi riêng cuối PROGRESS. Không tắt phần mềm bảo mật hoặc lọc request của nó để báo local đã sạch.

Dependency audit production không finding; audit toàn bộ vẫn có hai advisory moderate ở glob/minimatch trong dev dependencies ESLint/Lighthouse, không thêm dependency mới cho M6. Thông tin đường dẫn/phiên bản/nguồn ở PHASE2-MILESTONE5.md. Chưa xử lý nâng major tooling trong milestone này, không tuyên bố toàn repository không có lỗ hổng. Chưa đo Lighthouse M6 hoặc nhận Performance ≥90.

## Manual QA còn mở

| Nhóm              | Cần kiểm chứng thật                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Thiết bị          | Xbox/PlayStation/generic USB/Bluetooth, nhiều tay cầm, browser expose sau tương tác; đối chiếu index/nút/trục với thao tác thật                   |
| Mapping           | standard và không standard, trigger analog/nút chạm, stick trái/phải, trục đảo, ít/nhiều trục/nút, driver và calibration/deadzone OS              |
| Drift             | Buông stick thực, thay mức deadzone tham chiếu, so sánh nguồn/driver, lặp nhiều cửa sổ; không suy ra chứng nhận lỗi từ một cửa sổ browser         |
| Vòng đời          | Unplug/reconnect cùng slot/cùng model, chuyển thiết bị, sleep/wake, background/BFCache/Back/Forward; không tự poll lại hoặc trộn dữ liệu          |
| Browser           | Safari thật, browser/điện thoại có tay cầm thật, gamepad policy native khi automation không expose directive; WebKit automation không thay Safari |
| Khả năng truy cập | Screen reader, zoom/reduced motion và điều hướng dropdown trên thiết bị/browser thật                                                              |

Final Acceptance Phase 1/2 tiếp tục mở. Không tự triển khai Phase 3 sau khi 19 công cụ Phase 2 có engine.

Nguồn: [W3C Gamepad](https://w3c.github.io/gamepad/), [getGamepads](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getGamepads), [gamepad policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/gamepad), [Playwright Clock](https://playwright.dev/docs/clock).
