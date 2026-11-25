import type { Tool } from './types';

export const mouseReactionTool: Tool = {
  id: 'C08',
  slug: 'reaction',
  category: 'mouse',
  phase: null,
  status: 'published',
  icon: 'mouse',
  engine: 'mouse-reaction',
  requiredCapabilities: ['pointer'],
  optionalCapabilities: [],
  permissions: [],
  classification: 'observation',
  environments: ['desktop'],
  seo: { index: true },
  relatedTools: ['C01', 'C03', 'C07'],
  copy: {
    vi: {
      name: 'Kiểm tra phản xạ nhấp chuột',
      description: 'Nhấp khi tín hiệu xuất hiện để xem thời gian phản xạ qua 5 lượt.',
      instructions:
        'Bấm Bắt đầu và giữ con trỏ trong vùng thử. Khi thấy chữ Nhấp ngay!, hãy nhấp nhanh nhất có thể bằng nút chính của chuột.',
      limitations:
        'Kết quả phản ánh phản xạ trong trình duyệt, chịu ảnh hưởng của màn hình, chuột và tải hệ thống. Kết quả chỉ tồn tại trong trang đang mở.',
      method:
        'Trình duyệt đưa tín hiệu vào giao diện sau 1,5–4 giây ngẫu nhiên, rồi đo đến lúc xử lý lượt nhấp bằng đồng hồ đơn điệu. Trung vị và lượt nhanh nhất lấy từ 5 lượt hợp lệ.',
    },
    en: {
      name: 'Mouse Reaction Test',
      description: 'Click when the signal appears and see your reaction time over five rounds.',
      instructions:
        'Select Start and keep the pointer inside the test area. When Click now! appears, click as quickly as you can with the primary mouse button.',
      limitations:
        'Reaction times are measured in the browser and depend on the display, mouse and system load. Results stay on the open page.',
      method:
        'The browser puts the signal on screen after a random 1.5–4 second delay and uses a monotonic clock until it handles the click. The median and fastest time use five valid rounds.',
    },
  },
};
