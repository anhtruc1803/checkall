import type { AccentTopic } from './accents';
import type { TypingDifficulty } from './difficulty';
import type { PracticeKeyRow } from './keyboard-guide';

export const typingDurationMs = 60_000;

export const practiceGroups = ['rows', 'text', 'accents'] as const;
export type PracticeGroup = (typeof practiceGroups)[number];
export type PracticeLesson =
  | { group: 'rows'; row: PracticeKeyRow; passage: string }
  | { group: 'text'; difficulty: TypingDifficulty; passage: string }
  | { group: 'accents'; passage: string };

const accentLessons = {
  toneQuestionTilde: {
    group: 'accents',
    passage:
      'Hải hỏi Thủy về tấm ảnh cũ. Thủy kể rằng cả nhóm đã nghỉ bên bờ suối, rồi rẽ qua ngõ nhỏ để ngắm những dãy núi phủ sương.',
  },
  toneRisingHeavy: {
    group: 'accents',
    passage:
      'Bác Phúc đặt túi sách cạnh cửa. Một bạn nhỏ nhặt chiếc bút, sắp lại tập giấy và cất hộp mực trước khi lớp bắt đầu.',
  },
  toneLevelFalling: {
    group: 'accents',
    passage:
      'Lan mang bình hoa vào phòng. Bà ngồi bên bàn, chậm rãi kể chuyện mùa hè. Ngoài hiên, hàng cau đung đưa theo làn gió.',
  },
  vowelA: {
    group: 'accents',
    passage:
      'Ba bạn mang khăn ra sân. An cắt một tấm bìa, Thảo vẽ cành hoa, còn Nhân gấp chiếc thuyền. Cả nhóm ăn bánh rồi chuẩn bị về nhà.',
  },
  vowelE: {
    group: 'accents',
    passage:
      'Bé ghé bên kệ sách để tìm truyện. Chị Lê chỉ lên tấm thẻ màu kem rồi khẽ nhắc bé kéo ghế lại gần bàn.',
  },
  vowelO: {
    group: 'accents',
    passage:
      'Con thỏ nhỏ chạy qua bờ cỏ. Cô Hoa mở hộp đựng hạt, đổ vào rổ rồi để ở góc sân. Đến tối, cô nhớ đóng cửa kho.',
  },
  vowelU: {
    group: 'accents',
    passage:
      'Thu rủ Hương thử pha nước mơ. Hai bạn rửa cốc, chọn quả đủ chín rồi đong từng thìa đường. Hương muốn gửi một phần cho chú Út.',
  },
} as const satisfies Record<AccentTopic, Extract<PracticeLesson, { group: 'accents' }>>;

