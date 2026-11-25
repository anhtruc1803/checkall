import type { Tool } from './types';

export const typingTool: Tool = {
  id: 'B06',
  slug: 'vietnamese-typing',
  category: 'keyboard',
  phase: null,
  status: 'published',
  icon: 'keyboard',
  engine: 'vietnamese-typing',
  requiredCapabilities: [],
  optionalCapabilities: [],
  permissions: [],
  classification: 'observation',
  environments: ['desktop', 'mobile', 'tablet'],
  seo: { index: true },
  relatedTools: ['B01', 'B05'],
  copy: {
    vi: {
      name: 'Tốc độ gõ tiếng Việt',
      description: 'Test gõ phím 60 giây, xem WPM và luyện gõ tiếng Việt theo lỗi dấu.',
      instructions:
        'Chọn bài 60 giây hoặc Luyện tự do rồi gõ theo đoạn mẫu. Có thể sửa trực tiếp trong ô gõ. Với bài luyện, bấm Kết thúc để xem phân tích.',
      limitations:
        'Độ chính xác phản ánh văn bản cuối lượt. Lỗi đã sửa và phần mẫu chưa gõ nằm ngoài điểm lỗi. Nội dung gõ chỉ tồn tại trong lượt đang mở.',
      method:
        'Đối chiếu văn bản tiếng Việt sau khi chuẩn hóa NFC, tính ký tự đúng mỗi phút và quy đổi WPM theo 5 ký tự. Phân tích riêng dấu thanh, dấu chữ, d/đ và khoảng trắng.',
    },
    en: {
      name: 'Vietnamese typing speed',
      description: 'Take a 60-second typing test, see WPM and practise Vietnamese accents.',
      instructions:
        'Choose a 60-second test or free practice, then type the sample. Edit directly in the typing field. Select Finish to review a free practice session.',
      limitations:
        'Accuracy reflects the final text. Corrected mistakes and untouched text are outside the error score. Typed text stays in the open session.',
      method:
        'Compare NFC-normalized Vietnamese text, calculate correct characters per minute, and convert to WPM using five characters per word. Tone marks, vowel marks, d/đ and spaces are counted separately.',
    },
  },
};
