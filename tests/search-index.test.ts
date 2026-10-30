import { it, expect } from 'vitest';
import { getToolSearchIndex, tools, searchTools } from '@/lib/tools/registry';
import { searchToolIndex } from '@/lib/tools/search';
it('derives a localized index for all 32 published tools without methodology or draft metadata', () => {
  for (const locale of ['vi', 'en'] as const) {
    const index = getToolSearchIndex(locale);
    expect(index).toHaveLength(32);
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
