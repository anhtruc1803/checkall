'use client';
import { useSyncExternalStore, useMemo } from 'react';
import { STORAGE_PREFIX, parsePreference } from '@/lib/storage/preferences';
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('device-lab-storage', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('device-lab-storage', callback);
  };
}
export function usePreference<T>(key: string, fallback: T): T {
  const defaultValue = JSON.stringify(fallback);
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(STORAGE_PREFIX + key) ?? defaultValue;
      } catch {
        return defaultValue;
      }
    },
    () => defaultValue,
  );
  return useMemo(() => {
    try {
      return parsePreference(key, raw, JSON.parse(defaultValue) as T);
    } catch {
      return JSON.parse(defaultValue) as T;
    }
  }, [raw, defaultValue, key]);
}
