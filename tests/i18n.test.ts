import { it, expect } from 'vitest';
import vi from '@/messages/vi.json';
import en from '@/messages/en.json';
import sitemap from '@/app/sitemap';
it('keeps complete translation key parity', () => {
  expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
  for (const value of [...Object.values(vi), ...Object.values(en)])
    expect(value.trim().length).toBeGreaterThan(0);
});
it('publishes only the 52 real localized routes in sitemap with alternates', () => {
  const entries = sitemap();
  expect(entries).toHaveLength(52);
  expect(
    entries.every((entry) => entry.alternates?.languages?.vi && entry.alternates?.languages?.en),
  ).toBe(true);
  expect(entries.some((entry) => entry.url.includes('network'))).toBe(false);
});
