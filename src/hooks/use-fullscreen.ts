'use client';
import { useEffect, useState, type RefObject } from 'react';
export function useFullscreen(target: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false),
    [error, setError] = useState(false),
    [supported, setSupported] = useState(true);
  useEffect(() => {
    const element = target.current;
    const change = () => setActive(document.fullscreenElement === element);
    const check = () =>
      setSupported(Boolean(document.fullscreenEnabled && element?.requestFullscreen));
    check();
    document.addEventListener('fullscreenchange', change);
    return () => {
      document.removeEventListener('fullscreenchange', change);
      if (element && document.fullscreenElement === element)
        void document.exitFullscreen().catch(() => {});
    };
  }, [target]);
  async function toggle() {
    try {
      setError(false);
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (target.current?.requestFullscreen) await target.current.requestFullscreen();
      else setError(true);
    } catch {
      setError(true);
    }
  }
  return { active, error, supported, toggle };
}
