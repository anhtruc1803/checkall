import assert from 'node:assert/strict';
const origin = process.argv[2] ?? 'http://127.0.0.1:8080';
const health = await fetch(`${origin}/api/health`);
assert.equal(health.status, 200);
assert.equal((await health.json()).status, 'ok');
for (const locale of ['vi', 'en'])
  for (const path of [
    '',
    '/screen/refresh-rate',
    '/keyboard/tester',
    '/mouse/buttons',
    '/device/information',
    '/browser/storage',
    '/audio/speaker',
    '/audio/stereo',
    '/audio/frequency-generator',
    '/audio/microphone',
    '/audio/spectrum',
    '/camera/preview',
    '/camera/resolution',
    '/camera/fps',
  ]) {
    const response = await fetch(`${origin}/${locale}${path}`);
    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get('permissions-policy'),
      ['/audio/microphone', '/audio/spectrum'].includes(path)
        ? 'camera=(), microphone=(self), geolocation=()'
        : ['/camera/preview', '/camera/resolution', '/camera/fps'].includes(path)
          ? 'camera=(self), microphone=(), geolocation=()'
          : 'camera=(), microphone=(), geolocation=()',
    );
    const html = await response.text();
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`));
    assert.match(html, /<main/);
  }
console.log(
  'HTTP smoke passed: health + 28 VI/EN routes, including scoped camera/microphone policy.',
);
