import type { Tool } from './types';

const copy = {
  D01: {
    vi: {
      description:
        'Phát tín hiệu sine 440 Hz để bạn tự kiểm tra âm thanh từ loa hoặc tai nghe đang được hệ điều hành chọn.',
      instructions:
        'Giảm âm lượng hệ thống trước, chọn mức tín hiệu thấp rồi bấm Bắt đầu. Nghe thử ở hai kênh; Dừng kết thúc ngay. Mỗi phiên tự dừng sau 10 giây, rời tab hoặc mất focus cũng dừng.',
      limitations:
        'Bạn cần tự xác nhận âm thanh nghe được. Trạng thái phát chỉ mô tả Web Audio, không xác nhận loa hoạt động, âm lượng dB SPL, độ méo hay đáp tuyến. Thiết bị có thể mute, chuyển output hoặc downmix.',
      method:
        'Tạo AudioContext sau thao tác Bắt đầu, dùng OscillatorNode sine 440 Hz và GainNode với mức mặc định 3%, tối đa 20% biên độ số. Không thu microphone, enumerate thiết bị, lưu hoặc upload âm thanh.',
    },
    en: {
      description:
        'Play a 440 Hz sine signal to manually check the speakers or headphones selected by your operating system.',
      instructions:
        'Lower system volume first, choose a low signal level and select Start. Listen to both channels; Stop ends playback. Sessions stop after 10 seconds, on focus loss or when the tab is hidden.',
      limitations:
        'You must confirm audibility yourself. Playback status describes Web Audio only, not working speakers, dB SPL, distortion or frequency response. The device may be muted, rerouted or downmixed.',
      method:
        'Creates an AudioContext only after Start, with a 440 Hz sine OscillatorNode and GainNode at 3% default, capped at 20% digital amplitude. No microphone capture, device enumeration, audio storage or upload.',
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
      method:
        'OscillatorNode sine 440 Hz đi qua GainNode riêng cho hai kênh, ghép vào input 0/1 của ChannelMergerNode. Gain chuyển mượt, output chỉ khởi tạo sau Bắt đầu; không yêu cầu quyền microphone.',
    },
    en: {
      description:
        'Send a test signal to the left, right or both channels to manually check stereo routing.',
      instructions:
        'Use headphones or two speakers, lower system volume, choose Left, Right or Both and select Start. Channels can change during playback. Sessions last at most 10 seconds; Stop or leaving the tab ends playback.',
      limitations:
        'Mono output, spatial audio, drivers or system settings may mix channels. The browser cannot verify which ear you hear, wiring or speaker quality; listening with real equipment is required.',
      method:
        'A 440 Hz sine OscillatorNode feeds separate channel GainNodes into inputs 0/1 of a ChannelMergerNode. Gain transitions are smoothed and output starts only after Start. No microphone permission is requested.',
    },
  },
  D04: {
    vi: {
      description:
        'Tạo tín hiệu âm thanh từ 20 đến 20.000 Hz với dạng sóng và mức biên độ do bạn chọn.',
      instructions:
        'Giảm âm lượng hệ thống, chọn tần số và dạng sóng rồi bấm Bắt đầu. Có thể thay đổi khi phát; giới hạn tần số còn phụ thuộc sample rate của AudioContext. Dừng, Reset, rời tab hoặc hết 10 giây sẽ kết thúc.',
      limitations:
        'Tần số hiển thị là cấu hình tín hiệu, không phải đo đầu ra vật lý. Sample rate thuộc AudioContext, không xác nhận DAC. Không dùng kết quả làm bài kiểm tra thính lực hoặc xác nhận đáp tuyến loa; sóng khác sine có harmonic và có thể bị giới hạn bởi browser.',
      method:
        'Web Audio OscillatorNode hỗ trợ sine, triangle, square và sawtooth, gain mặc định 0,03 và tối đa 0,2. Chỉ chấp nhận 20–20.000 Hz và dưới Nyquist của context thực tế; không phát tự động, không thu âm hoặc lưu log.',
    },
    en: {
      description:
        'Generate an audio signal from 20 to 20,000 Hz with selectable waveform and digital amplitude.',
      instructions:
        'Lower system volume, select frequency and waveform, then select Start. Settings can change during playback; frequency is also bounded by the AudioContext sample rate. Stop, Reset, leaving the tab or the 10-second limit ends playback.',
      limitations:
        'The displayed frequency is a signal setting, not a physical output measurement. Context sample rate does not establish DAC specifications. This is not a hearing test or speaker frequency-response measurement; non-sine waveforms contain harmonics and may be browser-limited.',
      method:
        'Uses a Web Audio OscillatorNode with sine, triangle, square and sawtooth, default gain 0.03 and maximum 0.2. Accepts 20–20,000 Hz below the actual context Nyquist frequency. No autoplay, recording or event logging.',
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
