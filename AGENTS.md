<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Quy tắc dự án Device Lab

- Luôn trao đổi, báo cáo tiến độ và giải thích lỗi với người dùng bằng tiếng Việt.
- Viết tài liệu trong `docs/` bằng tiếng Việt; giữ thuật ngữ kỹ thuật thông dụng.
- Dùng tiếng Anh cho tên biến, API, type, file và route; giao diện phải đầy đủ VI/EN qua next-intl.
- Không trình bày ước tính browser như thông số phần cứng đã xác nhận; không tạo số liệu giả.
- Không upload sự kiện bàn phím/chuột; lịch sử chỉ lưu tóm tắt khi người dùng opt-in và bấm lưu.
- Kiểm tra `docs/PROGRESS.md` trước khi tiếp tục; cập nhật kết quả thật, lệnh đã chạy, phần còn thiếu sau mỗi milestone.
- Chạy typecheck, lint và các kiểm thử liên quan; không giảm yêu cầu kiểm thử để làm chúng đạt.
- Không triển khai hạ tầng thật khi chưa có yêu cầu rõ ràng của người dùng.
