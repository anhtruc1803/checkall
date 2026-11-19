import type { Tool } from './types';

type Copy = [
  name: string,
  description: string,
  instructions: string,
  method: string,
  limitations: string,
];
const entries: { id: string; slug: string; vi: Copy; en: Copy }[] = [
  {
    id: 'U03',
    slug: 'word-counter',
    vi: [
      'Đếm từ và ký tự',
      'Đếm từ, ký tự hiển thị, dòng, đoạn và dung lượng UTF-8 của văn bản.',
      'Nhập văn bản, chọn ngôn ngữ rồi bấm Đếm. Mở Chi tiết để xem code point, UTF-16 và byte UTF-8.',
      'Ký tự hiển thị được đếm theo cụm Unicode, giữ emoji ghép và dấu kết hợp. Từ được đếm theo ranh giới từ của trình duyệt.',
      'Không phân tích từ ghép tiếng Việt hoặc ngữ nghĩa. Cách tách từ có thể khác theo phiên bản trình duyệt; mục không được hỗ trợ sẽ hiện dấu gạch, không ước tính thay thế.',
    ],
    en: [
      'Word and character counter',
      'Count words, visible characters, lines, paragraphs and UTF-8 bytes in text.',
      'Enter text, choose its language and select Count. Open Details for code points, UTF-16 units and UTF-8 bytes.',
      'Visible characters use Unicode grapheme clusters, including combined emoji and combining accents. Words use the browser’s word boundaries.',
      'Does not analyze Vietnamese compound words or meaning. Word boundaries may vary by browser version; unsupported counts show a dash instead of an estimate.',
    ],
  },
  {
    id: 'U04',
    slug: 'case-converter',
    vi: [
      'Đổi chữ hoa và chữ thường',
      'Chuyển chữ hoa, chữ thường hoặc viết hoa đầu từ, đầu câu với bản xem trước.',
      'Nhập văn bản, chọn cách viết và ngôn ngữ rồi bấm Chuyển đổi. Bản gốc luôn được giữ để đối chiếu.',
      'Chuyển hoa/thường theo ngôn ngữ đã chọn. Đầu từ dựa trên cụm chữ; đầu câu dựa trên dấu chấm, hỏi, than và xuống dòng.',
      'Không nhận diện tên riêng, viết tắt hoặc quy tắc tiêu đề biên tập. Chuyển hoa/thường có thể thay đổi số ký tự; hãy xem kết quả trước khi sao chép.',
    ],
    en: [
      'Text case converter',
      'Preview uppercase, lowercase, title-style or sentence-style text.',
      'Enter text, choose a case mode and language, then select Convert. The original stays available for comparison.',
      'Uses the selected language for case mapping. Word starts use letter sequences; sentence starts follow periods, question marks, exclamation marks and line breaks.',
      'Does not recognize proper names, abbreviations or editorial title rules. Case conversion can change the character count; review before copying.',
    ],
  },
  {
    id: 'U05',
    slug: 'remove-accents-slug',
    vi: [
      'Bỏ dấu và tạo slug',
      'Bỏ dấu chữ Latin/tiếng Việt hoặc tạo slug ASCII, Unicode với dấu nối tùy chọn.',
      'Chọn Bỏ dấu để giữ nội dung và chữ hoa/thường, hoặc chọn slug ASCII/Unicode rồi bấm Tạo kết quả.',
      'Bỏ dấu trên chữ Latin, đổi đ/Đ thành d/D. Slug ASCII giữ a-z và 0-9; slug Unicode giữ chữ, số và dấu kết hợp, chuyển thường và nối các cụm.',
      'Không phiên âm mọi ngôn ngữ hoặc bảo đảm slug duy nhất. Slug ASCII có thể bỏ chữ ngoài bảng Latin cơ bản; kết quả là chuỗi, chưa phải một URL được mã hóa.',
    ],
    en: [
      'Remove accents and create slugs',
      'Remove Latin/Vietnamese accents or create ASCII or Unicode slugs with a chosen separator.',
      'Choose Remove accents to preserve content and case, or choose an ASCII/Unicode slug and select Create result.',
      'Removes marks from Latin letters and maps đ/Đ to d/D. ASCII slugs keep a-z and 0-9; Unicode slugs keep letters, digits and attached marks, lowercase them and join runs.',
      'Does not transliterate every language or guarantee uniqueness. ASCII can discard other letters; the output is a string, not an encoded URL.',
    ],
  },
  {
    id: 'U06',
    slug: 'text-cleaner',
    vi: [
      'Làm sạch văn bản',
      'Xử lý khoảng trắng, dòng trống, dòng trùng và ký tự ẩn theo tùy chọn.',
      'Chọn các bước cần dùng rồi bấm Làm sạch. Xem kết quả riêng bên dưới; bản gốc không bị ghi đè.',
      'Áp dụng lần lượt chuẩn hóa Unicode tùy chọn, bỏ ký tự ẩn, gộp khoảng trắng ngang, cắt lề, lọc dòng trống/trùng và cắt khoảng trắng ngoài cùng.',
      'Gộp khoảng trắng có thể đổi thụt lề. Dòng trùng được so khớp chính xác sau các bước trước đó. Không sửa ngữ pháp, dịch nội dung hoặc khử mã HTML để bảo đảm an toàn.',
    ],
    en: [
      'Text cleaner',
      'Clean whitespace, blank lines, duplicate lines and selected invisible characters.',
      'Choose the steps you need, then select Clean. Review the separate output; the original is never overwritten.',
      'Applies optional Unicode normalization, invisible removal, horizontal whitespace collapsing, line trimming, blank/duplicate filtering and outer trimming in order.',
      'Collapsing whitespace can change indentation. Duplicate matching is exact after earlier steps. Does not correct grammar, translate text or sanitize HTML for safe execution.',
    ],
  },
];
export const textUtilityTools: Tool[] = entries.map(({ id, slug, vi, en }) => {
  const copy = ([name, description, instructions, method, limitations]: Copy) => ({
    name,
    description,
    instructions,
    method,
    limitations,
  });
  return {
    id,
    slug,
    engine: 'text',
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
    relatedTools: entries.filter((tool) => tool.id !== id).map((tool) => tool.id),
    copy: { vi: copy(vi), en: copy(en) },
  };
});
