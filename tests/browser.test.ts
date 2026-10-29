import { it, expect, vi, afterEach } from 'vitest';
import { detectCapabilities, browserInfo } from '@/lib/browser/capabilities';
afterEach(() => vi.restoreAllMocks());
it('reports a blocked canvas context as unsupported', () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  expect(detectCapabilities().canvas).toBe(false);
});
it('identifies user agent data as best effort without inventing an unknown system', () => {
  expect(browserInfo('unknown')).toEqual({ browser: '—', os: '—' });
  expect(browserInfo('Mozilla Windows Chrome/120.0 Edg/120.0')).toEqual({
    browser: 'Edge',
    os: 'Windows',
  });
});
