# Chế độ nhận diện EVKey qua keyup — Keyboard Tester

Ngày: 12/11/2026. Bản triển khai local, dựa trên khảo sát trong KEYBOARD-IME-SURVEY.md. Không cập nhật website hoặc push GitHub trong lượt này. Giữ 40 công cụ và route VI/EN; không thay engine đo nhấn/giữ/rollover/Chatter hiện có.

## Cách dùng và phạm vi

Chỉ B01 Keyboard Tester có checkbox **Tương thích EVKey qua keyup (A–Z)**, mặc định tắt. Bật chế độ, kích hoạt vùng thử và thả phím chữ để nhận diện. Tiến độ tính số **mã chữ khác nhau đã nhận** trong 26 mã KeyA–KeyZ của sơ đồ, không phải số lần nhấn hoặc số lần thả. Cùng mã lặp lại không tăng tiến độ.

Phím đã nhận có viền đứt, dấu ↑ và nhãn nguồn keyup. Không tạo badge ✓ kèm số lần nhấn; không dựng trạng thái đang giữ. Backspace, số, modifier, điều hướng và phím ngoài A–Z không được đánh giá trong chế độ này. Chúng vẫn có trong sơ đồ tham khảo và có nhãn accessibility ghi rõ ngoài phạm vi. Không suy diễn một phím chưa nhận là bị hỏng.

Khi bật tương thích, các thẻ số lần nhấn, giữ hiện tại/tối đa và repeat được ẩn; không hiển thị giá trị 0 như một phép đo đã xác nhận. Rollover, Hold Test, Key Chatter và Event Inspector không có tùy chọn tương thích và giữ engine cũ. Đổi chế độ dừng thu và xóa dữ liệu của phiên công cụ; lời giải thích hiển thị trước thao tác. Reset xóa kết quả/cờ tín hiệu, giữ lựa chọn chế độ. Đổi layout dừng thu, giữ tập mã đã nhận. Tất cả nhãn/hướng dẫn có VI/EN.

## Cảnh báo khi thử dd

B01 luôn hiển thị lưu ý **dd → đ** cạnh lựa chọn EVKey, ở cả VI/EN. Telex có thể chặn D hoặc tạo Backspace; browser có thể không nhận đủ sự kiện để phát hiện dd. Vì vậy không phụ thuộc hoàn toàn vào cảnh báo tự động, không khẳng định phát hiện được bộ gõ đang bật.

Hook `use-keyboard-d-warning.ts` chỉ theo dõi hai sự kiện keyup KeyD liên tiếp trong vùng thử đang active, rồi bật lời nhắc một lần. Đây là quan sát browser, không chứng nhận hai lần nhấn vật lý. Hai lần thả cách nhau lâu vẫn có thể hiện nhắc; không dùng ngưỡng thời gian hoặc giữ lịch sử gõ. Một D đơn, keydown đơn, auto-repeat, shortcut Ctrl/Alt/Meta, mã thiếu/Unidentified/Process/229/231 hoặc isComposing không đủ điều kiện. Phím khác, composition start, dừng/mất focus/tab ẩn hoặc kích hoạt phiên mới ngắt chuỗi quan sát. Khi bộ gõ giấu lần D thứ hai, lưu ý cố định vẫn đọc được bên cạnh hướng dẫn và cảnh báo IME hiện có.

Trong chế độ thường, lời nhắc hướng dẫn E/ENG cho phép đo nhấn/giữ hoặc bật tương thích để chỉ nhận diện chữ, đồng thời nhắc đổi mode xóa phiên. Trong tương thích, lời nhắc giải thích D chỉ nhận qua keyup, Backspace không được đánh giá và không có press/hold/rollover/Chatter. Reset/đổi mode xóa cờ nhắc; dừng giữ lời nhắc đã hiện để đọc. Cảnh báo dùng role=status, không di chuyển focus hoặc tự đổi chế độ. Hai ref/state boolean không được đưa vào bộ đếm, raw log, localStorage, lịch sử hay mạng. B02–B05 không hiện cảnh báo này.

Phần kiểm chứng 328 unit/48 E2E và full suite bên dưới là checkpoint **trước bổ sung cảnh báo dd**; không dùng fingerprint hay kết quả đó thay cho source cuối. Kết quả mới được ghi riêng tại [QA cảnh báo dd](qa/keyboard-dd-warning-local-2026-11-12.json) và TESTING.md.

## Tách luồng nhận diện khỏi phép đo

`use-keyboard-release.ts` chỉ giữ active, tập mã chữ đã nhận và cờ đã gặp tín hiệu nhập liệu không xác định. Set giới hạn tự nhiên ở 26 mã; không giữ raw events, thời gian, press counter, repeat counter, hold, maximum hoặc Chatter. Không tạo synthetic keydown, không dùng thời điểm Unicode/keyup làm thời điểm nhấn vật lý.

Chỉ nhận khi vùng thử đang active, loại sự kiện là keyup, code khớp KeyA–KeyZ và không có repeat/composition/Process/Unidentified hoặc legacy keyCode 229/231. Key/code rỗng, ký tự `đ`, keyCode 68 hay Backspace không được suy ra thành KeyD. keyCode chỉ dùng loại tín hiệu không đủ tin cậy, không làm bảng mapping. isTrusted không dùng để chứng nhận nguồn phần cứng.

