import type { Tool } from './types';
const details = {
  F01: {
    vi: {
      description: 'Quan sát nút bấm, giá trị analog và các trục của tay cầm do browser cung cấp.',
      method:
        'Hiển thị trạng thái từng nút và giá trị các trục mà trình duyệt nhận được từ tay cầm.',
    },
    en: {
      description: 'Observe gamepad buttons, analog values and axes supplied by the browser.',
      method: 'Shows button states and axis values received from the controller by the browser.',
    },
  },
  F02: {
    vi: {
      description: 'Quan sát tọa độ và đường di chuyển của analog stick.',
      method:
        'Vẽ vị trí của cặp trục đã chọn. Vòng deadzone chỉ để đối chiếu, không thay đổi dữ liệu hoặc cài đặt tay cầm.',
    },
    en: {
      description: 'Observe analog stick coordinates and movement trails.',
      method:
        'Plots the selected axis pair. The deadzone circle is a visual reference and changes neither data nor controller settings.',
    },
  },
  F03: {
    vi: {
      description: 'Kiểm tra mức lệch của analog stick khi bạn buông tay.',
      method:
        'Chờ ổn định 1 giây rồi quan sát vị trí nghỉ trong 5 giây. Tổng hợp độ lệch so với tâm; cần dữ liệu liên tục để có kết quả.',
    },
    en: {
      description: 'Check analog stick offsets while your hands are off the stick.',
      method:
        'Waits 1 second to settle, then observes the rest position for 5 seconds. Summarizes distance from the center; continuous data is required.',
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
          'Kết nối tay cầm, bấm Bắt đầu rồi nhấn một nút để trình duyệt nhận thiết bị. Chọn tay cầm và cặp trục. Đổi tay cầm, trục hoặc deadzone sẽ xóa kết quả drift. Phiên tối đa 120 giây; Dừng hoặc rời tab sẽ kết thúc và xóa kết quả.',
        limitations:
          'Driver và trình duyệt có thể áp dụng mapping hoặc deadzone trước khi gửi dữ liệu. Kết quả không đo USB Polling Rate, độ trễ hoặc tự xác nhận tay cầm tốt/hỏng.',
      },
      en: {
        ...tool.copy.en,
        ...copy.en,
        instructions:
          'Connect a controller, select Start and press a controller button so the browser detects it. Choose a controller and axis pair. Changing controller, axes or deadzone clears drift results. Sessions last up to 120 seconds; Stop or leaving the tab ends the test and clears results.',
        limitations:
          'Drivers and browsers may apply mapping or deadzones before reporting data. Results do not measure USB Polling Rate or latency, or determine whether a controller is faulty.',
      },
    },
  };
}
