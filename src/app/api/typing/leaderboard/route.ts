import { z } from 'zod';
import {
  challengeId,
  checkTypingTicket,
  createTypingTicket,
  leaderboardError,
  leaderboardJson,
  leaderboardResponse,
  publicAction,
  typingLeaderboardConfig,
  validTypingScore,
} from '@/lib/typing/server/leaderboard-http';
import {
  listTypingResults,
  openTypingLeaderboard,
  submitTypingResult,
} from '@/lib/typing/server/leaderboard-store';

export const runtime = 'nodejs';

const listQuery = z.object({
  challenge: challengeId,
  page: z.coerce.number().int().min(1).max(100_000),
});

export function GET(request: Request) {
  const config = typingLeaderboardConfig();
  if (!config) return leaderboardResponse({ enabled: false });
  const params = new URL(request.url).searchParams;
  const query = listQuery.safeParse({
    challenge: params.get('challenge'),
    page: params.get('page') ?? 1,
  });
  if (!query.success) return leaderboardError('invalid', 400);
  try {
    using db = openTypingLeaderboard(config.file);
    const { challenge, page } = query.data;
    return leaderboardResponse({ enabled: true, ...listTypingResults(db, challenge, page) });
  } catch {
    return leaderboardError('unavailable', 503);
  }
}

export async function POST(request: Request) {
  const config = typingLeaderboardConfig();
  if (!config) return leaderboardError('unavailable', 503);
  const body = publicAction.safeParse(await leaderboardJson(request));
  if (!body.success) return leaderboardError('invalid', 400);
  const now = Date.now();
  const payload = body.data;
  if (payload.action === 'start')
    return leaderboardResponse({ ticket: createTypingTicket(payload.challenge, config.key, now) });

  if (!validTypingScore(payload.challenge, payload.correct, payload.accuracy))
    return leaderboardError('invalid', 400);
  const ticket = checkTypingTicket(payload.ticket, payload.challenge, config.key, now);
  if (ticket.error) return leaderboardError(ticket.error, ticket.error === 'tooSoon' ? 409 : 400);
  try {
    using db = openTypingLeaderboard(config.file);
    const result = submitTypingResult(db, {
      id: ticket.id,
      challenge: payload.challenge,
      nickname: payload.nickname,
      correct: payload.correct,
      accuracy: payload.accuracy,
      time: now,
    });
    if (result === 'alreadySubmitted') return leaderboardError(result, 409);
    if (result === 'rateLimited') return leaderboardError(result, 429);
    return leaderboardResponse({ id: ticket.id }, 201);
  } catch {
    return leaderboardError('unavailable', 503);
  }
}
