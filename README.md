# Device Lab

Nền tảng kiểm tra thiết bị cục bộ trên trình duyệt, song ngữ Việt/Anh. Phase 1 có 21 công cụ: 11 màn hình, 5 bàn phím và 5 chuột. Không tài khoản, database hoặc upload sự kiện thiết bị.

## Chạy phát triển

Yêu cầu Node.js 24 LTS và pnpm 11.25.0.

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Mở [bản Việt](http://localhost:3000/vi) hoặc [bản Anh](http://localhost:3000/en). `/` ưu tiên ngôn ngữ đã chọn, mặc định Việt. Language switcher giữ nguyên công cụ.

## Kiểm tra và production

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm exec playwright install chromium firefox webkit
pnpm build
pnpm test:e2e
pnpm start
```

`pnpm start` chạy server standalone và sao chép static assets cần thiết. Dừng dev server trước khi chạy production/E2E release. Docker dùng trực tiếp `node server.js` trong image.

```bash
docker compose config --quiet
docker compose up -d --build --wait
docker compose exec nginx nginx -t
```

Trước khi triển khai, đặt `SITE_URL` bằng origin thực trong `.env`, đọc `docs/DEPLOYMENT.md` về HTTPS và rollback. Không có hạ tầng ngoài nào được triển khai tự động bởi dự án này.

## Kiến trúc và tài liệu

```text
src/app/[locale]/       Trang server, nội dung SEO và route VI/EN
src/components/        Layout, UI shadcn/ui và khung công cụ
src/features/          Engine screen / keyboard / mouse tải riêng
src/lib/tools/         Registry duy nhất cho 21 công cụ
src/lib/measurements/  Thuật toán thuần và sample buffers
src/lib/browser/       Feature detection và thông tin browser
src/lib/storage/       Preferences, tóm tắt opt-in và dữ liệu phiên
src/messages/          Bản dịch đầy đủ VI / EN
tests/                 Unit, integration và E2E
deploy/                Nginx và HTTPS template
docs/                  Đặc tả, tiến độ, kiểm thử và vận hành
scripts/               Standalone start và công cụ QA tái lập
```

- `docs/ARCHITECTURE.md`: mô-đun và nguyên tắc thiết kế.
- `docs/TOOL_SPECIFICATIONS.md`: danh sách 21 phép thử và roadmap 55 khả năng.
- `docs/TESTING.md`: tự động, thủ công và ma trận phần cứng.
- `docs/PROGRESS.md`: kết quả thực tế từng milestone.
- `docs/DEPLOYMENT.md`: cài đặt, HTTPS, nâng cấp, rollback và log.
- `docs/RELEASE_CHECKLIST.md`: điều kiện trước phát hành.
- `docs/ACCEPTANCE.md`: kết luận rà soát Phase 1, phân loại phần đã xác minh và còn mở.
- `docs/PERFORMANCE.md` và `docs/qa/performance.json`: ba lượt đo sạch/trang, raw metrics và median trước/sau.

## Giới hạn đo lường

CSS dimensions không xác nhận native resolution. RAF và pointer events chỉ cho phép ước tính mà browser quan sát được. Pixel/hở sáng/Ghosting cần người dùng nhìn màn hình. Không chẩn đoán switch hỏng, chứng nhận NKRO hoặc xác nhận USB Polling Rate. Các giới hạn riêng luôn có trên từng trang.

Lighthouse và E2E không thay thế kiểm tra phần cứng thật. Trạng thái xác minh cuối cùng được ghi trong `docs/PROGRESS.md`; không coi cấu hình Docker hợp lệ là bằng chứng image đã chạy thành công.
