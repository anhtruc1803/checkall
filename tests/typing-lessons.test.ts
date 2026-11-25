import { expect, it } from 'vitest';
import { typingDifficulties } from '@/lib/typing/difficulty';
import { typingKeyHint } from '@/lib/typing/keyboard-guide';
import { practiceLessons, timedPassages } from '@/lib/typing/lessons';

it('has three distinct practice lessons at each level and a full timed passage per level', () => {
  const lessons = Object.values(practiceLessons);
  expect(lessons).toHaveLength(9);
  expect(new Set(lessons.map((lesson) => lesson.passage)).size).toBe(9);
  for (const difficulty of typingDifficulties) {
    expect(lessons.filter((lesson) => lesson.difficulty === difficulty)).toHaveLength(3);
    expect(timedPassages[difficulty].length).toBeGreaterThan(1000);
  }
});

it('maps Vietnamese sample characters to base QWERTY keys and their recommended fingers', () => {
  expect(typingKeyHint('ứ')).toEqual({ key: 'u', finger: 6, shifted: false });
  expect(typingKeyHint('Đ')).toEqual({ key: 'd', finger: 3, shifted: true });
  expect(typingKeyHint(':')).toEqual({ key: ';', finger: 9, shifted: true });
  expect(typingKeyHint(' ')).toEqual({ key: ' ', finger: 5, shifted: false });
  expect(typingKeyHint(undefined)).toBeNull();
});
