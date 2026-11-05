import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { InputSession } from '@/lib/audio/input-session';
import { fakeInput } from './helpers/input-audio';
import { deferred, fakePermission } from './helpers/media';
const sessions: InputSession[] = [];
function setup() {
  const audio = fakeInput();
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('AudioContext', audio.factory);
  vi.stubGlobal('navigator', {
    userActivation: { isActive: true },
    mediaDevices: { getUserMedia: audio.capture },
  });
  const session = new InputSession(audio.factory);
  sessions.push(session);
  return { ...audio, session };
}
beforeEach(() => vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible'));
afterEach(() => {
  sessions.forEach((session) => session.reset());
  sessions.length = 0;
  Reflect.deleteProperty(document, 'permissionsPolicy');
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('captures only after Start, analyses real data, and never connects to speakers', async () => {
  const audio = setup();
  expect(audio.factory).not.toHaveBeenCalled();
  expect(audio.capture).not.toHaveBeenCalled();
  await audio.session.start();
  expect(audio.capture).toHaveBeenCalledWith({ audio: true, video: false });
  expect(audio.session.getSnapshot().state).toBe('running');
  expect(audio.session.getSnapshot().reading?.rms).toBe(0.25);
  expect(audio.context.createMediaStreamSource).toHaveBeenCalledWith(audio.stream);
  expect(audio.source.connect).toHaveBeenCalledWith(audio.analyser);
  expect(audio.analyser.connect).not.toHaveBeenCalled();
  audio.session.stop();
  expect(audio.track.stop).toHaveBeenCalledTimes(1);
  expect(audio.context.close).toHaveBeenCalledTimes(1);
  expect(audio.source.disconnect).toHaveBeenCalled();
  expect(audio.analyser.disconnect).toHaveBeenCalled();
  expect(audio.session.getSnapshot().reading).toBeNull();
});
it.each(['reset', 'stop'] as const)(
  'releases a late grant after %s without starting analysis',
  async (action) => {
    const audio = setup(),
      pending = deferred<MediaStream>();
    audio.capture.mockReturnValue(pending.promise);
    const first = audio.session.start();
    await Promise.resolve();
    expect(audio.session.start()).toBe(first);
    audio.session[action]();
    expect(audio.context.close).toHaveBeenCalledTimes(1);
    expect(audio.session.getSnapshot().pending).toBe(true);
    expect(audio.session.start()).toBe(first);
    pending.resolve(audio.stream);
    await first;
    expect(audio.track.stop).toHaveBeenCalledTimes(1);
    expect(audio.context.createMediaStreamSource).not.toHaveBeenCalled();
    expect(audio.session.getSnapshot().pending).toBe(false);
  },
);
it('ignores late denial after cleanup', async () => {
  const audio = setup(),
    pending = deferred<MediaStream>();
  audio.capture.mockReturnValue(pending.promise);
  const first = audio.session.start();
  await Promise.resolve();
  audio.session.reset();
  pending.reject(new DOMException('denied', 'NotAllowedError'));
  await first;
  expect(audio.session.getSnapshot().state).toBe('idle');
  expect(audio.session.getSnapshot().failure).toBeNull();
});
it('cancels an unresolved resume after capture settles and Stop, and never creates a late graph', async () => {
  const audio = setup(),
    resume = deferred<void>();
  audio.context.resume.mockReturnValue(resume.promise);
  const first = audio.session.start();
  await Promise.resolve();
  await Promise.resolve();
  audio.session.stop();
  await first;
  expect(audio.session.getSnapshot().pending).toBe(false);
  resume.resolve();
  await Promise.resolve();
  expect(audio.context.createMediaStreamSource).not.toHaveBeenCalled();
});
it.each([
  'NotAllowedError',
  'NotFoundError',
  'NotReadableError',
  'OverconstrainedError',
  'AbortError',
])('handles %s, closes context and retains no raw error details', async (name) => {
  const audio = setup();
  audio.capture.mockRejectedValue(new DOMException('private device name', name));
  await audio.session.start();
  expect(audio.session.getSnapshot().state).toBe('error');
  expect(JSON.stringify(audio.session.getSnapshot())).not.toContain('private device name');
  expect(audio.context.close).toHaveBeenCalledTimes(1);
});
it.each(['insecure', 'policy', 'api', 'activation', 'hidden', 'audio'])(
  'prevents capture blocked by %s',
  async (condition) => {
    const audio = setup();
    if (condition === 'insecure') vi.stubGlobal('isSecureContext', false);
    if (condition === 'policy')
      Object.defineProperty(document, 'permissionsPolicy', {
        configurable: true,
        value: { allowsFeature: () => false },
      });
    if (condition === 'api') vi.stubGlobal('navigator', {});
    if (condition === 'activation')
      Object.defineProperty(navigator, 'userActivation', { value: { isActive: false } });
    if (condition === 'hidden')
      vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    if (condition === 'audio') vi.stubGlobal('AudioContext', undefined);
    await audio.session.start();
    expect(audio.capture).not.toHaveBeenCalled();
    expect(audio.factory).not.toHaveBeenCalled();
  },
);
it('cleans tracks/context/timers on analysis allocation failure', async () => {
  vi.useFakeTimers();
  const audio = setup();
  audio.context.createAnalyser.mockImplementation(() => {
    throw new Error('failed');
  });
  await audio.session.start();
  expect(audio.session.getSnapshot().failure).toBe('analysis-failed');
  expect(audio.track.stop).toHaveBeenCalledTimes(1);
  expect(audio.source.disconnect).toHaveBeenCalled();
  expect(audio.context.close).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});
it('handles runtime sample failure and a context suspended after grant', async () => {
  const audio = setup();
  audio.analyser.getFloatTimeDomainData.mockImplementation(() => {
    throw new Error('lost');
  });
  await audio.session.start();
  expect(audio.session.getSnapshot().failure).toBe('analysis-failed');
  const next = setup(),
    pending = deferred<MediaStream>();
  next.capture.mockReturnValue(pending.promise);
  const first = next.session.start();
  await Promise.resolve();
  await Promise.resolve();
  next.context.state = 'suspended';
  pending.resolve(next.stream);
  await first;
  expect(next.session.getSnapshot().failure).toBe('audio-blocked');
  expect(next.track.stop).toHaveBeenCalledTimes(1);
});
it('bounds timers and clears muted, ended and interrupted input', async () => {
  vi.useFakeTimers();
  const audio = setup();
  await audio.session.start();
  Object.assign(audio.track, { muted: true });
  audio.track.dispatchEvent(new Event('mute'));
  expect(audio.session.getSnapshot().reading).toBeNull();
  vi.advanceTimersByTime(125);
  expect(audio.session.getSnapshot().muted).toBe(true);
  Object.assign(audio.track, { muted: false });
  audio.track.dispatchEvent(new Event('unmute'));
  vi.advanceTimersByTime(125);
  expect(audio.session.getSnapshot().reading?.rms).toBe(0.25);
  vi.advanceTimersByTime(60000);
  expect(audio.session.getSnapshot().failure).toBe('timeout');
  expect(vi.getTimerCount()).toBe(0);
  expect(audio.track.stop).toHaveBeenCalledTimes(1);
});
it.each(['ended', 'blur', 'pagehide', 'hidden', 'context'])(
  'releases active resources on %s',
  async (event) => {
    const audio = setup(),
      detach = audio.session.attach();
    await audio.session.start();
    if (event === 'ended') audio.track.dispatchEvent(new Event('ended'));
    else if (event === 'hidden') {
      vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
    } else if (event === 'context') {
      audio.context.state = 'suspended';
      audio.context.onstatechange?.();
    } else window.dispatchEvent(new Event(event));
    expect(audio.track.stop).toHaveBeenCalledTimes(1);
    expect(audio.context.close).toHaveBeenCalledTimes(1);
    expect(audio.session.getSnapshot().reading).toBeNull();
    detach();
  },
);
it('stops after permission revocation and detaches permission observation', async () => {
  const audio = setup(),
    permission = fakePermission('granted'),
    remove = vi.spyOn(permission, 'removeEventListener');
  Object.defineProperty(navigator, 'permissions', {
    value: { query: vi.fn().mockResolvedValue(permission) },
  });
  const detach = audio.session.attach();
  await audio.session.start();
  Object.defineProperty(permission, 'state', { configurable: true, value: 'denied' });
  permission.dispatchEvent(new Event('change'));
  expect(audio.session.getSnapshot().failure).toBe('permission-denied');
  expect(audio.track.stop).toHaveBeenCalledTimes(1);
  detach();
  expect(remove).toHaveBeenCalled();
});
it('detects a natively stopped track even when no ended event is emitted', async () => {
  vi.useFakeTimers();
  const audio = setup();
  await audio.session.start();
  audio.track.readyState = 'ended';
  vi.advanceTimersByTime(125);
  expect(audio.session.getSnapshot().failure).toBe('input-ended');
  expect(audio.session.getSnapshot().reading).toBeNull();
  expect(audio.context.close).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});
