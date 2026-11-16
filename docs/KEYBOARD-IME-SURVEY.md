# Khảo sát phím D với EVKey V + Telex

Ngày khảo sát: 12/11/2026, theo lịch người dùng Asia/Saigon.

Đây là báo cáo khảo sát trước triển khai. Phần triển khai local tiếp theo được ghi riêng trong KEYBOARD-EVKEY-COMPATIBILITY.md; số liệu dưới đây không phải một phiên kiểm thử UI mới. Phạm vi chỉ khảo sát cục bộ; không sửa engine/UI/registry của ứng dụng, không push hoặc triển khai website.

## Kết luận

Có bằng chứng để đề xuất chế độ tương thích **nhận diện D qua `keyup.code === "KeyD"`** trên cấu hình đã thử. Chưa có bằng chứng để coi đó là phép đo chính xác mọi lần nhấn, thời gian giữ, rollover hoặc Key Chatter khi EVKey can thiệp.

Hai lượt người dùng thao tác đều có `keyup: KeyD` tiếp tục xuất hiện sau sự kiện Unicode/Backspace không xác định. Một số `keydown: KeyD` tương ứng không tới được vùng thử. Không thể dựng lại thời điểm nhấn đã mất từ thời điểm thả hoặc từ ký tự `đ`.

Người dùng xác nhận có thao tác thêm ngoài bài hướng dẫn; chưa cung cấp số lần D thực tế của từng lượt. Vì vậy **3 và 7 bên dưới là số sự kiện thả D được browser báo, không phải số lần nhấn vật lý đã được đối chứng**. Không khẳng định EVKey không phát thêm/mất sự kiện trong mọi trường hợp.

## Môi trường và phương pháp

- Windows 10 Pro, phiên bản 10.0.19045/build 19045, đọc qua Win32_OperatingSystem.
- EVKey x64 6.0.4.0, bảng mã Unicode, kiểu gõ Telex; bảng điều khiển hiển thị cơ chế Keyboard hook. Đây là EVKey đang dùng, không phải một bản UniKey riêng.
- Microsoft Edge 157.0.4341.42, cửa sổ khảo sát riêng trên localhost. Luồng soạn thảo có chuyển `dd` thành `đ`, phù hợp với chế độ tiếng Việt đang hoạt động; không suy trạng thái V chỉ từ tên tiến trình.
- Probe độc lập trong `artifacts/ime-survey.html`, không chạy qua Next.js và không thay website. Một vùng DIV không soạn thảo gọi preventDefault tương tự vùng capture; một textarea đối chứng cho phép xử lý mặc định.
- Listener phím/input chỉ gắn vào hai vùng thử đã kích hoạt. Không nghe bàn phím toàn hệ thống. Giới hạn 500 sự kiện/lượt, tối đa 10 lượt trong RAM; blur/hidden/Stop/Escape khi được browser nhận sẽ dừng. Hai lượt quan sát kết thúc do mất focus; không có sự kiện Escape trong log nên không nhận đây là kiểm chứng Escape với EVKey.
- Thu cả keydown/keyup, keypress, composition và beforeinput/input. Khác engine hiện hành, probe tiếp tục quan sát sau sự kiện thiếu code để biết sự kiện thả nào tới muộn.
- Một lượt tự động qua công cụ Windows thực sự tạo chuyển đổi `dd → đ`, nhưng phím D của lượt tự động có code rỗng. Lượt này không đại diện cho mã phím vật lý và được giữ tách biệt. Không dùng Playwright keyboard hoặc DOM dispatchEvent để thay thế hai lượt người dùng thao tác bằng tay.
- Chỉ đọc trạng thái cấu hình EVKey và đóng bảng điều khiển; không đổi V/E, kiểu gõ, checkbox hoặc thiết lập hệ điều hành. Computer Use từng dừng vì không xác định được URL đủ tin cậy; đã dừng nhập liệu khi bị chặn. Sau khi người dùng báo hoàn thành, lượt đọc mới xác minh lại cửa sổ và URL localhost trước khi đọc log.

## Số liệu thực tế

| Quan sát                                           | Vùng capture, chặn default | Textarea, không chặn default |
| -------------------------------------------------- | -------------------------: | ---------------------------: |
| Tổng sự kiện đã thu                                |                         22 |                          141 |
| Sự kiện bàn phím keydown/keyup                     |                         22 |                           64 |
| keydown có code KeyD                               |                          1 |                            2 |
| keyup có code KeyD                                 |                          3 |                            7 |
| keyup KeyD không có keydown KeyD ghép trước đó     |                          2 |                            5 |
| keyup KeyD tới sau sự kiện không xác định đầu tiên |                          2 |                            6 |
| keydown Backspace                                  |                          4 |                           18 |
| keydown Backspace có repeat=true                   |                          0 |                            7 |
| keyup Backspace                                    |                          4 |                           11 |
| Cặp Space down/up                                  |                          0 |                            1 |
| Sự kiện bàn phím có keyCode 231                    |                         10 |                           24 |
| Sự kiện composition hoặc isComposing=true          |                          0 |                            0 |
| Mọi sự kiện bàn phím có isTrusted=true             |                         Có |                           Có |

Textarea có thao tác Space và giữ Backspace, cuối lượt có giá trị `đ`. Không gán toàn bộ 18 Backspace thành sự kiện do EVKey phát ra: lượt này có cả thao tác thật bổ sung. Trong các cụm đổi chữ quan sát được, Backspace và Unicode xen giữa hai lần thả D; cần phân biệt diễn giải luồng với phép chứng nhận nguồn phần cứng của từng sự kiện.

