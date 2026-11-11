# Rà soát và cải tiến công cụ bàn phím

Ngày: 11/11/2026. Phạm vi: B01–B05 đang công bố; giữ tổng40 công cụ và route VI/EN. Không thêm Phase3, không viết lại Tool Registry hoặc cơ chế tải engine.

## Vấn đề và đề xuất đã triển khai

| Công cụ             | Hiện trạng phát hiện                                                                          | Thay đổi                                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B01 Keyboard Tester | Số phím đã nhận không cho biết mức bao phủ layout đang chọn; sơ đồ ép chữ rất nhỏ trên mobile | Progress theo code có trong sơ đồ, danh sách mã chưa nhận và mã ngoài layout; giữ dữ liệu khi đổi layout; sơ đồ cuộn trong vùng riêng, nhãn từ12px thay vì ép cả bàn phím vào màn hình |
| B02 Key Rollover    | Có số tối đa nhưng không giữ lại tổ hợp tạo ra nó                                             | Giữ tổ hợp đầu tiên đạt cực đại đến Reset, tách repeat và IME; không chứng nhận NKRO/6KRO                                                                                              |
| B03 Key Chatter     | Phân tích lại mảng log200 sự kiện làm mất thống kê cũ; cặp thả/nhấn có thể nối qua gián đoạn  | Bộ cộng dồn riêng, chỉ ghép keyup hợp lệ với non-repeat keydown cùng code trong đoạn capture liên tục; ngắt cặp khi blur/hidden/layout/IME/Tab/Esc                                     |
| B04 Hold Test       | Đồng hồ50ms chạy ở cả công cụ khác; lý do gián đoạn quá chung                                 | Chỉ chạy đồng hồ khi Hold Test có phím giữ; phân biệt focus/tabẩn/Tab-Esc/IME/code không khả dụng, giữ50 kết quả mới nhất                                                              |
| B05 Event Inspector | Log khó tìm kiếm, xóa chỉ bằng Reset toàn bộ; thiếu cờ IME/lock                               | Lọc key/code và loại sự kiện, xóa riêng log, sao chép kết quả lọc theo thao tác; thêm sự kiện mới nhất/cờ browser và raw isComposing/isTrusted                                         |

Dùng UI/UX Pro Max, tra `live progress status screen reader --domain ux`; áp dụng semantic progress/region, focus rõ và target control tối thiểu44px. Đọc tài liệu Server/Client Components, lazy loading của Next.js cài trong repo trước sửa code. Không thay thiết kế tổng thể, font, dependency hoặc công cụ đo khác.

## Tính đúng của phép đo

Progress là số mã có trong sơ đồ được nhận, không phải số phím phần cứng tự phát hiện. Mã ngoài sơ đồ vẫn hiển thị riêng. Code thiếu/Unidentified, sự kiện composition và Process không làm tăng số phím vật lý; raw log vẫn giữ sự kiện nếu chế độ log đang bật. Chạm keycap chỉ kích hoạt vùng thử, không tạo keydown hoặc kết quả giả. Tab/Esc luôn thoát nếu sự kiện tới browser; không hứa chặn phím tắt OS.

Thống kê được giữ đến Reset, còn mỗi lần activate/mất focus/đổi layout/IME tạo ranh giới đoạn. Ranh giới xóa trạng thái giữ và cặp Chatter đang chờ; không xóa tổng đã quan sát. Không nhận keyup mồ côi hoặc keydown trùng đang-held thành chu kỳ bấm mới. Auto-repeat được đếm riêng. Chatter dùng ngưỡng nguyên1–500ms; histogram theo ceil(gap) giữ so sánh chính xác với ngưỡng nguyên, shortestGap vẫn giữ giá trị thực. Không lưu toàn bộ chuỗi gap; chỉ đếm bucket≤500ms và tổng cặp hợp lệ. Khoảng ngắn, timer bị giảm độ phân giải hoặc event.isTrusted không chứng minh nguồn phần cứng, switch hỏng hay độ trễ USB.

Event Inspector giữ nguyên isComposing do native event báo, kể cả khi cờ đó khác trạng thái compositionstart/end của vùng thử. `compositionActive` là trạng thái nội bộ, tách riêng trong dữ liệu sao chép; không thay nó vào API flag. Code rỗng được giữ rỗng trong log/JSON và trình bày `""` trên UI. CapsLock/NumLock/AltGraph là getModifierState của browser, không khẳng định trạng thái đèn LED. `performance.now()` dùng cho khoảng thời gian browser nhận sự kiện; `timeStamp` là giá trị API của sự kiện.

