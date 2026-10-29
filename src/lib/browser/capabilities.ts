import type { Capability } from '@/lib/tools/registry';
export function detectCapabilities(): Record<Capability, boolean> {
  let canvas = false;
  if (typeof document !== 'undefined') {
    try {
      canvas = Boolean(document.createElement('canvas').getContext('2d'));
    } catch {
      canvas = false;
    }
  }
  return {
    screen: typeof window !== 'undefined' && 'screen' in window,
    animationFrame: typeof requestAnimationFrame === 'function',
    canvas,
    pointer: typeof window !== 'undefined' && typeof window.PointerEvent === 'function',
    touch: typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0,
    keyboard: typeof window !== 'undefined' && typeof window.KeyboardEvent === 'function',
    fullscreen: typeof document !== 'undefined' && Boolean(document.fullscreenEnabled),
    visualViewport: typeof window !== 'undefined' && Boolean(window.visualViewport),
  };
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
