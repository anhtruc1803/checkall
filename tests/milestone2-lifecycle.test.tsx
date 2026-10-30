import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';
import { useInspection } from '@/hooks/use-inspection';
import { useTimedTask } from '@/hooks/use-timed-task';
import { useFullscreen } from '@/hooks/use-fullscreen';
import DeviceInformation from '@/features/device/information';
import GpuInformation from '@/features/device/gpu';
import StorageCapabilities from '@/features/browser/storage';
import FullscreenTest from '@/features/browser/fullscreen';
import PointerCapabilities from '@/features/device/pointer';
import { deferred } from './helpers/media';
const wrap = (children: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);
const factory = () => ({ count: 0 });
const snapshot = (model: ReturnType<typeof factory>) => model.count;
beforeEach(() => vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible'));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, 'fullscreenElement');
  Reflect.deleteProperty(document, 'fullscreenEnabled');
  Reflect.deleteProperty(document, 'exitFullscreen');
});
it('does not run inspections on mount and ignores a late result after Reset', async () => {
  const pending = deferred<number>(),
    reader = vi.fn(() => pending.promise);
  const hook = renderHook(() => useInspection(reader));
  expect(reader).not.toHaveBeenCalled();
  act(() => {
    void hook.result.current.read();
  });
  act(() => hook.result.current.reset());
  await act(async () => {
    pending.resolve(42);
    await pending.promise;
  });
  expect(hook.result.current.state).toBe('idle');
  expect(hook.result.current.result).toBeNull();
});
it('ignores a late inspection rejection after unmount', async () => {
  const pending = deferred<number>(),
    hook = renderHook(() => useInspection(() => pending.promise));
  act(() => {
    void hook.result.current.read();
  });
  hook.unmount();
  await act(async () => {
    pending.reject(new Error('blocked'));
    await Promise.resolve();
  });
});
it('bounds timed tasks and cleans timers/listeners on blur and unmount', () => {
  vi.useFakeTimers();
  const remove = vi.spyOn(window, 'removeEventListener');
  const hook = renderHook(() => useTimedTask(factory, snapshot));
  act(() => hook.result.current.start());
  act(() => window.dispatchEvent(new Event('blur')));
  expect(hook.result.current.running).toBe(false);
  expect(hook.result.current.state).toBe('warning');
  act(() => hook.result.current.start());
  act(() => vi.advanceTimersByTime(60001));
  expect(hook.result.current.state).toBe('stopped');
  hook.unmount();
  act(() => vi.advanceTimersByTime(0));
  expect(vi.getTimerCount()).toBe(0);
  expect(remove).toHaveBeenCalledWith('blur', expect.any(Function));
});
it('shows unknown device readings until an explicit read and supports Reset', async () => {
  const view = render(wrap(<DeviceInformation />));
  expect(view.container.querySelectorAll('.metric dd')).toHaveLength(9);
  expect(
    [...view.container.querySelectorAll('.metric dd')].every((element) =>
      element.textContent?.startsWith('—'),
    ),
  ).toBe(true);
  fireEvent.click(view.getByRole('button', { name: 'Read data' }));
  await waitFor(() =>
    expect(view.container.querySelector('.status')).toHaveTextContent('Completed'),
  );
  fireEvent.click(view.getByRole('button', { name: 'Reset' }));
  expect(view.container.querySelector('.status')).toHaveTextContent('Ready');
});
it('does not create a GPU context when the page mounts', async () => {
  const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  const view = render(wrap(<GpuInformation />));
  expect(context).not.toHaveBeenCalled();
  fireEvent.click(view.getByRole('button', { name: 'Read data' }));
  await waitFor(() => expect(view.getByText(/A WebGL context could not be read/)).toBeVisible());
  expect(context).toHaveBeenCalledWith('webgl2');
  expect(context).toHaveBeenCalledWith('webgl');
});
it('never touches Web Storage just because its tool mounted', () => {
  const writes = vi.spyOn(Storage.prototype, 'setItem');
  render(wrap(<StorageCapabilities />));
  expect(writes).not.toHaveBeenCalled();
});
it('cleans ResizeObserver and Fullscreen listeners when its tool unmounts', () => {
  const disconnect = vi.fn(),
    observe = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = observe;
      disconnect = disconnect;
    },
  );
  const remove = vi.spyOn(document, 'removeEventListener');
  const view = render(wrap(<FullscreenTest />));
  view.unmount();
  expect(observe).toHaveBeenCalledOnce();
  expect(disconnect).toHaveBeenCalledOnce();
  expect(remove).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
});
it('exits only its own fullscreen after a request finishes following unmount', async () => {
  const pending = deferred<void>(),
    element = document.createElement('div');
  document.body.append(element);
  let current: Element | null = null;
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => current });
  const exit = vi.fn(async () => {
    current = null;
  });
  Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exit });
  element.requestFullscreen = vi.fn(async () => {
    await pending.promise;
    current = element;
  });
  const target = { current: element },
    hook = renderHook(() => useFullscreen(target));
  act(() => {
    void hook.result.current.toggle();
  });
  hook.unmount();
  await act(async () => {
    pending.resolve();
    await pending.promise;
    await Promise.resolve();
  });
  expect(exit).toHaveBeenCalledOnce();
  expect(current).toBeNull();
  element.remove();
});
it('does not exit a fullscreen element owned by another tool', () => {
  const element = document.createElement('div'),
    other = document.createElement('div'),
    exit = vi.fn();
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: other });
  Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exit });
  const hook = renderHook(() => useFullscreen({ current: element }));
  hook.unmount();
  expect(exit).not.toHaveBeenCalled();
});
it('releases pointer capture and timers when the pointer task unmounts', () => {
  vi.useFakeTimers();
  vi.stubGlobal('PointerEvent', MouseEvent);
  const view = render(wrap(<PointerCapabilities />));
  fireEvent.click(view.getByRole('button', { name: 'Start' }));
  const region = view.getByTestId('pointer-capability-area');
  Object.assign(region, {
    setPointerCapture: vi.fn(),
    hasPointerCapture: () => true,
    releasePointerCapture: vi.fn(),
  });
  const event = new MouseEvent('pointerdown', { clientX: 10, clientY: 10, bubbles: true });
  Object.defineProperties(event, {
    pointerId: { value: 1 },
    pointerType: { value: 'mouse' },
    pressure: { value: 0.5 },
    width: { value: 1 },
    height: { value: 1 },
  });
  fireEvent(region, event);
  view.unmount();
  act(() => vi.advanceTimersByTime(0));
  expect(region.releasePointerCapture).toHaveBeenCalledWith(1);
  expect(vi.getTimerCount()).toBe(0);
});
