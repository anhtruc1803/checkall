export const typingDifficulties = ['easy', 'medium', 'hard'] as const;
export type TypingDifficulty = (typeof typingDifficulties)[number];
