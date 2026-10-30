import { it, expect, vi, afterEach } from 'vitest';
import {
  readDeviceDetails,
  readCompatibility,
  readPointerCapabilities,
} from '@/lib/browser/device-details';
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it('reads browser observations without substituting missing hardware hints', () => {
  vi.stubGlobal('navigator', {
    userAgent: 'unknown',
    language: 'vi',
    languages: ['vi', 'en'],
    hardwareConcurrency: 8,
    maxTouchPoints: 0,
  });
  vi.stubGlobal('screen', { width: 1920, height: 1080 });
  vi.stubGlobal('innerWidth', 800);
  vi.stubGlobal('innerHeight', 600);
  vi.stubGlobal('devicePixelRatio', 1.5);
  expect(readDeviceDetails()).toMatchObject({
    os: '—',
    browser: '—',
    memoryGiB: null,
    logicalProcessors: 8,
    maxTouchPoints: 0,
    screen: '1920 × 1080',
    viewport: '800 × 600',
    dpr: 1.5,
  });
});
it('scans API presence without querying permissions, GPU or media devices', () => {
  const capture = vi.fn(),
    query = vi.fn(),
    audio = vi.fn();
  vi.stubGlobal('navigator', {
    mediaDevices: { getUserMedia: capture },
    permissions: { query },
    maxTouchPoints: 0,
  });
  vi.stubGlobal('AudioContext', audio);
  const canvas = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  const report = readCompatibility();
  expect(report.capabilities.mediaDevices).toBe('available');
  expect(report.capabilities.canvas).toBe('unavailable');
  expect(canvas).toHaveBeenCalledWith('2d');
  expect(canvas).not.toHaveBeenCalledWith('webgl');
  for (const operation of [capture, query, audio]) expect(operation).not.toHaveBeenCalled();
});
it('reports media queries and unknown queries without inventing a touch device', () => {
  vi.stubGlobal('navigator', { maxTouchPoints: 0 });
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      if (query === '(hover: hover)') throw Error('blocked');
      return { matches: query === '(pointer: fine)' };
    }),
  );
  expect(readPointerCapabilities()).toMatchObject({
    maxTouchPoints: 0,
    primaryFine: true,
    primaryCoarse: false,
    hover: null,
  });
});
