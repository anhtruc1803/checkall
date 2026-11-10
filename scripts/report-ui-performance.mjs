import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    comparison: { type: 'string' },
    public: { type: 'string' },
    'comparison-run': { type: 'string' },
    'public-run': { type: 'string' },
    'windows-smoke': { type: 'string' },
  },
});
for (const key of ['comparison', 'public', 'comparison-run', 'public-run'])
  assert.ok(values[key], `Missing --${key}`);
const load = async (directory, label) =>
  JSON.parse(await readFile(join(directory, label, 'summary.json'), 'utf8'));
const before = await load(values.comparison, 'ui-before');
const after = await load(values.comparison, 'ui-after');
const production = await load(values.public, 'ui-public');
const rawPublic = JSON.parse(await readFile(join(values.public, 'ui-public', 'vi-1.json'), 'utf8'));
const date = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date(rawPublic.fetchTime));
const displayDate = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }).format(
  new Date(rawPublic.fetchTime),
);
const rawAfter = JSON.parse(
  await readFile(join(values.comparison, 'ui-after', 'vi-1.json'), 'utf8'),
);
const browserVersion = after.measurements[0].environment.hostUserAgent.match(
  /(?:HeadlessChrome|Chrome)\/([\d.]+)/,
)?.[1];
const windowsSmoke = values['windows-smoke']
  ? JSON.parse(await readFile(join(values['windows-smoke'], 'summary.json'), 'utf8'))
  : null;
const lastSmoke = windowsSmoke?.measurements.at(-1);
const smokeDetails = lastSmoke
  ? JSON.parse(
      await readFile(
        join(
          values['windows-smoke'],
          `${lastSmoke.path.slice(1).replaceAll('/', '-')}-${lastSmoke.run}.json`,
        ),
        'utf8',
      ),
    )
  : null;
const smokeWork = (group) =>
  smokeDetails?.audits['mainthread-work-breakdown'].details.items.find(
    (item) => item.group === group,
  )?.duration;
assert.equal(before.execution.githubRunId, after.execution.githubRunId);
assert.equal(after.sourceCommit, production.sourceCommit);
assert.equal(before.baseUrl, after.baseUrl);
assert.equal(production.baseUrl, 'https://nguyenanhtruc.io.vn');
assert.deepEqual(
  before.median.map((row) => row.path),
  after.median.map((row) => row.path),
);
assert.deepEqual(
  after.median.map((row) => row.path),
  production.median.map((row) => row.path),
);
assert.deepEqual(before.measurements[0].settings, after.measurements[0].settings);
for (const report of [before, after, production]) {
  assert.equal(report.measurements.length, 18);
  assert.ok(report.median.every((row) => row.runs === 3 && row.clean));
  assert.ok(report.measurements.every((row) => row.clean && row.externalScripts.length === 0));
  assert.ok(report.measurements.every((row) => Object.values(row.metrics).every(Number.isFinite)));
}
const compact = (report) => ({
  sourceCommit: report.sourceCommit,
  baseUrl: report.baseUrl,
  execution: report.execution,
  certificatePinUsed: report.certificatePinUsed,
  median: report.median,
  measurements: report.measurements.map(
    ({
      path,
      run,
      clean,
      pageVerified,
      lighthouseVersion,
      externalScripts,
      scores,
      metrics,
      environment,
      settings,
    }) => ({
      path,
      run,
      clean,
      pageVerified,
      lighthouseVersion,
      externalScripts,
      scores,
      metrics,
      settings,
      benchmarkIndex: environment.benchmarkIndex,
      browserUserAgent: environment.hostUserAgent,
    }),
  ),
});
const result = {
  date,
  threshold: 90,
  before: compact(before),
  after: compact(after),
  public: compact(production),
  windowsHarnessSmoke: windowsSmoke ? compact(windowsSmoke) : undefined,
  labMedianGoalMet: after.median.every((row) => row.scores.performance >= 90),
  publicMedianGoalMet: production.median.every((row) => row.scores.performance >= 90),
  comparisonRun: `https://github.com/anhtruc1803/checkall/actions/runs/${values['comparison-run']}`,
  publicRun: `https://github.com/anhtruc1803/checkall/actions/runs/${values['public-run']}`,
  bundle: { removedModule: 'tailwind-merge', moduleBytes: 27421, moduleGzipEstimateBytes: 8444 },
  limitations: [
    'Chỉ đo sáu trang đại diện ở trạng thái idle, không phải toàn bộ 80 route hoặc tải phần cứng khi chạy',
    'Public và loopback là hai môi trường khác nhau; chỉ cặp loopback được đo cùng VM',
    'Lighthouse không thay manual QA, field data hoặc Safari/thiết bị thật',
  ],
};
await writeFile('docs/qa/performance-ui.json', `${JSON.stringify(result, null, 2)}\n`);
const n = (value, digits = 0) => value.toFixed(digits);
const kib = (value) => n(value / 1024, 1);
const bounds = (report, key, digits = 0) =>
  `${n(Math.min(...report.median.map((row) => row.metrics[key])), digits)}–${n(Math.max(...report.median.map((row) => row.metrics[key])), digits)}`;
