import { readFile, mkdir, writeFile } from 'node:fs/promises';
const read = async (label) =>
  JSON.parse(await readFile(`artifacts/performance/${label}/summary.json`, 'utf8'));
const before = await read('clean-before'),
  after = await read('clean-final');
const compact = (result) => ({
  baseUrl: result.baseUrl,
  certificatePinUsed: result.certificatePinUsed,
  median: result.median,
  runs: result.measurements.map(
    ({ path, run, clean, externalScripts, scores, metrics, settings }) => ({
      path,
      run,
      clean,
      externalScripts,
      scores,
      metrics,
      settings,
    }),
  ),
});
await mkdir('docs/qa', { recursive: true });
await writeFile(
  'docs/qa/performance.json',
  JSON.stringify({ date: '2026-10-29', before: compact(before), after: compact(after) }, null, 2) +
    '\n',
);
const number = (value, digits = 0) => value.toFixed(digits);
const rows = (result) =>
  result.measurements
    .map(
      (run) =>
        `| ${run.path} | ${run.run} | ${run.scores.performance} | ${number(run.metrics.fcpMs)} | ${number(run.metrics.lcpMs)} | ${number(run.metrics.tbtMs)} | ${number(run.metrics.cls, 5)} | ${number(run.metrics.jsBytes / 1024, 1)} |`,
    )
    .join('\n');
const summary = before.median
  .map((previous) => {
    const current = after.median.find((item) => item.path === previous.path);
    return `| ${previous.path} | ${previous.scores.performance} → ${current.scores.performance} | ${number(previous.metrics.lcpMs)} → ${number(current.metrics.lcpMs)} | ${number(previous.metrics.tbtMs)} → ${number(current.metrics.tbtMs)} | ${number(previous.metrics.jsBytes / 1024, 1)} → ${number(current.metrics.jsBytes / 1024, 1)} |`;
  })
  .join('\n');
