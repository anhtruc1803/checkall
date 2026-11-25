import { describe, expect, it } from 'vitest';
import { scoreTyping } from '@/lib/typing/score';

describe('Vietnamese typing score', () => {
  it('scores committed đ and canonically equivalent accents as one character each', () => {
    expect(scoreTyping('đường', 'đu\u031bo\u031b\u0300ng', 60_000)).toMatchObject({
      correct: 5,
      entered: 5,
      accuracy: 100,
      cpm: 5,
      wpm: 1,
    });
  });

  it('separates d/đ, tone and vowel form mistakes in the same attempt', () => {
    expect(scoreTyping('đi đến đó', 'di den do', 60_000)).toMatchObject({
      correct: 4,
      entered: 9,
      errors: { tone: 1, vowel: 1, letterD: 3, spacing: 0, other: 0 },
    });
  });

  it('aligns missing and extra spaces without penalizing the untouched suffix', () => {
    expect(scoreTyping('đi học rồi về', 'đihọc', 60_000)).toMatchObject({
      correct: 5,
      errors: { spacing: 1 },
      accuracy: (100 * 5) / 6,
    });
    expect(scoreTyping('đi học', 'đi  học', 60_000)).toMatchObject({
      correct: 6,
      errors: { spacing: 1 },
    });
  });

  it('omits remaining prompt characters and reports no score for empty input', () => {
    expect(scoreTyping('đi đến đó', 'đ', 60_000)).toMatchObject({ correct: 1, accuracy: 100 });
    expect(scoreTyping('đi đến đó', '', 60_000)).toMatchObject({
      correct: 0,
      accuracy: 0,
      cpm: 0,
      wpm: 0,
    });
  });
});