export const practiceLessons = {
  homeRow: {
    group: 'rows',
    row: 'home',
    passage: 'asdf jkl; fdsa ;lkj as df jk l; fj dk sl a; asdf jkl;',
  },
  homeReach: {
    group: 'rows',
    row: 'home',
    passage: 'fgf jhj fghj jhgf asdfg hjkl; dfg hjk agh; ls afgj; fhgj',
  },
  upperRow: {
    group: 'rows',
    row: 'upper',
    passage: 'qwer uiop qwert yuiop qw op er ui rt yu qe pi tw oy qwertyuiop',
  },
  lowerRow: {
    group: 'rows',
    row: 'lower',
    passage: 'zxcv nm,. zxcvb nm,./ zx ,m cv nb xc m, vb nm zv n/ zxcvbnm',
  },
  numberRow: {
    group: 'rows',
    row: 'number',
    passage: '1234 7890 4567 0987 12345 67890 13579 24680 90-= 19 28 37 46 50',
  },
  mixedRows: {
    group: 'rows',
    row: 'mixed',
    passage: 'zaq wsx edc rfv tgb yhn ujm ik, ol. p;/ zaq1 wsx2 edc3 rfv4 yhn6 ujm7',
  },
  accents: {
    group: 'text',
    difficulty: 'easy',
    passage: 'Buổi sáng, bé Thảo mượn quyển sách ở thư viện rồi kể lại câu chuyện cho cả nhóm.',
  },
  shortNote: {
    group: 'text',
    difficulty: 'easy',
    passage: 'Mai nhớ mang áo mưa. Mình sẽ đợi bạn ở cổng rồi cùng đi bộ đến lớp.',
  },
  rainyMorning: {
    group: 'text',
    difficulty: 'easy',
    passage:
      'Mưa rơi ngoài ngõ. Hòa mặc áo khoác rồi cầm ô ra cửa. Trên đường đi, bạn dừng lại chờ một em nhỏ qua đường.',
  },
  gardenWalk: {
    group: 'text',
    difficulty: 'easy',
    passage:
      'Cả nhà đi dạo trong vườn. Bé An thấy một chú bướm vàng đậu trên cành hoa. Bé đứng yên để nhìn cho rõ.',
  },
  kitchen: {
    group: 'text',
    difficulty: 'easy',
    passage:
      'Mẹ rửa rau, bố vo gạo. Linh lấy bát và đặt lên bàn. Khi cơm chín, cả nhà ngồi ăn cùng nhau.',
  },
  readingCorner: {
    group: 'text',
    difficulty: 'easy',
    passage:
      'Vy mở cuốn truyện mới. Em đọc một trang rồi ghi tên nhân vật vào sổ. Đọc xong, em cất sách lên kệ.',
  },
  everyday: {
    group: 'text',
    difficulty: 'medium',
    passage:
      'Trước khi gửi thư, mình đọc lại từng câu, sửa các dấu còn thiếu và kiểm tra tên người nhận.',
  },
  market: {
    group: 'text',
    difficulty: 'medium',
    passage:
      'Sáng chủ nhật, mẹ ghé chợ mua bưởi, mướp và một bó rau ngót. Trên đường về, hai mẹ con dừng lại hỏi thăm bà Cúc ở cuối ngõ.',
  },
  weekend: {
    group: 'text',
    difficulty: 'medium',
    passage:
      'Nếu chiều mai trời tạnh, nhóm mình sẽ gặp nhau ở bến xe. Hãy mang theo một chai nước, một chiếc khăn và bản đồ khu triển lãm.',
  },
  busRoute: {
    group: 'text',
    difficulty: 'medium',
    passage:
      'Trạm xe buýt nằm đối diện bưu điện. Chuyến này đi qua công viên, rẽ ở cuối phố rồi dừng trước cổng trường. Bảo xuống ở trạm thứ ba và đi bộ qua cầu.',
  },
  community: {
    group: 'text',
    difficulty: 'medium',
    passage:
      'Chiều thứ bảy, cư dân mang cây con đến khoảng sân chung. Cô Phương chia đất vào từng chậu, còn các bạn nhỏ viết nhãn để ghi nhớ tên mỗi loài.',
  },
  photoAlbum: {
    group: 'text',
    difficulty: 'medium',
    passage:
      'Trong cuốn album có ảnh cả nhóm đứng dưới hàng phượng. Mai ghi lại nơi chụp, thời điểm và tên từng người để sau này dễ tìm lại tấm ảnh.',
  },
  schedule: {
    group: 'text',
    difficulty: 'hard',
    passage:
      'Lịch thứ Tư, 27/11: 8 giờ 30 họp nhóm; 10 giờ 15 gửi bảng dự thảo. Ghi rõ ba mục cần sửa (tiêu đề, dấu câu, định dạng) trước khi chuyển bản cuối.',
  },
  weather: {
    group: 'text',
    difficulty: 'hard',
    passage:
      'Gió bấc thổi qua triền dốc, luồn giữa những tán sồi ướt sũng. Cô hướng dẫn khẽ nhắc: "Đường trơn, mọi người đi chậm và giữ khoảng cách."',
  },
  receipt: {
    group: 'text',
    difficulty: 'hard',
    passage:
      'Phiếu số 08: nhận 24 quyển vở, 6 hộp bút chì và 12 thước kẻ. Người phụ trách kiểm đếm, đối chiếu từng mục rồi ghi chú: "Đã đủ, chuyển vào tủ số 3."',
  },
  officeEmail: {
    group: 'text',
    difficulty: 'hard',
    passage:
      'Tiêu đề: Chốt lịch gửi bản in. Nhóm thiết kế duyệt bản nháp lúc 14:30, kiểm tra lại 3 mục (cỡ chữ, căn lề, dấu câu), rồi gửi xác nhận trước 17:00.',
  },
  trainBoard: {
    group: 'text',
    difficulty: 'hard',
    passage:
      'Chuyến tàu SE4 khởi hành lúc 19:45 ở đường số 2. Khách mang theo giấy tờ, kiểm tra đúng toa và ghế; hành lý cồng kềnh để ở khu vực có biển hướng dẫn.',
  },
  libraryReport: {
    group: 'text',
    difficulty: 'hard',
    passage:
      'Báo cáo tháng 11: thư viện tiếp nhận 48 cuốn sách, trong đó có 16 cuốn thiếu nhi và 8 cuốn tra cứu. Ba cuốn cần sửa gáy trước khi chuyển lên kệ (khu B).',
  },
  ...accentLessons,
} as const satisfies Record<string, PracticeLesson>;

