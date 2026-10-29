import { cpSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
const server = resolve('.next/standalone/server.js');
if (!existsSync(server)) throw new Error('Run pnpm build before pnpm start.');
cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
if (existsSync('public')) cpSync('public', '.next/standalone/public', { recursive: true });
const child = spawn(process.execPath, [server], {
  stdio: 'inherit',
  env: {
    ...process.env,
    HOSTNAME: process.env.HOSTNAME ?? '0.0.0.0',
    PORT: process.env.PORT ?? '3000',
    NODE_ENV: 'production',
  },
});
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
child.on('exit', (code) => process.exit(code ?? 0));
