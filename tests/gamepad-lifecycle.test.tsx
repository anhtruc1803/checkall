import { StrictMode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';
import GamepadTool from '@/features/gamepad/gamepad';
import { fakeGamepads } from './helpers/gamepad';
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const component = (id: string) => (
  <StrictMode>
    <NextIntlClientProvider locale="en" messages={messages}>
      <GamepadTool toolId={id} />
    </NextIntlClientProvider>
  </StrictMode>
);
it('keeps StrictMode passive and clears RAF/results on tool change and unmount', () => {
  const c = fakeGamepads(),
    view = render(component('F03'));
  expect(c.read).not.toHaveBeenCalled();
  fireEvent.click(view.getByRole('button', { name: 'Start' }));
  expect(view.getByRole('combobox', { name: /^X axis$/ })).toBeEnabled();
  fireEvent.click(view.getByRole('button', { name: 'Measure rest position (5 seconds)' }));
  act(() => c.advance(6200));
  expect(view.container.querySelector('.status')).toHaveAttribute('data-state', 'running');
  expect(view.getByText(/Window complete/)).toBeVisible();
  view.rerender(component('F02'));
  expect(c.frames.size).toBe(0);
  expect(view.container).not.toHaveTextContent('QA controller 0');
  fireEvent.click(view.getByRole('button', { name: 'Start' }));
  expect(c.frames.size).toBe(1);
  view.unmount();
  expect(c.frames.size).toBe(0);
  act(() => vi.advanceTimersByTime(0));
  expect(vi.getTimerCount()).toBe(0);
});
it('requires both axes for non-standard mapping and resets drift when the pair changes', () => {
  const c = fakeGamepads();
  c.pad.mapping = '';
  c.pad.axes = [0.2, -0.3, 0, 0];
  const view = render(component('F03'));
  fireEvent.click(view.getByRole('button', { name: 'Start' }));
  expect(view.getByRole('button', { name: 'Measure rest position (5 seconds)' })).toBeDisabled();
  fireEvent.change(view.getByLabelText('X axis'), { target: { value: '0' } });
  expect(view.getByRole('button', { name: 'Measure rest position (5 seconds)' })).toBeDisabled();
  fireEvent.change(view.getByLabelText('Y axis'), { target: { value: '1' } });
  expect(view.getByRole('button', { name: 'Measure rest position (5 seconds)' })).toBeEnabled();
  fireEvent.click(view.getByRole('button', { name: 'Measure rest position (5 seconds)' }));
  act(() => c.advance(6200));
  expect(view.getByText(/Window complete/)).toBeVisible();
  fireEvent.change(view.getByLabelText('X axis'), { target: { value: '2' } });
  expect(view.getByText('No rest-position observation yet.')).toBeVisible();
});
