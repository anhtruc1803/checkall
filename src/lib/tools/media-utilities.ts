import type { Tool } from './types';

const entries = [
  {
    id: 'U09',
    slug: 'qr-code',
    engine: 'qr-code',
    relatedTools: ['U10', 'U05', 'B06'],
    copy: {
      vi: {
        name: 'Tạo mã QR',
        description: 'Tạo mã QR từ liên kết hoặc văn bản, xem trước và tải PNG.',
        instructions:
          'Nhập nội dung, bấm Tạo mã QR rồi tải ảnh. Có thể dán link đề thi gõ hoặc nội dung tiếng Việt.',
        method:
          'Mã hóa nội dung gốc bằng UTF-8 và vẽ mã đen trắng có viền trống để dễ quét. Nội dung được xử lý tại chỗ.',
        limitations: 'Hỗ trợ tối đa 1.000 byte UTF-8. Mã là ảnh tĩnh, chứa đúng dữ liệu đã nhập.',
      },
      en: {
        name: 'QR code generator',
        description: 'Turn a link or text into a QR code, preview it and download a PNG.',
        instructions:
          'Enter content, generate a QR code, then download the image. You can paste a typing challenge link or Vietnamese text.',
        method:
          'Encodes the original UTF-8 content and draws a black-and-white code with a quiet zone. Processing takes place on this device.',
        limitations:
          'Supports up to 1,000 UTF-8 bytes. The static image encodes the original input.',
      },
    },
  },
  {
    id: 'U10',
    slug: 'image-resizer',
    engine: 'image-resizer',
    relatedTools: ['U09', 'U07', 'A01'],
    copy: {
      vi: {
        name: 'Nén và đổi kích thước ảnh',
        description: 'Đổi chiều rộng ảnh theo tỷ lệ, so sánh dung lượng và tải ảnh đã xử lý.',
        instructions:
          'Chọn một ảnh JPEG, PNG hoặc WebP. Nhập chiều rộng, chọn định dạng và chất lượng phù hợp, rồi bấm Xử lý ảnh.',
        method:
          'Canvas xử lý ảnh tại thiết bị. Dung lượng trước và sau được lấy từ tệp gốc và tệp xuất thực tế.',
        limitations:
          'Ảnh nguồn tối đa 20 MiB và 24 megapixel. Ảnh xuất tối đa 4.096 px mỗi cạnh. Ảnh động xuất thành ảnh tĩnh. Định dạng xuất phụ thuộc trình duyệt.',
      },
      en: {
        name: 'Image resizer and compressor',
        description: 'Resize an image proportionally, compare file sizes and download the result.',
        instructions:
          'Choose a JPEG, PNG or WebP image. Set the width, format and quality, then process the image.',
        method:
          'Canvas processes the image on this device. The before and after sizes come from the original and exported files.',
        limitations:
          'Sources can be up to 20 MiB and 24 megapixels. Output is limited to 4,096 px per side. Animated images export as stills. Output formats depend on your browser.',
      },
    },
  },
] satisfies Pick<Tool, 'id' | 'slug' | 'engine' | 'relatedTools' | 'copy'>[];

export const mediaUtilityTools: Tool[] = entries.map((tool) => ({
  ...tool,
  category: 'utilities',
  icon: 'utilities',
  phase: null,
  status: 'published',
  requiredCapabilities: [],
  optionalCapabilities: [],
  permissions: [],
  classification: 'calculator',
  environments: ['desktop', 'mobile', 'tablet'],
  seo: { index: true },
}));
