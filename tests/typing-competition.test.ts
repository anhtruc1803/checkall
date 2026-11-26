import { expect, it } from 'vitest';
import { readPreference, saveSummary, writePreference } from '@/lib/storage/preferences';
import { rankTypingAttempts } from '@/lib/typing/competition';

it('ranks by correct characters at fixed duration, then accuracy, with shared ranks', () => {
  const scores = [
    { name: 'first tie', correct: 300, accuracy: 95 },
    { name: 'slower', correct: 299, accuracy: 100 },
    { name: 'second tie', correct: 300, accuracy: 95 },
    { name: 'most accurate', correct: 300, accuracy: 99 },
  ];
  expect(rankTypingAttempts(scores).map(({ attempt, rank }) => [attempt.name, rank])).toEqual([
    ['most accurate', 1],
    ['first tie', 2],
    ['second tie', 2],
    ['slower', 4],
  ]);
  expect(scores[0].name).toBe('first tie');
});

it('stores only validated competition summaries after opt-in, alongside legacy summaries', () => {
  const competition = {
    toolId: 'B06',
    time: '2026-11-26T00:00:00.000Z',
    value: '60.0 WPM · 95.0%',
    competition: { challenge: 'morning-v1', nickname: 'Ánh', correct: 300, accuracy: 95 },
  } as const;
  const legacy = { toolId: 'A05', time: 'now', value: '60 Hz' };
  expect(saveSummary(competition)).toBe(false);
  writePreference('save', true);
  expect(saveSummary(legacy)).toBe(true);
  expect(saveSummary(competition)).toBe(true);
  expect(
    saveSummary({ ...competition, competition: { ...competition.competition, correct: 0.5 } }),
  ).toBe(false);
  expect(readPreference('summaries', [])).toEqual([competition, legacy]);
});
