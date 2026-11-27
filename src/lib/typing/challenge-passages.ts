import { timedPassages } from './lessons';
import type { TypingChallengeId } from './competition';

// A versioned ID identifies the exact passage used for shared links and scoring.
export const challengePassages = {
  'morning-v1': timedPassages.medium,
  'riverside-v1': timedPassages.hard,
} satisfies Record<TypingChallengeId, string>;
