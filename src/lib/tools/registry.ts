import type { Locale } from '@/lib/i18n/routing';
import type { MeasurementClass } from '@/lib/measurements/types';
import { normalizeSearch, searchToolIndex, type ToolSearchEntry } from './search';
export { categories, toolHref } from './search';
export type Category = 'screen' | 'keyboard' | 'mouse';
export type Capability =
  | 'screen'
  | 'animationFrame'
  | 'canvas'
  | 'pointer'
  | 'touch'
  | 'keyboard'
  | 'fullscreen'
  | 'visualViewport';
export type Engine =
  | 'screen-info'
  | 'calculator'
  | 'refresh'
  | 'patterns'
  | 'motion'
  | 'touch'
  | 'keyboard'
  | 'mouse';
export interface ToolCopy {
  name: string;
  description: string;
  instructions: string;
  limitations: string;
  method: string;
}
export interface Tool {
  id: string;
  slug: string;
  category: Category;
  phase: 1 | 2 | 3;
  status: 'published' | 'draft';
  icon: Category;
  engine: Engine;
  requiredCapabilities: Capability[];
  optionalCapabilities: Capability[];
  permissions: readonly string[];
  classification: MeasurementClass;
  environments: readonly string[];
  seo: { index: boolean };
  relatedTools: string[];
  copy: Record<Locale, ToolCopy>;
}
type Entry = [
  string,
  string,
  Category,
  Engine,
  MeasurementClass,
  Capability[],
  [string, string, string, string, string],
  [string, string, string, string, string],
];
const entries: Entry[] = [
  [
    'A01',
    'resolution',
    'screen',
    'screen-info',
    'observation',
    ['screen'],
    [
      'Độ phân giải màn hình',
      'Đọc kích thước màn hình, vùng khả dụng và hướng hiển thị.',
      'So sánh kích thước màn hình và viewport; thay đổi màn hình hoặc xoay thiết bị để cập nhật.',
      'CSS pixels không xác nhận độ phân giải native. Nhân với DPR chỉ tạo ước tính, chịu ảnh hưởng scaling và zoom.',
      'Đọc window.screen, innerWidth, innerHeight và devicePixelRatio trực tiếp.',
    ],
    [
      'Screen resolution',
      'Read screen size, available area and display orientation.',
      'Compare screen and viewport dimensions; move between displays or rotate the device to update.',
      'CSS pixels do not establish native panel resolution. Multiplying by DPR is an estimate affected by scaling and zoom.',
      'Reads window.screen, innerWidth, innerHeight and devicePixelRatio directly.',
    ],
  ],
  [
    'A02',
    'viewport',
    'screen',
    'screen-info',
    'observation',
    ['screen'],
    [
      'Viewport & DPR',
      'Theo dõi vùng hiển thị và mật độ điểm ảnh khi thay đổi cửa sổ.',
      'Kéo kích thước cửa sổ, xoay thiết bị hoặc thử pinch zoom và quan sát visual viewport.',
      'DPR bao gồm ảnh hưởng zoom và scaling hệ điều hành; visualViewport có thể không được hỗ trợ.',
      'Theo dõi resize, orientationchange và visualViewport.resize/scroll.',
    ],
    [
      'Viewport & DPR',
      'Watch viewport and pixel density as the window changes.',
      'Resize the window, rotate the device or pinch zoom and inspect the visual viewport.',
      'DPR includes browser zoom and OS scaling; visualViewport may be unavailable.',
      'Observes resize, orientationchange and visualViewport resize/scroll events.',
    ],
  ],
  [
    'A03',
    'aspect-ratio',
    'screen',
    'calculator',
    'calculator',
    [],
    [
      'Tính tỷ lệ khung hình',
      'Rút gọn tỷ lệ từ chiều rộng và chiều cao bạn nhập.',
      'Nhập hai số nguyên dương, sau đó sao chép tỷ lệ đã rút gọn.',
      'Nhãn tỷ lệ phổ biến dùng sai số 0,015 cho tỷ lệ thập phân; số liệu đầu vào do bạn cung cấp.',
      'Chia hai kích thước cho ước chung lớn nhất; tỷ lệ thập phân bằng width / height.',
    ],
    [
      'Aspect ratio calculator',
      'Simplify the ratio of a width and height you provide.',
      'Enter two positive integers, then copy the simplified ratio.',
      'Common ratio labels use a decimal tolerance of 0.015; inputs are user supplied.',
      'Divides both dimensions by their greatest common divisor; decimal ratio is width / height.',
    ],
  ],
  [
    'A04',
    'ppi',
    'screen',
    'calculator',
    'calculator',
    [],
    [
      'Tính mật độ điểm ảnh PPI',
      'Tính PPI bằng độ phân giải và đường chéo thực tế.',
      'Nhập độ phân giải panel và đường chéo tính bằng inch từ thông số nhà sản xuất.',
      'Trình duyệt không tự xác định đường chéo vật lý. Kết quả phụ thuộc độ chính xác đầu vào.',
      'PPI = √(width² + height²) / diagonal, với đường chéo tính bằng inch.',
    ],
    [
      'PPI calculator',
      'Calculate pixel density from resolution and physical diagonal.',
      'Enter panel resolution and diagonal in inches from manufacturer specifications.',
      'The browser cannot detect physical diagonal size. Results depend on input accuracy.',
      'PPI = √(width² + height²) / diagonal, with diagonal measured in inches.',
    ],
  ],
  [
    'A05',
    'refresh-rate',
    'screen',
    'refresh',
    'estimate',
    ['animationFrame'],
    [
      'Ước tính Refresh Rate',
      'Lấy mẫu nhịp khung hình thực tế mà trình duyệt quan sát được.',
      'Chọn thời gian đo, bấm bắt đầu và giữ tab ở phía trước cho đến khi hoàn tất.',
      'requestAnimationFrame chịu ảnh hưởng tải hệ thống, compositor và tiết kiệm pin; không xác nhận Hz vật lý của panel.',
      'Thu khoảng cách timestamp giữa các requestAnimationFrame; ước tính Hz = 1000 / trung vị khoảng cách.',
    ],
    [
      'Refresh Rate estimate',
      'Sample the actual frame cadence observed by your browser.',
      'Choose a duration, start sampling and keep this tab visible until completion.',
      'requestAnimationFrame depends on system load, compositor and power saving; it does not confirm physical panel Hz.',
      'Collects intervals between requestAnimationFrame timestamps; Hz = 1000 / median interval.',
    ],
  ],
  [
    'A06',
    'dead-pixel',
    'screen',
    'patterns',
    'visual',
    ['canvas'],
    [
      'Kiểm tra điểm ảnh chết',
      'Quan sát từng điểm ảnh trên các nền màu đồng nhất.',
      'Lau sạch màn hình, bật toàn màn hình và dùng phím mũi tên hoặc chạm để đổi màu. Esc để thoát.',
      'Bạn tự quan sát; website không đọc được điểm ảnh vật lý và không tự phát hiện điểm chết.',
      'Hiển thị đen, trắng, đỏ, xanh lá, xanh lam và các màu bổ sung.',
    ],
    [
      'Dead pixel test',
      'Inspect individual pixels against solid color backgrounds.',
      'Clean the screen, enter fullscreen and use arrow keys or tap to change colors. Esc exits.',
      'Inspection is manual; the website cannot read physical pixels or automatically detect dead pixels.',
      'Displays black, white, red, green, blue and additional solid colors.',
    ],
  ],
  [
    'A07',
    'stuck-pixel',
    'screen',
    'patterns',
    'visual',
    ['canvas'],
    [
      'Kiểm tra điểm ảnh kẹt',
      'Dùng các nền tương phản để tìm điểm ảnh luôn sáng một màu.',
      'Đổi từng màu bằng nút, phím mũi tên hoặc chạm; quan sát điểm vẫn giữ nguyên màu.',
      'Không có chẩn đoán tự động hoặc bảo đảm sửa được pixel; công cụ không dùng nhấp nháy nhanh.',
      'Các nền RGB và màu đối lập giúp quan sát thủ công subpixel có thể bị kẹt.',
    ],
    [
      'Stuck pixel test',
      'Use contrasting backgrounds to find pixels stuck on one color.',
      'Change colors with buttons, arrow keys or taps; look for pixels that keep the same color.',
      'No automatic diagnosis or guaranteed repair is provided; this tool uses no rapid flashing.',
      'RGB and complementary backgrounds support manual inspection of potentially stuck subpixels.',
    ],
  ],
  [
    'A08',
    'backlight-bleed',
    'screen',
    'patterns',
    'visual',
    ['canvas'],
    [
      'Kiểm tra hở sáng',
      'Nền đen toàn màn hình để quan sát ánh sáng không đồng đều.',
      'Giảm ánh sáng phòng, mở toàn màn hình và kiểm tra các cạnh ở độ sáng sử dụng thường ngày.',
      'Không định lượng hở sáng. IPS glow thay đổi theo góc nhìn; hở sáng thường cố định tại cạnh. OLED có hành vi khác LCD.',
      'Vẽ nền đen RGB(0,0,0); kết quả quan sát phụ thuộc panel, môi trường và độ sáng.',
    ],
    [
      'Backlight bleed test',
      'Inspect uneven illumination against a fullscreen black background.',
      'Dim the room, enter fullscreen and inspect edges at your normal brightness.',
      'Cannot quantify bleed. IPS glow changes with viewing angle; bleed usually stays near edges. OLED differs from LCD.',
      'Renders RGB(0,0,0); visual results depend on the panel, room and brightness.',
    ],
  ],
  [
    'A09',
    'color-gradient',
    'screen',
    'patterns',
    'visual',
    ['canvas'],
    [
      'Màu sắc & Gradient',
      'Quan sát chuyển màu, thang xám, sọc màu và banding.',
      'Chuyển giữa RGB gradient, thang xám và các dải màu; xem ở chế độ toàn màn hình.',
      'Không thay thế thiết bị hiệu chuẩn màu. Trình duyệt, quản lý màu và độ sâu bit ảnh hưởng kết quả.',
      'Tạo gradient liên tục, dải xám 16 mức và thanh màu bằng Canvas.',
    ],
    [
      'Color & gradient test',
      'Inspect color ramps, grayscale, color bars and banding.',
      'Switch between RGB gradients, grayscale and color bars; inspect in fullscreen.',
      'Does not replace calibration equipment. Browser color management and bit depth affect results.',
      'Draws continuous gradients, 16-step grayscale and color bars with Canvas.',
    ],
  ],
  [
    'A10',
    'ghosting',
    'screen',
    'motion',
    'visual',
    ['canvas', 'animationFrame'],
    [
      'Ghosting & Motion Blur',
      'Theo dõi vật thể chuyển động để quan sát vệt bóng.',
      'Bắt đầu chuyển động, điều chỉnh tốc độ, hướng và độ tương phản; nhìn theo vật thể.',
      'Quan sát thủ công, không đo được thời gian phản hồi GTG hoặc MPRT chính xác. Frame không đều có thể do trình duyệt.',
      'Canvas dịch chuyển vật thể theo thời gian thực và theo dõi khoảng cách giữa các frame.',
    ],
    [
      'Ghosting & motion blur',
      'Follow a moving object to inspect visible trails.',
      'Start motion, adjust speed, direction and contrast, then follow the object with your eyes.',
      'Manual inspection cannot accurately measure GTG or MPRT response time. Uneven frames may originate in the browser.',
      'Canvas moves an object using elapsed time and records frame interval statistics.',
    ],
  ],
  [
    'A11',
    'touch',
    'screen',
    'touch',
    'observation',
    ['pointer', 'touch'],
    [
      'Kiểm tra cảm ứng',
      'Vẽ dấu chạm, đường di chuyển và đếm nhiều điểm cùng lúc.',
      'Dùng ngón tay chạm và kéo trong vùng thử; thử nhiều ngón rồi xóa để làm lại.',
      'Chỉ ghi nhận pointerType touch/pen. Không chẩn đoán phần cứng digitizer; thiết bị không cảm ứng không thể chạy phép thử này.',
      'Theo dõi pointerdown, pointermove, pointerup và pointercancel, phân biệt từng pointerId.',
    ],
    [
      'Touch screen test',
      'Draw touch trails and count concurrent contact points.',
      'Touch and drag inside the test area; try several fingers, then reset.',
      'Only touch/pen pointers are recorded. This is not digitizer hardware diagnosis; non-touch devices cannot perform the test.',
      'Observes pointerdown/move/up/cancel and tracks individual pointerIds.',
    ],
  ],
  [
    'B01',
    'tester',
    'keyboard',
    'keyboard',
    'observation',
    ['keyboard'],
    [
      'Kiểm tra bàn phím',
      'Xem phím đang giữ, phím đã thử và số lần nhấn.',
      'Chọn layout, kích hoạt vùng thử rồi nhấn các phím. Tab hoặc Esc thoát; dùng chuột để đặt lại.',
      'Phím tắt hệ điều hành có thể bị giữ lại trước khi tới trình duyệt. Vị trí phím dùng KeyboardEvent.code.',
      'Theo dõi keydown/keyup trong vùng capture được kích hoạt rõ ràng.',
    ],
    [
      'Keyboard tester',
      'See held keys, tested keys and press counts.',
      'Choose a layout, activate the test area and press keys. Tab or Esc exits; reset with the button.',
      'OS shortcuts may never reach the browser. Physical key positions use KeyboardEvent.code.',
      'Tracks keydown/keyup in an explicitly activated capture area.',
    ],
  ],
  [
    'B02',
    'rollover',
    'keyboard',
    'keyboard',
    'observation',
    ['keyboard'],
    [
      'Key Rollover',
      'Đếm phím giữ đồng thời và mức tối đa quan sát được.',
      'Kích hoạt vùng thử, giữ nhiều phím cùng lúc rồi xem danh sách và số lượng tối đa.',
      'Số phím nhận được không chứng nhận NKRO hoặc 6KRO. Browser và OS có thể chặn tổ hợp phím.',
      'Tập hợp code đang giữ được cập nhật theo keydown/keyup và xóa khi mất focus.',
    ],
    [
      'Key rollover test',
      'Count held keys and the highest simultaneous count observed.',
      'Activate the area, hold several keys and inspect the list and maximum count.',
      'Observed counts do not certify NKRO or 6KRO. Browser and OS may intercept combinations.',
      'Maintains a set of held codes on keydown/keyup and clears it on focus loss.',
    ],
  ],
  [
    'B03',
    'chatter',
    'keyboard',
    'keyboard',
    'estimate',
    ['keyboard'],
    [
      'Key Chatter',
      'Phân tích chuỗi nhấn nhanh, tách biệt auto-repeat.',
      'Chọn ngưỡng điều tra, kích hoạt vùng thử và nhấn từng phím nhiều lần một cách bình thường.',
      'Khoảng thời gian ngắn không chứng minh switch hỏng; event.repeat được đếm riêng, không coi là chatter.',
      'Đo từ keyup tới keydown không repeat tiếp theo cùng code; đánh dấu khoảng nhỏ hơn hoặc bằng ngưỡng.',
    ],
    [
      'Key chatter test',
      'Inspect rapid repeat sequences separately from auto-repeat.',
      'Set an investigation threshold, activate capture and press each key normally several times.',
      'A short gap does not prove a faulty switch; event.repeat is counted separately and never labeled chatter.',
      'Measures keyup to next non-repeat keydown for each code; flags gaps at or below the threshold.',
    ],
  ],
  [
    'B04',
    'hold',
    'keyboard',
    'keyboard',
    'observation',
    ['keyboard'],
    [
      'Thời gian giữ phím',
      'Đo thời gian giữ từng phím và các sự kiện lặp.',
      'Kích hoạt vùng thử, giữ phím rồi thả; xem thời gian khi đang giữ và sau khi thả.',
      'Mất focus hoặc tab bị ẩn sẽ ngắt lượt giữ; thời gian phản ánh sự kiện browser nhận được.',
      'Dùng performance.now cho thời gian giữ và phân biệt release bình thường với gián đoạn.',
    ],
    [
      'Key hold test',
      'Measure per-key hold time and repeat events.',
      'Activate capture, hold and release keys; inspect live and completed durations.',
      'Losing focus or hiding the tab interrupts holds; duration reflects events received by the browser.',
      'Uses performance.now for durations and distinguishes normal release from interruption.',
    ],
  ],
  [
    'B05',
    'events',
    'keyboard',
    'keyboard',
    'observation',
    ['keyboard'],
    [
      'Keyboard Event Inspector',
      'Đọc key, code, location, modifiers và timestamp.',
      'Kích hoạt vùng thử, nhấn các tổ hợp và xem log; có thể sao chép log hoặc xóa.',
      'Log chỉ giữ 200 sự kiện gần nhất trong bộ nhớ. Không upload hoặc tự lưu nội dung phím.',
      'Ghi nhận event.key, code, location, repeat, modifiers, type và timeStamp.',
    ],
    [
      'Keyboard event inspector',
      'Inspect key, code, location, modifiers and timestamps.',
      'Activate capture, try combinations and inspect logs; copy or clear them as needed.',
      'Only the latest 200 events are kept in memory. Key contents are never uploaded or saved automatically.',
      'Records event.key, code, location, repeat, modifiers, type and timeStamp.',
    ],
  ],
  [
    'C01',
    'buttons',
    'mouse',
    'mouse',
    'observation',
    ['pointer'],
    [
      'Kiểm tra nút chuột',
      'Xem trạng thái và bộ đếm của các nút chuột.',
      'Nhấn và thả từng nút trong vùng thử; thử nút trái, phải, giữa và nút phụ.',
      'Nút phụ có thể bị trình duyệt hoặc hệ điều hành dành cho điều hướng; chỉ các event nhận được mới được đếm.',
      'Theo dõi pointerdown/up/cancel, button và buttons; context menu chỉ bị chặn trong vùng thử.',
    ],
    [
      'Mouse button tester',
      'Inspect mouse button states and counters.',
      'Press and release each button in the test area; try left, right, middle and auxiliary buttons.',
      'Auxiliary buttons may be reserved for OS/browser navigation; only received events are counted.',
      'Observes pointerdown/up/cancel, button and buttons; context menus are blocked only in the test area.',
    ],
  ],
  [
    'C02',
    'double-click',
    'mouse',
    'mouse',
    'estimate',
    ['pointer'],
    [
      'Kiểm tra Double Click',
      'Đo khoảng cách giữa các lần nhấp và phát hiện chuỗi nhanh.',
      'Đặt ngưỡng điều tra rồi nhấp đơn bình thường; so sánh khi cố ý nhấp đôi.',
      'Nhấp nhanh không chứng minh switch lỗi. Người dùng phải phân biệt nhấp đôi chủ ý.',
      'Dùng timestamp của các pointerdown nút trái và so sánh từng khoảng với ngưỡng.',
    ],
    [
      'Double click tester',
      'Measure click gaps and investigate rapid sequences.',
      'Set a threshold and click normally; compare against intentional double clicks.',
      'A short gap does not prove a faulty switch. Intentional double clicks require user interpretation.',
      'Uses left-button pointerdown timestamps and compares consecutive intervals to the threshold.',
    ],
  ],
  [
    'C03',
    'cps',
    'mouse',
    'mouse',
    'observation',
    ['pointer'],
    [
      'Tốc độ nhấp CPS',
      'Đếm số lần nhấp trong một khoảng thời gian bạn chọn.',
      'Chọn thời lượng, bấm bắt đầu rồi nhấp trong vùng thử trước khi đồng hồ kết thúc.',
      'Kết quả chỉ gồm pointerdown nút trái trong vùng thử; tự động hóa có thể tạo sự kiện tổng hợp.',
      'CPS = số lần nhấp / thời gian thực tế tính bằng giây; dùng performance.now.',
    ],
    [
      'Clicks per second',
      'Count clicks within a duration you choose.',
      'Select a duration, start and click inside the region before the timer ends.',
      'Only left-button pointerdown events in the region count; automation may generate synthetic events.',
      'CPS = click count / actual elapsed seconds using performance.now.',
    ],
  ],
  [
    'C04',
    'scroll',
    'mouse',
    'mouse',
    'observation',
    [],
    [
      'Kiểm tra con lăn',
      'Quan sát hướng cuộn, delta và đơn vị wheel event.',
      'Đặt con trỏ trong vùng thử và cuộn dọc hoặc ngang; đưa chuột ra ngoài để cuộn trang.',
      'Wheel event không tương đương số nấc con lăn. deltaMode quy định đơn vị pixel, dòng hoặc trang.',
      'Listener wheel không passive chỉ trong vùng thử; ghi deltaX, deltaY, deltaMode và số sự kiện.',
    ],
    [
      'Scroll wheel tester',
      'Inspect direction, deltas and wheel event units.',
      'Move into the region and scroll vertically or horizontally; move outside to scroll the page.',
      'Wheel events do not equal hardware detents. deltaMode specifies pixels, lines or pages.',
      'A non-passive wheel listener only inside the region records deltaX, deltaY, deltaMode and event count.',
    ],
  ],
  [
    'C05',
    'polling-rate',
    'mouse',
    'mouse',
    'estimate',
    ['pointer'],
    [
      'Ước tính Polling Rate',
      'Lấy mẫu tần suất sự kiện di chuyển chuột mà browser nhận được.',
      'Bắt đầu rồi di chuột liên tục trong vùng thử; lặp lại và so sánh các lượt.',
      'Không bảo đảm USB polling rate thực tế, đặc biệt 1000/4000/8000 Hz. Coalescing, OS và tải hệ thống ảnh hưởng kết quả.',
      'Dùng pointermove và getCoalescedEvents khi có, loại timestamp trùng; tính (N−1) / khoảng thời gian.',
    ],
    [
      'Polling Rate estimate',
      'Sample mouse movement event frequency observed by the browser.',
      'Start and move the mouse continuously inside the region; repeat and compare runs.',
      'Does not guarantee actual USB polling rate, especially 1000/4000/8000 Hz. Coalescing, OS and system load affect results.',
      'Uses pointermove and getCoalescedEvents where available, deduplicates timestamps; computes (N−1) / elapsed time.',
    ],
  ],
];
export const tools: Tool[] = entries.map(
  ([id, slug, category, engine, classification, requiredCapabilities, vi, en]) => {
    const make = ([name, description, instructions, limitations, method]: Entry[6]): ToolCopy => ({
      name,
      description,
      instructions,
      limitations,
      method,
    });
    return {
      id,
      slug,
      category,
      phase: 1,
      status: 'published',
      icon: category,
      engine,
      requiredCapabilities,
      optionalCapabilities: category === 'screen' ? ['fullscreen', 'visualViewport'] : [],
      permissions: [],
      classification,
      environments: ['desktop', ...(category === 'screen' ? ['mobile', 'tablet'] : [])],
      seo: { index: true },
      relatedTools: entries
        .filter((e) => e[2] === category && e[0] !== id)
        .slice(0, 3)
        .map((e) => e[0]),
      copy: { vi: make(vi), en: make(en) },
    };
  },
);
export function getToolSearchIndex(locale: Locale): ToolSearchEntry[] {
  return tools
    .filter((tool) => tool.status === 'published')
    .map((tool) => ({
      id: tool.id,
      slug: tool.slug,
      category: tool.category,
      icon: tool.icon,
      classification: tool.classification,
      name: tool.copy[locale].name,
      searchText: normalizeSearch(
        `${tool.copy.vi.name} ${tool.copy.en.name} ${tool.copy.vi.description} ${tool.copy.en.description} ${tool.id}`,
      ),
    }));
}
export function findTool(category: string, slug: string) {
  return tools.find((t) => t.category === category && t.slug === slug && t.status === 'published');
}
export function searchTools(query: string, category?: Category) {
  const ids = new Set(
    searchToolIndex(getToolSearchIndex('vi'), query, category).map((tool) => tool.id),
  );
  return tools.filter((tool) => ids.has(tool.id));
}
