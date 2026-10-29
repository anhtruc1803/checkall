import { it, expect } from 'vitest';
import { PointerSampler } from '@/lib/measurements/pointer-sampler';
it('uses coalesced samples, rejects duplicate timestamps and ignores touch', () => {
  const sampler = new PointerSampler();
  const event = {
    pointerType: 'mouse',
    timeStamp: 10,
    getCoalescedEvents: () => [
      { timeStamp: 1 },
      { timeStamp: 2 },
      { timeStamp: 2 },
      { timeStamp: NaN },
      { timeStamp: 3 },
    ],
  } as unknown as PointerEvent;
  sampler.add(event);
  expect(sampler.timestamps).toEqual([1, 2, 3]);
  expect(sampler.rejected).toBe(2);
  expect(sampler.coalesced).toBe(true);
  sampler.add({ pointerType: 'touch', timeStamp: 100 } as PointerEvent);
  expect(sampler.timestamps).toHaveLength(3);
  sampler.reset();
  expect(sampler.timestamps).toEqual([]);
});
it('falls back when coalesced access fails', () => {
  const sampler = new PointerSampler();
  sampler.add({
    pointerType: 'mouse',
    timeStamp: 10,
    getCoalescedEvents: () => {
      throw new Error('unavailable');
    },
  } as unknown as PointerEvent);
  expect(sampler.timestamps).toEqual([10]);
  expect(sampler.coalesced).toBe(false);
});