const document = `# Performance Phase 1 — phép đo sạch ngày 29/10/2026

## Phương pháp và tính hợp lệ

Lighthouse 13.6.0, Chromium 156, mobile simulated, RTT 150 ms, throughput 1638,4 Kbps, CPU slowdown ×4. Mỗi lượt dùng một profile Chrome tạm mới, tắt extension; không chạy đồng thời E2E, build hoặc unit tests. Mỗi trang được đo ba lần, theo thứ tự luân phiên; không bỏ lượt xấu.

HTTP trên Windows vẫn bị Kaspersky chèn script và sửa CSP, kể cả profile mới và loopback. Origin HTTPS QA riêng \`https://127.0.0.1:3443\` đã được xác minh không có request ngoài origin, extension request hoặc CSP bị sửa. Chrome chỉ pin SPKI của chứng chỉ tự ký QA; không tắt phần mềm bảo vệ, không chặn request trong Lighthouse, không sửa trace hoặc điểm. Chứng chỉ/key QA nằm trong artifacts bị Git bỏ qua, không được commit. Điều này không xác minh chứng chỉ HTTPS công khai.

Baseline sạch dùng build ban đầu với SITE_URL cũ nên SEO 92 do canonical khác origin QA. Build sau đặt SITE_URL đúng origin QA và SEO 100. Cấu hình mạng/CPU/browser/origin của phép đo Performance không đổi; khác biệt canonical chỉ là cấu hình metadata đã được công khai ở đây. Bản raw JSON/HTML ở artifacts/performance/clean-before và clean-final; dữ liệu gọn có thể đối chiếu trong [qa/performance.json](qa/performance.json).

## Median trước và sau

| Trang | Performance | LCP (ms) | TBT (ms) | JS truyền tải (KiB) |
|---|---:|---:|---:|---:|
${summary}

## Từng lượt baseline sạch

| Trang | Lượt | Performance | FCP (ms) | LCP (ms) | TBT (ms) | CLS | JS (KiB) |
|---|---:|---:|---:|---:|---:|---:|---:|
${rows(before)}

## Từng lượt sau tối ưu

| Trang | Lượt | Performance | FCP (ms) | LCP (ms) | TBT (ms) | CLS | JS (KiB) |
|---|---:|---:|---:|---:|---:|---:|---:|
${rows(after)}

## Các nguyên nhân và thay đổi có bằng chứng

- Zod đầy đủ và metadata registry của cả 21 công cụ từng nằm trong bundle client dùng chung. Chuyển validation sang zod/mini, truyền chỉ mục tìm kiếm được sinh từ registry và chỉ truyền ba trường runtime cho engine. JS truyền tải giảm khoảng 21 KiB trên mỗi trang. Không bỏ validation, VI/EN, nội dung SEO hoặc chức năng.
- Hộp tìm kiếm không dựng 21 kết quả khi chưa mở. Catalog không prefetch hàng loạt engine chưa được chọn; các link và khả năng tìm kiếm vẫn đầy đủ.
- Một lượt baseline Keyboard có CLS 0,42352 do giao diện engine xuất hiện sau placeholder. Đợt tối ưu giữa có LCP median 3515 ms, trace chỉ rõ đoạn hướng dẫn capture được render muộn. HTML công cụ hiện prerender giao diện inert; chỉ mở tương tác sau capability detection. Không chạy phép đo phần cứng trên server. LCP median Keyboard cuối 1081 ms, CLS median 0.
- Catalog không nhận input trước hydration để tránh mất truy vấn trên WebKit. Device Overview không tạo canvas capability probe lặp lại theo timer.
- Không có ảnh truyền tải trong ba trang (0 byte). Font self-host giữ đủ ký tự Việt/Anh: median khoảng 93,1 KiB ở /vi, 52,7 KiB ở PPI tiếng Anh, 78,1 KiB ở Keyboard tiếng Việt. Không loại subset tiếng Việt để tăng điểm.

## Mục tiêu chưa đạt và giới hạn

PPI đạt median 95. Homepage 81 và Keyboard 83 vẫn dưới mục tiêu 90. TBT median còn 768 ms và 667 ms, tương ứng còn chi phí JavaScript/hydration và layout. Bundle framework lớn nhất khoảng 224 KiB chưa nén (70 KiB gzip), bên cạnh runtime React và các thành phần tương tác. JS toàn trang còn khoảng 190–201 KiB truyền tải. Môi trường có biến thiên CPU rõ rệt: lượt đầu homepage có FCP/LCP 4323 ms; Keyboard có TBT từ 255 đến 1704 ms. Các lượt này vẫn được giữ và median tính từ đủ ba lượt.

Accessibility, Best Practices và SEO đều 100 ở ba trang trong lượt đo cuối; CLS median từ 0 đến 0,00081, không được làm tròn thành “mọi lượt CLS bằng 0”. Điểm lab không thay thế dữ liệu thực địa, kiểm thử thiết bị hay việc nghiệm thu production. Cần tiếp tục kiểm tra startup/hydration trên Linux staging có CPU ổn định; chưa tuyên bố Performance 90+ cho toàn bộ Phase 1.

## Tái lập trên Windows

1. Tạo chứng chỉ tự ký QA (SAN localhost/127.0.0.1), lưu key.pem và cert.pem trong artifacts/qa-tls bằng OpenSSL; không đưa key vào Git hoặc trust store hệ thống.
2. Đặt SITE_URL=https://127.0.0.1:3443 khi build, chạy pnpm build và pnpm start.
3. Chạy node scripts/qa-https.mjs ở terminal khác; proxy chỉ bind loopback.
4. Chạy node scripts/probe-browser.mjs và kiểm tra HTTPS không có externalOrigins.
5. Chạy node scripts/lighthouse.mjs --label clean-final --runs 3. Script từ chối kết quả “sạch” nếu trace có external/injected script.

Trên Linux sạch có thể dùng --base-url http://127.0.0.1:3000 và SITE_URL tương ứng, không cần chứng chỉ QA. Không so sánh trực tiếp điểm từ hai máy khác nhau như cùng một điều kiện đo.

## Báo cáo lịch sử

Các điểm 75–81 trong bàn giao trước là một lượt đo HTTP bị chèn script, không phải median sạch. Chúng còn ở artifacts/lighthouse-baseline và báo cáo cũ, chỉ dùng để giải thích lịch sử. Một bộ đo giữa tối ưu được giữ tại artifacts/performance/clean-after, không thay thế bộ clean-final cuối cùng.
`;
await writeFile('docs/PERFORMANCE.md', document);
console.log('Wrote Vietnamese performance report and compact raw measurements.');
