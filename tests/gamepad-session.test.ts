import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { GamepadSession } from '@/lib/gamepad/session';
import { inspectGamepadEnvironment } from '@/lib/gamepad/environment';
import { fakeGamepads, fakePad } from './helpers/gamepad';
const sessions: GamepadSession[] = [];
function setup() {
  const fixture = fakeGamepads(),
    session = new GamepadSession();
  sessions.push(session);
  return { ...fixture, session };
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  sessions.forEach((session) => session.reset());
  sessions.length = 0;
  Reflect.deleteProperty(document, 'permissionsPolicy');
  Reflect.deleteProperty(document, 'featurePolicy');
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('stays passive on attach, reads after Start and stops RAF/timer/listeners with no late updates', () => {
  const c = setup(),
    detach = c.session.attach();
  expect(c.read).not.toHaveBeenCalled();
  c.session.start();
  c.session.start();
  expect(c.read).toHaveBeenCalledTimes(1);
  expect(c.session.getSnapshot()).toMatchObject({
    state: 'running',
    axes: [0, 1],
    pad: { id: 'QA controller 0' },
  });
  const callback = [...c.frames.values()][0];
  c.session.stop();
  const count = c.read.mock.calls.length;
  callback(200);
  expect(c.read).toHaveBeenCalledTimes(count);
  expect(c.frames.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
  expect(c.session.getSnapshot()).toMatchObject({
    pad: null,
    devices: [],
    axes: null,
    path: [],
    drift: { phase: 'idle', result: null },
  });
  detach();
});
it('waits for an exposed device without treating a sparse/empty list as broken hardware', () => {
  const c = setup();
  c.devices.length = 0;
  c.session.start();
  expect(c.session.getSnapshot()).toMatchObject({ state: 'running', pad: null, devices: [] });
  c.devices.push(null, null, fakePad(2));
  c.advance(160);
  expect(c.session.getSnapshot().pad?.index).toBe(2);
});
it('requires a chosen pair for non-standard mappings, and clears path/results on axis/device/threshold changes', () => {
  const c = setup();
  c.pad.mapping = '';
  c.pad.axes = [0.3, -0.4, 0.1, 0.2];
  c.devices.push(fakePad(1));
  c.session.start();
  expect(c.session.getSnapshot().axes).toBeNull();
  c.session.measure();
  expect(c.session.getSnapshot().drift.phase).toBe('idle');
  c.session.setAxes(0, 0);
  expect(c.session.getSnapshot().axes).toBeNull();
  c.session.setAxes(0, 1);
  c.session.measure();
  c.advance(6200);
  expect(c.session.getSnapshot().drift.result?.meanRadius).toBeCloseTo(0.5);
  c.session.setThreshold(0.2);
  expect(c.session.getSnapshot().drift.result).toBeNull();
  c.session.setThreshold(NaN);
  c.session.setThreshold(0.7);
  expect(c.session.getSnapshot().threshold).toBe(0.2);
  c.session.measure();
  c.session.setAxes(2, 3);
  expect(c.session.getSnapshot().drift.phase).toBe('idle');
  expect(c.session.getSnapshot().path).toHaveLength(0);
  c.session.selectDevice(1);
  expect(c.session.getSnapshot()).toMatchObject({
    pad: { index: 1 },
    axes: [0, 1],
    drift: { result: null },
  });
});
it('samples raw rest offsets after settling and keeps results distinct from a hardware diagnosis', () => {
  const c = setup();
  c.pad.axes = [0.12, -0.05, 0, 0];
  c.session.start();
  c.session.measure();
  c.advance(900);
  expect(c.session.getSnapshot().drift.phase).toBe('settling');
  c.advance(5200);
  const result = c.session.getSnapshot().drift.result!;
  expect(c.session.getSnapshot().drift.phase).toBe('completed');
  expect(result.meanX).toBeCloseTo(0.12);
  expect(result.meanY).toBeCloseTo(-0.05);
  expect(result.meanRadius).toBeCloseTo(0.13);
  expect(result.outsideFraction).toBe(1);
  expect(result.duration).toBeGreaterThanOrEqual(4500);
  expect(c.session.getSnapshot().path.length).toBeLessThanOrEqual(120);
  c.session.stop();
  expect(c.session.getSnapshot().drift.result).toBeNull();
});
it.each(['gap', 'invalid-axis', 'nonmonotonic'])(
  'invalidates a drift window on %s without producing a result',
  (reason) => {
    const c = setup();
    c.session.start();
    c.session.measure();
    c.advance(1500);
    if (reason === 'gap') c.step(400);
    else if (reason === 'invalid-axis') {
      c.pad.axes[0] = NaN;
      c.step();
    } else c.step(0);
    expect(c.session.getSnapshot().drift).toMatchObject({ phase: 'invalid', result: null });
    expect(c.session.getSnapshot().state).toBe('running');
  },
);
it.each(['missing', 'insecure', 'policy', 'raf', 'activation', 'hidden', 'focus'])(
  'does not poll when %s blocks Start',
  (reason) => {
    const c = setup();
    if (reason === 'missing') Object.defineProperty(navigator, 'getGamepads', { value: undefined });
    if (reason === 'insecure') vi.stubGlobal('isSecureContext', false);
    if (reason === 'policy')
      Object.defineProperty(document, 'permissionsPolicy', {
        configurable: true,
        value: { features: () => ['gamepad'], allowsFeature: () => false },
      });
    if (reason === 'raf') vi.stubGlobal('requestAnimationFrame', undefined);
    if (reason === 'activation')
      Object.defineProperty(navigator, 'userActivation', { value: { isActive: false } });
    if (reason === 'hidden') vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    if (reason === 'focus') vi.spyOn(document, 'hasFocus').mockReturnValue(false);
    c.session.start();
    expect(c.read).not.toHaveBeenCalled();
    expect(c.frames.size).toBe(0);
  },
);
it('does not misinterpret unknown policy directives as explicit denial, and catches native SecurityError', () => {
  const c = setup();
  Object.defineProperty(document, 'permissionsPolicy', {
    configurable: true,
    value: { features: () => ['camera'], allowsFeature: () => false },
  });
  expect(inspectGamepadEnvironment()).toBe('available');
  c.read.mockImplementation(() => {
    throw new DOMException('private detail', 'SecurityError');
  });
  c.session.start();
  expect(c.session.getSnapshot()).toMatchObject({ state: 'error', failure: 'blocked', pad: null });
  expect(c.frames.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
  expect(JSON.stringify(c.session.getSnapshot())).not.toContain('private detail');
});
it.each([
  'disconnected',
  'silent-disconnect',
  'replaced',
  'mapping',
  'axes',
  'buttons',
  'blur',
  'hidden',
  'pagehide',
  'focus',
  'timeout',
  'detach',
  'exception',
])('cleans all active state on %s', (reason) => {
  const c = setup(),
    detach = c.session.attach();
  c.session.start();
  c.session.measure();
  c.advance(1500);
  if (reason === 'disconnected') {
    const event = new Event('gamepaddisconnected');
    Object.defineProperty(event, 'gamepad', { value: c.pad });
    window.dispatchEvent(event);
  } else if (reason === 'silent-disconnect') {
    c.devices[0] = null;
    c.devices.push(fakePad(1));
    c.step();
  } else if (['replaced', 'mapping', 'axes', 'buttons'].includes(reason)) {
    if (reason === 'replaced') c.pad.id = 'Other controller';
    if (reason === 'mapping') c.pad.mapping = '';
    if (reason === 'axes') c.pad.axes.push(0);
    if (reason === 'buttons') c.pad.buttons.pop();
    c.step();
  } else if (reason === 'hidden') {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  } else if (reason === 'focus') {
    vi.spyOn(document, 'hasFocus').mockReturnValue(false);
    c.step();
  } else if (reason === 'timeout') vi.advanceTimersByTime(120000);
  else if (reason === 'detach') detach();
  else if (reason === 'exception') {
    c.read.mockImplementation(() => {
      throw new Error('driver');
    });
    c.step();
  } else window.dispatchEvent(new Event(reason));
  expect(c.session.getSnapshot()).toMatchObject({
    pad: null,
    devices: [],
    path: [],
    drift: { phase: 'idle', result: null },
  });
  expect(c.frames.size).toBe(0);
  vi.advanceTimersByTime(0);
  expect(vi.getTimerCount()).toBe(0);
  detach();
});
it('bounds UI updates and history while preserving real raw values', () => {
  const c = setup();
  c.pad.axes[0] = -0.04;
  c.session.start();
  const listener = vi.fn(),
    off = c.session.subscribe(listener);
  c.advance(1000);
  expect(listener.mock.calls.length).toBeLessThanOrEqual(9);
  expect(c.session.getSnapshot().pad?.axes[0]).toBe(-0.04);
  c.advance(3000);
  expect(c.session.getSnapshot().path).toHaveLength(120);
  off();
});
it('does not allocate or republish stale data if a subscriber stops during Start/selection', () => {
  const c = setup();
  const off = c.session.subscribe(() => {
    if (c.session.getSnapshot().state === 'running') c.session.stop();
  });
  c.session.start();
  expect(c.read).not.toHaveBeenCalled();
  expect(c.frames.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
  off();
  const next = setup();
  const remove = next.session.subscribe(() => {
    if (next.session.getSnapshot().axes) next.session.stop();
  });
  next.session.start();
  expect(next.session.getSnapshot().pad).toBeNull();
  expect(next.frames.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
  remove();
});
