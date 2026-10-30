import { afterEach, expect, it, vi } from 'vitest';
import {
  OutputSession,
  defaultOutput,
  validOutput,
  outputDuration,
} from '@/lib/audio/output-session';
import { fakeAudio } from './helpers/audio';
import { deferred } from './helpers/media';
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
it('never creates audio before explicit Start and rejects duplicate starts', async () => {
  const audio = fakeAudio(),
    session = new OutputSession(audio.factory);
  expect(audio.factory).not.toHaveBeenCalled();
  const pending = session.start(defaultOutput);
  await session.start(defaultOutput);
  await pending;
  expect(audio.factory).toHaveBeenCalledTimes(1);
  expect(audio.oscillator.start).toHaveBeenCalledTimes(1);
  expect(session.getSnapshot()).toEqual({
    state: 'running',
    reason: null,
    sampleRate: 48000,
    frequency: 440,
  });
  session.dispose();
});
it.each([
  { frequency: 19 },
  { frequency: 20001 },
  { frequency: NaN },
  { frequency: Infinity },
  { volume: -0.1 },
  { volume: 0.21 },
  { volume: NaN },
])('rejects invalid settings before creating a context: %j', async (patch) => {
  const audio = fakeAudio(),
    session = new OutputSession(audio.factory);
  await session.start({ ...defaultOutput, ...patch });
  expect(audio.factory).not.toHaveBeenCalled();
  expect(session.getSnapshot().reason).toBe('invalid');
});
it('accepts mute and range boundaries, bounded by actual context Nyquist', async () => {
  expect(validOutput({ ...defaultOutput, volume: 0, frequency: 20 })).toBe(true);
  expect(validOutput({ ...defaultOutput, volume: 0.2, frequency: 20000 })).toBe(true);
  expect(validOutput({ ...defaultOutput, frequency: 16000 }, 32000)).toBe(false);
  const audio = fakeAudio(32000),
    session = new OutputSession(audio.factory);
  await session.start({ ...defaultOutput, frequency: 18000 });
  expect(session.getSnapshot().reason).toBe('invalid');
  expect(audio.oscillator.start).not.toHaveBeenCalled();
  expect(audio.context.close).toHaveBeenCalledTimes(1);
});
it.each(['both', 'left', 'right'] as const)(
  'routes %s through explicit merger inputs',
  async (channel) => {
    const audio = fakeAudio(),
      session = new OutputSession(audio.factory);
    await session.start({ ...defaultOutput, channel });
    const [left, right, master] = audio.gains;
    expect(audio.context.createChannelMerger).toHaveBeenCalledWith(2);
    expect(audio.oscillator.connect.mock.calls).toEqual([[left], [right]]);
    expect(left.connect).toHaveBeenCalledWith(audio.merger, 0, 0);
    expect(right.connect).toHaveBeenCalledWith(audio.merger, 0, 1);
    expect(left.gain.value).toBe(channel === 'right' ? 0 : 1);
    expect(right.gain.value).toBe(channel === 'left' ? 0 : 1);
    expect(master.gain.setTargetAtTime).toHaveBeenCalledWith(0.03, 1, 0.01);
    expect(master.connect).toHaveBeenCalledWith(audio.destination);
    session.dispose();
  },
);
it('updates frequency, waveform, mute and channel without creating another oscillator', async () => {
  const audio = fakeAudio(),
    session = new OutputSession(audio.factory);
  await session.start(defaultOutput);
  session.update({ frequency: 1000, wave: 'triangle', channel: 'right', volume: 0 });
  expect(audio.oscillator.frequency.setTargetAtTime).toHaveBeenLastCalledWith(1000, 1, 0.01);
  expect(audio.gains[0].gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 1, 0.01);
  expect(audio.gains[1].gain.setTargetAtTime).toHaveBeenLastCalledWith(1, 1, 0.01);
  expect(audio.gains[2].gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 1, 0.01);
  expect(audio.oscillator.type).toBe('triangle');
  expect(audio.context.createOscillator).toHaveBeenCalledTimes(1);
  session.update({ ...defaultOutput, frequency: NaN });
  expect(session.getSnapshot().reason).toBe('invalid');
  session.dispose();
});
it('bounds playback and releases all nodes, context and timers', async () => {
  vi.useFakeTimers();
  const audio = fakeAudio(),
    session = new OutputSession(audio.factory);
  await session.start(defaultOutput);
  vi.advanceTimersByTime(outputDuration);
  expect(session.getSnapshot().state).toBe('completed');
  expect(audio.gains[2].gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 1, 0.003);
  vi.advanceTimersByTime(35);
  for (const node of [audio.oscillator, ...audio.gains, audio.merger])
    expect(node.disconnect).toHaveBeenCalled();
  expect(audio.context.close).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});
