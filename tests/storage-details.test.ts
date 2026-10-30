import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { probeWebStorage, readStorageDetails } from '@/lib/browser/storage-details';
const estimate = vi.fn(),
  persisted = vi.fn(),
  persist = vi.fn();
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.resetAllMocks();
  vi.stubGlobal('navigator', { storage: { estimate, persisted, persist } });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it('round-trips an isolated key and preserves all existing data', () => {
  localStorage.setItem('other-app', 'keep');
  localStorage.setItem('device-lab:theme', 'dark');
  expect(probeWebStorage(() => localStorage)).toBe('passed');
  expect(localStorage.length).toBe(2);
  expect(localStorage.getItem('other-app')).toBe('keep');
  expect(localStorage.getItem('device-lab:theme')).toBe('dark');
});
it('handles blocked storage getters without attempting broad deletion', () => {
  expect(
    probeWebStorage(() => {
      throw Error('blocked');
    }),
  ).toBe('blocked');
});
it('reports unverifiable cleanup rather than claiming the round-trip passed', () => {
  const data = new Map<string, string>();
  const store = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: vi.fn(),
  } as unknown as Storage;
  expect(probeWebStorage(() => store)).toBe('cleanup-failed');
  expect(store.removeItem).toHaveBeenCalledOnce();
});
it('does not overwrite or delete an existing colliding probe key', () => {
  const store = {
    getItem: () => 'existing',
    setItem: vi.fn(),
    removeItem: vi.fn(),
  } as unknown as Storage;
  expect(probeWebStorage(() => store)).toBe('blocked');
  expect(store.setItem).not.toHaveBeenCalled();
  expect(store.removeItem).not.toHaveBeenCalled();
});
it('reads quota/usage estimates including genuine zero without requesting persistence', async () => {
  estimate.mockResolvedValue({ usage: 0, quota: 1000000 });
  persisted.mockResolvedValue(false);
  expect(await readStorageDetails()).toMatchObject({
    local: 'passed',
    session: 'passed',
    usage: 0,
    quota: 1000000,
    persisted: false,
  });
  expect(persist).not.toHaveBeenCalled();
  expect(localStorage.length).toBe(0);
  expect(sessionStorage.length).toBe(0);
});
it('keeps estimates unknown after API rejection but preserves independent results', async () => {
  estimate.mockRejectedValue(new Error('blocked'));
  persisted.mockResolvedValue(true);
  expect(await readStorageDetails()).toMatchObject({
    local: 'passed',
    usage: null,
    quota: null,
    persisted: true,
  });
});
it('does not turn missing, negative or nonfinite estimates into fake disk readings', async () => {
  estimate.mockResolvedValue({ usage: -1, quota: Infinity });
  persisted.mockResolvedValue(undefined);
  expect(await readStorageDetails()).toMatchObject({ usage: null, quota: null, persisted: null });
});