Microsoft định nghĩa VK_PACKET = 0xE7 (231) cho đường chuyển ký tự Unicode dưới dạng keystroke. Việc quan sát keyCode 231, code rỗng, ký tự `đ` và keyup Unidentified **phù hợp** với đường gửi Unicode này; đây là diễn giải dựa trên browser và tài liệu, không phải kernel trace của EVKey. [Microsoft Virtual-Key Codes](https://learn.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes)

Code mô tả vị trí phím và có ý nghĩa khác key/ký tự. Không chuyển `đ`, keyCode 231, Backspace hoặc code thiếu thành KeyD. isTrusted=true cũng không tách được sự kiện bàn phím thật khỏi chuỗi chỉnh sửa của bộ gõ trong hai mẫu này. [W3C code values](https://www.w3.org/TR/uievents-code/)

## Mức hỗ trợ có thể đề xuất

| Chức năng                      | Kết luận trong cấu hình đã khảo sát                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B01: nhận diện D trên sơ đồ    | Có cơ sở bổ sung trạng thái riêng “đã nhận qua sự kiện thả”. Chỉ xác nhận sự kiện thả D tới vùng thử, không tạo trạng thái đang giữ hoặc giả định đủ chu kỳ nhấn/thả.   |
| Số lần nhấn D                  | Chưa đủ đối chứng để chứng nhận. Có thể trình bày số sự kiện thả riêng, không đổi tên thành số lần nhấn vật lý; tránh cộng cùng chu kỳ ở cả down và up.                 |
| B02: rollover/tổ hợp đồng thời | Không khôi phục được từ keyup đơn lẻ; thiếu thời điểm bắt đầu giữ và khoảng chồng giữa phím.                                                                            |
| B03: Key Chatter               | Không lấy khoảng cách giữa hai keyup hoặc cụm Backspace thay cho cặp release→press hợp lệ. Các đoạn mất down không đủ dữ liệu.                                          |
| B04: hold                      | Chỉ cặp down/up nguyên bản đầy đủ mới có dữ liệu thời gian browser. Không đo hold cho các lượt có up nhưng mất down, không lấy đầu cụm Unicode làm thời điểm nhấn thật. |
| B05: Inspector                 | Có cơ sở thêm chế độ chẩn đoán giữ log sau tín hiệu bộ gõ trong vùng focus, tách khỏi thống kê phần cứng. Cần giữ giới hạn log và cleanup/privacy. Chưa triển khai.     |
| Backspace khi bật bộ gõ        | Chưa thể chứng nhận nguồn từng sự kiện chỉ từ code/isTrusted/isComposing; có cả Backspace thật và cụm chỉnh sửa. Không bỏ qua mọi Backspace.                            |

Engine hiện hành ở `src/features/keyboard/use-keyboard.ts` dừng và rollback lượt thu ngay khi code/key không xác định hoặc có tín hiệu IME. Vì vậy nó không nhận các keyup KeyD tới sau đó. Đây là lý do bản public chưa khai thác được tín hiệu thả đã quan sát. Bản khảo sát không thay cơ chế bảo vệ hiện có.

Đề xuất tiếp theo, nếu được yêu cầu triển khai: chế độ tương thích có thông báo rõ, bộ nhận diện sự kiện thả tách khỏi measurement engine; các phép đo không đủ dữ liệu hiển thị trạng thái chưa xác định. Không tự bật phương án suy đoán keyCode hoặc sửa toàn bộ kiến trúc. Chưa có kết luận cho UniKey riêng, browser khác, layout khác hoặc các phím Telex khác.

## Kiểm tra và bằng chứng

- `node artifacts/analyze-ime-survey.mjs`: đạt các assertion kiểm tra thứ tự sequence, thời gian browser hữu hạn, giới hạn mẫu, số up/down, up tới sau unknown, không composition và không giả dựng down.
- `pnpm typecheck`, `pnpm lint`: đạt.
- `pnpm exec vitest run tests/keyboard.test.tsx tests/keyboard-chatter.test.ts`: 32/32 đạt, hai file. Đây là kiểm thử engine hiện hành; không nhận chúng là một chế độ tương thích mới đã triển khai.
- Không chạy build/full E2E/Lighthouse hoặc Docker mới vì không thay mã ứng dụng, dependency hay cấu hình triển khai. Không dùng số đo ngày 11/11 như số đo của tính năng tương thích chưa tồn tại.
- Bản tóm tắt không chứa raw events tại `docs/qa/keyboard-ime-survey-2026-11-12.json`. Raw dữ liệu D/đ/Space/Backspace đã kiểm tra phạm vi nằm local trong artifacts bị ignore; không đưa vào Git hoặc upload. Probe không ghi localStorage, sessionStorage, lịch sử sản phẩm hoặc gửi sự kiện tới server. Không suy rộng thành mọi dịch vụ nền của browser đều không có network.

Chưa xác minh: số lần D vật lý biết trước, D giữ/auto-repeat, nhấn nhanh, chuyển focus giữa lúc giữ, D với modifier, đúng hai D rồi dừng bằng chuột để loại ảnh hưởng phím thoát, Backspace thật xen lẫn chuyển chữ có nhãn nguồn, các browser/phiên bản bộ gõ khác. Final Acceptance không được đóng từ khảo sát này.
