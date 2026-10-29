import {
  phase1Capabilities,
  type Capability,
  type CapabilityState,
  type Phase1Capability,
} from './capability-types';

// API presence only; never requests access, creates an AudioContext or probes GPU identity.
export function inspectCapabilities(
  requested: readonly Capability[],
): Partial<Record<Capability, CapabilityState>> {
  const result: Partial<Record<Capability, CapabilityState>> = {};
  for (const capability of requested) {
    if (
      typeof window === 'undefined' ||
      typeof document === 'undefined' ||
      typeof navigator === 'undefined'
    ) {
      result[capability] = 'unknown';
      continue;
    }
    try {
      let available: boolean;
      switch (capability) {
        case 'screen':
          available = 'screen' in window;
          break;
        case 'animationFrame':
          available = typeof window.requestAnimationFrame === 'function';
          break;
        case 'canvas':
          available = Boolean(document.createElement('canvas').getContext('2d'));
          break;
        case 'pointer':
          available = typeof window.PointerEvent === 'function';
          break;
        case 'touch':
          available = navigator.maxTouchPoints > 0;
          break;
        case 'keyboard':
          available = typeof window.KeyboardEvent === 'function';
          break;
        case 'fullscreen':
          available = Boolean(document.fullscreenEnabled);
          break;
        case 'visualViewport':
          available = Boolean(window.visualViewport);
          break;
        case 'secureContext':
          available = window.isSecureContext === true;
          break;
        case 'mediaDevices':
          available = typeof navigator.mediaDevices?.getUserMedia === 'function';
          break;
        case 'audioContext':
          available = typeof window.AudioContext === 'function';
          break;
        case 'gamepad':
          available = typeof navigator.getGamepads === 'function';
          break;
        case 'webgl':
          available = typeof window.WebGLRenderingContext === 'function';
          break;
        case 'storage':
          available = typeof navigator.storage?.estimate === 'function';
          break;
        case 'permissions':
          available = typeof navigator.permissions?.query === 'function';
          break;
      }
      result[capability] = available ? 'available' : 'unavailable';
    } catch {
      result[capability] = 'unavailable';
    }
  }
  return result;
}
export function detectCapabilities(): Record<Phase1Capability, boolean> {
  const inspected = inspectCapabilities(phase1Capabilities);
  return Object.fromEntries(
    phase1Capabilities.map((capability) => [capability, inspected[capability] === 'available']),
  ) as Record<Phase1Capability, boolean>;
}
export function browserInfo(ua: string) {
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /Firefox\//.test(ua)
      ? 'Firefox'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Safari\//.test(ua)
          ? 'Safari'
          : '—';
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Android/.test(ua)
      ? 'Android'
      : /iPhone|iPad/.test(ua)
        ? 'iOS / iPadOS'
        : /Mac OS/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : '—';
  return { browser, os };
}
