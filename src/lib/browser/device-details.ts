import { inspectCapabilities, browserInfo } from './capabilities';
import { phase1Capabilities, type Capability } from './capability-types';
import { inspectPermissionEnvironment } from './permissions';

export const compatibilityCapabilities: readonly Capability[] = [
  ...phase1Capabilities,
  'secureContext',
  'mediaDevices',
  'audioContext',
  'gamepad',
  'webgl',
  'storage',
  'permissions',
];
export function readDeviceDetails() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    ...browserInfo(nav.userAgent),
    userAgent: nav.userAgent,
    language: nav.language || null,
    languages: [...nav.languages].slice(0, 10),
    logicalProcessors: validNumber(nav.hardwareConcurrency),
    memoryGiB: validNumber(nav.deviceMemory),
    maxTouchPoints: validNumber(nav.maxTouchPoints),
    screen: `${screen.width} × ${screen.height}`,
    viewport: `${innerWidth} × ${innerHeight}`,
    dpr: devicePixelRatio,
  };
}
export function readCompatibility() {
  return {
    capabilities: inspectCapabilities(compatibilityCapabilities),
    camera: inspectPermissionEnvironment('camera').state,
    microphone: inspectPermissionEnvironment('microphone').state,
  };
}
export function readPointerCapabilities() {
  const matches = (query: string): boolean | null => {
    try {
      return typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : null;
    } catch {
      return null;
    }
  };
  return {
    pointerEvents: typeof window.PointerEvent === 'function',
    maxTouchPoints: validNumber(navigator.maxTouchPoints),
    primaryFine: matches('(pointer: fine)'),
    primaryCoarse: matches('(pointer: coarse)'),
    anyFine: matches('(any-pointer: fine)'),
    anyCoarse: matches('(any-pointer: coarse)'),
    hover: matches('(hover: hover)'),
  };
}
function validNumber(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}
