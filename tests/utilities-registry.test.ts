import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { publishedTools, searchTools, findTool } from '@/lib/tools/registry';
import { getToolGroup, getPublishedGroups } from '@/lib/tools/groups';

it('preserves all 40 original published IDs, routes and engine/capability metadata', () => {
  const original = publishedTools.filter((tool) => getToolGroup(tool.category) === 'device-tests');
  expect(original).toHaveLength(40);
  expect(original.map((tool) => tool.id).sort()).toEqual([
    ...Array.from({ length: 11 }, (_, i) => `A${String(i + 1).padStart(2, '0')}`),
    ...Array.from({ length: 5 }, (_, i) => `B${String(i + 1).padStart(2, '0')}`),
    ...Array.from({ length: 7 }, (_, i) => `C${String(i + 1).padStart(2, '0')}`),
    ...Array.from({ length: 5 }, (_, i) => `D${String(i + 1).padStart(2, '0')}`),
    'E01',
    'E02',
    'E03',
    'F01',
    'F02',
    'F03',
    'G01',
    'G02',
    'G03',
    'G04',
    'G05',
    'G06',
  ]);
  // Freeze original source definitions, including copy and every testing engine.
  // Baseline is a committed fixture, independent of the current checkout's Git availability.
  const baseline = JSON.parse(readFileSync('tests/fixtures/device-tools-baseline.json', 'utf8'));
  expect(original).toEqual(baseline);
});
it('preserves both original utility definitions including localized copy', () => {
  const baseline = JSON.parse(
    readFileSync('tests/fixtures/utility-milestone1-baseline.json', 'utf8'),
  );
  expect(publishedTools.filter((tool) => ['U01', 'U02'].includes(tool.id))).toEqual(baseline);
});
it('registers six calculators on the independent utility roadmap without permission or storage capabilities', () => {
  expect(getPublishedGroups(publishedTools)).toEqual(['device-tests', 'utilities']);
  const utilities = publishedTools.filter((tool) => getToolGroup(tool.category) === 'utilities');
  expect(utilities.map((tool) => tool.id)).toEqual(['U01', 'U02', 'U03', 'U04', 'U05', 'U06']);
  for (const tool of utilities) {
    expect(tool.phase).toBeNull();
    expect(tool.classification).toBe('calculator');
    expect(tool.permissions).toEqual([]);
    expect(tool.requiredCapabilities).toEqual([]);
    expect(tool.optionalCapabilities).toEqual([]);
    expect(findTool(tool.category, tool.slug)).toBe(tool);
  }
  expect(searchTools('số tiền').map((tool) => tool.id)).toContain('U01');
  expect(searchTools('percentage').map((tool) => tool.id)).toContain('U02');
  expect(getPublishedGroups([{ category: 'utilities', status: 'draft' }])).toEqual([]);
});
