import { describe, it, expect } from 'vitest';
import {
  aspectRatio,
  ppi,
  summarizeIntervals,
  analyzeChatter,
  clickAnalysis,
  cps,
  pointerStatistics,
  dimensionsSchema,
} from '@/lib/measurements/calculations';
import { tools, findTool, searchTools } from '@/lib/tools/registry';
describe('calculators', () => {
  it('reduces integer ratios and recognizes common formats', () => {
    expect(aspectRatio(1920, 1080)).toEqual({
      ratio: '16:9',
      decimal: 1920 / 1080,
      common: '16:9',
    });
    expect(aspectRatio(3440, 1440).ratio).toBe('43:18');
  });
  it('calculates PPI and rejects invalid inputs', () => {
    expect(ppi(1920, 1080, 24)).toBeCloseTo(91.79, 2);
    expect(() => ppi(0, 1080, 24)).toThrow();
    expect(() => ppi(1920, 1080, 0)).toThrow();
    expect(dimensionsSchema.safeParse({ width: Infinity, height: 2 }).success).toBe(false);
  });
});
describe('timing', () => {
  it('calculates measured frequency without snapping to a standard', () => {
    expect(summarizeIntervals([10, 10, 10]).frequency).toBe(100);
    expect(summarizeIntervals([7, 8, 9]).frequency).toBe(125);
    expect(summarizeIntervals([0, NaN, Infinity, 1000, -2, 10]).rejected).toBe(5);
    expect(summarizeIntervals([]).frequency).toBe(0);
  });
  it('separates auto repeat from release/press chatter', () => {
    const result = analyzeChatter(
      [
        { code: 'KeyA', type: 'keydown', time: 0, repeat: false },
        { code: 'KeyA', type: 'keydown', time: 10, repeat: true },
        { code: 'KeyA', type: 'keyup', time: 20, repeat: false },
        { code: 'KeyA', type: 'keydown', time: 25, repeat: false },
      ],
      15,
    );
    expect(result[0]).toMatchObject({ presses: 2, repeats: 1, suspicious: 1, shortestGap: 5 });
  });
  it('calculates click gaps, CPS and observed pointer rate', () => {
    expect(clickAnalysis([0, 5000], 80).mean).toBe(5000);
    expect(clickAnalysis([0, 50, 300], 80).suspicious).toBe(1);
    expect(cps(15, 5000)).toBe(3);
    expect(cps(0, 0)).toBe(0);
    expect(pointerStatistics([0, 5, 10, 15]).frequency).toBe(200);
  });
});
describe('registry', () => {
  it('publishes exactly 21 unique bilingual capabilities', () => {
    const published = tools.filter((tool) => tool.status === 'published' && tool.phase === 1);
    expect(published).toHaveLength(21);
    expect(new Set(published.map((t) => t.id)).size).toBe(21);
    expect(published.filter((t) => t.category === 'screen')).toHaveLength(11);
    for (const t of published) {
      expect(t.copy.en.limitations.length).toBeGreaterThan(30);
      expect(t.copy.vi.instructions.length).toBeGreaterThan(30);
      expect(t.relatedTools.every((id) => tools.some((tool) => tool.id === id))).toBe(true);
    }
  });
  it('finds valid tools and searches both locales without accents', () => {
    expect(findTool('screen', 'refresh-rate')?.id).toBe('A05');
    expect(findTool('network', 'speed')).toBeUndefined();
    expect(searchTools('ban phim').length).toBeGreaterThan(0);
    expect(searchTools('do phan giai')[0]?.id).toBe('A01');
    expect(searchTools('polling')[0].id).toBe('C05');
  });
});
