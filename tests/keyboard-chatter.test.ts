import { describe, it, expect } from 'vitest';
import { KeyboardChatter, KEYBOARD_CODE_LIMIT } from '@/lib/measurements/keyboard-chatter';

describe('cumulative keyboard chatter', () => {
  it('keeps totals beyond the event-log limit and changes integer thresholds exactly', () => {
    const session = new KeyboardChatter();
    for (let i = 0; i < 150; i++) {
      session.record({ code: 'KeyA', type: 'keydown', repeat: false, time: i * 20 });
      session.record({ code: 'KeyA', type: 'keydown', repeat: true, time: i * 20 + 5 });
      session.record({ code: 'KeyA', type: 'keyup', repeat: false, time: i * 20 + 10 });
    }
    expect(session.snapshot(10)).toEqual([
      { code: 'KeyA', presses: 150, repeats: 150, pairs: 149, suspicious: 149, shortestGap: 10 },
    ]);
    expect(session.snapshot(9)[0].suspicious).toBe(0);
  });
  it('does not pair orphan releases, duplicate downs or separate capture segments', () => {
    const session = new KeyboardChatter();
    const send = (type: 'keydown' | 'keyup', time: number) =>
      session.record({ code: 'KeyA', type, time, repeat: false });
    send('keyup', 0);
    send('keydown', 5);
    send('keydown', 6);
    send('keyup', 10);
    session.breakSequence();
    send('keydown', 11);
    send('keyup', 20);
    send('keydown', 25);
    expect(session.snapshot(30)[0]).toMatchObject({
      presses: 3,
      pairs: 1,
      suspicious: 1,
      shortestGap: 5,
    });
  });
  it('preserves fractional gaps without rounding them into the wrong threshold', () => {
    const session = new KeyboardChatter();
    for (const event of [
      { type: 'keydown', time: 0 },
      { type: 'keyup', time: 1 },
      { type: 'keydown', time: 10.1 },
      { type: 'keyup', time: 20 },
      { type: 'keydown', time: 521 },
    ] as const)
      session.record({ ...event, code: 'KeyA', repeat: false });
    expect(session.snapshot(9)[0]).toMatchObject({ pairs: 2, suspicious: 0, shortestGap: 9.1 });
    expect(session.snapshot(10)[0].suspicious).toBe(1);
    expect(session.snapshot(500)[0].suspicious).toBe(1);
  });
  it('bounds key storage, rejects unavailable codes/times and resets pending state', () => {
    const session = new KeyboardChatter();
    session.record({ code: '', type: 'keydown', time: 0, repeat: false });
    session.record({ code: 'Unidentified', type: 'keydown', time: 0, repeat: false });
    session.record({ code: 'KeyA', type: 'keydown', time: NaN, repeat: false });
    expect(session.snapshot(30)).toEqual([]);
    for (let i = 0; i < KEYBOARD_CODE_LIMIT + 10; i++)
      session.record({ code: `Test${i}`, type: 'keydown', time: i, repeat: false });
    expect(session.snapshot(30)).toHaveLength(KEYBOARD_CODE_LIMIT);
    session.reset();
    session.record({ code: 'constructor', type: 'keydown', time: 1, repeat: false });
    expect(session.snapshot(30)).toEqual([
      { code: 'constructor', presses: 1, repeats: 0, pairs: 0, shortestGap: null, suspicious: 0 },
    ]);
  });
});
