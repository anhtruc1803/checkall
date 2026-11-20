import type { Tool } from './types';

const entries = [
  {
    id: 'U07',
    slug: 'unit-converter',
    engine: 'unit-converter',
    vi: [
      'Đổi đơn vị',
      'Chuyển đổi độ dài, khối lượng, diện tích, thể tích, nhiệt độ, tốc độ, thời lượng và dữ liệu.',
      'Chọn nhóm, đơn vị nguồn và đích, định dạng số rồi nhập giá trị. Nút Đảo đơn vị giữ nguyên số đang nhập.',
      'Dùng hệ số định nghĩa và phân số chính xác; hiển thị tối đa sáu chữ số thập phân, có ghi chú khi làm tròn.',
      'Dùng foot/mile quốc tế, pound/ounce avoirdupois, gallon Mỹ dạng chất lỏng và gallon Anh. Chỉ nhiệt độ nhận số âm; không nhận nhiệt độ dưới 0 K. Không đổi tiền tệ, tháng/năm hoặc đơn vị địa phương có nhiều quy ước.',
    ],
    en: [
      'Unit converter',
      'Convert length, mass, area, volume, temperature, speed, duration and data units.',
      'Choose a group, source and target units and number format, then enter a value. Swap units keeps the input number unchanged.',
      'Uses exact defined factors and rational arithmetic; displays up to six decimal places and marks rounding.',
      'Uses international feet/miles, avoirdupois pounds/ounces, US liquid and Imperial gallons. Negative input is accepted only for temperature, never below 0 K. Does not convert currencies, months/years or ambiguous local units.',
    ],
  },
  {
    id: 'U08',
    slug: 'date-calculator',
    engine: 'date-calculator',
    vi: [
      'Tính ngày',
      'Tính số ngày giữa hai ngày hoặc cộng, trừ ngày lịch với năm nhuận.',
      'Chọn cách tính và nhập ngày. Khi cộng/trừ, nhập số ngày nguyên có dấu âm để lùi ngày. Kết quả ngày có dạng YYYY-MM-DD.',
      'Lấy ngày kết thúc trừ ngày bắt đầu trong lịch Gregorian, độc lập múi giờ. Hai ngày giống nhau có khoảng cách 0; kết quả âm khi ngày kết thúc sớm hơn.',
      'Hỗ trợ năm 0001–9999, tính cả thứ Bảy, Chủ nhật và ngày lễ. Không tính ngày làm việc, tuổi, tháng/năm, âm lịch hoặc thời lượng theo giờ; không cộng thêm ngày đầu/cuối.',
    ],
    en: [
      'Date calculator',
      'Find the days between two dates or add and subtract calendar days, including leap years.',
      'Choose a calculation and enter dates. For addition, enter a signed whole number of days; negative values go backward. Date results use YYYY-MM-DD.',
      'Subtracts the start date from the end date in the Gregorian calendar, independent of time zones. Equal dates give zero; an earlier end date gives a negative result.',
      'Supports years 0001–9999 and includes weekends and holidays. Does not calculate business days, age, months/years, lunar dates or elapsed hours; no extra inclusive day is added.',
    ],
  },
] as const;

export const conversionUtilityTools: Tool[] = entries.map(({ id, slug, engine, vi, en }) => {
  const copy = ([name, description, instructions, method, limitations]: readonly string[]) => ({
    name,
    description,
    instructions,
    method,
    limitations,
  });
  return {
    id,
    slug,
    engine,
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
    relatedTools: [id === 'U07' ? 'U08' : 'U07', 'U01', 'U02'],
    copy: { vi: copy(vi), en: copy(en) },
  };
});
