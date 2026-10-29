'use client';
import { useEffect, useState } from 'react';
import { browserInfo, detectCapabilities } from '@/lib/browser/capabilities';
export function useDevice() {
  const [device, setDevice] = useState<ReturnType<typeof getDevice> | null>(null);
  useEffect(() => {
    const capabilities = detectCapabilities();
    const update = () => setDevice(getDevice(capabilities));
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    const timer = window.setInterval(update, 2000);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
      clearInterval(timer);
    };
  }, []);
  return device;
}
function getDevice(capabilities: ReturnType<typeof detectCapabilities>) {
  return {
    ...browserInfo(navigator.userAgent),
    screenWidth: screen.width,
    screenHeight: screen.height,
    availableWidth: screen.availWidth,
    availableHeight: screen.availHeight,
    viewportWidth: innerWidth,
    viewportHeight: innerHeight,
    dpr: devicePixelRatio,
    orientation: screen.orientation?.type ?? (innerWidth >= innerHeight ? 'landscape' : 'portrait'),
    visualWidth: window.visualViewport?.width,
    visualHeight: window.visualViewport?.height,
    visualScale: window.visualViewport?.scale,
    capabilities,
  };
}
