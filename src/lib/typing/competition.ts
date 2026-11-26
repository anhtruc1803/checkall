export const typingChallengeIds = ['morning-v1', 'riverside-v1'] as const;
export type TypingChallengeId = (typeof typingChallengeIds)[number];

type CompetitionScore = { correct: number; accuracy: number };

export function rankTypingAttempts<T extends CompetitionScore>(attempts: readonly T[]) {
  const sorted = [...attempts].sort(
    (left, right) => right.correct - left.correct || right.accuracy - left.accuracy,
  );
  let rank = 0;
  return sorted.map((attempt, index) => {
    const previous = sorted[index - 1];
    if (!previous || previous.correct !== attempt.correct || previous.accuracy !== attempt.accuracy)
      rank = index + 1;
    return { attempt, rank };
  });
}
