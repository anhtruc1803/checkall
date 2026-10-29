import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { inspectCapabilities, detectCapabilities } from '@/lib/browser/capabilities';
import { phase1Capabilities } from '@/lib/browser/capability-types';
beforeEach(() => vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null));
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('detects only requested APIs without opening devices or initializing expensive contexts', () => {
  const getUserMedia = vi.fn(),
    query = vi.fn(),
    getGamepads = vi.fn(),
    estimate = vi.fn(),
    audio = vi.fn(),
    webgl = vi.fn();
  vi.stubGlobal('navigator', {
    mediaDevices: { getUserMedia },
    permissions: { query },
    getGamepads,
    storage: { estimate },
  });
  vi.stubGlobal('AudioContext', audio);
  vi.stubGlobal('WebGLRenderingContext', webgl);
  vi.stubGlobal('isSecureContext', true);
  const inspected = inspectCapabilities([
    'mediaDevices',
    'audioContext',
    'permissions',
    'gamepad',
    'storage',
    'webgl',
    'secureContext',
  ]);
  expect(Object.values(inspected).every((state) => state === 'available')).toBe(true);
  expect(inspected.canvas).toBeUndefined();
  for (const operation of [getUserMedia, query, getGamepads, estimate, audio, webgl])
    expect(operation).not.toHaveBeenCalled();
  expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
});
it('keeps the original eight Phase 1 capability keys', () => {
  expect(Object.keys(detectCapabilities())).toEqual([...phase1Capabilities]);
});
it('reports missing APIs, not fake devices or permission grants', () => {
  vi.stubGlobal('navigator', {});
  vi.stubGlobal('isSecureContext', false);
  expect(
    inspectCapabilities(['mediaDevices', 'gamepad', 'storage', 'permissions', 'secureContext']),
  ).toEqual({
    mediaDevices: 'unavailable',
    gamepad: 'unavailable',
    storage: 'unavailable',
    permissions: 'unavailable',
    secureContext: 'unavailable',
  });
});
it('contains failed feature probes without throwing or affecting another capability', () => {
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementationOnce(() => {
    throw new Error('blocked');
  });
  expect(inspectCapabilities(['canvas', 'screen'])).toEqual({
    canvas: 'unavailable',
    screen: 'available',
  });
  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledOnce();
});
