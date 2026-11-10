import { spawn, execFileSync } from 'node:child_process';
import { mkdir, open } from 'node:fs/promises';
import { resolve } from 'node:path';

const paths =
  '/vi,/en/screen/ppi,/vi/keyboard/tester,/en/audio/microphone,/vi/camera/preview,/en/gamepad/tester';
await mkdir('artifacts/performance', { recursive: true });
async function audit(baseUrl, label, source) {
  const child = spawn(
    process.execPath,
    [
      'scripts/lighthouse.mjs',
      '--base-url',
      baseUrl,
      '--label',
      label,
      '--runs',
      '3',
      '--paths',
      paths,
    ],
    { stdio: 'inherit', env: { ...process.env, APP_SOURCE_COMMIT: source } },
  );
  const code = await new Promise((done, reject) => {
    child.once('error', reject);
    child.once('exit', done);
  });
  if (code !== 0) throw new Error(`Lighthouse failed with exit ${code}`);
}
async function measure(directory, label) {
  const cwd = resolve(directory);
  const source = execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim();
  const log = await open(`artifacts/performance/${label}-server.log`, 'w');
  const server = spawn(process.execPath, ['scripts/start.mjs'], {
    cwd,
    env: { ...process.env, NODE_ENV: 'production', HOSTNAME: '127.0.0.1', PORT: '3000' },
    stdio: ['ignore', log.fd, log.fd],
  });
  const exited = new Promise((done) => server.once('exit', done));
  try {
    let healthy = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw new Error(`QA server exited: ${server.exitCode}`);
      try {
        const response = await fetch('http://127.0.0.1:3000/api/health');
        if (response.ok && (await response.json()).status === 'ok') {
          healthy = true;
          break;
        }
      } catch {}
      await new Promise((done) => setTimeout(done, 200));
    }
    if (!healthy) throw new Error('Performance QA server not healthy.');
    await audit('http://127.0.0.1:3000', label, source);
  } finally {
    if (server.exitCode === null) server.kill('SIGTERM');
    await exited;
    await log.close();
  }
}
if (process.env.PERFORMANCE_PUBLIC === 'true') {
  const source = process.env.PERFORMANCE_PUBLIC_REF;
  if (!/^[0-9a-f]{40}$/.test(source ?? '')) throw new Error('Expected deployed commit SHA.');
  const response = await fetch('https://nguyenanhtruc.io.vn/vi');
  if (!response.ok || response.headers.get('x-device-lab-release') !== source.slice(0, 7))
    throw new Error('Public release does not match the requested commit.');
  await audit('https://nguyenanhtruc.io.vn', 'ui-public', source);
} else {
  await measure('app-before', 'ui-before');
  if (process.env.PERFORMANCE_AFTER === 'true') await measure('app-after', 'ui-after');
}