Gặp luồng Unicode/unknown, bộ nhận diện tiếp tục chờ keyup hợp lệ trong vùng focus, kèm thông báo giải thích; không chuyển các sự kiện xen giữa thành kết quả đo. Đây là khác biệt có chủ ý với engine thường, vốn dừng và rollback lượt nhiễu. `use-keyboard.ts` và `keyboard-chatter.ts` không thay đổi. UI chỉ nối handler của một chế độ tại một thời điểm. Workspace có key theo toolId để không giữ trạng thái tương thích khi React tái sử dụng component cho công cụ khác.

Listener key chỉ nằm trên vùng thử React. Listener window blur/document visibility chỉ dừng phiên; cleanup khi dừng hoặc unmount. Tab/Escape thoát và giữ default nếu browser nhận được phím; Stop/Reset/mất focus/tab ẩn đều dừng, không tự tiếp tục. Không interval/rAF, không storage, clipboard hoặc gửi sự kiện qua mạng. Không lưu lựa chọn mode qua reload. B01 không thêm log thô hoặc lịch sử tự động.

## File chính

- `src/features/keyboard/use-keyboard-release.ts`: nhận diện độc lập và lifecycle.
- `src/features/keyboard/keyboard.tsx`: mode opt-in riêng B01, tiến độ/nguồn nhận và tách UI phép đo.
- `src/features/keyboard/keyboard.css`: target label tối thiểu 44 px, trạng thái viền đứt/↑ và reflow.
- `src/messages/vi.json`, `src/messages/en.json`: nhãn, phạm vi, cảnh báo và giải thích đổi chế độ.
- `tests/keyboard-release.test.tsx`, `tests/e2e/keyboard-release.spec.ts`: isolation, IME/unknown, lifecycle, locale, accessibility và responsive.

Áp dụng UI/UX Pro Max với truy vấn form labels instructions: checkbox có label, aria-describedby và helper text hiển thị; không dựa chỉ vào màu. Giữ sơ đồ cuộn ngang trong vùng focus, không cắt control/hướng dẫn khi chữ 200%.

## Kiểm chứng local

Checkpoint đã chạy: typecheck/lint, build 106 trang, 328 unit trên 35 file đều đạt; riêng nhóm bàn phím 55/55. Bộ E2E mới 12/12 đạt trên Chromium, Firefox, WebKit và mobile Chromium, gồm VI/EN, hai theme, WCAG tự động/heading-order, reflow 320/375/768/1440 px và chữ 200%. Chế độ thường và bốn công cụ đo không có trạng thái keyup tương thích.

Phát lại hai luồng D/đ/Backspace/Space của khảo sát trước vào bản local đạt 6/6 trên ba browser: chỉ KeyD được nhận qua keyup, tiến độ 1/26, không badge đếm nhấn, không đánh dấu Backspace, Stop về inactive. Đây là replay qua KeyboardEvent constructor; isTrusted của replay là false, không phải phiên phím vật lý mới hay chứng minh độ đúng của số lần nhấn. Raw khảo sát vẫn ở artifacts bị ignore, không đưa vào Git.

Full E2E local đã chạy đủ 372 bài: 345 pass/18 skip/9 fail, không flaky; nhóm bàn phím 48/48 đạt. Sáu lỗi no-upload camera/gamepad thấy POST Kaspersky; ba lỗi protocol đóng context Firefox. Chạy riêng nhóm Firefox cho 2 pass/1 skip, không tái hiện lỗi đóng context; full suite vẫn được ghi fail. Kiểm tra audio nền: Chromium/Firefox pass, WebKit Windows thiếu AudioContext; không coi native audio WebKit đã xác minh. Một bài no-upload gamepad phát hiện POST Kaspersky bên ngoài ứng dụng. Trang HTML trắng không có mã/script Device Lab cũng ghi nhận script/POST cùng origin Kaspersky, xác nhận yếu tố chèn của môi trường. Giữ nguyên assertion; không tắt bảo vệ Windows hoặc lọc bỏ request để lấy pass. WSL không khởi chạy được do service unavailable/disabled; không thay cấu hình hệ thống.

## Phần còn cần xác minh

- Thử trực tiếp bản UI mới với EVKey V + Telex, không chỉ replay dữ liệu cũ; ghi riêng phản hồi người dùng.
- Chưa chứng nhận các phím A–Z khác ngoài D trên bộ gõ thật, phiên bản/bộ gõ khác, Safari thật hoặc mọi tổ hợp modifier/giữ/mất focus.
- Không khôi phục được hold, rollover, Chatter hay số lần nhấn vật lý từ một keyup thiếu down. Đây là giới hạn thiết kế, không phải phép đo bị đặt về 0.
- Không nhận Performance của source cũ là của bản local này; chỉ ghi median mới nếu đủ ba lượt sạch mỗi trang. Lượt local đầu đã có clean=false do script Kaspersky; validator dừng đo, chưa có median sạch để xác minh ≥90. Không quy điểm của lượt nhiễu thành regression source.
- Chưa cập nhật server/domain/proxy/Docker/CI; Final Acceptance tiếp tục mở. Kết quả đầy đủ tại PROGRESS.md/TESTING.md/PERFORMANCE.md và [QA JSON](qa/keyboard-release-local-2026-11-12.json). Manual UI mới/Safari/screen reader và Performance sạch còn mở.

Sau QA, Prettier chuẩn hóa line wrapping/punctuation trong keyboard-release.spec.ts. TypeScript parser xác nhận AST tương đương; không thay assertion/test logic hoặc source ứng dụng. QA JSON giữ cả fingerprint đã kiểm thử và fingerprint review cuối.
