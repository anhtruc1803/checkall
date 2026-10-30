import type { Locale } from '@/lib/i18n/routing';
import type { Tool, ToolCopy } from './types';
type CopyFields = [string, string, string, string];
const descriptions: Record<string, Record<Locale, CopyFields>> = {
  G01: {
    vi: [
      'Đọc thông tin thiết bị mà browser cho phép: viewport, DPR, ngôn ngữ và các gợi ý tài nguyên.',
      'Bấm Đọc dữ liệu để lấy snapshot cục bộ. So sánh các trường với cài đặt hệ thống; đọc lại sau khi đổi màn hình hoặc zoom. Reset xóa snapshot trong phiên.',
      'OS được suy đoán từ User-Agent. Số logical processors có thể bị giảm và deviceMemory là giá trị ước lượng/làm tròn; không xác nhận model CPU, RAM lắp đặt hoặc native panel resolution.',
      'Đọc các thuộc tính navigator, screen và window sau thao tác chủ động. Trường không được cung cấp hiển thị dấu —; không truy cập serial, danh sách thiết bị hoặc gửi dữ liệu lên server.',
    ],
    en: [
      'Read device information exposed by the browser: viewport, DPR, language and resource hints.',
      'Select Read data to take a local snapshot. Compare it with system settings and read again after changing monitors or zoom. Reset clears the session snapshot.',
      'The OS is inferred from User-Agent. Logical processor counts may be reduced and deviceMemory is an approximate rounded hint, not installed RAM, CPU model or native panel resolution.',
      'Reads navigator, screen and window properties after an explicit action. Unavailable fields show —. No serial numbers, device enumeration or server upload are involved.',
    ],
  },
  G02: {
    vi: [
      'Kiểm tra sự hiện diện của API và trạng thái policy camera/microphone mà browser cho đọc.',
      'Bấm Đọc dữ liệu để quét capability. Phân biệt API khả dụng với quyền truy cập và phần cứng có thật. Reset để xóa bảng rồi kiểm tra lại khi cấu hình thay đổi.',
      'API tồn tại không bảo đảm thao tác thành công hoặc có phần cứng tương ứng. Không query được policy thì trạng thái quyền vẫn chưa xác định; không dùng tên browser để khẳng định hỗ trợ.',
      'Feature detection theo API, không theo whitelist User-Agent. Chỉ probe Canvas 2D; không mở camera, microphone, AudioContext, WebGL context hoặc hộp hỏi quyền.',
    ],
    en: [
      'Inspect exposed browser APIs and camera/microphone policy where the browser makes it available.',
      'Select Read data to scan capabilities. Distinguish API availability from permission and attached hardware. Reset and scan again after changing configuration.',
      'An exposed API does not guarantee a successful operation or connected hardware. Unknown policy remains unknown; browser names are not used as support guarantees.',
      'Uses API feature detection rather than a User-Agent whitelist. Only Canvas 2D is probed; no media capture, AudioContext, WebGL context or permission prompt is started.',
    ],
  },
  G03: {
    vi: [
      'Đọc thông tin WebGL và các chuỗi renderer do browser cung cấp theo yêu cầu.',
      'Bấm Đọc dữ liệu để thử WebGL 2 rồi WebGL 1. Chỉ bật renderer chi tiết nếu muốn truy vấn thêm thông tin driver; Reset xóa snapshot, không lưu định danh.',
      'Renderer có thể bị che, thay thế hoặc là software renderer. Không xác nhận GPU vật lý, VRAM, hiệu năng hoặc khả năng tăng tốc phần cứng chỉ từ các chuỗi này.',
      'Tạo context tạm, đọc version/vendor/renderer và giới hạn texture rồi gọi WEBGL_lose_context nếu khả dụng. Chỉ truy vấn WEBGL_debug_renderer_info sau opt-in; không benchmark hoặc tạo fingerprint hash.',
    ],
    en: [
      'Read WebGL information and renderer strings exposed by the browser on demand.',
      'Select Read data to try WebGL 2, then WebGL 1. Enable detailed renderer information only if you want extra driver information. Reset clears the snapshot without storing identifiers.',
      'Renderer strings may be masked, replaced or describe software rendering. They do not confirm a physical GPU, VRAM, performance or hardware acceleration.',
      'Creates a temporary context, reads version/vendor/renderer and texture limits, then calls WEBGL_lose_context when available. Debug renderer information requires opt-in; no benchmark or fingerprint hash is produced.',
    ],
  },
  G04: {
    vi: [
      'Xem capability cảm ứng/pointer và các PointerEvent thực nhận trong vùng thử.',
      'Bấm Bắt đầu, di chuyển chuột hoặc chạm/dùng bút trong vùng. Quan sát loại pointer, vị trí và các contact đang hoạt động; Dừng hoặc Reset để kết thúc. Phiên giới hạn 60 giây.',
      'maxTouchPoints là khả năng browser báo, không xác nhận số ngón của một panel cụ thể. Pressure và contact geometry có thể là giá trị mặc định do browser tổng hợp; không suy ra lực vật lý.',
      'Đọc media queries pointer/hover và thu PointerEvent trong vùng sau kích hoạt. UI cập nhật tối đa bốn lần/giây, không lưu log thô; mất focus, ẩn tab hoặc resize sẽ dừng phiên.',
    ],
    en: [
      'Inspect touch/pointer capabilities and actual PointerEvents received inside the test region.',
      'Select Start, then move a mouse, touch or use a pen inside the region. Observe pointer type, position and active contacts. Stop or Reset ends the session, which is limited to 60 seconds.',
      'maxTouchPoints is browser-reported capability, not confirmation of a particular panel. Pressure and contact geometry may be browser defaults and do not establish physical force.',
      'Reads pointer/hover media queries and receives regional PointerEvents after activation. UI updates at most four times per second without raw logs. Focus loss, hidden tabs or resize stop the session.',
    ],
  },
  G05: {
    vi: [
      'Kiểm tra Web Storage bằng khóa tạm và đọc usage/quota ước tính của origin hiện tại.',
      'Bấm Đọc dữ liệu để ghi/đọc/xóa khóa thử riêng trong localStorage và sessionStorage. Xem API IndexedDB/CacheStorage và trạng thái persisted; không yêu cầu persist hoặc xóa dữ liệu ứng dụng khác.',
      'Quota/usage là ước tính theo origin, không phải dung lượng hoặc phần trống ổ đĩa. Private Mode và policy có thể giới hạn API. IndexedDB/CacheStorage chỉ được kiểm tra sự hiện diện, chưa thử I/O.',
      'Phép round-trip dùng khóa tạm duy nhất và cleanup trong finally. StorageManager.estimate/persisted được đọc độc lập, lỗi một API không tạo giá trị thay thế giả; kết quả đến muộn sau Reset/rời trang bị bỏ qua.',
    ],
    en: [
      'Test Web Storage with temporary keys and read estimated usage/quota for the current origin.',
      'Select Read data to write/read/delete an isolated localStorage and sessionStorage key. Inspect IndexedDB/CacheStorage API exposure and persisted status. No persistence request or other application data deletion is performed.',
      'Usage and quota are origin-level estimates, not disk capacity or free disk space. Private Mode and policy may restrict APIs. IndexedDB/CacheStorage exposure is checked without I/O testing.',
      'The round-trip uses a unique temporary key and finally cleanup. StorageManager.estimate/persisted are read independently; failures never become fabricated values. Late results after Reset or navigation are ignored.',
    ],
  },
  G06: {
    vi: [
      'Thử vào/thoát Fullscreen và xem kích thước CSS thực của vùng hiển thị.',
      'Bấm Fullscreen trong vùng thử. Bấm nút thoát bên trong hoặc dùng Esc; browser có thể có cử chỉ thoát riêng. Nếu API không hỗ trợ, dùng vùng thử trong trang và đọc thông báo.',
      'Fullscreen do browser/OS quyết định và có thể bị policy hoặc môi trường nhúng chặn. Kích thước CSS của vùng không chứng nhận native resolution; WebKit automation không thay cho Safari/iOS thật.',
      'Gọi requestFullscreen từ thao tác người dùng, theo dõi fullscreenchange và ResizeObserver. Rời route sẽ dọn observer/listener và thoát Fullscreen do chính công cụ sở hữu, kể cả request trả về muộn.',
    ],
    en: [
      'Test entering/exiting fullscreen and inspect the rendered CSS size of the test region.',
      'Select Fullscreen inside the region. Use its exit button or Esc; the browser may provide other exit gestures. If unavailable, use the inline region and read the fallback notice.',
      'Fullscreen is controlled by the browser/OS and may be blocked by policy or embedding. CSS dimensions do not certify native resolution. WebKit automation does not replace real Safari/iOS testing.',
      'Requests fullscreen from a user action and observes fullscreenchange and ResizeObserver. Navigation cleans up observers/listeners and exits only fullscreen owned by this tool, including late request completion.',
    ],
  },
  C06: {
    vi: [
      'Quan sát đường đi, vị trí và khoảng cách con trỏ chuột trong vùng thử bằng CSS pixels.',
      'Bấm Bắt đầu rồi di chuyển chuột trong vùng. Dừng để giữ kết quả hoặc Reset để xóa; không nối quãng đường khi con trỏ rời rồi quay lại. Phiên tối đa 60 giây.',
      'Đây là chuyển động con trỏ browser quan sát, chịu ảnh hưởng scaling, OS và tăng tốc. Không suy ra DPI/CPI, quãng đường vật lý, Polling Rate hoặc độ trễ cảm biến. Tốc độ trung bình tính cả thời gian nghỉ.',
      'Cộng khoảng cách Euclid giữa các PointerEvent loại mouse liên tiếp trong vùng. Chỉ giữ 120 điểm vẽ cuối, giới hạn 100.000 mẫu và cập nhật UI bốn lần/giây; mất focus/ẩn tab/resize sẽ dừng.',
    ],
    en: [
      'Observe mouse pointer paths, position and distance inside a test region in CSS pixels.',
      'Select Start and move a mouse inside the region. Stop preserves results and Reset clears them. Leaving and re-entering the region does not add a connecting segment. Sessions last up to 60 seconds.',
      'These are browser-observed pointer movements affected by scaling, OS settings and acceleration. They do not establish DPI/CPI, physical distance, Polling Rate or sensor latency. Average speed includes idle time.',
      'Sums Euclidean distances between consecutive mouse PointerEvents in the region. Keeps only the last 120 drawing points, caps samples at 100,000 and updates UI four times per second. Focus loss, hidden tabs or resize stop the session.',
    ],
  },
  C07: {
    vi: [
      'Thực hiện tác vụ nhấn mười mục tiêu và xem tỷ lệ trúng, số lần nhấn cùng sai lệch tới tâm.',
      'Chọn kích thước, bấm Bắt đầu và dùng nút trái chuột nhấn mục tiêu đánh số. Nhấn trượt giữ nguyên mục tiêu; trúng sẽ chuyển mục tiêu kế tiếp. Dừng/Reset bất cứ lúc nào; phiên giới hạn 60 giây hoặc 1.000 lần nhấn.',
      'Kết quả mô tả tác vụ của người dùng trong browser, không chứng nhận độ chính xác cảm biến hoặc độ trễ phần cứng. Chỉ pointer mouse/nút chính được chấm; bàn phím, cảm ứng và bút không tạo điểm giả.',
      'So tọa độ pointerdown với tâm và bán kính CSS thực của mục tiêu. Tính hits/attempts và sai lệch tâm trung bình của các lần trúng; mười vị trí mục tiêu định trước không phải dữ liệu đo mẫu.',
    ],
    en: [
      'Complete a ten-target pointing task and inspect hit ratio, attempts and distance from target centers.',
      'Choose a target size, select Start and use the primary mouse button on numbered targets. Misses keep the current target; hits advance it. Stop/Reset anytime. Sessions are capped at 60 seconds or 1,000 attempts.',
      'Results describe a browser task performed by a user, not sensor precision or hardware latency. Only primary mouse pointer input is scored; keyboard, touch and pen input do not produce artificial scores.',
      'Compares pointerdown coordinates with the target’s actual CSS center and radius. Computes hits/attempts and mean center error for hits. The ten predefined target locations are task geometry, not sample measurements.',
    ],
  },
};
const related: Record<string, string[]> = {
  G01: ['A01', 'A02', 'G02'],
  G02: ['G01', 'G05', 'G06'],
  G03: ['G01', 'G02', 'A10'],
  G04: ['A11', 'G01', 'C06'],
  G05: ['G02', 'G01', 'G06'],
  G06: ['A06', 'A10', 'G02'],
  C06: ['C05', 'C07', 'C01'],
  C07: ['C06', 'C02', 'C03'],
};
export const milestone2Ids = Object.keys(descriptions);
export function publishMilestone2(tool: Tool): Tool {
  const copy = descriptions[tool.id];
  if (!copy) return tool;
  const translated = (locale: Locale): ToolCopy => {
    const [description, instructions, limitations, method] = copy[locale];
    return { name: tool.copy[locale].name, description, instructions, limitations, method };
  };
  return {
    ...tool,
    status: 'published',
    seo: { index: true },
    engine: tool.id === 'G04' ? 'pointer-info' : tool.engine,
    requiredCapabilities: tool.category === 'mouse' ? ['pointer'] : [],
    optionalCapabilities:
      tool.id === 'G03'
        ? ['webgl']
        : tool.id === 'G05'
          ? ['storage', 'secureContext']
          : tool.id === 'G06'
            ? ['fullscreen']
            : tool.id === 'G04'
              ? ['pointer', 'touch']
              : [],
    classification: tool.id === 'G05' ? 'estimate' : tool.classification,
    relatedTools: related[tool.id],
    copy: { vi: translated('vi'), en: translated('en') },
  };
}
