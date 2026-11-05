export const inputFftSize = 2048;
export const inputSessionDuration = 60_000;
export interface InputReading {
  rms: number;
  peak: number;
  dbfs: number;
  nearFullScale: number;
  strongestBin: number | null;
  binWidth: number;
  upperFrequency: number;
  waveform: number[];
  spectrum: number[];
}
/** Digital stream samples only. No acoustic calibration or inferred hardware ratings. */
export function analyseInput(
  time: Float32Array,
  frequencies: Float32Array,
  sampleRate: number,
): InputReading {
  if (
    !time.length ||
    frequencies.length * 2 !== time.length ||
    !Number.isFinite(sampleRate) ||
    sampleRate <= 40
  )
    throw new Error('Invalid analysis input');
  let sum = 0,
    peak = 0,
    near = 0;
  for (const value of time) {
    if (!Number.isFinite(value)) throw new Error('Invalid sample');
    sum += value * value;
    peak = Math.max(peak, Math.abs(value));
    if (Math.abs(value) >= 0.99) near++;
  }
  const rms = Math.sqrt(sum / time.length),
    binWidth = sampleRate / time.length;
  let strongest = -Infinity,
    index = -1;
  for (let i = 0; i < frequencies.length; i++) {
    const value = frequencies[i];
    if (Number.isNaN(value) || value === Infinity) throw new Error('Invalid FFT sample');
    if (i * binWidth >= 20 && i * binWidth <= 20_000 && value > strongest) {
      strongest = value;
      index = i;
    }
  }
  const upperFrequency = Math.min(20_000, sampleRate / 2);
  const spectrum = Array.from({ length: 64 }, (_, bar) => {
    const lower = 20 * (upperFrequency / 20) ** (bar / 64);
    const upper = 20 * (upperFrequency / 20) ** ((bar + 1) / 64);
    let value = -Infinity;
    for (
      let i = Math.max(1, Math.ceil(lower / binWidth));
      i < Math.min(frequencies.length, Math.ceil(upper / binWidth));
      i++
    )
      value = Math.max(value, frequencies[i]);
    // Empty FFT bands remain zero, rather than interpolating fabricated readings.
    return Math.max(0, Math.min(1, (value + 100) / 90));
  });
  return {
    rms,
    peak,
    dbfs: rms > 0 ? 20 * Math.log10(rms) : -Infinity,
    nearFullScale: near / time.length,
    strongestBin: rms > 0.00001 && strongest > -100 && index >= 0 ? index * binWidth : null,
    binWidth,
    upperFrequency,
    waveform: Array.from({ length: 64 }, (_, i) => time[Math.floor((i * time.length) / 64)]),
    spectrum,
  };
}
