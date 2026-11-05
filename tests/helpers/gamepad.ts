import { vi } from 'vitest';
export function fakePad(index = 0, mapping: GamepadMappingType = 'standard') {
  return {
    index,
    id: `QA controller ${index}`,
    mapping,
    connected: true,
    timestamp: 0,
    axes: [0, 0, 0, 0],
    buttons: Array.from({ length: 17 }, () => ({ value: 0, pressed: false, touched: false })),
  };
}
export function fakeGamepads() {
  const pad = fakePad();
  const devices: (ReturnType<typeof fakePad> | null)[] = [pad];
  const read = vi.fn(() => devices as unknown as (Gamepad | null)[]);
  const frames = new Map<number, FrameRequestCallback>();
  let id = 0,
    now = 0;
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('navigator', { userActivation: { isActive: true }, getGamepads: read });
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  vi.spyOn(document, 'hasFocus').mockReturnValue(true);
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      frames.set(++id, callback);
      return id;
    }),
  );
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((index: number) => {
      frames.delete(index);
    }),
  );
  const step = (ms = 16) => {
    now += ms;
    vi.advanceTimersByTime(ms);
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(now));
  };
  const advance = (ms: number) => {
    for (let elapsed = 0; elapsed < ms; elapsed += 16) step(Math.min(16, ms - elapsed));
  };
  return { pad, devices, read, frames, step, advance };
}
