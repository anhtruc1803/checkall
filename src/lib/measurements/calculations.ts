import { z } from 'zod/mini';
import type { IntervalSummary } from './types';
export const dimensionsSchema = z.object({
  width: z.int().check(z.gt(0), z.lte(100000)),
  height: z.int().check(z.gt(0), z.lte(100000)),
});
export const ppiSchema = z.extend(dimensionsSchema, {
  diagonal: z.number().check(z.gt(0), z.lte(1000)),
});
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
export function aspectRatio(width: number, height: number) {
  dimensionsSchema.parse({ width, height });
  const divisor = gcd(width, height);
  const decimal = width / height;
  const common = [
    [16, 9],
    [16, 10],
    [4, 3],
    [21, 9],
    [3, 2],
    [1, 1],
    [32, 9],
    [9, 16],
  ].find(([w, h]) => Math.abs(decimal - w / h) < 0.015);
  return {
    ratio: `${width / divisor}:${height / divisor}`,
    decimal,
    common: common ? `${common[0]}:${common[1]}` : null,
  };
}
export function ppi(width: number, height: number, diagonal: number) {
  ppiSchema.parse({ width, height, diagonal });
  return Math.hypot(width, height) / diagonal;
}
export function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b),
    mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
export function summarizeIntervals(intervals: number[], maximumInterval = 1000): IntervalSummary {
  const valid = intervals.filter((v) => Number.isFinite(v) && v > 0 && v < maximumInterval);
  if (!valid.length)
    return {
      count: 0,
      median: 0,
      mean: 0,
      min: 0,
      max: 0,
      standardDeviation: 0,
      frequency: 0,
      rejected: intervals.length,
    };
  const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  return {
    count: valid.length,
    median: median(valid),
    mean,
    min: Math.min(...valid),
    max: Math.max(...valid),
    standardDeviation: Math.sqrt(valid.reduce((sum, v) => sum + (v - mean) ** 2, 0) / valid.length),
    frequency: 1000 / median(valid),
    rejected: intervals.length - valid.length,
  };
}
export function intervalsFromTimestamps(timestamps: number[]) {
  return timestamps.slice(1).map((time, index) => time - timestamps[index]);
}
export function pointerStatistics(timestamps: number[]) {
  const intervals = intervalsFromTimestamps(timestamps);
  const stats = summarizeIntervals(intervals);
  const duration = timestamps.length > 1 ? timestamps[timestamps.length - 1] - timestamps[0] : 0;
  return {
    ...stats,
    frequency: duration > 0 ? ((timestamps.length - 1) * 1000) / duration : 0,
    duration,
  };
}
export function clickAnalysis(times: number[], threshold: number) {
  const intervals = intervalsFromTimestamps(times);
  return {
    intervals,
    suspicious: intervals.filter((v) => v >= 0 && v <= threshold).length,
    ...summarizeIntervals(intervals, Infinity),
  };
}
export function cps(clicks: number, durationMs: number) {
  return durationMs > 0 && clicks >= 0 ? (clicks * 1000) / durationMs : 0;
}
export interface InputRecord {
  code: string;
  type: 'keydown' | 'keyup';
  time: number;
  repeat: boolean;
}
export function analyzeChatter(events: InputRecord[], threshold: number) {
  const lastRelease = new Map<string, number>();
  const keys = new Map<
    string,
    { presses: number; repeats: number; suspicious: number; shortestGap: number | null }
  >();
  for (const e of events) {
    const data = keys.get(e.code) ?? { presses: 0, repeats: 0, suspicious: 0, shortestGap: null };
    if (e.type === 'keyup') lastRelease.set(e.code, e.time);
    else if (e.repeat) data.repeats++;
    else {
      data.presses++;
      const previous = lastRelease.get(e.code);
      if (previous !== undefined) {
        const gap = e.time - previous;
        if (gap >= 0) {
          data.shortestGap = data.shortestGap === null ? gap : Math.min(gap, data.shortestGap);
          if (gap <= threshold) data.suspicious++;
        }
        lastRelease.delete(e.code);
      }
    }
    keys.set(e.code, data);
  }
  return [...keys].map(([code, data]) => ({ code, ...data }));
}
