export type StorageProbe = 'passed' | 'blocked' | 'cleanup-failed';
export interface StorageDetails {
  local: StorageProbe;
  session: StorageProbe;
  indexedDB: boolean;
  cacheStorage: boolean;
  usage: number | null;
  quota: number | null;
  persisted: boolean | null;
}
let sequence = 0;
export function probeWebStorage(getStorage: () => Storage): StorageProbe {
  let storage: Storage | undefined;
  const key = `device-lab:storage-probe:${Date.now()}:${++sequence}`;
  let written = false,
    result: StorageProbe = 'blocked';
  try {
    storage = getStorage();
    if (storage.getItem(key) !== null) return 'blocked';
    storage.setItem(key, 'probe');
    written = true;
    result = storage.getItem(key) === 'probe' ? 'passed' : 'blocked';
  } catch {
    result = 'blocked';
  } finally {
    if (storage && written) {
      try {
        storage.removeItem(key);
        if (storage.getItem(key) !== null) result = 'cleanup-failed';
      } catch {
        result = 'cleanup-failed';
      }
    }
  }
  return result;
}
export async function readStorageDetails(): Promise<StorageDetails> {
  const result: StorageDetails = {
    local: probeWebStorage(() => window.localStorage),
    session: probeWebStorage(() => window.sessionStorage),
    indexedDB: false,
    cacheStorage: false,
    usage: null,
    quota: null,
    persisted: null,
  };
  try {
    result.indexedDB = typeof window.indexedDB?.open === 'function';
  } catch {
    /* Unavailable API. */
  }
  try {
    result.cacheStorage = typeof window.caches?.open === 'function';
  } catch {
    /* Unavailable API. */
  }
  const bytes = (value: number | undefined) =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
  await Promise.allSettled([
    (async () => {
      const estimate = await navigator.storage?.estimate?.();
      result.usage = bytes(estimate?.usage);
      result.quota = bytes(estimate?.quota);
    })(),
    (async () => {
      const persisted = await navigator.storage?.persisted?.();
      result.persisted = typeof persisted === 'boolean' ? persisted : null;
    })(),
  ]);
  return result;
}
