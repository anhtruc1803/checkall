import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { isAbsolute } from 'node:path';
import { z } from 'zod';
import { challengePassages } from '../challenge-passages';
import { typingChallengeIds, type TypingChallengeId } from '../competition';
import type { LeaderboardError } from '../leaderboard';
import { typingDurationMs } from '../lessons';
import { typingCharacters } from '../score';

export const challengeId = z.enum(typingChallengeIds);
export const entryId = z.uuid();
const nickname = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .regex(/^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}]+$/u)
  .transform((name) => name.normalize('NFC'));

export const publicAction = z.discriminatedUnion('action', [
  z.strictObject({ action: z.literal('start'), challenge: challengeId }),
  z.strictObject({
    action: z.literal('submit'),
    challenge: challengeId,
    ticket: z.string().max(180),
    nickname,
    correct: z.number().int().positive(),
    accuracy: z.number().min(0).max(100),
  }),
]);

export function typingLeaderboardConfig() {
  const file = process.env.TYPING_LEADERBOARD_DB;
  const key = process.env.TYPING_LEADERBOARD_ADMIN_KEY;
  return file && isAbsolute(file) && key && key.length >= 32 ? { file, key } : null;
}

export function leaderboardResponse(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function leaderboardError(error: LeaderboardError, status: number) {
  return leaderboardResponse({ error }, status);
}

export function typingRequestOrigin(request: Request) {
  const url = new URL(request.url);
  // The standalone server can use its bind address in request.url. Host is preserved by Nginx.
  const host = request.headers.get('host') ?? url.host;
  const forwardedProtocol = request.headers.get('x-forwarded-proto');
  const protocol =
    forwardedProtocol === 'http' || forwardedProtocol === 'https'
      ? `${forwardedProtocol}:`
      : url.protocol;
  return `${protocol}//${host}`;
}

export async function leaderboardJson(request: Request): Promise<unknown> {
  const origin = request.headers.get('origin');
  if (
    (origin && origin !== typingRequestOrigin(request)) ||
    request.headers.get('sec-fetch-site') === 'cross-site' ||
    request.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/json' ||
    !request.body
  )
    return null;

  const reader = request.body.getReader();
  const maxBytes = 2048;
  const buffer = new Uint8Array(maxBytes);
  let length = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      if (length + chunk.value.length > maxBytes) {
        void reader.cancel().catch(() => {});
        return null;
      }
      buffer.set(chunk.value, length);
      length += chunk.value.length;
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, length)));
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

function digest(value: string) {
  return createHash('sha256').update(value).digest();
}

function sign(value: string, key: string) {
  return createHmac('sha256', key)
    .update(`typing-leaderboard-attempt:${value}`)
    .digest('base64url');
}

export function createTypingTicket(challenge: TypingChallengeId, key: string, now: number) {
  const value = `${randomUUID()}.${challenge}.${now}`;
  return `${value}.${sign(value, key)}`;
}

export function checkTypingTicket(
  ticket: string,
  challenge: TypingChallengeId,
  key: string,
  now: number,
) {
  const [id, ticketChallenge, issued, signature, extra] = ticket.split('.');
  const time = Number(issued);
  if (
    extra !== undefined ||
    ticketChallenge !== challenge ||
    !entryId.safeParse(id).success ||
    !Number.isSafeInteger(time) ||
    !signature ||
    !timingSafeEqual(digest(signature), digest(sign(`${id}.${challenge}.${issued}`, key)))
  )
    return { error: 'invalid' } as const;
  if (now - time < typingDurationMs) return { error: 'tooSoon' } as const;
  if (now - time > 30 * 60_000) return { error: 'expired' } as const;
  return { id };
}

const challengeLengths = {
  'morning-v1': typingCharacters(challengePassages['morning-v1']).length,
  'riverside-v1': typingCharacters(challengePassages['riverside-v1']).length,
} satisfies Record<TypingChallengeId, number>;

export function validTypingScore(challenge: TypingChallengeId, correct: number, accuracy: number) {
  return correct <= challengeLengths[challenge] && Math.round(accuracy * 10) / 10 === accuracy;
}
