import { describe, it, expect } from 'vitest';
import {
  tools,
  publishedTools,
  categories,
  findTool,
  getToolSearchIndex,
} from '@/lib/tools/registry';
import {
  getPublishedTools,
  getPublishedCategories,
  validateToolRegistry,
} from '@/lib/tools/catalog';
import { getSearchCategories } from '@/lib/tools/search';
import type { Tool } from '@/lib/tools/types';
import sitemap from '@/app/sitemap';

describe('Phase 2 publication boundary', () => {
  it('keeps 21 real Phase 1 tools and 19 explicitly unindexed drafts', () => {
    expect(tools).toHaveLength(40);
    expect(new Set(tools.map((tool) => tool.id)).size).toBe(40);
    expect(publishedTools).toHaveLength(21);
    expect(publishedTools.every((tool) => tool.phase === 1 && tool.permissions.length === 0)).toBe(
      true,
    );
    const drafts = tools.filter((tool) => tool.phase === 2);
    expect(drafts).toHaveLength(19);
    for (const draft of drafts) {
      expect(draft.status).toBe('draft');
      expect(draft.seo.index).toBe(false);
      expect(findTool(draft.category, draft.slug)).toBeUndefined();
      for (const locale of ['vi', 'en'] as const) {
        expect(getToolSearchIndex(locale).some((tool) => tool.id === draft.id)).toBe(false);
        expect(
          sitemap().some((item) => item.url.endsWith(`/${draft.category}/${draft.slug}`)),
        ).toBe(false);
      }
    }
  });
  it('derives navigation from published tools, even when a new category has only drafts', () => {
    expect(categories).toEqual(['screen', 'keyboard', 'mouse']);
    expect(getSearchCategories(getToolSearchIndex('en'))).toEqual(categories);
    expect(getPublishedTools(tools.filter((tool) => tool.phase === 2))).toEqual([]);
    expect(getPublishedCategories(tools.filter((tool) => tool.phase === 2))).toEqual([]);
    const audio = { ...tools.find((tool) => tool.id === 'D01')!, status: 'published' as const };
    expect(getPublishedCategories([audio])).toEqual(['audio']);
  });
  it.each([
    ['duplicate id', (tool: Tool): Tool[] => [tool, { ...tool, slug: 'another' }]],
    ['duplicate route', (tool: Tool): Tool[] => [tool, { ...tool, id: 'OTHER' }]],
    [
      'indexable draft',
      (tool: Tool): Tool[] => [{ ...tool, status: 'draft', seo: { index: true } }],
    ],
    ['missing engine', (tool: Tool): Tool[] => [{ ...tool, engine: 'camera' }]],
    [
      'draft related link',
      (tool: Tool): Tool[] => [
        { ...tool, relatedTools: ['D01'] },
        tools.find((item) => item.id === 'D01')!,
      ],
    ],
    [
      'missing translation',
      (tool: Tool): Tool[] => [
        { ...tool, copy: { ...tool.copy, vi: { ...tool.copy.vi, name: ' ' } } },
      ],
    ],
  ])('rejects %s before build/publication', (_, makeRegistry) => {
    const fixture = { ...publishedTools[0], relatedTools: [] };
    expect(() => validateToolRegistry(makeRegistry(fixture))).toThrow();
  });
  it('accepts a future implemented engine only when explicitly registered', () => {
    const draft = tools.find((tool) => tool.id === 'E01')!;
    expect(() =>
      validateToolRegistry([{ ...draft, status: 'published', seo: { index: true } }], ['camera']),
    ).not.toThrow();
  });
});
