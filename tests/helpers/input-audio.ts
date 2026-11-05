import { vi } from 'vitest';
import { fakeAudio } from './audio';
import { fakeStream } from './media';
export function fakeInput() {
  const audio = fakeAudio(),
    { stream, track } = fakeStream();
  Object.assign(track, { muted: false });
  const source = { connect: vi.fn(), disconnect: vi.fn() };
  const analyser = {
    fftSize: 2048,
    frequencyBinCount: 1024,
    smoothingTimeConstant: 0,
    minDecibels: 0,
    maxDecibels: 0,
    connect: vi.fn(),
    disconnect: vi.fn(),
    getFloatTimeDomainData: vi.fn((buffer: Float32Array) => buffer.fill(0.25)),
    getFloatFrequencyData: vi.fn((buffer: Float32Array) => {
      buffer.fill(-Infinity);
      buffer[40] = -20;
    }),
  };
  const context = Object.assign(audio.context, {
    createMediaStreamSource: vi.fn(() => source),
    createAnalyser: vi.fn(() => analyser),
  });
  const capture = vi.fn().mockResolvedValue(stream);
  return { ...audio, context, source, analyser, stream, track, capture };
}
