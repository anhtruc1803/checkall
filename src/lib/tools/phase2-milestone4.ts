import type { Tool } from './types';
const details = {
  D03: {
    vi: {
      description: 'Kiểm tra microphone qua mức tín hiệu và dạng sóng trực tiếp.',
      instructions:
        'Bấm Bắt đầu, cho phép microphone rồi nói vào mic. Dừng để kết thúc; rời tab hoặc sau 60 giây, phiên sẽ tự dừng.',
      limitations:
        'Mức tín hiệu không phải độ lớn âm thanh thực tế hoặc đánh giá chất lượng mic. Mute, lọc tiếng ồn và cài đặt hệ thống có thể ảnh hưởng; im lặng chưa chứng minh mic hỏng.',
      method:
        'Phân tích mức trung bình RMS, mức đỉnh và dạng sóng của âm thanh đầu vào; không phát lại hoặc ghi âm.',
    },
    en: {
      description: 'Check your microphone using live signal levels and a waveform.',
      instructions:
        'Select Start, allow microphone access and speak into the mic. Stop ends the test; leaving the tab or reaching 60 seconds stops it automatically.',
      limitations:
        'Signal levels are not physical loudness or a microphone quality rating. Mute, noise filtering and system settings may affect them; silence does not establish a broken mic.',
      method: 'Analyzes the input’s RMS level, peak and waveform without playback or recording.',
    },
  },
  D05: {
    vi: {
      description: 'Xem các dải tần số trong âm thanh microphone trực tiếp.',
      instructions:
        'Bấm Bắt đầu, cho phép microphone rồi nói hoặc tạo âm thanh. Quan sát phổ và tần số nổi bật; Dừng để kết thúc.',
      limitations:
        'Tần số nổi bật chỉ là ước tính, không chắc là cao độ của giọng nói. Không dùng để kiểm tra thính lực hoặc đo đáp tuyến microphone.',
      method:
        'Phân tích FFT để chia tín hiệu thành các dải tần và hiển thị dải nổi bật. Độ chi tiết phụ thuộc tốc độ lấy mẫu.',
    },
    en: {
      description: 'View the frequency bands in live microphone audio.',
      instructions:
        'Select Start, allow the microphone and speak or make a sound. Observe the spectrum and strongest frequency; Stop ends the test.',
      limitations:
        'The strongest frequency is an estimate, not necessarily the pitch of a voice. This is not a hearing test or microphone frequency-response measurement.',
      method:
        'Uses FFT analysis to display frequency bands and the strongest bin. Detail depends on the audio sample rate.',
    },
  },
};
export function publishMilestone4(tool: Tool): Tool {
  if (!(tool.id in details)) return tool;
  const copy = details[tool.id as keyof typeof details];
  return {
    ...tool,
    status: 'published',
    seo: { index: true },
    requiredCapabilities: [],
    optionalCapabilities: ['secureContext', 'mediaDevices', 'audioContext', 'permissions'],
    relatedTools: ['D01', 'D02', 'D03', 'D04', 'D05'].filter((id) => id !== tool.id),
    copy: { vi: { ...tool.copy.vi, ...copy.vi }, en: { ...tool.copy.en, ...copy.en } },
  };
}
