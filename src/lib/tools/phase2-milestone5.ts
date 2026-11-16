import type { Tool } from './types';
const details = {
  E01: {
    vi: {
      description: 'Xem trước video webcam cục bộ sau khi bạn cho phép camera.',
      method: 'Hiển thị video từ camera bạn cho phép; không sử dụng microphone hoặc ghi hình.',
    },
    en: {
      description: 'Preview a local webcam video after allowing camera access.',
      method:
        'Displays video from the camera you allow, without using the microphone or recording.',
    },
  },
  E02: {
    vi: {
      description: 'Xem kích thước video và độ phân giải luồng camera hiện tại.',
      method: 'Đối chiếu kích thước video đang hiển thị với cấu hình luồng camera được báo.',
    },
    en: {
      description: 'View video dimensions and the current camera stream resolution.',
      method: 'Compares displayed video dimensions with the reported camera stream settings.',
    },
  },
  E03: {
    vi: {
      description: 'Ước tính FPS video đang hiển thị và so sánh với FPS luồng được báo.',
      method:
        'Tính FPS từ số khung video mới trong khoảng ít nhất 2 giây. Không đủ dữ liệu hoặc trình duyệt không hỗ trợ thì hiện —.',
    },
    en: {
      description: 'Estimate displayed video FPS and compare it with the reported stream FPS.',
      method:
        'Calculates FPS from new video frames over at least 2 seconds. Displays — when data or browser support is insufficient.',
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
          'Bấm Bắt đầu và cho phép camera. Dừng để tắt camera; rời tab hoặc sau 60 giây, phiên tự kết thúc. Nếu hộp quyền còn mở, hãy chọn cho phép hoặc từ chối trước khi thử lại.',
        limitations:
          'Kết quả phản ánh luồng video hiện tại, không phải độ phân giải tối đa hay thông số cảm biến. Ánh sáng, tải máy và Refresh Rate có thể ảnh hưởng FPS.',
      },
      en: {
        ...tool.copy.en,
        ...copy.en,
        instructions:
          'Select Start and allow the camera. Stop turns it off; leaving the tab or reaching 60 seconds ends the session. If the permission prompt is still open, allow or deny it before trying again.',
        limitations:
          'Results describe the current video stream, not maximum resolution or sensor specifications. Lighting, system load and display Refresh Rate can affect FPS.',
      },
    },
  };
}
