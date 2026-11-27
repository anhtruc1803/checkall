import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const typingAdminCookie = 'device-lab-typing-admin';
export const typingAdminSessionSeconds = 2 * 60 * 60;

export function isTypingAdminKey(request: Request, key: string) {
  const header = request.headers.get('authorization');
  if (!header) return false;
  const actual = createHash('sha256').update(header).digest();
  const expected = createHash('sha256').update(`Bearer ${key}`).digest();
  return timingSafeEqual(actual, expected);
}

function signature(expires: string, key: string) {
  return createHmac('sha256', key).update(`typing-admin-session:${expires}`).digest();
}

export function createTypingAdminSession(key: string, now: number) {
  const expires = String(now + typingAdminSessionSeconds * 1000);
  return `${expires}.${signature(expires, key).toString('base64url')}`;
}

export function isTypingAdminSession(value: string | undefined, key: string, now = Date.now()) {
  const match = /^(\d{13})\.([A-Za-z0-9_-]{43})$/.exec(value ?? '');
  if (!match) return false;
  const [, expires, encoded] = match;
  if (Number(expires) <= now) return false;
  const actual = Buffer.from(encoded, 'base64url');
  return timingSafeEqual(actual, signature(expires, key));
}
