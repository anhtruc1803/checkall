# Đặc tả công cụ Phase 1

Registry `src/lib/tools/registry.ts` là nguồn dữ liệu duy nhất cho tên, route, hướng dẫn, giới hạn, phương pháp, khả năng trình duyệt, SEO và công cụ liên quan bằng VI/EN. Chỉ công cụ `published` xuất hiện trong tìm kiếm và sitemap.

| ID  | Route sau locale       | Loại              |
| --- | ---------------------- | ----------------- |
| A01 | screen/resolution      | Quan sát browser  |
| A02 | screen/viewport        | Quan sát browser  |
| A03 | screen/aspect-ratio    | Tính toán         |
| A04 | screen/ppi             | Tính toán         |
| A05 | screen/refresh-rate    | Ước tính          |
| A06 | screen/dead-pixel      | Quan sát thủ công |
| A07 | screen/stuck-pixel     | Quan sát thủ công |
| A08 | screen/backlight-bleed | Quan sát thủ công |
| A09 | screen/color-gradient  | Quan sát thủ công |
| A10 | screen/ghosting        | Quan sát thủ công |
| A11 | screen/touch           | Quan sát browser  |
| B01 | keyboard/tester        | Quan sát browser  |
| B02 | keyboard/rollover      | Quan sát browser  |
| B03 | keyboard/chatter       | Ước tính          |
| B04 | keyboard/hold          | Quan sát browser  |
| B05 | keyboard/events        | Quan sát browser  |
| C01 | mouse/buttons          | Quan sát browser  |
| C02 | mouse/double-click     | Ước tính          |
| C03 | mouse/cps              | Quan sát browser  |
| C04 | mouse/scroll           | Quan sát browser  |
| C05 | mouse/polling-rate     | Ước tính          |

Không phép thử nào chứng nhận native panel resolution, GTG/MPRT, NKRO, switch hỏng hoặc USB Polling Rate. `requestAnimationFrame` đo nhịp callback, pointermove đo nhịp sự kiện; không làm tròn về thông số phần cứng tiêu chuẩn.

Vòng đời chung: idle → preparing → running → completed; có stopped, warning, error, unsupported và reset. Calculator cập nhật sau dữ liệu hợp lệ; visual test cần thao tác chủ động. Tab ẩn/mất focus dừng phép đo theo thời gian và xóa trạng thái phím/nút đang giữ.

## Roadmap chưa công bố

Phase 2: 19 khả năng audio, microphone, webcam, gamepad, device/browser/GPU information, storage, fullscreen, mouse movement/accuracy.

Milestone nền tảng Phase 2 đã bắt đầu theo yêu cầu người dùng. 19 mục có metadata draft trong src/lib/tools/phase2.ts, không có route public hoặc engine được công bố; 21 công cụ Phase 1 vẫn published. Không coi draft là chức năng đã triển khai. Publication guard và quyền riêng tư được mô tả trong [PHASE2-FOUNDATION.md](PHASE2-FOUNDATION.md).

Phase 3: 15 khả năng network và tiện ích: tốc độ download/upload, HTTP latency, jitter, packet loss estimate, public IP, DNS, TLS, headers, color picker, unit converter, benchmark, quick test, export, share.

Tổng kiến trúc dự kiến: 21 + 19 + 15 = 55 khả năng. Endpoint network tương lai phải có rate limit, chống SSRF và kiểm soát tài nguyên trước khi được công bố.
