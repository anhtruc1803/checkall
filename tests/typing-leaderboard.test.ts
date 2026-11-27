// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/typing/leaderboard/route';
import { POST as moderate } from '@/app/api/typing/leaderboard/admin/route';
import { listTypingResults, openTypingLeaderboard } from '@/lib/typing/server/leaderboard-store';
import { typingAdminSessionSeconds } from '@/lib/typing/server/typing-admin-session';
import { leaderboardPath } from '@/lib/typing/leaderboard';

const challenge = 'morning-v1';
const origin = 'http://localhost:3000';
const key = randomUUID();
const start = Date.parse('2026-11-26T00:00:00Z');
const adminPath = `${leaderboardPath}/admin`;

function query(next = challenge, page = 1) {
  return GET(new Request(`${origin}${leaderboardPath}?challenge=${next}&page=${page}`));
}

function request(body: object, path = leaderboardPath, headers: HeadersInit = {}) {
  return new NextRequest(`${origin}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

async function signIn(headers: Record<string, string> = {}) {
  const response = await moderate(
    request({ action: 'signIn' }, adminPath, {
      Authorization: `Bearer ${key}`,
      ...headers,
    }),
  );
  expect(response.status).toBe(200);
  const cookie = response.headers.get('set-cookie')!;
  expect(cookie).toContain('HttpOnly');
  expect(cookie).toContain('SameSite=strict');
  expect(response.headers.get('cache-control')).toBe('no-store');
  return { header: cookie, Cookie: cookie.split(';')[0] };
}

async function begin(next = challenge) {
  const response = await POST(request({ action: 'start', challenge: next }));
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('no-store');
  return (await response.json()).ticket as string;
}

function score(ticket: string) {
  return { action: 'submit', challenge, ticket, correct: 150, accuracy: 96.1, nickname: '  Ánh  ' };
}

describe('public typing leaderboard routes and SQLite', () => {
  let directory: string;
  let file: string;
  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'device-lab-leaderboard-'));
    file = join(directory, 'test.sqlite');
    vi.stubEnv('TYPING_LEADERBOARD_DB', file);
    vi.stubEnv('TYPING_LEADERBOARD_ADMIN_KEY', key);
    vi.useFakeTimers();
    vi.setSystemTime(start);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    for (const suffix of ['', '-shm', '-wal']) rmSync(`${file}${suffix}`, { force: true });
    rmdirSync(directory);
  });

  it('disables the API without runtime configuration and rejects invalid query values', async () => {
    expect(query('unknown').status).toBe(400);
    expect(query(challenge, 0).status).toBe(400);
    vi.stubEnv('TYPING_LEADERBOARD_DB', undefined);
    expect(await query().json()).toEqual({ enabled: false });
    expect((await POST(request({ action: 'start', challenge }))).status).toBe(503);
  });

  it('publishes only a summary after 60 seconds and isolates the other challenge', async () => {
    const ticket = await begin();
    expect(await query().json()).toEqual({ enabled: true, entries: [], more: false });
    vi.setSystemTime(start + 59_999);
    const early = await POST(request(score(ticket)));
    expect(early.status).toBe(409);
    expect(await early.json()).toEqual({ error: 'tooSoon' });
    vi.setSystemTime(start + 60_000);
    const published = await POST(request(score(ticket)));
    expect(published.status).toBe(201);
    const { id } = await published.json();
    const response = query();
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      enabled: true,
      entries: [
        {
          id,
          rank: 1,
          nickname: 'Ánh',
          correct: 150,
          accuracy: 96.1,
          time: '2026-11-26T00:01:00.000Z',
        },
      ],
      more: false,
    });
    expect((await query('riverside-v1').json()).entries).toEqual([]);
  });

  it('rejects expired, reused and challenge-mismatched tickets', async () => {
    const ticket = await begin();
    const other = await begin('riverside-v1');
    vi.setSystemTime(start + 60_000);
    expect((await POST(request(score(other)))).status).toBe(400);
    expect((await POST(request(score(`${ticket}x`)))).status).toBe(400);
    const concurrent = await Promise.all([
      POST(request(score(ticket))),
      POST(request(score(ticket))),
    ]);
    expect(concurrent.map(({ status }) => status).sort()).toEqual([201, 409]);
    vi.setSystemTime(start + 30 * 60_000 + 1);
    const expired = await POST(request({ ...score(other), challenge: 'riverside-v1' }));
    expect(await expired.json()).toEqual({ error: 'expired' });
  });

  it('rejects malformed scores, unwanted fields, oversized bodies and cross-origin writes', async () => {
    const ticket = await begin();
    vi.setSystemTime(start + 60_000);
    for (const invalid of [
      { correct: 80_000 },
      { correct: 0 },
      { accuracy: 93.12 },
      { accuracy: 101 },
      { nickname: '   ' },
      { nickname: 'Two\nlines' },
      { nickname: 'a'.repeat(2200) },
      { text: 'Not part of the score summary' },
    ]) {
      expect((await POST(request({ ...score(ticket), ...invalid }))).status).toBe(400);
    }
    expect(
      (await POST(request(score(ticket), leaderboardPath, { Origin: 'https://example.org' })))
        .status,
    ).toBe(400);
    expect((await query().json()).entries).toEqual([]);
  });

  it('accepts the browser origin preserved by the reverse proxy', async () => {
    const headers = { Host: 'typing.example.org', 'X-Forwarded-Proto': 'https' };
    const payload = { action: 'start', challenge };
    expect(
      (
        await POST(
          request(payload, leaderboardPath, {
            ...headers,
            Origin: 'https://typing.example.org',
          }),
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await POST(
          request(payload, leaderboardPath, {
            ...headers,
            Origin: origin,
          }),
        )
      ).status,
    ).toBe(400);
  });

  it('authorizes moderation on the server and keeps hidden scores out after reopening SQLite', async () => {
    const ticket = await begin();
    vi.setSystemTime(start + 60_000);
    const { id } = await (await POST(request(score(ticket)))).json();
    const authorization = { Authorization: `Bearer ${key}` };
    const hide = { action: 'hide', challenge, id };
    expect((await moderate(request(hide, adminPath))).status).toBe(401);
    expect(
      (
        await moderate(
          request({ action: 'signIn' }, adminPath, { Authorization: 'Bearer incorrect' }),
        )
      ).status,
    ).toBe(401);
    expect((await moderate(request(hide, adminPath, authorization))).status).toBe(401);
    const { Cookie } = await signIn();
    expect(
      (await moderate(request({ ...hide, challenge: 'riverside-v1' }, adminPath, { Cookie })))
        .status,
    ).toBe(404);
    expect(
      (await moderate(request(hide, adminPath, { Cookie, Origin: 'https://example.org' }))).status,
    ).toBe(400);
    expect((await query().json()).entries).toHaveLength(1);
    expect((await moderate(request(hide, adminPath, { Cookie }))).status).toBe(200);
    using db = openTypingLeaderboard(file);
    expect(listTypingResults(db, challenge, 1).entries).toEqual([]);
    expect(db.prepare('SELECT hidden FROM typing_results WHERE id = ?').get(id)?.hidden).toBe(1);
    expect((await POST(request(score(ticket)))).status).toBe(409);
  });

  it('sets a secure session behind HTTPS and rejects tampered and expired sessions', async () => {
    const { Cookie, header } = await signIn({
      Host: 'typing.example.org',
      'X-Forwarded-Proto': 'https',
      Origin: 'https://typing.example.org',
    });
    expect(header).toContain('Secure');
    const hide = { action: 'hide', challenge, id: randomUUID() };
    const [name, token] = Cookie.split('=');
    const [expires, signature] = token.split('.');
    const tampered = `${name}=${expires}.${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`;
    expect((await moderate(request(hide, adminPath, { Cookie: tampered }))).status).toBe(401);
    expect((await moderate(request(hide, adminPath, { Cookie }))).status).toBe(404);
    const logout = await moderate(request({ action: 'signOut' }, adminPath, { Cookie }));
    expect(logout.headers.get('set-cookie')).toContain('Max-Age=0');
    vi.setSystemTime(start + typingAdminSessionSeconds * 1000);
    expect((await moderate(request(hide, adminPath, { Cookie }))).status).toBe(401);
  });

  it('keeps ties across pagination, ranks by accuracy, and recalculates after hiding', async () => {
    using db = openTypingLeaderboard(file);
    const insert = db.prepare('INSERT INTO typing_results VALUES (?, ?, ?, ?, ?, ?, 0)');
    const first = randomUUID();
    insert.run(first, challenge, 'More accurate', 100, 99, start + 1);
    for (let index = 0; index < 25; index++) {
      insert.run(randomUUID(), challenge, `Tie ${index}`, 100, 90, start + index + 2);
    }
    insert.run(randomUUID(), challenge, 'Fewer correct', 99, 100, start + 28);
    const firstPage = await query().json();
    expect(firstPage.more).toBe(true);
    expect(firstPage.entries).toHaveLength(25);
    expect(firstPage.entries[0]).toMatchObject({ nickname: 'More accurate', rank: 1 });
    expect(
      (await query(challenge, 2).json()).entries.map(({ rank }: { rank: number }) => rank),
    ).toEqual([2, 27]);
    const { Cookie } = await signIn();
    expect(
      (await moderate(request({ action: 'hide', challenge, id: first }, adminPath, { Cookie })))
        .status,
    ).toBe(200);
    expect((await query().json()).entries[0]).toMatchObject({ nickname: 'Tie 0', rank: 1 });
    expect((await query(challenge, 2).json()).entries[0]).toMatchObject({
      nickname: 'Fewer correct',
      rank: 26,
    });
  });

  it('limits submissions during a burst and accepts an unused ticket after the window', async () => {
    const ticket = await begin();
    using db = openTypingLeaderboard(file);
    const insert = db.prepare('INSERT INTO typing_results VALUES (?, ?, ?, ?, ?, ?, 1)');
    for (let index = 0; index < 120; index++) {
      insert.run(randomUUID(), challenge, 'Hidden attempt', 100, 99, start + 60_000);
    }
    vi.setSystemTime(start + 60_001);
    expect((await POST(request(score(ticket)))).status).toBe(429);
    vi.setSystemTime(start + 120_001);
    expect((await POST(request(score(ticket)))).status).toBe(201);
  });
});
