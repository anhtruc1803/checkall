'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
export function useFullscreen(target: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false),
    [error, setError] = useState(false),
    [supported, setSupported] = useState(true);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const element = target.current;
    const change = () => setActive(document.fullscreenElement === element);
    const check = () =>
      setSupported(Boolean(document.fullscreenEnabled && element?.requestFullscreen));
    check();
    document.addEventListener('fullscreenchange', change);
    return () => {
      mounted.current = false;
      document.removeEventListener('fullscreenchange', change);
      if (element && document.fullscreenElement === element)
        void document.exitFullscreen().catch(() => {});
    };
  }, [target]);
  async function toggle() {
    const element = target.current;
    try {
      setError(false);
      if (element && document.fullscreenElement === element) await document.exitFullscreen();
      else if (element?.requestFullscreen) {
        await element.requestFullscreen();
        if (!mounted.current && document.fullscreenElement === element)
          await document.exitFullscreen();
      } else setError(true);
    } catch {
      if (mounted.current) setError(true);
    }
  }
  return { active, error, supported, toggle };
}
