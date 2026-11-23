# Hệ thống giao diện Device Lab

Hướng đã được người dùng chọn ngày 23/11/2026: **bảng điều khiển kỹ thuật, rõ nét và có chiều sâu**. Áp dụng UI/UX Pro Max và Hallmark cho lớp trình bày; giữ Registry, route, quyền, engine và dữ liệu thực tế.

## Cấu trúc

- Trang công cụ: Workbench. Tiêu đề ngắn, chuyển công cụ cùng nhóm, điều khiển, vùng thử/nhập liệu, kết quả và hướng dẫn.
- Tiện ích: nhập ở trái, kết quả ở phải khi đủ rộng; trên mobile giữ thứ tự nhập → kết quả theo DOM.
- Danh mục Tiện ích chia theo Số và tiền, Văn bản, Đơn vị và ngày. Tên thẻ 18 px và mô tả riêng 16 px ở cỡ chữ mặc định. Desktop dùng hai cột thẻ, còn mobile dùng một cột và đặt tên nhóm phía trên.
- Danh mục và mục nổi bật dùng thẻ chung với icon riêng, hình minh họa tĩnh và câu mô tả ngắn VI/EN. Trang công cụ lặp lại icon và đặt hình minh họa cạnh tiêu đề khi đủ chỗ. Hình minh họa dùng CSS, icon và ký hiệu ví dụ.
- Thiết bị: toolbar rõ ràng, vùng tương tác riêng, thông số có nhãn và đơn vị. Camera trống có hướng dẫn ngay trong vùng xem trước.
- Trang chủ: ô tìm công cụ và lối tắt theo vấn đề xuất hiện đầu trang. Hai khối nằm cạnh nhau trên desktop và xếp theo thứ tự tìm kiếm → vấn đề trên mobile. Danh mục, thông tin thiết bị và hình minh họa nằm ở các phần tiếp theo.
- Điều hướng: tách danh mục Kiểm tra thiết bị và liên kết Tiện ích. Mục xổ xuống dùng liên kết thường, đóng khi nhấn Esc hoặc khi focus ra ngoài. Nút tìm trên Header vẫn có phím tắt Ctrl/⌘+K.

## Màu và chữ

Giữ nhận diện xanh, Geist Variable cho giao diện và Geist Mono Variable cho số đo. Tokens chung ở `tokens.css`; màu mới dùng OKLCH và ánh xạ riêng cho Dark/Light. Màu mẫu kiểm tra màn hình RGB và canvas đo được giữ nguyên.

Không thêm font, ảnh nền hoặc thư viện animation. Dùng icon Lucide có sẵn; icon trang trí ẩn khỏi accessibility tree. Không dùng số liệu giả, mô phỏng waveform hoặc camera/gamepad đang hoạt động khi chưa có dữ liệu.

## Khoảng cách và trạng thái

Thang 4px hiện có: 4/8/16/24/32/48/72px qua các token `--space-*`. Button/input tối thiểu 44px. Border không đổi độ dày khi focus. Giữ focus ring tức thì, nhãn visible, lỗi `aria-invalid`/`aria-describedby`, loading/disabled/success từ trạng thái engine thực tế.

Hover chỉ tăng phản hồi nhẹ, transform/opacity; không animation lặp hoặc entrance che nội dung. Reduced motion bỏ chuyển động không cần thiết. Không sticky toolbar che focus, không capture phím ngoài vùng thử.

## Responsive và nội dung

Từ 960px trở xuống bỏ chia đôi tiện ích. Mobile 320px và chữ 200% phải đọc/điều khiển được; tên VI/EN dài được phép xuống dòng khi cần accessibility. Chỉ sơ đồ bàn phím, bảng dữ liệu và thanh chuyển công cụ có cuộn cục bộ. Không giấu hướng dẫn, giới hạn, SEO hoặc chức năng để làm giao diện gọn.

## Phạm vi file

Chỉnh template route công cụ, component kết quả/điều khiển, JSX bọc vùng nhập/kết quả và CSS của tiện ích, camera, bàn phím. Trang chủ và Header dùng CSS Module theo phạm vi trong `home-discovery.module.css`, `problem-chooser.module.css` và `header.module.css`. Các lớp này dùng chung token, nhãn VI/EN và kiểm thử hồi quy giao diện.

## Nguồn định hướng

UI/UX Pro Max xác nhận phong cách dashboard kỹ thuật, typography số liệu và Server Components. Kết quả tìm kiếm pattern landing page không phù hợp trang công cụ nên không áp dụng. Giữ font local hiện có để tránh tải mới. Hallmark dùng nhánh redesign ứng dụng, tông technical và genre modern-minimal; các trang chia sẻ cùng hệ thống.

## Kiểm tra nghiệm thu local

Xem trước/sau ở desktop/mobile, VI/EN, Dark/Light; kiểm tra empty/active/error/disabled/result, reflow 320px/chữ 200%, keyboard focus và reduced motion. Chạy typecheck, lint, unit, build, HTTP smoke và E2E phù hợp. Phân biệt lỗi môi trường Windows có Kaspersky; không giảm assertion. Chưa push hoặc triển khai từ lượt duyệt local.

## Các dạng token dùng lại

`tokens.css` là nguồn thật và đã được import ở đầu stylesheet ứng dụng. Các trích đoạn sau chỉ ánh xạ vai trò tương đương để dùng lại, không nạp thêm vào sản phẩm.

### CSS

```css
:root {
  --color-workbench-inset: oklch(17% 0.018 258);
  --color-result-surface: oklch(20% 0.035 258);
  --color-result-edge: oklch(43% 0.07 258);
  --space-lg: 24px;
  --font-body: 'Geist Variable', sans-serif;
}
```

### Tailwind v4

```css
@theme inline {
  --color-workbench: var(--color-workbench-inset);
  --color-result: var(--color-result-surface);
  --font-sans: var(--font-body);
  --spacing-panel: var(--space-lg);
}
```

### DTCG

```json
{
  "workbench": {
    "$type": "color",
    "$value": { "colorSpace": "oklch", "components": [0.17, 0.018, 258] }
  },
  "panelSpace": { "$type": "dimension", "$value": { "value": 24, "unit": "px" } }
}
```

### shadcn/ui

```css
:root {
  --background: var(--color-bg);
  --foreground: var(--color-ink);
  --card: var(--color-surface);
  --primary: var(--color-primary);
  --primary-foreground: var(--color-primary-ink);
  --ring: var(--color-focus);
}
```
