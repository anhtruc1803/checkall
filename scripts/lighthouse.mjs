import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { createServer } from 'node:net';
import { parseArgs } from 'node:util';
import { X509Certificate, createHash } from 'node:crypto';
const { values } = parseArgs({
  options: {
    'base-url': { type: 'string', default: 'https://127.0.0.1:3443' },
    label: { type: 'string', default: 'clean-after' },
    runs: { type: 'string', default: '3' },
    cert: { type: 'string', default: 'artifacts/qa-tls/cert.pem' },
  },
});
const base = new URL(values['base-url']);
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname))
  throw new Error('Audit only local QA origins.');
if (!/^[a-z0-9-]+$/.test(values.label)) throw new Error('Invalid audit label.');
const repetitions = Number(values.runs);
if (!Number.isInteger(repetitions) || repetitions < 3 || repetitions > 10)
  throw new Error('Use 3–10 repetitions.');
const directory = resolve('artifacts/performance', values.label);
await mkdir(directory, { recursive: true });
let certificatePin;
if (base.protocol === 'https:') {
  const certificate = new X509Certificate(await readFile(values.cert));
  certificatePin = createHash('sha256')
    .update(certificate.publicKey.export({ type: 'spki', format: 'der' }))
    .digest('base64');
}
const paths = ['/vi', '/en/screen/ppi', '/vi/keyboard/tester'];
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
  const profile = await mkdtemp(join(tmpdir(), 'device-lab-lighthouse-'));
  const port = await freePort();
  const args = [
    '--headless=new',
    '--disable-extensions',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
  ];
  if (certificatePin) args.push(`--ignore-certificate-errors-spki-list=${certificatePin}`);
  if (process.getuid?.() === 0) args.push('--no-sandbox');
  const child = spawn(chromium.executablePath(), args, { stdio: 'ignore', windowsHide: true });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
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
    const slug = `${path.slice(1).replaceAll('/', '-')}-${run}`;
    await writeFile(join(directory, `${slug}.json`), result.report[0]);
    await writeFile(join(directory, `${slug}.html`), result.report[1]);
    const { lhr } = result;
    const network = lhr.audits['network-requests'].details.items;
    const externalScripts = network
      .filter((item) => item.resourceType === 'Script' && new URL(item.url).origin !== base.origin)
      .map((item) => new URL(item.url).origin);
    const clean =
      externalScripts.length === 0 &&
      !/kaspersky|kis\.v2\.scr|chrome-extension:/i.test(JSON.stringify(network));
    const bytes = (type) =>
      network
        .filter((item) => item.resourceType === type)
        .reduce((sum, item) => sum + (item.transferSize ?? 0), 0);
    const measurement = {
      path,
      run,
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
        jsBytes: bytes('Script'),
        fontBytes: bytes('Font'),
        imageBytes: bytes('Image'),
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
    child.kill();
    if (child.exitCode === null) await new Promise((done) => child.once('exit', done));
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