export type TypingLesson = keyof typeof practiceLessons;
export const typingLessons = Object.keys(practiceLessons) as TypingLesson[];

const mediumPassage = [
  'Buổi sáng, con đường nhỏ trước nhà còn ướt sau trận mưa đêm. Chị Lan mở cửa sổ để đón ánh nắng và nghe tiếng chim ở đầu ngõ.',
  'Trên bàn có một tách trà nóng, một quyển sổ và chiếc bút màu xanh. Chị ghi ra những việc cần làm rồi chọn một việc để bắt đầu.',
  'Trong lúc chờ xe buýt, chị đọc vài trang sách. Câu chuyện kể về một nhóm bạn cùng nhau trồng cây trên mảnh đất trống cạnh trường.',
  'Họ đem theo xẻng, bình tưới và những chiếc găng tay cũ. Mỗi người phụ trách một hàng cây, còn em nhỏ nhất ghi tên từng giống vào cuốn sổ.',
  'Đến giữa buổi, trời hửng nắng. Cả nhóm nghỉ dưới bóng mát, chia nhau quả ổi và bàn xem nên đặt ghế ở đâu để người đi bộ có chỗ ngồi.',
  'Cuối tuần sau, họ quay lại và thấy vài chiếc lá non đã nhú lên. Những hạt giống nhỏ cần được tưới đều, nhất là những ngày trời có gió mạnh.',
  'Khi về đến nhà, chị Lan thử viết lại câu chuyện bằng lời của mình. Chị đọc chậm từng dòng, sửa dấu câu và thêm một đoạn về người giữ vườn.',
  'Người giữ vườn thường đến trước mọi người. Ông nhặt lá rụng, kiểm tra vòi nước và để sẵn một chiếc chổi dưới mái hiên.',
  'Chiều xuống, mấy đứa trẻ mang phấn màu đến vẽ tên các loài hoa lên tấm bảng gỗ. Chúng chọn chữ đủ lớn để người đi ngang có thể đọc rõ.',
  'Khu vườn dần trở thành nơi mọi người gặp nhau. Có người đến để tưới cây, có người ghé đọc sách, còn vài bạn chỉ muốn ngồi yên nghe gió.',
].join(' ');

