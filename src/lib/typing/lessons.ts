import type { TypingDifficulty } from './difficulty';

export const typingDurationMs = 60_000;

export const practiceLessons = {
  homeRow: { difficulty: 'easy', passage: 'asdf jkl; fdsa ;lkj as df jk l; fj dk sl a; asdf jkl;' },
  accents: {
    difficulty: 'easy',
    passage: 'Buổi sáng, bé Thảo mượn quyển sách ở thư viện rồi kể lại câu chuyện cho cả nhóm.',
  },
  shortNote: {
    difficulty: 'easy',
    passage: 'Mai nhớ mang áo mưa. Mình sẽ đợi bạn ở cổng rồi cùng đi bộ đến lớp.',
  },
  everyday: {
    difficulty: 'medium',
    passage:
      'Trước khi gửi thư, mình đọc lại từng câu, sửa các dấu còn thiếu và kiểm tra tên người nhận.',
  },
  market: {
    difficulty: 'medium',
    passage:
      'Sáng chủ nhật, mẹ ghé chợ mua bưởi, mướp và một bó rau ngót. Trên đường về, hai mẹ con dừng lại hỏi thăm bà Cúc ở cuối ngõ.',
  },
  weekend: {
    difficulty: 'medium',
    passage:
      'Nếu chiều mai trời tạnh, nhóm mình sẽ gặp nhau ở bến xe. Hãy mang theo một chai nước, một chiếc khăn và bản đồ khu triển lãm.',
  },
  schedule: {
    difficulty: 'hard',
    passage:
      'Lịch thứ Tư, 27/11: 8 giờ 30 họp nhóm; 10 giờ 15 gửi bảng dự thảo. Ghi rõ ba mục cần sửa (tiêu đề, dấu câu, định dạng) trước khi chuyển bản cuối.',
  },
  weather: {
    difficulty: 'hard',
    passage:
      'Gió bấc thổi qua triền dốc, luồn giữa những tán sồi ướt sũng. Cô hướng dẫn khẽ nhắc: "Đường trơn, mọi người đi chậm và giữ khoảng cách."',
  },
  receipt: {
    difficulty: 'hard',
    passage:
      'Phiếu số 08: nhận 24 quyển vở, 6 hộp bút chì và 12 thước kẻ. Người phụ trách kiểm đếm, đối chiếu từng mục rồi ghi chú: "Đã đủ, chuyển vào tủ số 3."',
  },
} as const satisfies Record<string, { difficulty: TypingDifficulty; passage: string }>;

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
