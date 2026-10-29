import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { createMediaSession } from '@/lib/browser/media-session';
import { deferred, fakeStream } from './helpers/media';

const capture = vi.fn();
beforeEach(() => {
  capture.mockReset();
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('navigator', {
    mediaDevices: { getUserMedia: capture },
    userActivation: { isActive: true },
  });
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
});
afterEach(() => {
  Reflect.deleteProperty(document, 'permissionsPolicy');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('stays idle until start, captures the selected kind and stops all tracks', async () => {
  const { stream, track } = fakeStream();
  capture.mockResolvedValue(stream);
  const session = createMediaSession('camera'),
    changes = vi.fn();
  const unsubscribe = session.subscribe(changes);
  expect(session.getSnapshot().status).toBe('idle');
  expect(capture).not.toHaveBeenCalled();
  expect((await session.start()).status).toBe('active');
  expect(capture).toHaveBeenCalledWith({ video: true, audio: false });
  session.stop();
  expect(track.stop).toHaveBeenCalledOnce();
  expect(session.getSnapshot()).toEqual({ status: 'stopped', stream: null, failure: null });
  unsubscribe();
  session.dispose();
});
it.each(['stop', 'dispose'] as const)(
  'releases a late grant after %s and never publishes active',
  async (action) => {
    const pending = deferred<MediaStream>(),
      { stream, track } = fakeStream();
    capture.mockReturnValue(pending.promise);
    const session = createMediaSession('microphone'),
      states: string[] = [];
    session.subscribe(() => states.push(session.getSnapshot().status));
    const request = session.start();
    await Promise.resolve();
    session[action]();
    pending.resolve(stream);
    await request;
    expect(track.stop).toHaveBeenCalledOnce();
    expect(states).not.toContain('active');
    expect(session.getSnapshot().stream).toBeNull();
    session.dispose();
  },
);
it('deduplicates pending starts and active sessions', async () => {
  const pending = deferred<MediaStream>(),
    { stream } = fakeStream();
  capture.mockReturnValue(pending.promise);
  const session = createMediaSession('microphone');
  const first = session.start(),
    second = session.start();
  expect(second).toBe(first);
  pending.resolve(stream);
  await first;
  await session.start();
  expect(capture).toHaveBeenCalledTimes(1);
  session.dispose();
});
it('does not request after disposal or a stop before the queued request starts', async () => {
  const session = createMediaSession('camera');
  const request = session.start();
  session.stop();
  await request;
  expect(capture).not.toHaveBeenCalled();
  session.dispose();
  await session.start();
  expect(capture).not.toHaveBeenCalled();
});
it('never revives a stopped pending session; a fresh explicit retry works after settlement', async () => {
  const pending = deferred<MediaStream>(),
    old = fakeStream(),
    fresh = fakeStream();
  capture.mockReturnValueOnce(pending.promise).mockResolvedValueOnce(fresh.stream);
  const session = createMediaSession('camera');
  const first = session.start();
  await Promise.resolve();
  session.stop();
  expect(session.start()).toBe(first);
  pending.resolve(old.stream);
  await first;
  expect(old.track.stop).toHaveBeenCalledOnce();
  expect(session.getSnapshot().status).toBe('stopped');
  expect((await session.start()).stream).toBe(fresh.stream);
  session.dispose();
  expect(fresh.track.stop).toHaveBeenCalledOnce();
});
it('ignores a rejected permission request after disposal', async () => {
  const pending = deferred<MediaStream>();
  capture.mockReturnValue(pending.promise);
  const session = createMediaSession('camera'),
    changes = vi.fn();
  session.subscribe(changes);
  const request = session.start();
  await Promise.resolve();
  session.dispose();
  const count = changes.mock.calls.length;
  pending.reject(new DOMException('denied', 'NotAllowedError'));
  await request;
  expect(changes).toHaveBeenCalledTimes(count);
  expect(session.getSnapshot().status).toBe('stopped');
});
it.each([false, true])('rejects empty or ended streams (%s) and releases tracks', async (ended) => {
  const { stream, track } = fakeStream();
  if (ended) track.readyState = 'ended';
  capture.mockResolvedValue(ended ? stream : { getTracks: () => [] });
  const session = createMediaSession('camera');
  expect((await session.start()).failure).toBe('device-not-found');
  if (ended) expect(track.stop).toHaveBeenCalledOnce();
  session.dispose();
});
it.each([
  'NotAllowedError',
  'NotFoundError',
  'NotReadableError',
  'OverconstrainedError',
  'AbortError',
])('handles %s and allows an explicit retry', async (name) => {
  const { stream, track } = fakeStream();
  capture
    .mockRejectedValueOnce(new DOMException('device details must not be stored', name))
    .mockResolvedValueOnce(stream);
  const session = createMediaSession('camera');
  expect((await session.start()).status).toBe('error');
  expect(session.getSnapshot()).not.toHaveProperty('message');
  expect((await session.start()).status).toBe('active');
  session.dispose();
  expect(track.stop).toHaveBeenCalledOnce();
});
it('recovers from a synchronous capture error', async () => {
  capture.mockImplementationOnce(() => {
    throw new TypeError('blocked');
  });
  const session = createMediaSession('camera');
  expect((await session.start()).failure).toBe('unknown');
  const { stream } = fakeStream();
  capture.mockResolvedValue(stream);
  expect((await session.start()).status).toBe('active');
  session.dispose();
});
it.each(['hidden', 'pagehide', 'ended'] as const)(
  'releases active capture on %s and removes listeners',
  async (event) => {
    const { stream, track } = fakeStream();
    capture.mockResolvedValue(stream);
    const removeDocument = vi.spyOn(document, 'removeEventListener');
    const removeWindow = vi.spyOn(window, 'removeEventListener');
    const removeTrack = vi.spyOn(track, 'removeEventListener');
    const session = createMediaSession('camera');
    await session.start();
    if (event === 'hidden') {
      vi.mocked(Object.getOwnPropertyDescriptor(document, 'visibilityState')!.get!).mockReturnValue(
        'hidden',
      );
      document.dispatchEvent(new Event('visibilitychange'));
    } else if (event === 'pagehide') window.dispatchEvent(new Event('pagehide'));
    else track.dispatchEvent(new Event('ended'));
    expect(session.getSnapshot().status).toBe('stopped');
    expect(track.stop).toHaveBeenCalledOnce();
    expect(removeDocument).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(removeWindow).toHaveBeenCalledWith('pagehide', expect.any(Function));
    expect(removeTrack).toHaveBeenCalledWith('ended', expect.any(Function));
    session.dispose();
  },
);
it.each(['insecure', 'policy', 'activation', 'hidden', 'missing'] as const)(
  'does not request a device when blocked by %s',
  async (reason) => {
    if (reason === 'insecure') vi.stubGlobal('isSecureContext', false);
    if (reason === 'policy')
      Object.defineProperty(document, 'permissionsPolicy', {
        configurable: true,
        value: { allowsFeature: () => false },
      });
    if (reason === 'activation')
      vi.stubGlobal('navigator', {
        mediaDevices: { getUserMedia: capture },
        userActivation: { isActive: false },
      });
    if (reason === 'hidden') vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    if (reason === 'missing') vi.stubGlobal('navigator', {});
    const session = createMediaSession('camera');
    expect((await session.start()).status).toBe('error');
    expect(capture).not.toHaveBeenCalled();
    session.dispose();
  },
);
