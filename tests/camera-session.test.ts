import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CameraSession } from '@/lib/camera/camera-session';
import { fakeCamera } from './helpers/camera';
import { deferred, fakePermission } from './helpers/media';
const sessions: CameraSession[] = [];
function setup() {
  const camera = fakeCamera();
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('navigator', {
    userActivation: { isActive: true },
    mediaDevices: { getUserMedia: camera.capture },
  });
  const session = new CameraSession();
  sessions.push(session);
  return { ...camera, session };
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
it('captures only video after Start, reads whitelisted settings and clears all resources', async () => {
  vi.useFakeTimers();
  const c = setup();
  const detach = c.session.attach();
  expect(c.capture).not.toHaveBeenCalled();
  const first = c.session.start(c.video);
  expect(c.session.start(c.video)).toBe(first);
  await first;
  expect(c.capture).toHaveBeenCalledExactlyOnceWith({ audio: false, video: true });
  expect(c.video.srcObject).toBe(c.stream);
  expect(c.video.muted).toBe(true);
  expect(c.video.playsInline).toBe(true);
  expect(c.session.getSnapshot()).toMatchObject({
    state: 'running',
    width: 640,
    trackHeight: 480,
    reportedFps: 30,
    reading: null,
  });
  c.frame(performance.now(), 1);
  vi.advanceTimersByTime(2000);
  c.frame(performance.now(), 61);
  vi.advanceTimersByTime(250);
  expect(c.session.getSnapshot().reading?.fps).toBe(30);
  expect(JSON.stringify(c.session.getSnapshot())).not.toContain('never-retain');
  c.session.stop();
  expect(c.track.stop).toHaveBeenCalledTimes(1);
  expect(c.frames.size).toBe(0);
  expect(c.video.srcObject).toBeNull();
  expect(c.pause).toHaveBeenCalled();
  expect(c.load).toHaveBeenCalled();
  expect(c.session.getSnapshot()).toMatchObject({ reading: null, width: null, reportedFps: null });
  expect(vi.getTimerCount()).toBe(0);
  detach();
  expect(c.track.stop).toHaveBeenCalledTimes(1);
});
it('releases a late grant after Stop and keeps duplicate requests blocked until settlement', async () => {
  const c = setup(),
    pending = deferred<MediaStream>();
  c.capture.mockReturnValue(pending.promise);
  const first = c.session.start(c.video);
  await Promise.resolve();
  await Promise.resolve();
  c.session.stop();
  expect(c.session.getSnapshot().pending).toBe(true);
  expect(c.session.start(c.video)).toBe(first);
  pending.resolve(c.stream);
  await first;
  expect(c.track.stop).toHaveBeenCalledTimes(1);
  expect(c.play).not.toHaveBeenCalled();
  expect(c.video.srcObject).toBeNull();
  expect(c.session.getSnapshot()).toMatchObject({ state: 'stopped', pending: false });
});
it.each([
  ['NotAllowedError', 'permission-denied'],
  ['NotFoundError', 'device-not-found'],
  ['NotReadableError', 'device-busy'],
  ['OverconstrainedError', 'constraints-unavailable'],
  ['AbortError', 'aborted'],
  ['Other', 'unknown'],
])('preserves capture failure %s', async (name, failure) => {
  const c = setup();
  c.capture.mockRejectedValue(new DOMException('private driver message', name));
  await c.session.start(c.video);
  expect(c.session.getSnapshot().failure).toBe(failure);
  expect(c.video.srcObject).toBeNull();
  expect(JSON.stringify(c.session.getSnapshot())).not.toContain('private driver');
});
it.each(['insecure', 'policy', 'api', 'activation', 'hidden'])(
  'prevents capture blocked by %s',
  async (condition) => {
    const c = setup();
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
    await c.session.start(c.video);
    expect(c.capture).not.toHaveBeenCalled();
  },
);
it('handles rejected playback, unresolved playback and cancellation without a dangling Start', async () => {
  vi.useFakeTimers();
  const c = setup();
  c.play.mockRejectedValue(new DOMException('blocked', 'NotAllowedError'));
  await c.session.start(c.video);
  expect(c.session.getSnapshot().failure).toBe('playback-blocked');
  expect(c.track.stop).toHaveBeenCalledTimes(1);
  const next = setup();
  next.play.mockReturnValue(new Promise(() => {}));
  const pending = next.session.start(next.video);
  for (let i = 0; i < 8; i++) await Promise.resolve();
  vi.advanceTimersByTime(10000);
  await pending;
  expect(next.session.getSnapshot()).toMatchObject({ failure: 'playback-blocked', pending: false });
  expect(next.video.srcObject).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});
it('keeps preview working without frame callbacks and never fabricates FPS', async () => {
  const c = setup();
  Object.defineProperty(c.video, 'requestVideoFrameCallback', { value: undefined });
  await c.session.start(c.video);
  expect(c.session.getSnapshot()).toMatchObject({
    state: 'running',
    frameCallbacks: false,
    reading: null,
    reportedFps: 30,
  });
});
it.each(['event', 'silent'])('cancels pending playback when the camera ends (%s)', async (mode) => {
  vi.useFakeTimers();
  const c = setup();
  c.play.mockReturnValue(new Promise(() => {}));
  const pending = c.session.start(c.video);
  for (let i = 0; i < 8; i++) await Promise.resolve();
  if (mode === 'event') c.track.dispatchEvent(new Event('ended'));
  else {
    c.track.readyState = 'ended';
    vi.advanceTimersByTime(250);
  }
  await pending;
  expect(c.session.getSnapshot()).toMatchObject({ failure: 'camera-ended', pending: false });
  expect(c.video.srcObject).toBeNull();
  expect(c.track.stop).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(0);
  expect(vi.getTimerCount()).toBe(0);
});
it('handles a frame callback failure and settings failure with complete cleanup', async () => {
  const c = setup();
  await c.session.start(c.video);
  vi.mocked(c.video.requestVideoFrameCallback).mockImplementation(() => {
    throw new Error('lost callback');
  });
  c.frame(performance.now(), 1);
  expect(c.session.getSnapshot().failure).toBe('preview-failed');
  expect(c.track.stop).toHaveBeenCalledTimes(1);
  const next = setup();
  next.track.getSettings.mockImplementation(() => {
    throw new Error('lost device');
  });
  await next.session.start(next.video);
  expect(next.session.getSnapshot().failure).toBe('preview-failed');
  expect(next.track.stop).toHaveBeenCalledTimes(1);
});
it.each([
  'ended',
  'silent-ended',
  'blur',
  'pagehide',
  'hidden',
  'pause',
  'error',
  'timeout',
  'detach',
])('cleans active resources on %s', async (event) => {
  vi.useFakeTimers();
  const c = setup(),
    detach = c.session.attach();
  await c.session.start(c.video);
  if (event === 'ended') c.track.dispatchEvent(new Event('ended'));
  else if (event === 'silent-ended') {
    c.track.readyState = 'ended';
    vi.advanceTimersByTime(250);
  } else if (event === 'hidden') {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  } else if (event === 'pause' || event === 'error') c.video.dispatchEvent(new Event(event));
  else if (event === 'timeout') vi.advanceTimersByTime(60000);
  else if (event === 'detach') detach();
  else window.dispatchEvent(new Event(event));
  expect(c.track.stop).toHaveBeenCalledTimes(1);
  expect(c.frames.size).toBe(0);
  expect(c.video.srcObject).toBeNull();
  // Drain jsdom's event microtask; no capture timers may remain afterwards.
  vi.advanceTimersByTime(0);
  expect(vi.getTimerCount()).toBe(0);
  detach();
});
it('clears muted data, handles revocation and removes permission listeners', async () => {
  vi.useFakeTimers();
  const c = setup(),
    permission = fakePermission('granted'),
    remove = vi.spyOn(permission, 'removeEventListener');
  Object.defineProperty(navigator, 'permissions', {
    value: { query: vi.fn().mockResolvedValue(permission) },
  });
  const detach = c.session.attach();
  await c.session.start(c.video);
  Object.assign(c.track, { muted: true });
  c.track.dispatchEvent(new Event('mute'));
  expect(c.session.getSnapshot().muted).toBe(true);
  expect(c.session.getSnapshot().reading).toBeNull();
  Object.defineProperty(permission, 'state', { value: 'denied' });
  permission.dispatchEvent(new Event('change'));
  expect(c.session.getSnapshot().failure).toBe('permission-denied');
  expect(c.track.stop).toHaveBeenCalledTimes(1);
  detach();
  expect(remove).toHaveBeenCalled();
  vi.advanceTimersByTime(0);
  expect(vi.getTimerCount()).toBe(0);
});
