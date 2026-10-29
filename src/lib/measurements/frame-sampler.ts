export interface FrameSample {
  intervals: number[];
  elapsed: number;
  finished: boolean;
}
/** Warm-up is excluded. Updates at most four times per second; stop cancels RAF. */
export function startFrameSampler(durationMs: number, onSample: (sample: FrameSample) => void) {
  let frame = 0,
    start: number | undefined,
    last: number | undefined,
    lastUpdate = 0;
  const intervals: number[] = [];
  let cancelled = false;
  const tick = (time: number) => {
    if (cancelled) return;
    if (start === undefined) start = time;
    const elapsed = time - start;
    if (elapsed < 500) {
      last = undefined;
      frame = requestAnimationFrame(tick);
      return;
    }
    if (last !== undefined) intervals.push(time - last);
    last = time;
    const finished = elapsed - 500 >= durationMs;
    if (time - lastUpdate >= 250 || finished) {
      lastUpdate = time;
      onSample({ intervals: [...intervals], elapsed: elapsed - 500, finished });
    }
    if (!finished) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}
