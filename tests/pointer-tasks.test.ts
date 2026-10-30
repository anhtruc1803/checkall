import { it, expect } from 'vitest';
import { MovementMeasurement, AccuracyMeasurement } from '@/lib/measurements/pointer-tasks';
import { PointerObservationModel } from '@/lib/measurements/pointer-observation';
it('sums actual CSS segments and does not bridge leave/re-entry gaps', () => {
  const task = new MovementMeasurement();
  task.add({ x: 0, y: 0, time: 0 });
  task.add({ x: 3, y: 4, time: 1 });
  expect(task.distance).toBe(5);
  task.breakPath();
  task.add({ x: 103, y: 104, time: 2 });
  expect(task.distance).toBe(5);
  expect(task.count).toBe(3);
  expect(task.displacement).toBeCloseTo(Math.hypot(103, 104));
});
it('rejects invalid samples and bounds its trail and total sample count', () => {
  const task = new MovementMeasurement();
  expect(task.add({ x: NaN, y: 0, time: 0 })).toBe(false);
  for (let i = 0; i < 100010; i++) task.add({ x: i, y: 0, time: i });
  expect(task.count).toBe(100000);
  expect(task.trail).toHaveLength(120);
  expect(task.add({ x: 0, y: 0, time: -1 })).toBe(false);
});
it('computes hits, misses and center error from task geometry', () => {
  const task = new AccuracyMeasurement();
  expect(task.accuracy).toBeNull();
  expect(task.meanError).toBeNull();
  expect(task.record(3, 4, 0, 0, 10)).toBe(true);
  expect(task.record(20, 0, 0, 0, 10)).toBe(false);
  expect(task.record(10, 0, 0, 0, 10)).toBe(true);
  expect(task.accuracy).toBeCloseTo(200 / 3);
  expect(task.meanError).toBe(7.5);
});
it('stops scoring after ten hits and caps excessive misses', () => {
  const completed = new AccuracyMeasurement();
  for (let i = 0; i < 20; i++) completed.record(0, 0, 0, 0, 10);
  expect(completed.hits).toBe(10);
  expect(completed.attempts).toBe(10);
  const missed = new AccuracyMeasurement();
  for (let i = 0; i < 1010; i++) missed.record(100, 100, 0, 0, 10);
  expect(missed.attempts).toBe(1000);
  expect(missed.accuracy).toBe(0);
  expect(missed.record(NaN, 0, 0, 0, 10)).toBeNull();
});
it('keeps only current contacts and rejects malformed pointer coordinates', () => {
  const task = new PointerObservationModel();
  task.press(1);
  task.press(2);
  task.release(1);
  expect(task.pressed.size).toBe(1);
  task.record({ type: 'mouse', x: NaN, y: 0, pressure: 0, width: 1, height: 1, buttons: 0 });
  expect(task.count).toBe(0);
  expect(task.last).toBeNull();
});
