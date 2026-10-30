import { vi } from 'vitest';
export function fakeAudio(sampleRate = 48_000) {
  const param = (value = 0) => ({
    value,
    cancelScheduledValues: vi.fn(),
    setTargetAtTime: vi.fn(),
  });
  const node = () => ({ connect: vi.fn(), disconnect: vi.fn() });
  const oscillator = { ...node(), frequency: param(), type: 'sine', start: vi.fn(), stop: vi.fn() };
  const gains = Array.from({ length: 3 }, () => ({ ...node(), gain: param(1) }));
  const merger = node(),
    destination = node();
  let index = 0;
  const context = {
    sampleRate,
    currentTime: 1,
    state: 'running',
    destination,
    onstatechange: null as (() => void) | null,
    resume: vi.fn(async () => {}),
    close: vi.fn(async () => {
      context.state = 'closed';
    }),
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gains[index++]),
    createChannelMerger: vi.fn(() => merger),
  };
  const factory = vi.fn(function () {
    return context as unknown as AudioContext;
  });
  return { factory, context, oscillator, gains, merger, destination };
}
