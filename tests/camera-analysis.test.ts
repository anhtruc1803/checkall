import { expect, it } from 'vitest';
import { FrameWindow, positive } from '@/lib/camera/frame-analysis';
it('measures compositor frame deltas rather than callback count or reported FPS', () => {
  const window = new FrameWindow();
  window.add(100, 4);
  window.add(1100, 34);
  expect(window.get(1100)).toBeNull();
  window.add(2100, 64);
  expect(window.get(2100)).toEqual({ fps: 30, frames: 60, duration: 2000 });
  window.add(3000, 64); // Repeated metadata must not keep an old measurement alive.
  expect(window.get(4101)).toBeNull();
  window.add(5100, 65);
  expect(window.get(5100)).toBeNull();
  window.add(7100, 85);
  expect(window.get(7100)?.fps).toBe(10);
  window.reset();
  expect(window.get(7100)).toBeNull();
});
it('discards counter/time discontinuities and invalid metadata', () => {
  for (const [time, count] of [
    [0, 100],
    [2100, 101],
    [2000, 100],
    [2200, 0],
    [NaN, 50],
    [Infinity, 3],
    [3000, -1],
    [3000, 1.5],
  ]) {
    const window = new FrameWindow();
    window.add(100, 30);
    window.add(2100, 90);
    window.add(time, count);
    expect(window.get(time)).toBeNull();
  }
  expect([undefined, 0, -10, NaN, Infinity].map(positive)).toEqual([null, null, null, null, null]);
  expect(positive(29.97)).toBe(29.97);
});
