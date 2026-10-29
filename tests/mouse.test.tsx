import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { it, expect, afterEach, vi } from 'vitest';
import MouseTool from '@/features/mouse/mouse';
import messages from '@/messages/en.json';
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
it('captures wheel only inside its region, resets the buffer and removes listeners', () => {
  vi.useFakeTimers();
  const view = render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <MouseTool toolId="C04" />
    </NextIntlClientProvider>,
  );
  const area = screen.getByTestId('mouse-area');
  const wheel = new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true });
  fireEvent(area, wheel);
  expect(wheel.defaultPrevented).toBe(true);
  act(() => vi.advanceTimersByTime(150));
  expect(screen.getByText('120')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  act(() => vi.advanceTimersByTime(150));
  expect(screen.queryByText('120')).not.toBeInTheDocument();
  view.unmount();
  const after = new WheelEvent('wheel', { deltaY: 10, cancelable: true });
  area.dispatchEvent(after);
  expect(after.defaultPrevented).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
});
