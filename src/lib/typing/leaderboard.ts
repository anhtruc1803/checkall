export const leaderboardPath = '/api/typing/leaderboard';
export const leaderboardPageSize = 25;

export type PublicTypingEntry = {
  id: string;
  rank: number;
  nickname: string;
  correct: number;
  accuracy: number;
  time: string;
};

export type TypingBoard =
  | { enabled: false }
  | { enabled: true; entries: PublicTypingEntry[]; more: boolean };

export type LeaderboardError =
  | 'unavailable'
  | 'invalid'
  | 'expired'
  | 'tooSoon'
  | 'alreadySubmitted'
  | 'rateLimited'
  | 'unauthorized'
  | 'notFound';
