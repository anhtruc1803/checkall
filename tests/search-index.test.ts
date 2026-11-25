import { it, expect } from 'vitest';
import { getToolSearchIndex, tools, searchTools } from '@/lib/tools/registry';
import { searchToolIndex } from '@/lib/tools/search';
it('derives a localized index for all 50 published tools without methodology or draft metadata', () => {
  for (const locale of ['vi', 'en'] as const) {
    const index = getToolSearchIndex(locale);
    expect(index).toHaveLength(50);
    expect(
      index.filter((entry) => tools.find((tool) => tool.id === entry.id)?.phase === 1),
    ).toHaveLength(21);
    for (const entry of index) {
      expect(entry.name).toBe(tools.find((tool) => tool.id === entry.id)?.copy[locale].name);
      expect(entry).not.toHaveProperty('copy');
      expect(entry).not.toHaveProperty('instructions');
    }
    expect(searchToolIndex(index, 'ban phim').map((tool) => tool.id)).toEqual(
      searchTools('ban phim').map((tool) => tool.id),
    );
    expect(searchToolIndex(index, 'ĐỘ PHÂN GIẢI')[0].id).toBe('A01');
  }
});

it('finds the same diagnostic tools by Vietnamese and English symptom text', () => {
  const index = getToolSearchIndex('vi');
  for (const [queries, expected] of [
    [
      ['man hinh bi giat', 'screen feels choppy'],
      ['A05', 'A10'],
    ],
    [
      ['phím bị lặp', 'keys keep repeating'],
      ['B01', 'B03'],
    ],
    [
      ['mic khong hoat dong', 'microphone is not working'],
      ['D03', 'D05'],
    ],
  ]) {
    for (const query of queries)
      expect(searchToolIndex(index, query).map(({ id }) => id)).toEqual(expected);
  }
});
