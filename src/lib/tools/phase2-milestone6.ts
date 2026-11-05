import type { Tool } from './types';
const details = {
  F01: {
    vi: {
      description: 'Quan sát nút bấm, giá trị analog và các trục của tay cầm do browser cung cấp.',
      method:
        'Sau Bắt đầu, đọc navigator.getGamepads mỗi requestAnimationFrame, cập nhật UI tối đa 8 Hz. Hiển thị index, ID/mapping do browser báo, pressed/touched/value của từng nút và giá trị trục thô; không gọi haptics hoặc enumerate khi idle.',
    },
    en: {
      description: 'Observe gamepad buttons, analog values and axes supplied by the browser.',
      method:
        'After Start, reads navigator.getGamepads on requestAnimationFrame and updates the UI at up to 8 Hz. Shows browser-reported index, ID/mapping, button pressed/touched/value and raw axes. No haptics or idle enumeration.',
    },
  },
  F02: {
    vi: {
      description:
        'Xem tọa độ analog stick và quỹ đạo quan sát gần nhất, với cặp trục được chọn rõ ràng.',
      method:
        'Mapping standard mặc định trục 0/1; trục 2/3 có thể chọn cho stick phải. Mapping khác yêu cầu chọn cặp trục. Đồ thị dùng giá trị thô [-1,1], Y dương hướng xuống, giữ tối đa 120 điểm; vòng deadzone tham chiếu chỉ để hiển thị, không sửa dữ liệu.',
    },
    en: {
      description:
        'View analog stick coordinates and a recent observation trail for an explicitly selected axis pair.',
      method:
        'Standard mapping defaults to axes 0/1; axes 2/3 can be selected for the right stick. Other mappings require an explicit pair. The plot uses raw [-1,1] values with positive Y down and at most 120 points. The reference deadzone is visual only and never modifies input.',
    },
  },
  F03: {
    vi: {
      description:
        'Thống kê độ lệch tọa độ analog stick trong cửa sổ nghỉ do bạn chủ động bắt đầu.',
      method:
        'Sau Bắt đầu và chọn trục, bấm Đo vị trí nghỉ, buông stick: chờ ổn định 1 giây rồi lấy quan sát trong 5 giây. Hiển thị mean X/Y, mean/RMS/max bán kính, tỷ lệ ngoài deadzone tham chiếu và số quan sát. Cần ≥30 quan sát trải ≥4,5 giây; mẫu lỗi hoặc khoảng poll >250 ms làm hủy phép đo. Không tự bù offset hoặc chẩn đoán hỏng.',
    },
    en: {
      description:
        'Summarize analog stick coordinate offsets over a rest window you explicitly start.',
      method:
        'After Start and axis selection, select Measure rest position and release the stick: 1-second settling followed by 5 seconds of observations. Shows mean X/Y, mean/RMS/max radius, fraction outside the reference deadzone and observation count. Requires ≥30 observations spanning ≥4.5 seconds; invalid data or a polling gap >250 ms invalidates the run. No automatic bias correction or fault diagnosis.',
    },
  },
};
export function publishMilestone6(tool: Tool): Tool {
  if (!(tool.id in details)) return tool;
  const copy = details[tool.id as keyof typeof details];
  return {
    ...tool,
    status: 'published',
    seo: { index: true },
    requiredCapabilities: [],
    optionalCapabilities: ['secureContext', 'gamepad', 'animationFrame'],
    relatedTools: ['F01', 'F02', 'F03', 'G02'].filter((id) => id !== tool.id),
    copy: {
      vi: {
        ...tool.copy.vi,
        ...copy.vi,
        instructions:
          'Kết nối tay cầm, bấm Bắt đầu rồi nhấn nút trên tay cầm để browser nhận thiết bị. Chọn thiết bị/cặp trục cần xem. Dừng/Reset, rời tab/mất focus, ngắt kết nối hoặc hết 120 giây sẽ xóa dữ liệu và dọn polling/listener. Đổi thiết bị/trục/deadzone tham chiếu xóa kết quả drift cũ.',
        limitations:
          'Chỉ quan sát Gamepad API; không chứng nhận drift phần cứng, USB Polling Rate, latency, calibration hoặc chất lượng tay cầm. Driver/browser có thể áp dụng mapping/deadzone và che thiết bị tới khi có tương tác. Các lần poll có thể lặp cùng dữ liệu, không phải mẫu phần cứng độc lập. Không lưu ID/log/history, upload hoặc kích hoạt rung.',
      },
      en: {
        ...tool.copy.en,
        ...copy.en,
        instructions:
          'Connect a controller, select Start, then press a controller button so the browser can expose it. Select the device and axis pair. Stop/Reset, leaving the tab/focus loss, disconnection or the 120-second limit clears data and polling/listeners. Changing device, axes or reference deadzone clears previous drift results.',
        limitations:
          'Observes the Gamepad API; does not certify hardware drift, USB polling rate, latency, calibration or controller quality. Drivers/browsers may apply mapping/deadzones and hide devices until interaction. Polls may repeat the same data and are not independent hardware samples. No stored IDs/logs/history, upload or vibration.',
      },
    },
  };
}