it.each(['resolve', 'reject'] as const)(
  'ignores late resume %s after Stop and a newer Start',
  async (outcome) => {
    const audio = fakeAudio(),
      newer = fakeAudio(),
      pending = deferred<void>();
    audio.context.resume.mockReturnValue(pending.promise);
    const factory = vi.fn().mockReturnValueOnce(audio.context).mockReturnValueOnce(newer.context);
    const session = new OutputSession(factory);
    const first = session.start(defaultOutput);
    session.stop();
    await session.start({ ...defaultOutput, frequency: 1000 });
    if (outcome === 'resolve') pending.resolve();
    else pending.reject(new Error('late'));
    await first;
    expect(audio.oscillator.start).not.toHaveBeenCalled();
    expect(audio.context.close).toHaveBeenCalledTimes(1);
    expect(session.getSnapshot().frequency).toBe(1000);
    session.dispose();
  },
);
it('times out a pending resume and never starts it later', async () => {
  vi.useFakeTimers();
  const audio = fakeAudio(),
    pending = deferred<void>(),
    session = new OutputSession(audio.factory);
  audio.context.resume.mockReturnValue(pending.promise);
  const start = session.start(defaultOutput);
  vi.advanceTimersByTime(10000);
  expect(session.getSnapshot().reason).toBe('blocked');
  pending.resolve();
  await start;
  expect(audio.oscillator.start).not.toHaveBeenCalled();
  expect(audio.context.close).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});
it('handles permission denial, a still-suspended context and partial graph failures honestly', async () => {
  for (const scenario of ['denied', 'suspended', 'allocation']) {
    const audio = fakeAudio(),
      session = new OutputSession(audio.factory);
    if (scenario === 'denied')
      audio.context.resume.mockRejectedValue(new DOMException('blocked', 'NotAllowedError'));
    if (scenario === 'suspended') audio.context.state = 'suspended';
    if (scenario === 'allocation')
      audio.context.createChannelMerger.mockImplementation(() => {
        throw new Error('allocation');
      });
    await session.start(defaultOutput);
    expect(session.getSnapshot().state).toBe('error');
    expect(session.getSnapshot().reason).toBe(scenario === 'allocation' ? 'failed' : 'blocked');
    expect(audio.context.close).toHaveBeenCalledTimes(1);
    expect(audio.oscillator.start).not.toHaveBeenCalled();
    if (scenario === 'allocation') expect(audio.oscillator.disconnect).toHaveBeenCalled();
    session.dispose();
  }
});
it('stops on context interruption and Reset releases retiring contexts immediately', async () => {
  vi.useFakeTimers();
  const audio = fakeAudio(),
    session = new OutputSession(audio.factory);
  await session.start(defaultOutput);
  audio.context.state = 'suspended';
  audio.context.onstatechange?.();
  expect(session.getSnapshot().reason).toBe('interrupted');
  expect(audio.context.close).toHaveBeenCalled();
  session.dispose();
  expect(session.getSnapshot().sampleRate).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});
it('survives context construction and close failures without leaking a graph', async () => {
  const failure = new OutputSession(() => {
    throw new Error('no device');
  });
  await failure.start(defaultOutput);
  expect(failure.getSnapshot().reason).toBe('failed');
  const audio = fakeAudio(),
    session = new OutputSession(audio.factory);
  audio.context.close.mockRejectedValue(new Error('close'));
  await session.start(defaultOutput);
  session.dispose();
  await Promise.resolve();
  expect(audio.oscillator.disconnect).toHaveBeenCalled();
});
