import { expect, it } from 'vitest';
import { analyseInput } from '@/lib/audio/input-analysis';
it('computes digital RMS, peak and dBFS from actual input samples', () => {
  const time = new Float32Array(2048).fill(0.5),
    bins = new Float32Array(1024).fill(-Infinity);
  bins[40] = -20;
  const result = analyseInput(time, bins, 48000);
  expect(result.rms).toBe(0.5);
  expect(result.peak).toBe(0.5);
  expect(result.dbfs).toBeCloseTo(-6.0206);
  expect(result.strongestBin).toBe(937.5);
  expect(result.binWidth).toBe(23.4375);
  expect(result.waveform).toHaveLength(64);
  expect(result.spectrum).toHaveLength(64);
  expect(result.spectrum.some((bar) => bar > 0)).toBe(true);
});
it('preserves real silence without inventing a frequency or a noise floor', () => {
  const result = analyseInput(
    new Float32Array(2048),
    new Float32Array(1024).fill(-Infinity),
    44100,
  );
  expect(result.rms).toBe(0);
  expect(result.dbfs).toBe(-Infinity);
  expect(result.strongestBin).toBeNull();
  expect(result.spectrum.every((value) => value === 0)).toBe(true);
});
it('counts near-full-scale samples and retains peaks beyond ±1', () => {
  const result = analyseInput(
    new Float32Array([1.2, -1, 0, 0]),
    new Float32Array([-Infinity, -10]),
    48000,
  );
  expect(result.peak).toBeCloseTo(1.2);
  expect(result.nearFullScale).toBe(0.5);
});
it('excludes DC/out-of-display bins and low-level strongest-bin readings', () => {
  const time = new Float32Array(2048).fill(0.000001),
    bins = new Float32Array(1024).fill(-Infinity);
  bins[0] = 0;
  bins[900] = 0;
  bins[40] = -110;
  expect(analyseInput(time, bins, 48000).strongestBin).toBeNull();
  time.fill(0.25);
  bins[40] = -20;
  expect(analyseInput(time, bins, 48000).strongestBin).toBe(937.5);
});
it('does not fill empty log bands with interpolated measurements', () => {
  const bins = new Float32Array(1024).fill(-Infinity);
  bins[1] = -10;
  const result = analyseInput(new Float32Array(2048).fill(0.1), bins, 48000);
  expect(result.spectrum.filter((value) => value > 0)).toHaveLength(1);
  expect(result.upperFrequency).toBe(20000);
  expect(analyseInput(new Float32Array(2048), bins, 32000).upperFrequency).toBe(16000);
});
it.each(['time', 'bins', 'rate', 'length'])(
  'rejects invalid %s instead of returning fake zeroes',
  (kind) => {
    const time = new Float32Array(2048),
      bins = new Float32Array(1024).fill(-Infinity);
    if (kind === 'time') time[0] = NaN;
    if (kind === 'bins') bins[0] = Infinity;
    expect(() =>
      analyseInput(kind === 'length' ? time.slice(1) : time, bins, kind === 'rate' ? NaN : 48000),
    ).toThrow();
  },
);
