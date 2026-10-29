import { it, expect, vi, afterEach } from 'vitest';
import { startFrameSampler } from '@/lib/measurements/frame-sampler';
afterEach(() => vi.unstubAllGlobals());
it('excludes warm-up, finishes a sampling window, and cancels resources', () => {
  let callback: FrameRequestCallback = () => {};
  const cancel = vi.fn();
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((next: FrameRequestCallback) => {
      callback = next;
      return 1;
    }),
  );
  vi.stubGlobal('cancelAnimationFrame', cancel);
  const samples = vi.fn();
  const stop = startFrameSampler(1000, samples);
  for (let time = 0; time <= 1500; time += 10) callback(time);
  expect(samples.mock.lastCall?.[0].finished).toBe(true);
  expect(samples.mock.lastCall?.[0].intervals).toHaveLength(100);
  expect(samples.mock.lastCall?.[0].intervals.every((interval: number) => interval === 10)).toBe(
    true,
  );
  stop();
  expect(cancel).toHaveBeenCalled();
});
