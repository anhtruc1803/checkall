import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, mkdtemp, rm, readFile, open } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { createServer } from 'node:net';
import { parseArgs } from 'node:util';
import { X509Certificate, createHash } from 'node:crypto';
import { cpus, platform, release, totalmem } from 'node:os';
const { values } = parseArgs({
  options: {
    'base-url': { type: 'string', default: 'https://127.0.0.1:3443' },
    label: { type: 'string', default: 'clean-after' },
    runs: { type: 'string', default: '3' },
    cert: { type: 'string', default: 'artifacts/qa-tls/cert.pem' },
    paths: { type: 'string', default: '/vi,/en/screen/ppi,/vi/keyboard/tester' },
  },
});
const base = new URL(values['base-url']);
if (
  !['http:', 'https:'].includes(base.protocol) ||
  base.username ||
  base.password ||
  base.search ||
  base.hash ||
  base.pathname !== '/'
)
  throw new Error('Use a plain HTTP(S) origin without credentials or URL parameters.');
const localOrigin = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
if (!localOrigin && base.origin !== 'https://nguyenanhtruc.io.vn')
  throw new Error('Audit only local QA or the authorized staging origin.');
if (!/^[a-z0-9-]+$/.test(values.label)) throw new Error('Invalid audit label.');
const repetitions = Number(values.runs);
if (!Number.isInteger(repetitions) || repetitions < 3 || repetitions > 10)
  throw new Error('Use 3–10 repetitions.');
const directory = resolve('artifacts/performance', values.label);
await mkdir(directory, { recursive: true });
let certificatePin;
if (base.protocol === 'https:' && localOrigin) {
  const certificate = new X509Certificate(await readFile(values.cert));
  certificatePin = createHash('sha256')
    .update(certificate.publicKey.export({ type: 'spki', format: 'der' }))
    .digest('base64');
}
const paths = values.paths.split(',');
if (!paths.length || paths.some((path) => !/^\/(vi|en)(\/[a-z0-9-]+)*$/.test(path)))
  throw new Error('Use explicit VI/EN content paths.');
