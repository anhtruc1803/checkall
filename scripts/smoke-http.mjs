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
    '/gamepad/tester',
    '/gamepad/analog-stick',
    '/gamepad/stick-drift',
  ]) {
    const response = await fetch(`${origin}/${locale}${path}`);
    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get('permissions-policy'),
      ['/audio/microphone', '/audio/spectrum'].includes(path)
        ? 'camera=(), microphone=(self), geolocation=(), gamepad=()'
        : ['/camera/preview', '/camera/resolution', '/camera/fps'].includes(path)
          ? 'camera=(self), microphone=(), geolocation=(), gamepad=()'
          : ['/gamepad/tester', '/gamepad/analog-stick', '/gamepad/stick-drift'].includes(path)
            ? 'camera=(), microphone=(), geolocation=(), gamepad=(self)'
            : 'camera=(), microphone=(), geolocation=(), gamepad=()',
    );
    const html = await response.text();
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`));
    assert.match(html, /<main/);
  }
console.log(
  'HTTP smoke passed: health + 34 VI/EN routes, including scoped camera/microphone/gamepad policy.',
);
