import { expect, it } from 'vitest';
import { accentTopics } from '@/lib/typing/accents';
import { typingDifficulties } from '@/lib/typing/difficulty';
import { keyboardRows, typingKeyHint } from '@/lib/typing/keyboard-guide';
import { practiceLessons, timedPassages } from '@/lib/typing/lessons';

it('has 31 distinct lessons, with six passages and a full timed sample at each level', () => {
  const lessons = Object.values(practiceLessons);
  expect(lessons).toHaveLength(31);
  expect(new Set(lessons.map((lesson) => lesson.passage)).size).toBe(31);
  for (const difficulty of typingDifficulties) {
    expect(
      lessons.filter((lesson) => lesson.group === 'text' && lesson.difficulty === difficulty),
    ).toHaveLength(6);
    expect(timedPassages[difficulty].length).toBeGreaterThan(1000);
  }
  expect(lessons.filter((lesson) => lesson.group === 'accents')).toHaveLength(7);
  for (const topic of accentTopics) expect(practiceLessons[topic].group).toBe('accents');
});

it('targets each intended QWERTY row and uses only those keys and space in single-row drills', () => {
  const drills = Object.values(practiceLessons).filter((lesson) => lesson.group === 'rows');
  expect(drills.map((lesson) => lesson.row)).toEqual([
    'home',
    'home',
    'upper',
    'lower',
    'number',
    'mixed',
  ]);
  for (const { row, passage } of drills) {
    const allowed = keyboardRows
      .filter((keys) => keys.id === row || keys.id === 'space' || row === 'mixed')
      .flatMap((keys) => keys.keys.map((key) => key.key));
    expect([...passage].every((character) => allowed.includes(character))).toBe(true);
  }
});

it('maps Vietnamese sample characters to base QWERTY keys and their recommended fingers', () => {
  expect(typingKeyHint('ứ')).toEqual({ key: 'u', finger: 6, shifted: false });
  expect(typingKeyHint('Đ')).toEqual({ key: 'd', finger: 3, shifted: true });
  expect(typingKeyHint(':')).toEqual({ key: ';', finger: 9, shifted: true });
  expect(typingKeyHint(' ')).toEqual({ key: ' ', finger: 5, shifted: false });
  expect(typingKeyHint(undefined)).toBeNull();
});
