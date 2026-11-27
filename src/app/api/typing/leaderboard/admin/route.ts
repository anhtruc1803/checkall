import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  challengeId,
  entryId,
  leaderboardError,
  leaderboardJson,
  leaderboardResponse,
  typingLeaderboardConfig,
  typingRequestOrigin,
} from '@/lib/typing/server/leaderboard-http';
import { hideTypingResult, openTypingLeaderboard } from '@/lib/typing/server/leaderboard-store';
import {
  createTypingAdminSession,
  isTypingAdminKey,
  isTypingAdminSession,
  typingAdminCookie,
  typingAdminSessionSeconds,
} from '@/lib/typing/server/typing-admin-session';

export const runtime = 'nodejs';

const adminAction = z.discriminatedUnion('action', [
  z.strictObject({ action: z.literal('signIn') }),
  z.strictObject({ action: z.literal('signOut') }),
  z.strictObject({ action: z.literal('hide'), challenge: challengeId, id: entryId }),
]);

export async function POST(request: NextRequest) {
  const config = typingLeaderboardConfig();
  if (!config) return leaderboardError('unavailable', 503);
  const body = adminAction.safeParse(await leaderboardJson(request));
  if (!body.success) return leaderboardError('invalid', 400);

  const now = Date.now();
  const { action } = body.data;
  if (action === 'signIn' || action === 'signOut') {
    const signingIn = action === 'signIn';
    if (signingIn && !isTypingAdminKey(request, config.key))
      return leaderboardError('unauthorized', 401);
    const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(
      typingAdminCookie,
      signingIn ? createTypingAdminSession(config.key, now) : '',
      {
        httpOnly: true,
        sameSite: 'strict',
        secure: typingRequestOrigin(request).startsWith('https:'),
        path: '/',
        maxAge: signingIn ? typingAdminSessionSeconds : 0,
      },
    );
    return response;
  }

  if (!isTypingAdminSession(request.cookies.get(typingAdminCookie)?.value, config.key, now))
    return leaderboardError('unauthorized', 401);
  try {
    using db = openTypingLeaderboard(config.file);
    const hidden = hideTypingResult(db, body.data.challenge, body.data.id);
    return hidden ? leaderboardResponse({ ok: true }) : leaderboardError('notFound', 404);
  } catch {
    return leaderboardError('unavailable', 503);
  }
}