Nguồn đối chiếu: [W3C UI Events](https://www.w3.org/TR/uievents/) và [React useEffect/cleanup](https://react.dev/reference/react/useEffect). Không dùng isTrusted=true của browser automation như bằng chứng bàn phím thật.

## Giới hạn bộ nhớ, hiệu năng và privacy

- Tối đa256 code trong một phiên. Khi đạt giới hạn có thông báo; Reset bắt đầu lại. Raw log200 sự kiện, Hold50 bản ghi. Chatter aggregate tách khỏi log và không mất khi xóa hoặc truncate log.
- B01/B02/B03/B05 không có interval cập nhật giữ phím. B04 cập nhật hiển thị50ms khi cần; số đo release vẫn dùng performance.now. Listener/timer được dọn khi mất focus/ẩn tab/unmount. Sơ đồ memoized không render lại theo đồng hồ Hold nếu các phím không đổi.
- B03 mặc định đóng raw event log; không mount bảng200 dòng khi đang đóng. B05 cho phép đóng bảng, lọc local và xuất clipboard chỉ sau click. Không upload, tự lưu localStorage/sessionStorage hoặc tạo file lịch sử từ raw key.
- Sơ đồ rộng theo rem trong vùng có scrollbar/focus và label, hỗ trợ cuộn bằng bàn phím khi capture dừng. Nút/field/progress vẫn reflow; không dùng overflow để che nhãn control bị tràn.

File chính: `src/features/keyboard/{keyboard,use-keyboard,keyboard-event-log}.tsx/ts`, `keyboard.css`, `src/lib/measurements/keyboard-chatter.ts`, helper calculations, copy registry/messages VI/EN; unit/lifecycle và keyboard-upgrade.spec.ts. Raw screenshot/log/trace chỉ ở artifacts bị ignore.

## Kiểm thử và checkpoint

Đã bổ sung kiểm thử aggregate vượt200 sự kiện, repeat/duplicate/orphan, độ chính xác gap phân số, ngắt đoạn/Reset/bound code; UI coverage theo layout, max combination, IME/code thiếu/raw flag, filter/xóa riêng log, không gọi storage/fetch tự động, timer và hidden/unmount. Fixture IME/clock chỉ phục vụ QA, không phải kết quả phần cứng.

Checkpoint đầu: build106 trang và288 unit trên34 file đạt. Nhóm liên quan sau thêm lifecycle/privacy đạt31/31. Chromium E2E đầu6 đạt/một lỗi reflow ở chữ200%: flex field bị co còn8px trong khi select78px. Đã sửa flex-basis/min-width theo không gian; giữ assertion. Lượt sau28/28 bốn project đạt trên snapshot trước cải tiến sơ đồ cuộn; không dùng kết quả đó nhận source cuối đã kiểm tra. Đang chạy lại source cuối với sơ đồ, flags và các kiểm thử đầy đủ. TypeScript đã bắt kiểu ModifierKey của getModifierState, sửa union cụ thể thay vì tắt kiểm tra.

## Manual QA còn cần

Bàn phím USB/Bluetooth nhiều layout/firmware, các tổ hợp OS chặn, Fn/media keys, AltGr, lock keys, NKRO thực, debounce/chatter thật và wake/reconnect. IME tiếng Việt trên Windows/macOS, dead keys, Safari thật, screen reader và keyboard navigation của vùng cuộn cần kiểm tra trên thiết bị thực. Browser automation chỉ xác minh hành vi phần mềm; không cấp chứng nhận phần cứng.

Đề xuất tiếp theo sau milestone: đối chiếu thêm sơ đồ JIS hoặc mapping firmware khi có thiết bị thật và nhu cầu cụ thể; giữ sơ đồ tham khảo thay vì tự suy ra nhãn in trên keycap từ code. Không triển khai ước đoán USB Polling Rate/latency như thông số phần cứng được xác nhận. Final Acceptance Phase1/2 vẫn mở với các tiêu chí manual/bảo mật đã ghi trong PROGRESS.md.

Lỗi Exit đã được tái hiện bằng browser automation: capture trở lại active=true sau click do handler/nội dung nút đổi trong blur. Đã dùng hai nút cố định với disabled theo trạng thái; regression kiểm tra cả blur→click lẫn data-active=false ở bài E2E Hold cũ. Đây là thay đổi cần thiết để tránh tiếp tục thu phím sau yêu cầu dừng, không chỉ cải tiến giao diện.

Checkpoint cuối trước CI: build106/typecheck/lint/292 unit34 file đạt; keyboard E2E28/28 bốn project đạt không skip/flaky. Native Stop probe sau sửa trả data-active=false; before probe đã trả true. Kết quả source mới trên CI/Linux, Performance và website sẽ bổ sung sau khi thực chạy; không dùng QA của sourceca2344f làm bằng chứng.
