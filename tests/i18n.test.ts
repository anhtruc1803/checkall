import { it, expect } from 'vitest';
import vi from '@/messages/vi.json';
import en from '@/messages/en.json';
import sitemap from '@/app/sitemap';
import { categoryOrder } from '@/lib/tools/types';
it('keeps all category labels as plain translated text, separate from engine namespaces', () => {
  for (const messages of [vi, en])
    for (const category of categoryOrder) {
      expect(typeof messages[category]).toBe('string');
      expect(messages[category].trim().length).toBeGreaterThan(0);
    }
});
it('keeps complete translation key parity', () => {
  const flatten = (messages: Record<string, unknown>, prefix = ''): Record<string, string> =>
    Object.assign(
      {},
      ...Object.entries(messages).map(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'string') return { [path]: value };
        if (value && typeof value === 'object')
          return flatten(value as Record<string, unknown>, path);
        throw new Error(`Invalid translation at ${path}`);
      }),
    );
  const vietnamese = flatten(vi),
    english = flatten(en);
  expect(Object.keys(vietnamese).sort()).toEqual(Object.keys(english).sort());
  for (const value of [...Object.values(vietnamese), ...Object.values(english)])
    expect(value.trim().length).toBeGreaterThan(0);
});
it('publishes only the 100 real localized routes in sitemap with alternates', () => {
  const entries = sitemap();
  expect(entries).toHaveLength(100);
  expect(
    entries.every((entry) => entry.alternates?.languages?.vi && entry.alternates?.languages?.en),
  ).toBe(true);
  expect(entries.some((entry) => entry.url.includes('network'))).toBe(false);
});
