import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  inspectPermissionEnvironment,
  observePermission,
  classifyMediaFailure,
} from '@/lib/browser/permissions';
import { usePermission } from '@/hooks/use-permission';
import { deferred, fakePermission } from './helpers/media';

const capture = vi.fn(),
  query = vi.fn();
beforeEach(() => {
  capture.mockReset();
  query.mockReset();
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: capture }, permissions: { query } });
});
afterEach(() => {
  Reflect.deleteProperty(document, 'permissionsPolicy');
  Reflect.deleteProperty(document, 'featurePolicy');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it.each(['prompt', 'granted', 'denied'] as const)(
  'observes %s without requesting access',
  async (state) => {
    query.mockResolvedValue(fakePermission(state));
    const states: string[] = [];
    const dispose = observePermission('camera', (snapshot) => states.push(snapshot.state));
    await waitFor(() => expect(states).toEqual(['unknown', state]));
    expect(capture).not.toHaveBeenCalled();
    dispose();
  },
);
it('tracks permission revocation and detaches its listener on cleanup', async () => {
  const permission = fakePermission('granted');
  const remove = vi.spyOn(permission, 'removeEventListener');
  query.mockResolvedValue(permission);
  const changes = vi.fn();
  const dispose = observePermission('microphone', changes);
  await waitFor(() =>
    expect(changes).toHaveBeenLastCalledWith(expect.objectContaining({ state: 'granted' })),
  );
  Object.defineProperty(permission, 'state', { configurable: true, value: 'denied' });
  permission.dispatchEvent(new Event('change'));
  expect(changes).toHaveBeenLastCalledWith(expect.objectContaining({ state: 'denied' }));
  dispose();
  const count = changes.mock.calls.length;
  permission.dispatchEvent(new Event('change'));
  expect(changes).toHaveBeenCalledTimes(count);
  expect(remove).toHaveBeenCalledWith('change', expect.any(Function));
});
it('does not attach a late query result after disposal', async () => {
  const pending = deferred<PermissionStatus>(),
    permission = fakePermission();
  const add = vi.spyOn(permission, 'addEventListener');
  query.mockReturnValue(pending.promise);
  const changes = vi.fn();
  const dispose = observePermission('camera', changes);
  dispose();
  pending.resolve(permission);
  await pending.promise;
  expect(add).not.toHaveBeenCalled();
  expect(changes).toHaveBeenCalledTimes(1);
});
it.each([true, false])(
  'keeps unknown when permission queries are missing/rejected (%s)',
  async (exists) => {
    if (exists) query.mockRejectedValue(new TypeError('descriptor unavailable'));
    else vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: capture } });
    const changes = vi.fn();
    const dispose = observePermission('camera', changes);
    await Promise.resolve();
    await Promise.resolve();
    expect(changes).toHaveBeenCalledTimes(1);
    expect(changes).toHaveBeenLastCalledWith({
      permission: 'camera',
      state: 'unknown',
      source: 'unknown',
    });
    expect(capture).not.toHaveBeenCalled();
    dispose();
  },
);
it.each(['permissionsPolicy', 'featurePolicy'])(
  'separates %s blocking from user denial',
  (property) => {
    Object.defineProperty(document, property, {
      configurable: true,
      value: { allowsFeature: () => false },
    });
    const changes = vi.fn();
    const dispose = observePermission('camera', changes);
    expect(changes).toHaveBeenLastCalledWith(expect.objectContaining({ state: 'policy-blocked' }));
    expect(query).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
    dispose();
  },
);
it('distinguishes insecure context from missing API', () => {
  vi.stubGlobal('isSecureContext', false);
  expect(inspectPermissionEnvironment('camera').state).toBe('insecure-context');
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('navigator', {});
  expect(inspectPermissionEnvironment('camera').state).toBe('unsupported');
});
it('contains a blocked Permissions API getter without turning it into permission denial', async () => {
  const blocked = { mediaDevices: { getUserMedia: capture } };
  Object.defineProperty(blocked, 'permissions', {
    get() {
      throw new Error('blocked');
    },
  });
  vi.stubGlobal('navigator', blocked);
  const changes = vi.fn();
  const dispose = observePermission('camera', changes);
  await Promise.resolve();
  expect(changes).toHaveBeenLastCalledWith(expect.objectContaining({ state: 'unknown' }));
  expect(capture).not.toHaveBeenCalled();
  dispose();
});
it('cleans the React observer on unmount without opening any device', async () => {
  const permission = fakePermission(),
    remove = vi.spyOn(permission, 'removeEventListener');
  query.mockResolvedValue(permission);
  const view = renderHook(() => usePermission('camera'));
  await waitFor(() => expect(view.result.current.state).toBe('prompt'));
  view.unmount();
  expect(remove).toHaveBeenCalled();
  expect(capture).not.toHaveBeenCalled();
});
it.each([
  ['NotAllowedError', 'permission-denied'],
  ['SecurityError', 'permission-denied'],
  ['NotFoundError', 'device-not-found'],
  ['NotReadableError', 'device-busy'],
  ['OverconstrainedError', 'constraints-unavailable'],
  ['AbortError', 'aborted'],
  ['NotSupportedError', 'unsupported'],
  ['UnexpectedError', 'unknown'],
])('classifies %s without exposing browser error/device details', (name, expected) => {
  expect(classifyMediaFailure({ name, message: 'private device name' })).toBe(expected);
});
