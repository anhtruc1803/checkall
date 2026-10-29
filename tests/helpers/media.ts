import { vi } from 'vitest';
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
export function fakeStream() {
  const track = Object.assign(new EventTarget(), { readyState: 'live', stop: vi.fn() });
  const stream = {
    getTracks: () => [track as unknown as MediaStreamTrack],
  } as unknown as MediaStream;
  return { stream, track };
}
export function fakePermission(state: PermissionState = 'prompt') {
  return Object.assign(new EventTarget(), { state }) as PermissionStatus;
}
