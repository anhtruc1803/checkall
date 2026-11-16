import type { Locale } from '@/lib/i18n/routing';
import type { Tool, ToolCopy } from './types';
type CopyFields = [string, string, string, string];
const descriptions: Record<string, Record<Locale, CopyFields>> = {
  G01: {
    vi: [
      'Xem thông tin màn hình, trình duyệt, ngôn ngữ và tài nguyên được báo.',
      'Bấm Đọc dữ liệu. Đọc lại sau khi đổi màn hình hoặc zoom; Đặt lại để xóa kết quả.',
      'Thông tin có thể được làm tròn hoặc ẩn. Không dùng để xác nhận model CPU, RAM lắp đặt hoặc độ phân giải vật lý.',
      'Hiển thị thông tin trình duyệt cho phép truy cập; mục không có dữ liệu hiện dấu —.',
    ],
    en: [
      'View reported screen, browser, language and device resource information.',
      'Select Read data. Read again after changing displays or zoom; Reset clears the results.',
      'Information may be rounded or hidden. It does not confirm the CPU model, installed RAM or physical display resolution.',
      'Shows information exposed by the browser; unavailable fields display —.',
    ],
  },
  G02: {
    vi: [
      'Xem trình duyệt hỗ trợ những tính năng kiểm tra nào.',
      'Bấm Đọc dữ liệu và xem trạng thái từng tính năng. Kiểm tra lại sau khi thay đổi cài đặt trình duyệt.',
      'Có hỗ trợ không bảo đảm thiết bị đã kết nối hoặc quyền đã được cấp. Mục chưa xác định cần thử trực tiếp bằng công cụ tương ứng.',
      'Kiểm tra hỗ trợ mà không mở camera, microphone hay yêu cầu cấp quyền.',
    ],
    en: [
      'Check which testing features your browser supports.',
      'Select Read data and review each feature. Check again after changing browser settings.',
      'Support does not guarantee connected hardware or granted permission. Try the relevant tool when a status is unknown.',
      'Checks feature support without opening the camera or microphone or requesting permission.',
    ],
  },
  G03: {
    vi: [
      'Xem thông tin đồ họa và WebGL do trình duyệt cung cấp.',
      'Bấm Đọc dữ liệu. Bật renderer chi tiết nếu muốn xem thêm thông tin driver; Đặt lại để xóa kết quả.',
      'Thông tin có thể bị ẩn hoặc mô tả đồ họa phần mềm. Không xác nhận GPU vật lý, VRAM hoặc hiệu năng.',
      'Hiển thị phiên bản WebGL, vendor, renderer và giới hạn texture. Thông tin driver chi tiết chỉ được đọc khi bạn cho phép.',
    ],
    en: [
      'View graphics and WebGL information provided by the browser.',
      'Select Read data. Enable detailed renderer information for extra driver details; Reset clears results.',
      'Information may be hidden or describe software rendering. It does not confirm the physical GPU, VRAM or performance.',
      'Shows WebGL version, vendor, renderer and texture limits. Detailed driver information is read only with your consent.',
    ],
  },
  G04: {
    vi: [
      'Thử cảm ứng, bút và chuột; xem vị trí và các điểm đang chạm.',
      'Bấm Bắt đầu rồi di chuột, chạm hoặc dùng bút trong vùng thử. Dừng để kết thúc; mỗi phiên tối đa 60 giây.',
      'Lực nhấn và kích thước điểm chạm có thể là giá trị mặc định của trình duyệt, không phải phép đo lực thực tế.',
      'Hiển thị loại con trỏ, tọa độ và các điểm đang hoạt động trong vùng thử.',
    ],
    en: [
      'Test touch, pen and mouse input; see positions and active contacts.',
      'Select Start, then move, touch or use a pen inside the area. Stop ends the test; each session lasts up to 60 seconds.',
      'Pressure and contact size may be browser defaults rather than measurements of physical force.',
      'Shows pointer type, coordinates and active contacts inside the test area.',
    ],
  },
  G05: {
    vi: [
      'Kiểm tra khả năng lưu dữ liệu của website trong trình duyệt.',
      'Bấm Đọc dữ liệu để thử bộ nhớ và xem dung lượng được báo. Phép thử dùng dữ liệu tạm, không xóa dữ liệu hiện có.',
      'Dung lượng là ước tính dành cho website, không phải dung lượng ổ đĩa. IndexedDB và CacheStorage chỉ kiểm tra hỗ trợ, chưa thử đọc/ghi. Chế độ riêng tư có thể giới hạn lưu trữ.',
      'Thử ghi, đọc rồi xóa dữ liệu tạm trong localStorage và sessionStorage; đọc mức sử dụng và giới hạn lưu trữ nếu trình duyệt cung cấp.',
    ],
    en: [
      'Check whether this website can store data in your browser.',
      'Select Read data to test storage and view reported capacity. The test uses temporary data and preserves existing data.',
      'Capacity is an estimate for this website, not disk capacity. IndexedDB and CacheStorage are checked for support only, without read/write tests. Private browsing can restrict storage.',
      'Writes, reads and deletes temporary data in localStorage and sessionStorage, and reads usage and quota when available.',
    ],
  },
  G06: {
    vi: [
      'Thử chế độ toàn màn hình và xem kích thước vùng hiển thị.',
      'Bấm Toàn màn hình, dùng nút thoát hoặc Esc để trở lại. Nếu không hỗ trợ, tiếp tục thử trong trang.',
      'Trình duyệt hoặc cài đặt trang có thể chặn toàn màn hình. Kích thước theo CSS không phải độ phân giải vật lý của màn hình.',
      'Mở vùng thử toàn màn hình và cập nhật kích thước khi vùng hiển thị thay đổi.',
    ],
    en: [
      'Try fullscreen mode and check the display area size.',
      'Select Fullscreen; use its exit button or Esc to return. If unsupported, continue with the inline area.',
      'Browser or page settings may block fullscreen. CSS dimensions are not the display’s physical resolution.',
      'Opens the test area in fullscreen and updates its dimensions as the display area changes.',
    ],
  },
  C06: {
    vi: [
      'Quan sát đường đi, vị trí và khoảng cách con trỏ chuột trong vùng thử bằng CSS pixels.',
      'Bấm Bắt đầu rồi di chuột trong vùng thử. Dừng để giữ kết quả, Đặt lại để xóa. Phiên tối đa 60 giây.',
      'Khoảng cách theo CSS pixels, không đo DPI/CPI, quãng đường vật lý, Polling Rate hoặc độ trễ. Tốc độ trung bình tính cả thời gian nghỉ.',
      'Cộng khoảng cách giữa các vị trí chuột liên tiếp. Rời vùng rồi quay lại không nối thêm đường đi.',
    ],
    en: [
      'Observe mouse pointer paths, position and distance inside a test region in CSS pixels.',
      'Select Start and move the mouse inside the area. Stop preserves results; Reset clears them. Sessions last up to 60 seconds.',
      'Distance is in CSS pixels, not DPI/CPI, physical travel, Polling Rate or latency. Average speed includes idle time.',
      'Adds the distances between consecutive pointer positions. Leaving and returning does not add a connecting segment.',
    ],
  },
  C07: {
    vi: [
      'Thử nhấn 10 mục tiêu, xem tỷ lệ trúng và khoảng cách tới tâm.',
      'Chọn kích thước, bấm Bắt đầu rồi dùng nút trái nhấn các mục tiêu. Trúng để chuyển tiếp; trượt để thử lại. Phiên tối đa 60 giây.',
      'Chỉ chấm nút trái chuột; bàn phím, cảm ứng và bút không tính điểm. Kết quả phản ánh thao tác của bạn, không xác nhận độ chính xác cảm biến hoặc độ trễ.',
      'Tính số lần trúng trên tổng lần nhấn và khoảng cách trung bình tới tâm của những lần trúng.',
    ],
    en: [
      'Click 10 targets and review your hit rate and distance from the center.',
      'Choose a size, select Start and left-click the targets. Hits advance; misses let you try again. Sessions last up to 60 seconds.',
      'Only left mouse clicks are scored; keyboard, touch and pen do not count. Results describe your task performance, not sensor precision or latency.',
      'Calculates hits as a share of attempts and the average distance from the center for successful hits.',
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
