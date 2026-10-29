import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
const staged = process.argv.includes('--staged');
const files = execFileSync(
  'git',
  staged
    ? ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']
    : ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean);
const patterns = [
  ['private-key', /^-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/m],
  ['github-token', /\bgh[pousr]_[A-Za-z0-9]{30,}\b/],
  ['github-fine-grained-token', /\bgithub_pat_[A-Za-z0-9_]{40,}\b/],
  ['aws-access-key', /\bAKIA[A-Z0-9]{16}\b/],
  ['openai-key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{40,}\b/],
  ['slack-token', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
];
const findings = [];
for (const file of [...new Set(files)]) {
  if (
    (/^\.env(?:\.|$)/.test(basename(file)) && basename(file) !== '.env.example') ||
    /\.(pem|key|p12|pfx)$/i.test(file)
  )
    findings.push({ file, rule: 'sensitive-file' });
  const content = staged
    ? execFileSync('git', ['show', `:${file}`]).toString('utf8')
    : readFileSync(file, 'utf8');
  for (const [rule, pattern] of patterns) {
    const match = pattern.exec(content);
    if (match)
      findings.push({ file, line: content.slice(0, match.index).split('\n').length, rule });
  }
}
console.log(
  JSON.stringify(
    {
      scope: staged ? 'staged' : 'tracked-and-untracked-not-ignored',
      filesScanned: files.length,
      findings,
    },
    null,
    2,
  ),
);
if (findings.length) process.exitCode = 1;
