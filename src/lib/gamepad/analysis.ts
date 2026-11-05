export const padLimits = { devices: 16, axes: 64, buttons: 128, path: 120 } as const;
export interface PadReading {
  index: number;
  id: string;
  mapping: string;
  axes: (number | null)[];
  buttons: { value: number | null; pressed: boolean | null; touched: boolean | null }[];
  truncated: boolean;
}
export function axisValue(value: number): number | null {
  return Number.isFinite(value) && value >= -1 && value <= 1 ? value : null;
}
export function readPad(pad: Gamepad): PadReading {
  return {
    index: pad.index,
    id: pad.id.slice(0, 256),
    mapping: pad.mapping,
    axes: Array.from({ length: Math.min(pad.axes.length, padLimits.axes) }, (_, index) =>
      axisValue(pad.axes[index]),
    ),
    buttons: Array.from(
      { length: Math.min(pad.buttons.length, padLimits.buttons) },
      (_, index) => pad.buttons[index],
    ).map((button) => ({
      value:
        Number.isFinite(button.value) && button.value >= 0 && button.value <= 1
          ? button.value
          : null,
      pressed: typeof button.pressed === 'boolean' ? button.pressed : null,
      touched: typeof button.touched === 'boolean' ? button.touched : null,
    })),
    truncated: pad.axes.length > padLimits.axes || pad.buttons.length > padLimits.buttons,
  };
}
export interface DriftResult {
  count: number;
  duration: number;
  meanX: number;
  meanY: number;
  meanRadius: number;
  rmsRadius: number;
  maxRadius: number;
  outsideFraction: number;
  threshold: number;
}
// Raw browser observations, including repeated values. Never infer USB sample rate or subtract bias.
export class DriftAccumulator {
  private count = 0;
  private first = 0;
  private last = 0;
  private sumX = 0;
  private sumY = 0;
  private sumRadius = 0;
  private sumSquaredRadius = 0;
  private maxRadius = 0;
  private outside = 0;
  constructor(private threshold: number) {}
  add(x: number, y: number, now: number): boolean {
    if (
      axisValue(x) === null ||
      axisValue(y) === null ||
      !Number.isFinite(now) ||
      (this.count && now <= this.last)
    )
      return false;
    if (!this.count) this.first = now;
    this.last = now;
    this.count++;
    const radius = Math.hypot(x, y);
    this.sumX += x;
    this.sumY += y;
    this.sumRadius += radius;
    this.sumSquaredRadius += radius * radius;
    this.maxRadius = Math.max(this.maxRadius, radius);
    if (radius > this.threshold) this.outside++;
    return true;
  }
  result(): DriftResult | null {
    const duration = this.last - this.first;
    if (this.count < 30 || duration < 4500) return null;
    return {
      count: this.count,
      duration,
      meanX: this.sumX / this.count,
      meanY: this.sumY / this.count,
      meanRadius: this.sumRadius / this.count,
      rmsRadius: Math.sqrt(this.sumSquaredRadius / this.count),
      maxRadius: this.maxRadius,
      outsideFraction: this.outside / this.count,
      threshold: this.threshold,
    };
  }
}