export const timedPassages: Record<TypingDifficulty, string> = {
  easy: [
    'Sáng nay trời đẹp. An dậy sớm và mở cửa sổ. Gió mát thổi vào phòng. An gấp chăn rồi đi rửa mặt.',
    'Ngoài sân có một cây xoài. Bên gốc cây là một chậu hoa nhỏ. Bố tưới cây mỗi sáng. An giúp bố xếp lại những chiếc chậu.',
    'Mẹ pha một ấm trà. Cả nhà ngồi bên bàn và ăn bánh mì. Em bé chọn một chiếc cốc màu vàng. An lấy thêm nước cho em.',
    'Sau bữa sáng, An đi bộ ra đầu ngõ. Cô Mai đang quét sân. An chào cô rồi dừng lại xem đàn cá trong bể nhỏ.',
    'Trên đường đến thư viện, An đi qua một hàng cây xanh. Vài chú chim đậu trên cành. Bạn Nam đã đứng đợi ở cửa.',
    'Hai bạn tìm một chỗ ngồi gần cửa sổ. Nam đọc truyện về một chú chó. An chọn một cuốn sách nói về các loài hoa.',
    'Gần trưa, hai bạn xếp sách vào đúng kệ. An mượn một cuốn để đọc ở nhà. Nam mang theo một cuốn truyện tranh.',
    'Chiều đến, An cùng em ra sân chơi. Hai anh em vẽ một ngôi nhà và một dòng sông bằng phấn. Mẹ gọi vào ăn cơm khi trời bắt đầu tối.',
    'Sau bữa tối, An đọc sách cho em nghe. Em thích nhất đoạn nói về khu vườn. Hai anh em hẹn sáng mai sẽ cùng tưới hoa.',
    'Trước khi đi ngủ, An chuẩn bị cặp sách. An đặt vở và bút lên bàn. Ngoài hiên, chiếc đèn nhỏ vẫn tỏa ánh sáng dịu.',
  ].join(' '),
  medium: mediumPassage,
  hard: [
    'Thông báo ngày 28/11: buổi khảo sát tuyến ven sông bắt đầu lúc 7 giờ 45 tại cổng số 2. Mỗi nhóm mang theo bản đồ, bút chì và sổ ghi chép.',
    'Ở đoạn từ cầu Gỗ đến bến Cũ, lối xuống khá khuất. Chị trưởng nhóm dặn: "Nếu mặt đường ướt, hãy đi theo vạch vàng và tránh mép kè."',
    'Nhóm 1 ghi chiều rộng lối đi ở 6 vị trí; nhóm 2 đánh dấu các điểm có thể đặt ghế. Mỗi vị trí nên có ảnh, số thứ tự và một câu mô tả.',
    'Khi gặp chỗ khuất tầm nhìn (sau bụi trúc hoặc dưới chân dốc), hãy vẽ thêm mũi tên để người đọc hình dung hướng di chuyển.',
    'Đến trưa, các nhóm tập hợp ở nhà văn hóa. Anh Nghĩa đối chiếu danh sách: 12 phiếu, 24 ảnh và 3 sơ đồ. Hai phiếu thiếu giờ ghi nhận.',
    'Bản nháp cần sửa ba mục: bổ sung mốc đường, thống nhất ký hiệu và ghi rõ điểm kết thúc. Mọi thay đổi được kiểm tra lại trước lúc 16 giờ.',
    'Trong cuộc họp cuối ngày, cả nhóm thảo luận cách bố trí đèn ở lối rẽ hẹp. Ý kiến được ghi nguyên văn rồi đánh số để dễ tra cứu.',
    'Thư tổng hợp gửi kèm phụ lục (sơ đồ A, bảng B, ảnh C). Dòng cuối ghi: "Các số liệu trên phản ánh hiện trạng tại thời điểm khảo sát."',
    'Sáng hôm sau, nhóm quay lại kiểm tra những vị trí còn thiếu. Sương vẫn đọng trên thảm cỏ; vài đoạn ngắn cần được đo lại do vạch phấn đã nhòe.',
  ].join(' '),
};
