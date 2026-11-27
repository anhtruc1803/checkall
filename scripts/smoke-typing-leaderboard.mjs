import assert from 'node:assert/strict';
import { setTimeout as wait } from 'node:timers/promises';

const [base, mode, id] = process.argv.slice(2);
const boardPath = '/api/typing/leaderboard';
const adminPath = `${boardPath}/admin`;
const challenge = 'morning-v1';
const nickname = 'Kiểm thử Docker';
const adminKey = process.env.TYPING_LEADERBOARD_ADMIN_KEY;
assert.ok(adminKey?.length >= 32, 'Expected the dedicated QA admin key.');

async function checked(path, status, options) {
  const response = await fetch(new URL(path, base), {
    signal: AbortSignal.timeout(10_000),
    ...options,
  });
  assert.equal(response.status, status, `${options?.method ?? 'GET'} ${path}`);
  assert.match(response.headers.get('cache-control') ?? '', /no-store/i);
  return response;
}

function post(path, status, payload, headers = {}) {
  return checked(path, status, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json', Origin: new URL(base).origin, ...headers },
  });
}

async function list(next = challenge) {
  const response = await checked(`${boardPath}?challenge=${next}`, 200);
  const result = await response.json();
  assert.equal(result.enabled, true);
  return result.entries;
}

if (mode === 'publish') {
  assert.deepEqual(await list(), []);
  const started = await post(boardPath, 200, { action: 'start', challenge });
  const { ticket } = await started.json();
  const summary = { action: 'submit', challenge, ticket, nickname, correct: 60, accuracy: 100 };
  const early = await post(boardPath, 409, summary);
  assert.equal((await early.json()).error, 'tooSoon');
  await wait(60_000);
  const published = await post(boardPath, 201, summary);
  const result = await published.json();
  assert.ok((await list()).some((entry) => entry.id === result.id && entry.nickname === nickname));
  assert.deepEqual(await list('riverside-v1'), []);
  console.log(result.id);
} else if (mode === 'moderate') {
  assert.ok((await list()).some((entry) => entry.id === id && entry.correct === 60));
  const hide = { action: 'hide', challenge, id };
  await post(adminPath, 401, hide);
  const signedIn = await post(
    adminPath,
    200,
    { action: 'signIn' },
    { Authorization: `Bearer ${adminKey}` },
  );
  const session = signedIn.headers.get('set-cookie');
  assert.ok(session?.includes('HttpOnly'));
  assert.match(session, /SameSite=strict/i);
  const Cookie = session.split(';')[0];
  await post(adminPath, 200, hide, { Cookie });
  await post(adminPath, 200, { action: 'signOut' }, { Cookie });
  assert.deepEqual(await list(), []);
  console.log('SQLite score survived restart and was hidden by an authenticated admin.');
} else if (mode === 'verify-hidden') {
  assert.deepEqual(await list(), []);
  for (const locale of ['vi', 'en']) {
    const page = await checked(`/${locale}/admin/typing-leaderboard`, 200);
    const html = await page.text();
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
    assert.match(html, /type="password"/);
    assert.doesNotMatch(html, /id="typing-admin-challenge"/);
  }
  console.log('Both admin routes require sign-in and the hidden score stays off the public board.');
} else {
  throw new Error('Invalid leaderboard smoke phase.');
}