const ranges = (report) => {
  const values = report.measurements.map((row) => row.environment.benchmarkIndex);
  return `${n(Math.min(...values), 1)}–${n(Math.max(...values), 1)}`;
};
const medianRows = before.median
  .map((previous) => {
    const current = after.median.find((row) => row.path === previous.path);
    return `| ${previous.path} | ${previous.scores.performance} → ${current.scores.performance} | ${n(previous.metrics.fcpMs)} → ${n(current.metrics.fcpMs)} | ${n(previous.metrics.lcpMs)} → ${n(current.metrics.lcpMs)} | ${n(previous.metrics.tbtMs, 1)} → ${n(current.metrics.tbtMs, 1)} | ${kib(previous.metrics.jsBytes)} → ${kib(current.metrics.jsBytes)} |`;
  })
  .join('\n');
const publicRows = production.median
  .map(
    (row) =>
      `| ${row.path} | ${row.scores.performance} | ${n(row.metrics.fcpMs)} | ${n(row.metrics.lcpMs)} | ${n(row.metrics.tbtMs, 1)} | ${n(row.metrics.cls, 5)} | ${kib(row.metrics.jsBytes)} | ${kib(row.metrics.fontBytes)} | ${kib(row.metrics.imageBytes)} |`,
  )
  .join('\n');
const runs = (report) =>
  report.measurements
    .map(
      (row) =>
        `| ${row.path} | ${row.run} | ${row.scores.performance} | ${n(row.metrics.fcpMs)} | ${n(row.metrics.lcpMs)} | ${n(row.metrics.tbtMs, 1)} | ${n(row.metrics.cls, 5)} | ${kib(row.metrics.jsBytes)} | ${kib(row.metrics.fontBytes)} | ${kib(row.metrics.imageBytes)} |`,
    )
    .join('\n');
const tableHead =
  '| Trang | Lượt | P | FCP ms | LCP ms | TBT ms | CLS | JS KiB | Font KiB | Ảnh KiB |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |';
const marker = '<!-- HISTORICAL_PERFORMANCE_REPORT -->';
const existing = await readFile('docs/PERFORMANCE.md', 'utf8');
const history = (
  existing.includes(marker) ? existing.split(marker).slice(1).join(marker) : existing
).trim();
const document = `# Performance giao diện mới — ${displayDate}

## Kết quả và phạm vi

Source trước: ${before.sourceCommit}; source sau/đang phục vụ: ${after.sourceCommit}. Mục tiêu median mobile ≥90 trên sáu trang đại diện: **lab ${result.labMedianGoalMet ? 'đạt' : 'chưa đạt'}; HTTPS public ${result.publicMedianGoalMet ? 'đạt' : 'chưa đạt'}**. Không nhận đó là 80 route hoặc toàn bộ trạng thái phần cứng đã được benchmark. Phân loại Final Acceptance và hồi quy ở PROGRESS.md/TESTING.md.

Mỗi nhóm đủ 18 lượt: ba lần/trang, luân phiên sáu trang, không bỏ lượt xấu. Cặp trước/sau cùng job [${values['comparison-run']}](${result.comparisonRun}), cùng VM/browser/cấu hình; build cả hai trước khi đo, không chạy build/E2E đồng thời trong VM. [Public ${values['public-run']}](${result.publicRun}) là phép đo riêng qua domain/proxy sau triển khai. Không so điểm public với loopback như một điều kiện đo duy nhất.

Lighthouse ${rawAfter.lighthouseVersion}, Chromium ${browserVersion}, profile tạm mới mỗi lượt, extension tắt, trace không có Script ngoài origin hoặc dấu hiệu Kaspersky/chrome-extension. CI dùng --no-sandbox trong VM tạm; không thay cấu hình bảo vệ của máy Windows. Mobile simulated, RTT 150 ms, throughput 1638,4 Kbps, CPU slowdown ×4. Public xác minh TLS bình thường, không bỏ qua lỗi chứng chỉ. Môi trường/UA/throttling/benchmark từng lượt tại [qa/performance-ui.json](qa/performance-ui.json), raw JSON/HTML/browser log trong artifact CI. CPU benchmark trước ${ranges(before)}, sau ${ranges(after)}, public ${ranges(production)}; điểm lab vẫn có biến thiên.

## Median trước → sau, cùng VM

| Trang | Performance | FCP ms | LCP ms | TBT ms | JS truyền tải KiB |
| --- | ---: | ---: | ---: | ---: | ---: |
${medianRows}

## Median HTTPS public sau triển khai

| Trang | P | FCP ms | LCP ms | TBT ms | CLS | JS KiB | Font KiB | Ảnh KiB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${publicRows}

## Phân tích và thay đổi có bằng chứng

Bundle analyzer chỉ ra tailwind-merge trong chunk client dùng chung: 27421 byte module, 8444 byte gzip ước tính riêng module. Button chỉ dùng class CSS thuần; các class bổ sung là menu-toggle/command-trigger, cva đã tạo chuỗi đầy đủ. Bỏ lớp gọi cn thừa tại Button khiến module này không còn trong client graph. Utility cn giữ nguyên; không thay biến thể/kích thước/asChild hoặc thêm dependency. Số byte JS truyền tải trong bảng là phép đo network thực, khác với ước tính gzip riêng module.

Giữ nguyên 40 công cụ, engine/capability/permission/lifecycle, nội dung SEO/a11y, registry VI/EN và font. Không loại subset tiếng Việt hoặc đổi cách đo phần cứng. Các audit được chạy ở trạng thái idle; không tự cấp quyền microphone/camera/gamepad hay khởi chạy engine chỉ để lấy điểm. CSS/font vẫn được báo đầy đủ; ảnh ngoài được đo theo byte thực thay vì bỏ nội dung để nâng điểm.

Trong cặp cùng VM, JavaScript truyền tải giảm 9551 byte (khoảng 9,3 KiB) ở mỗi trang; điểm median giữ 99–100. FCP/LCP lab sau khoảng ${bounds(after, 'lcpMs')} ms, TBT ${bounds(after, 'tbtMs', 1)} ms. Public có FCP/LCP ${bounds(production, 'lcpMs')} ms, TBT ${bounds(production, 'tbtMs', 1)} ms, CLS ${bounds(production, 'cls', 5)}. Tất cả lượt public có Performance từ ${Math.min(...production.measurements.map((row) => row.scores.performance))} đến ${Math.max(...production.measurements.map((row) => row.scores.performance))}; Accessibility/Best Practices/SEO đều được giữ trong QA JSON. CPU benchmark public thấp hơn VM so sánh, nên không quy riêng chênh lệch TBT/điểm giữa hai môi trường cho VPS hoặc proxy. Mức giảm byte công bố lấy từ cặp cùng VM.

Median cũ 84/87/75 thuộc UI Phase 1 trên Windows/CPU khác, không dùng để tính mức tăng của lần này. Baseline sạch UI đầu tiên ở run 42775192337 đã đạt 98/100/100/99/99/99 trước tối ưu; có một lượt homepage LCP 3310 ms nhưng vẫn giữ trong dữ liệu. Tối ưu hiện tại giảm JavaScript được chứng minh bằng graph và transfer; không quy mọi thay đổi TBT/điểm vào một component. Khi median public dưới 90, cần đọc raw LCP breakdown/TTFB/main-thread/network và nêu nguyên nhân bằng dữ liệu trước khi nhận mục tiêu đã đạt.

## Từng lượt trước tối ưu

${tableHead}
${runs(before)}

## Từng lượt sau tối ưu

${tableHead}
${runs(after)}

## Từng lượt HTTPS public

${tableHead}
${runs(production)}

${
  windowsSmoke
    ? `## Smoke kiểm tra harness trên Windows — môi trường riêng

