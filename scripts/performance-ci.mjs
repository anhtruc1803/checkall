import { spawn, execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, open, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const paths =
  process.env.PERFORMANCE_PATHS ||
  '/vi,/en/screen/ppi,/vi/keyboard/tester,/en/audio/microphone,/vi/camera/preview,/en/gamepad/tester';
await mkdir('artifacts/performance', { recursive: true });
async function audit(baseUrl, label, source, expectLeaderboard = false) {
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
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        APP_SOURCE_COMMIT: source,
        EXPECT_TYPING_LEADERBOARD: String(expectLeaderboard),
      },
    },
  );
  const code = await new Promise((done, reject) => {
    child.once('error', reject);
    child.once('exit', done);
  });
  if (code !== 0) throw new Error(`Lighthouse failed with exit ${code}`);
}
async function measure(directory, label) {
  const cwd = resolve(directory);
  const expectLeaderboard =
    label === 'ui-after' && process.env.PERFORMANCE_TYPING_LEADERBOARD === 'true';
  const databaseDirectory = expectLeaderboard
    ? await mkdtemp(join(tmpdir(), 'device-lab-lighthouse-db-'))
    : null;
  const source = execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim();
  const log = await open(`artifacts/performance/${label}-server.log`, 'w');
  const server = spawn(process.execPath, ['scripts/start.mjs'], {
    cwd,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      HOSTNAME: '127.0.0.1',
      PORT: '3000',
      ...(databaseDirectory && {
        TYPING_LEADERBOARD_ADMIN_KEY: randomBytes(32).toString('hex'),
        TYPING_LEADERBOARD_DB: join(databaseDirectory, 'typing.sqlite'),
      }),
    },
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
    if (expectLeaderboard) {
      const response = await fetch(
        'http://127.0.0.1:3000/api/typing/leaderboard?challenge=morning-v1',
      );
      if (!response.ok || (await response.json()).enabled !== true)
        throw new Error('The candidate leaderboard must be enabled during measurement.');
    }
    await audit('http://127.0.0.1:3000', label, source, expectLeaderboard);
  } finally {
    if (server.exitCode === null) server.kill('SIGTERM');
    await exited;
    await log.close();
    if (databaseDirectory) {
      for (const suffix of ['', '-shm', '-wal'])
        await rm(join(databaseDirectory, `typing.sqlite${suffix}`), { force: true });
      await rmdir(databaseDirectory);
    }
  }
}
if (process.env.PERFORMANCE_PUBLIC === 'true') {
  const source = process.env.PERFORMANCE_PUBLIC_REF;
  const origin = process.env.PERFORMANCE_PUBLIC_ORIGIN || 'https://a.ap.vn';
  if (!['https://nguyenanhtruc.io.vn', 'https://a.ap.vn'].includes(origin))
    throw new Error('Use an explicitly authorized public origin.');
  if (!/^[0-9a-f]{40}$/.test(source ?? '')) throw new Error('Expected deployed commit SHA.');
  const response = await fetch(`${origin}/vi`);
  if (!response.ok || response.headers.get('x-device-lab-release') !== source.slice(0, 7))
    throw new Error('Public release does not match the requested commit.');
  await audit(origin, 'ui-public', source);
} else {
  await measure('app-before', 'ui-before');
  if (process.env.PERFORMANCE_AFTER === 'true') await measure('app-after', 'ui-after');
}
