import type { Tool } from './types';
const details = {
  D03: {
    vi: {
      description:
        'Quan sát RMS, peak và waveform của luồng microphone sau khi bạn cho phép truy cập.',
      instructions:
        'Bấm Bắt đầu và xử lý hộp hỏi quyền của browser, rồi nói hoặc tạo âm thanh gần microphone. Dừng hoặc Reset để giải phóng thiết bị. Mất focus, ẩn trang hoặc hết thời hạn 60 giây sẽ dừng phiên; Stop không thể đóng hộp hỏi quyền của browser.',
      limitations:
        'Mức tín hiệu là giá trị số/dBFS của luồng browser, không phải dB SPL, độ nhạy hoặc chứng nhận chất lượng microphone. AGC, echo cancellation, noise suppression, driver và mute hệ thống có thể thay đổi dữ liệu; im lặng không chứng minh thiết bị hỏng.',
      method:
        'getUserMedia chỉ yêu cầu audio sau Bắt đầu. MediaStreamAudioSourceNode nối AnalyserNode FFT 2048 để lấy RMS, peak và tỷ lệ mẫu có |x| ≥ 0,99 theo cửa sổ hiện tại. Không nối ra loa, không ghi file, phát lại, lưu lịch sử, enumerate thiết bị hoặc upload audio.',
    },
    en: {
      description: 'Observe RMS, peak and waveform from a microphone stream after granting access.',
      instructions:
        'Select Start and respond to the browser permission prompt, then speak or make a sound near the microphone. Stop or Reset releases it. Focus loss, a hidden page or the 60-second limit stops the session. Stop cannot dismiss the browser permission prompt.',
      limitations:
        'Levels describe digital stream amplitude/dBFS, not dB SPL, sensitivity or certified microphone quality. AGC, echo cancellation, noise suppression, drivers and system mute may change the data. Silence does not establish a broken device.',
      method:
        'Requests audio-only getUserMedia after Start. A MediaStreamAudioSourceNode feeds an AnalyserNode with FFT size 2048 for RMS, peak and the fraction of samples with |x| ≥ 0.99 in the current window. No speaker monitoring, recording, playback, history, device enumeration or audio upload.',
    },
  },
  D05: {
    vi: {
      description:
        'Xem phổ FFT trực tiếp của microphone và bin có mức tín hiệu lớn nhất trong vùng hiển thị.',
      instructions:
        'Bấm Bắt đầu, cho phép microphone rồi tạo tín hiệu. Đọc phổ 64 dải log từ 20 Hz tới min(20.000 Hz, Nyquist) cùng độ rộng bin thực tế. Dừng/Reset, rời tab hoặc hết thời hạn phiên sẽ giải phóng luồng và context.',
      limitations:
        'Bin mạnh nhất chỉ là ước lượng theo FFT, không khẳng định fundamental/pitch hay độ chính xác máy đo chuyên dụng. Dải không có bin không được nội suy. Sample rate thuộc AudioContext, dữ liệu chịu ảnh hưởng xử lý browser/OS và không đo đáp tuyến microphone hoặc thính lực.',
      method:
        'AnalyserNode FFT 2048, smoothing 0,6; đọc dữ liệu float mỗi 125 ms và lấy cực đại trong từng dải log. Chỉ hiển thị bin mạnh nhất khi RMS > 0,00001 và bin > −100 dBFS. Không tự phát tone, không lưu PCM/phổ vào storage hoặc gửi dữ liệu lên server.',
    },
    en: {
      description:
        'View a live microphone FFT spectrum and the strongest bin within the displayed frequency range.',
      instructions:
        'Select Start, allow microphone access and produce a signal. Read 64 logarithmic bands from 20 Hz to min(20,000 Hz, Nyquist), alongside actual bin spacing. Stop/Reset, leaving the tab or the session limit releases the stream and context.',
      limitations:
        'The strongest FFT bin is an approximation, not a confirmed fundamental/pitch or calibrated instrument reading. Empty bands are not interpolated. Context sample rate and browser/OS processing affect data; this does not measure microphone response or hearing.',
      method:
        'Uses an AnalyserNode with FFT size 2048 and smoothing 0.6, reading float data every 125 ms and taking maxima in log bands. The strongest bin is shown only for RMS > 0.00001 and a bin > −100 dBFS. No automatic tone generation, PCM/spectrum storage or server upload.',
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
