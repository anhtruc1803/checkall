import type { Tool } from './types';

const copy = {
  D01: {
    vi: {
      description: 'Phát âm thử để kiểm tra loa hoặc tai nghe đang được chọn.',
      instructions:
        'Giảm âm lượng hệ thống, chọn mức thấp rồi bấm Bắt đầu. Nghe thử và bấm Dừng nếu khó chịu. Tín hiệu tự dừng sau 10 giây hoặc khi rời tab.',
      limitations:
        'Bạn cần tự nghe xác nhận. Trạng thái phát không bảo đảm loa có tiếng; kiểm tra mute và thiết bị đầu ra nếu không nghe được.',
      method: 'Phát âm sine 440 Hz qua thiết bị đầu ra hiện tại; không sử dụng microphone.',
    },
    en: {
      description: 'Play a test tone through your selected speakers or headphones.',
      instructions:
        'Lower system volume, choose a low level and select Start. Listen and stop if uncomfortable. Playback stops after 10 seconds or when you leave the tab.',
      limitations:
        'Confirm audibility by listening. Playback status does not guarantee sound; check mute and the selected output if you hear nothing.',
      method: 'Plays a 440 Hz sine tone through the current output without using the microphone.',
    },
  },
  D02: {
    vi: {
      description:
        'Phát tín hiệu vào kênh trái, phải hoặc cả hai để tự kiểm tra định tuyến stereo.',
      instructions:
        'Dùng tai nghe hoặc hai loa, giảm âm lượng hệ thống rồi chọn Trái, Phải hoặc Cả hai và bấm Bắt đầu. Có thể đổi kênh khi đang phát. Mỗi phiên tối đa 10 giây, Dừng hoặc rời tab để kết thúc.',
      limitations:
        'Mono output, spatial audio, driver hoặc thiết lập hệ thống có thể trộn kênh. Browser không xác nhận phía tai nghe bạn đang nghe, sơ đồ dây hay chất lượng loa; cần nghe kiểm chứng thực tế.',
      method: 'Phát cùng âm thử 440 Hz riêng vào kênh trái, phải hoặc cả hai theo lựa chọn.',
    },
    en: {
      description:
        'Send a test signal to the left, right or both channels to manually check stereo routing.',
      instructions:
        'Use headphones or two speakers, lower system volume, choose Left, Right or Both and select Start. Channels can change during playback. Sessions last at most 10 seconds; Stop or leaving the tab ends playback.',
      limitations:
        'Mono output, spatial audio, drivers or system settings may mix channels. The browser cannot verify which ear you hear, wiring or speaker quality; listening with real equipment is required.',
      method: 'Sends the same 440 Hz test tone to the left, right or both channels as selected.',
    },
  },
  D04: {
    vi: {
      description:
        'Tạo tín hiệu âm thanh từ 20 đến 20.000 Hz với dạng sóng và mức biên độ do bạn chọn.',
      instructions:
        'Giảm âm lượng hệ thống, chọn tần số và dạng sóng rồi bấm Bắt đầu. Có thể đổi khi đang phát. Dừng nếu khó chịu; phiên tự kết thúc sau 10 giây hoặc khi rời tab.',
      limitations:
        'Tần số là thiết lập tín hiệu, không phải phép đo âm thanh thực tế. Không dùng để kiểm tra thính lực hoặc đo đáp tuyến loa. Khả năng phát tần số cao tùy trình duyệt và thiết bị.',
      method:
        'Tạo âm theo tần số, dạng sóng và mức tín hiệu bạn chọn trong phạm vi trình duyệt hỗ trợ.',
    },
    en: {
      description:
        'Generate an audio signal from 20 to 20,000 Hz with selectable waveform and digital amplitude.',
      instructions:
        'Lower system volume, choose a frequency and waveform, then select Start. Settings can change during playback. Stop if uncomfortable; sessions end after 10 seconds or when you leave the tab.',
      limitations:
        'Frequency is a signal setting, not a physical sound measurement. Do not use this as a hearing test or a speaker frequency-response measurement. High-frequency output depends on the browser and device.',
      method:
        'Generates audio at your selected frequency, waveform and signal level within the browser’s supported range.',
    },
  },
};
export function publishMilestone3(tool: Tool): Tool {
  if (!(tool.id in copy)) return tool;
  const details = copy[tool.id as keyof typeof copy];
  return {
    ...tool,
    status: 'published',
    seo: { index: true },
    relatedTools: ['D01', 'D02', 'D04'].filter((id) => id !== tool.id),
    copy: { vi: { ...tool.copy.vi, ...details.vi }, en: { ...tool.copy.en, ...details.en } },
  };
}