if (new Set(paths).size !== paths.length) throw new Error('Duplicate audit paths.');
function median(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
async function freePort() {
  const server = createServer();
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No audit port');
  await new Promise((done) => server.close(done));
  return address.port;
}
async function audit(path, run) {
  const slug = `${path.slice(1).replaceAll('/', '-')}-${run}`;
  const profile = await mkdtemp(join(tmpdir(), 'device-lab-lighthouse-'));
  const port = await freePort();
  const args = [
    '--headless=new',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
  ];
  if (certificatePin) args.push(`--ignore-certificate-errors-spki-list=${certificatePin}`);
  if (process.env.CI || process.getuid?.() === 0) args.push('--no-sandbox');
  const browserLog = await open(join(directory, `${slug}-browser.log`), 'w');
  const child = spawn(chromium.executablePath(), args, {
    stdio: ['ignore', browserLog.fd, browserLog.fd],
    windowsHide: true,
  });
  let launchError;
  child.once('error', (error) => {
    launchError = error;
  });
  const closed = new Promise((done) => child.once('close', done));
  try {
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      if (launchError || child.exitCode !== null || child.signalCode !== null)
        throw new Error(
          `Chromium exited before CDP readiness: ${launchError?.message ?? child.exitCode ?? child.signalCode}; see ${slug}-browser.log`,
        );
      try {
        if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((done) => setTimeout(done, 200));
    }
    if (!ready) throw new Error('Audit Chrome did not start.');
    const result = await lighthouse(new URL(path, base).href, {
      port,
      hostname: '127.0.0.1',
      output: ['json', 'html'],
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });
    if (!result || result.lhr.runtimeError)
      throw new Error(result?.lhr.runtimeError?.message ?? 'No Lighthouse result');
    await writeFile(join(directory, `${slug}.json`), result.report[0]);
    await writeFile(join(directory, `${slug}.html`), result.report[1]);
    const { lhr } = result;
    const network = lhr.audits['network-requests'].details.items;
    const document = result.artifacts.MainDocumentContent;
    const finalUrl = new URL(lhr.finalDisplayedUrl ?? lhr.finalUrl);
    const expectedUrl = new URL(path, base);
    if (
      typeof document !== 'string' ||
      !document.includes('id="main"') ||
      !document.includes('class="brand"') ||
      !document.includes(`lang="${path.split('/')[1]}"`) ||
      !document.includes(path === '/vi' ? 'category-rail' : 'tool-workspace') ||
      finalUrl.origin !== expectedUrl.origin ||
      finalUrl.pathname !== expectedUrl.pathname
    )
      throw new Error('Audit did not load the expected Device Lab content.');
    const externalScripts = network
      .filter((item) => item.resourceType === 'Script' && new URL(item.url).origin !== base.origin)
      .map((item) => new URL(item.url).origin);
    const clean =
      externalScripts.length === 0 &&
      !/kaspersky|kis\.v2\.scr|chrome-extension:/i.test(JSON.stringify(network) + document);
    const bytes = (type) =>
      network
        .filter((item) => item.resourceType === type)
        .reduce((sum, item) => sum + (item.transferSize ?? 0), 0);
    const measurement = {
      path,
      run,
      pageVerified: true,
      lighthouseVersion: lhr.lighthouseVersion,
      clean,
      externalScripts: [...new Set(externalScripts)],
      scores: Object.fromEntries(
        Object.entries(lhr.categories).map(([key, category]) => [
          key,
          Math.round((category.score ?? 0) * 100),
        ]),
      ),
      metrics: {
        fcpMs: lhr.audits['first-contentful-paint'].numericValue,
        lcpMs: lhr.audits['largest-contentful-paint'].numericValue,
        tbtMs: lhr.audits['total-blocking-time'].numericValue,
        cls: lhr.audits['cumulative-layout-shift'].numericValue,
        speedIndexMs: lhr.audits['speed-index'].numericValue,
        jsBytes: bytes('Script'),
        fontBytes: bytes('Font'),
        imageBytes: bytes('Image'),
        documentBytes: bytes('Document'),
        cssBytes: bytes('Stylesheet'),
      },
      environment: lhr.environment,
      settings: {
        formFactor: lhr.configSettings.formFactor,
        throttlingMethod: lhr.configSettings.throttlingMethod,
        throttling: lhr.configSettings.throttling,
      },
      report: `${slug}.html`,
    };
    console.log(
      JSON.stringify({ path, run, clean, ...measurement.scores, ...measurement.metrics }),
    );
    return measurement;
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill();
    await closed;
    await browserLog.close();
    if (!resolve(profile).startsWith(resolve(tmpdir()) + sep + 'device-lab-lighthouse-'))
      throw new Error('Unexpected audit profile path');
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}
const measurements = [];
for (let run = 1; run <= repetitions; run++)
  for (const path of paths) {
    const measurement = await audit(path, run);
    measurements.push(measurement);
    await writeFile(join(directory, 'runs.json'), JSON.stringify(measurements, null, 2));
    if (!measurement.clean)
      throw new Error('Injected/external scripts detected. These results are not a clean audit.');
  }
const summary = paths.map((path) => {
  const runs = measurements.filter((item) => item.path === path);
  return {
    path,
    runs: runs.length,
    clean: runs.every((item) => item.clean),
    scores: Object.fromEntries(
      Object.keys(runs[0].scores).map((key) => [key, median(runs.map((item) => item.scores[key]))]),
    ),
    metrics: Object.fromEntries(
      Object.keys(runs[0].metrics).map((key) => [
        key,
        median(runs.map((item) => item.metrics[key])),
      ]),
    ),
  };
});
await writeFile(
  join(directory, 'summary.json'),
  JSON.stringify(
    {
      label: values.label,
      sourceCommit: process.env.APP_SOURCE_COMMIT ?? null,
      execution: {
        node: process.version,
        platform: platform(),
        osRelease: release(),
        cpuModel: cpus()[0]?.model,
        cpuCount: cpus().length,
        memoryBytes: totalmem(),
        githubRunId: process.env.GITHUB_RUN_ID ?? null,
      },
      baseUrl: base.origin,
      certificatePinUsed: Boolean(certificatePin),
      measurements,
      median: summary,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ median: summary }, null, 2));
