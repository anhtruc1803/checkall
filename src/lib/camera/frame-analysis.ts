export interface FrameReading {
  fps: number;
  frames: number;
  duration: number;
}
// Compositor submissions, not sensor exposures or display refresh cycles.
export class FrameWindow {
  private first: { now: number; frames: number } | null = null;
  private last: { now: number; frames: number } | null = null;
  private reading: FrameReading | null = null;
  reset() {
    this.first = this.last = this.reading = null;
  }
  add(now: number, frames: number) {
    if (!Number.isFinite(now) || !Number.isSafeInteger(frames) || frames < 0) {
      this.reset();
      return;
    }
    if (
      this.last &&
      (now <= this.last.now || frames < this.last.frames || now - this.last.now > 2000)
    )
      this.reset();
    if (this.last && frames === this.last.frames) return;
    this.last = { now, frames };
    this.first ??= this.last;
    const duration = now - this.first.now;
    const count = frames - this.first.frames;
    if (duration >= 2000 && count > 0) {
      this.reading = { fps: (count * 1000) / duration, frames: count, duration };
      this.first = this.last;
    }
  }
  get(now: number): FrameReading | null {
    return this.last && now - this.last.now <= 2000 ? this.reading : null;
  }
}
export function positive(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}
