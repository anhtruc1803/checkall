import { beforeEach, it, expect } from 'vitest';
import {
  readPreference,
  writePreference,
  saveSummary,
  clearLocalData,
} from '@/lib/storage/preferences';
beforeEach(() => localStorage.clear());
it('saves compact summaries only with opt-in and caps history', () => {
  expect(saveSummary({ toolId: 'A05', time: 'now', value: '60 Hz' })).toBe(false);
  writePreference('save', true);
  for (let i = 0; i < 40; i++) saveSummary({ toolId: 'A05', time: String(i), value: 'observed' });
  expect(readPreference<unknown[]>('summaries', [])).toHaveLength(30);
});
it('handles corrupt preferences and preserves unrelated storage on deletion', () => {
  localStorage.setItem('device-lab:summaries', '{}');
  writePreference('save', true);
  expect(saveSummary({ toolId: 'A05', time: 'now', value: 'estimate' })).toBe(true);
  localStorage.setItem('device-lab:theme', '{');
  expect(readPreference('theme', 'dark')).toBe('dark');
  localStorage.setItem('other-app', 'keep');
  writePreference('save', true);
  clearLocalData();
  expect(localStorage.getItem('other-app')).toBe('keep');
  expect(readPreference('save', false)).toBe(false);
});
it('round-trips typed scores alongside legacy summaries and rejects invalid scores', () => {
  const legacy = { toolId: 'A05', time: 'now', value: '60 Hz' };
  const typing = {
    toolId: 'B06',
    time: '2026-11-25T12:00:00.000Z',
    value: '40 WPM · 97.5%',
    typing: { difficulty: 'medium' as const, wpm: 40, accuracy: 97.5 },
  };
  expect(saveSummary(typing)).toBe(false);
  writePreference('save', true);
  expect(saveSummary(legacy)).toBe(true);
  expect(saveSummary(typing)).toBe(true);
  expect(saveSummary({ ...typing, typing: { ...typing.typing, accuracy: 101 } })).toBe(false);
  expect(readPreference('summaries', [])).toEqual([typing, legacy]);
});
