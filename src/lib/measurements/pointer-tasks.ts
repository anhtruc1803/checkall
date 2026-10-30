export interface PointerPoint {
  x: number;
  y: number;
  time: number;
}
export class MovementMeasurement {
  width = 0;
  height = 0;
  setBounds(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  count = 0;
  distance = 0;
  first: PointerPoint | null = null;
  last: PointerPoint | null = null;
  private previous: PointerPoint | null = null;
  readonly trail: PointerPoint[] = [];
  add(point: PointerPoint) {
    if (
      ![point.x, point.y, point.time].every(Number.isFinite) ||
      point.time < 0 ||
      (this.last && point.time < this.last.time)
    )
      return false;
    if (this.count >= 100000) return false;
    if (this.previous)
      this.distance += Math.hypot(point.x - this.previous.x, point.y - this.previous.y);
    this.first ??= point;
    this.last = point;
    this.previous = point;
    this.count++;
    this.trail.push(point);
    if (this.trail.length > 120) this.trail.shift();
    return true;
  }
  breakPath() {
    this.previous = null;
  }
  get displacement() {
    return this.first && this.last
      ? Math.hypot(this.last.x - this.first.x, this.last.y - this.first.y)
      : null;
  }
}
export const accuracyTargets = [
  [0.5, 0.5],
  [0.22, 0.25],
  [0.78, 0.75],
  [0.78, 0.25],
  [0.22, 0.75],
  [0.5, 0.25],
  [0.5, 0.75],
  [0.22, 0.5],
  [0.78, 0.5],
  [0.5, 0.5],
] as const;
export class AccuracyMeasurement {
  attempts = 0;
  hits = 0;
  errorTotal = 0;
  lastError: number | null = null;
  record(x: number, y: number, centerX: number, centerY: number, radius: number) {
    if (
      ![x, y, centerX, centerY, radius].every(Number.isFinite) ||
      radius <= 0 ||
      this.hits >= accuracyTargets.length ||
      this.attempts >= 1000
    )
      return null;
    const error = Math.hypot(x - centerX, y - centerY),
      hit = error <= radius;
    this.attempts++;
    this.lastError = error;
    if (hit) {
      this.hits++;
      this.errorTotal += error;
    }
    return hit;
  }
  get accuracy() {
    return this.attempts ? (this.hits / this.attempts) * 100 : null;
  }
  get meanError() {
    return this.hits ? this.errorTotal / this.hits : null;
  }
}