Ba lượt /en qua HTTPS loopback để xác minh lifecycle/validator của CLI: Performance ${windowsSmoke.measurements.map((row) => row.scores.performance).join('/')} (median ${windowsSmoke.median[0].scores.performance}), TBT median ${n(windowsSmoke.median[0].metrics.tbtMs, 1)} ms, CPU benchmark ${ranges(windowsSmoke)}. Trace không có script chèn. Lượt cuối ghi Script Evaluation khoảng ${n(smokeWork('scriptEvaluation'))} ms và Style & Layout ${n(smokeWork('styleLayout'))} ms; chưa khoanh riêng nguồn chi phí Windows. Không quy lỗi cho script Kaspersky khi trace không có nó.

Các lượt này không dùng cùng máy với cặp Linux; không gắn commit tự động và SITE_URL build khác origin QA nên SEO 92. Không dùng chúng tính mức tăng trước/sau hoặc nhận Windows ≥90. Giữ nguyên cả ba lượt, kể cả điểm dưới 90, tại QA JSON và bảng dưới.

${tableHead}
${runs(windowsSmoke)}
`
    : ''
}

## Tái lập

Chạy workflow performance.yml với before_ref/after_ref là SHA đầy đủ để so sánh; cả hai revision được build với SITE_URL=http://127.0.0.1:3000. Đặt public_only=true và after_ref đúng commit đang phục vụ để đo domain; script kiểm tra marker release trước khi đo. Đọc summary.json và toàn bộ runs.json, không chọn lượt đẹp. Dùng scripts/report-ui-performance.mjs --comparison <artifact-comparison> --public <artifact-public> --comparison-run <id> --public-run <id> để tạo báo cáo này. Script report-performance.mjs cũ chỉ dành dữ liệu Phase 1 lịch sử, không dùng sinh báo cáo UI mới.

Nguồn phương pháp: [Lighthouse variability](https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md), [Performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring).

## Báo cáo lịch sử, khác source và môi trường

Các số phía dưới giữ nguyên để đối chiếu lịch sử, không đại diện revision hiện tại.

${marker}
${history.replace(/^# /, '## ')}
`;
await writeFile('docs/PERFORMANCE.md', document);
console.log(
  JSON.stringify(
    {
      labMedianGoalMet: result.labMedianGoalMet,
      publicMedianGoalMet: result.publicMedianGoalMet,
      before: before.median,
      after: after.median,
      public: production.median,
    },
    null,
    2,
  ),
);
