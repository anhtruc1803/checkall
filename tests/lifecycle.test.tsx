import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import Refresh from '@/features/screen/refresh';
import Motion from '@/features/screen/motion';
import Touch from '@/features/screen/touch';
import Patterns from '@/features/screen/patterns';
import MouseTool from '@/features/mouse/mouse';
import KeyboardTool from '@/features/keyboard/keyboard';
import messages from '@/messages/en.json';
let frames: Map<number, FrameRequestCallback>;
let disconnects: ReturnType<typeof vi.fn>[];
const wrap = (children: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);
beforeEach(() => {
  frames = new Map();
  disconnects = [];
  let nextId = 0;
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      frames.set(++nextId, callback);
      return nextId;
    }),
  );
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((id: number) => frames.delete(id)),
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      disconnect = vi.fn();
      constructor() {
        disconnects.push(this.disconnect);
      }
      observe() {}
      unobserve() {}
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    setTransform: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it('cancels RAF and removes blur listener when a running refresh test unmounts', () => {
  const add = vi.spyOn(window, 'addEventListener'),
    remove = vi.spyOn(window, 'removeEventListener');
  const view = render(wrap(<Refresh />));
  fireEvent.click(screen.getByRole('button', { name: 'Start' }));
  expect(frames.size).toBe(1);
  const blur = add.mock.calls.find(([name]) => name === 'blur')?.[1];
  view.unmount();
  expect(frames.size).toBe(0);
  expect(remove).toHaveBeenCalledWith('blur', blur);
});
it('stops motion RAF and disconnects its resize observer on unmount', () => {
  const view = render(wrap(<Motion />));
  fireEvent.click(screen.getByRole('button', { name: 'Start' }));
  expect(frames.size).toBe(1);
  view.unmount();
  expect(frames.size).toBe(0);
  expect(disconnects.every((mock) => mock.mock.calls.length > 0)).toBe(true);
});
it('cancels the touch overlay loop after an active contact is unmounted', () => {
  const view = render(wrap(<Touch />));
  const canvas = screen.getByLabelText('Touch or use a pen inside this area');
  Object.defineProperty(canvas, 'setPointerCapture', { value: vi.fn() });
  const event = new MouseEvent('pointerdown', { clientX: 20, clientY: 20, bubbles: true });
  Object.defineProperties(event, { pointerType: { value: 'touch' }, pointerId: { value: 1 } });
  fireEvent(canvas, event);
  expect(frames.size).toBe(1);
  view.unmount();
  expect(frames.size).toBe(0);
  expect(disconnects.every((mock) => mock.mock.calls.length > 0)).toBe(true);
});
it('disconnects the static pixel pattern observer without leaving a timer', () => {
  vi.useFakeTimers();
  const view = render(wrap(<Patterns toolId="A06" />));
  view.unmount();
  expect(disconnects.every((mock) => mock.mock.calls.length > 0)).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});
it.each(['C03', 'C05'])('removes the sampling timer and listeners for %s', (toolId) => {
  vi.useFakeTimers();
  const remove = vi.spyOn(window, 'removeEventListener');
  const view = render(wrap(<MouseTool toolId={toolId} />));
  fireEvent.click(screen.getByRole('button', { name: 'Start' }));
  expect(vi.getTimerCount()).toBeGreaterThan(0);
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
  expect(remove.mock.calls.some(([name]) => name === 'blur')).toBe(true);
});
it('clears key-hold timer and listeners when leaving a captured keyboard', () => {
  vi.useFakeTimers();
  const interval = vi.spyOn(window, 'setInterval');
  const cleared = vi.spyOn(window, 'clearInterval');
  const remove = vi.spyOn(window, 'removeEventListener');
  const view = render(wrap(<KeyboardTool toolId="B04" />));
  fireEvent.click(screen.getByRole('button', { name: 'Activate test area' }));
  fireEvent.keyDown(screen.getByRole('group', { name: 'Activate test area' }), {
    key: 'a',
    code: 'KeyA',
  });
  expect(vi.getTimerCount()).toBeGreaterThan(0);
  view.unmount();
  expect(cleared).toHaveBeenCalledWith(interval.mock.results[0].value);
  // Xả Immediate của React sau key event; interval ứng dụng bị rò vẫn tồn tại ở mốc 50 ms.
  act(() => vi.advanceTimersByTime(0));
  expect(vi.getTimerCount()).toBe(0);
  expect(remove.mock.calls.some(([name]) => name === 'blur')).toBe(true);
});
