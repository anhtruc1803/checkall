import type { Tool } from './types';
const details = {
  E01: {
    vi: {
      description: 'Xem trước video webcam cục bộ sau khi bạn cho phép camera.',
      method:
        'getUserMedia({video:true,audio:false}) và video muted/playsInline; không ghi hình, đọc pixel, enumerate thiết bị, lưu lịch sử hoặc upload video.',
    },
    en: {
      description: 'Preview a local webcam video after allowing camera access.',
      method:
        'Uses getUserMedia({video:true,audio:false}) with muted/playsInline video. No recording, pixel reading, device enumeration, history or video upload.',
    },
  },
  E02: {
    vi: {
      description: 'Đọc kích thước video và độ phân giải luồng camera do browser báo.',
      method:
        'Đọc videoWidth/videoHeight của video và width/height từ MediaStreamTrack.getSettings mỗi 250 ms. Đây là cấu hình luồng hiện tại, không phải độ phân giải tối đa hoặc độ phân giải cảm biến.',
    },
    en: {
      description:
        'Read video dimensions and the camera stream resolution reported by the browser.',
      method:
        'Reads videoWidth/videoHeight and width/height from MediaStreamTrack.getSettings every 250 ms. These describe the current stream, not maximum resolution or sensor resolution.',
    },
  },
  E03: {
    vi: {
      description:
        'Quan sát FPS khung video được browser đưa tới compositor và đối chiếu FPS luồng được báo.',
      method:
        'requestVideoFrameCallback: ΔpresentedFrames × 1000 / Δthời gian callback, cửa sổ ít nhất 2 giây. Không đếm requestAnimationFrame hoặc lấy FPS được báo làm FPS đo. Thiếu API, chưa đủ mẫu hoặc gián đoạn trên 2 giây sẽ không có kết quả đo.',
    },
    en: {
      description:
        'Observe video frame submissions to the browser compositor and compare reported stream FPS.',
      method:
        'requestVideoFrameCallback: ΔpresentedFrames × 1000 / Δcallback time over at least 2 seconds. Does not count requestAnimationFrame or use reported FPS as measured FPS. Missing API, insufficient samples or a gap over 2 seconds produces no reading.',
    },
  },
};
export function publishMilestone5(tool: Tool): Tool {
  if (!(tool.id in details)) return tool;
  const copy = details[tool.id as keyof typeof details];
  return {
    ...tool,
    status: 'published',
    seo: { index: true },
    requiredCapabilities: [],
    optionalCapabilities: ['secureContext', 'mediaDevices', 'permissions'],
    relatedTools: ['E01', 'E02', 'E03', 'G01', 'G02'].filter((id) => id !== tool.id),
    copy: {
      vi: {
        ...tool.copy.vi,
        ...copy.vi,
        instructions:
          'Bấm Bắt đầu và xử lý hộp hỏi quyền. Browser chọn cấu hình camera mặc định. Dừng/Reset, mất focus, ẩn trang, rời trang hoặc hết 60 giây sẽ giải phóng camera. Nếu hộp hỏi quyền còn mở, Dừng không đóng được hộp này; luồng cấp muộn sẽ được giải phóng.',
        limitations:
          'Chỉ quan sát luồng browser, không chứng nhận thông số cảm biến, FPS phần cứng, chất lượng hoặc độ trễ camera. Ánh sáng, driver, xử lý browser, tải máy và Refresh Rate có thể ảnh hưởng kết quả. Không có mẫu hợp lệ được hiển thị bằng dấu —; không dùng số liệu giả.',
      },
      en: {
        ...tool.copy.en,
        ...copy.en,
        instructions:
          'Select Start and respond to the permission prompt. The browser selects default camera settings. Stop/Reset, focus loss, a hidden page, navigation or the 60-second limit releases the camera. Stop cannot dismiss an open browser prompt; a late stream is released.',
        limitations:
          'Observes the browser stream; does not certify sensor specifications, hardware FPS, quality or camera latency. Lighting, drivers, browser processing, system load and display refresh rate can affect results. Invalid or unavailable readings are shown as —; no fabricated measurements.',
      },
    },
  };
}
