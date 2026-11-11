import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { it, expect, afterEach, vi } from 'vitest';
import KeyboardTool from '@/features/keyboard/keyboard';
import messages from '@/messages/en.json';
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
const mount = (id: string) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <KeyboardTool toolId={id} />
    </NextIntlClientProvider>,
  );
const activate = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Activate test area' }));
  return screen.getByRole('group', { name: 'Activate test area' });
};
it('records an exit key without trapping focus', () => {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <KeyboardTool toolId="B01" />
    </NextIntlClientProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Activate test area' }));
  const area = screen.getByRole('group', { name: 'Activate test area' });
  fireEvent.keyDown(area, { key: 'Escape', code: 'Escape' });
  expect(document.querySelector('[data-code="Escape"]')).toHaveAttribute('data-tested', 'true');
  expect(area).toHaveAttribute('data-active', 'false');
});
it('does not turn an Exit click into a fresh activation after blur', () => {
  mount('B01');
  const area = activate();
  const exit = screen.getByRole('button', { name: 'Exit test area' });
  fireEvent.blur(area, { relatedTarget: exit });
  fireEvent.click(exit);
  expect(area).toHaveAttribute('data-active', 'false');
  expect(screen.getByRole('button', { name: 'Activate test area' })).toBeEnabled();
});
it('clears captured key state when the browser loses focus', () => {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <KeyboardTool toolId="B01" />
    </NextIntlClientProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Activate test area' }));
  const area = screen.getByRole('group', { name: 'Activate test area' });
  fireEvent.keyDown(area, { key: 'a', code: 'KeyA' });
  expect(document.querySelector('[data-code="KeyA"]')).toHaveAttribute('data-held', 'true');
  fireEvent.blur(window);
  expect(document.querySelector('[data-code="KeyA"]')).toHaveAttribute('data-held', 'false');
  expect(area).toHaveAttribute('data-active', 'false');
});

it('counts coverage only in the selected layout and preserves received codes on layout changes', () => {
  mount('B01');
  const area = activate();
  fireEvent.keyDown(area, { key: 'a', code: 'KeyA' });
  fireEvent.keyUp(area, { key: 'a', code: 'KeyA' });
  fireEvent.keyDown(area, { key: 'F1', code: 'F1' });
  fireEvent.keyUp(area, { key: 'F1', code: 'F1' });
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '2');
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '60%' } });
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
  expect(screen.getByText(/Received codes outside/)).toHaveTextContent('F1');
  expect(area).toHaveAttribute('data-active', 'false');
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
});
it('keeps the first actual maximum combination without counting auto-repeat twice', () => {
  mount('B02');
  const area = activate();
  fireEvent.keyDown(area, { key: 'a', code: 'KeyA' });
  fireEvent.keyDown(area, { key: 's', code: 'KeyS' });
  fireEvent.keyDown(area, { key: 'a', code: 'KeyA', repeat: true });
  fireEvent.keyUp(area, { key: 's', code: 'KeyS' });
  fireEvent.keyDown(area, { key: 'd', code: 'KeyD' });
  expect(document.querySelector('[data-max-combination]')).toHaveTextContent('KeyAKeyS');
  fireEvent.blur(window);
  expect(document.querySelector('[data-max-combination]')).toHaveTextContent('KeyAKeyS');
  expect(document.querySelector('[data-code="KeyA"]')).toHaveAttribute('data-held', 'false');
});
it('retains chatter totals beyond 200 events and never pairs across focus loss', () => {
  let time = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => time);
  mount('B03');
  const area = activate();
  for (let i = 0; i < 150; i++) {
    time = i * 20;
    fireEvent.keyDown(area, { key: 'a', code: 'KeyA' });
    time += 10;
    fireEvent.keyUp(area, { key: 'a', code: 'KeyA' });
  }
  const cells = () =>
    [...document.querySelectorAll('[data-chatter] tbody tr td')].map((cell) => cell.textContent);
  expect(cells()).toEqual(['KeyA', '150', '0', '149', '149', '10.0']);
  fireEvent.blur(window);
  fireEvent.click(screen.getByRole('button', { name: 'Activate test area' }));
  time += 1;
  fireEvent.keyDown(area, { key: 'a', code: 'KeyA' });
  expect(cells()).toEqual(['KeyA', '151', '0', '149', '149', '10.0']);
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '9' } });
  expect(cells()).toEqual(['KeyA', '151', '0', '0', '149', '10.0']);
});
it('does not count unidentified or composing events as physical presses and clears holds on IME', () => {
  mount('B05');
  const area = activate();
  fireEvent.keyDown(area, { key: 'a', code: 'KeyA' });
  fireEvent.compositionStart(area);
  expect(document.querySelector('[data-code="KeyA"]')).toHaveAttribute('data-held', 'false');
  fireEvent.keyDown(area, { key: 'Process', code: 'KeyB', isComposing: true });
  fireEvent.compositionEnd(area);
  fireEvent.keyDown(area, { key: 'x', code: '' });
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
  expect(document.querySelector('[data-code="KeyB"]')).toHaveAttribute('data-tested', 'false');
  expect(screen.getByText(/events had no code/)).toBeInTheDocument();
  expect(screen.getByText(/events belonged to IME/)).toBeInTheDocument();
  fireEvent.keyDown(area, { key: 'Escape', code: 'Escape' });
  expect(area).toHaveAttribute('data-active', 'false');
});
it.each(['B01', 'B02', 'B03', 'B05'])('does not schedule a live-hold interval for %s', (id) => {
  vi.useFakeTimers();
  const intervals = vi.spyOn(window, 'setInterval');
  mount(id);
  fireEvent.keyDown(activate(), { key: 'a', code: 'KeyA' });
  expect(intervals).not.toHaveBeenCalled();
});
it('stops the live hold clock with an accurate hidden-tab reason', () => {
  vi.useFakeTimers();
  mount('B04');
  const area = activate();
  fireEvent.keyDown(area, { key: 'a', code: 'KeyA' });
  act(() => vi.advanceTimersByTime(100));
  const descriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  try {
    fireEvent(document, new Event('visibilitychange'));
    expect(area).toHaveAttribute('data-active', 'false');
    expect(screen.getByText('Interrupted by a hidden tab')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(0));
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    if (descriptor) Object.defineProperty(document, 'hidden', descriptor);
    else Reflect.deleteProperty(document, 'hidden');
  }
});
it('does not store or send captured key data automatically', () => {
  const storage = vi.spyOn(Storage.prototype, 'setItem');
  const fetch = vi.spyOn(globalThis, 'fetch');
  mount('B05');
  const area = activate();
  fireEvent.keyDown(area, { key: 'a', code: 'KeyA' });
  fireEvent.keyUp(area, { key: 'a', code: 'KeyA' });
  fireEvent.blur(window);
  expect(storage).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});
it('preserves the native composition flag and empty code in the inspector', () => {
  mount('B05');
  const area = activate();
  fireEvent.compositionStart(area);
  fireEvent.keyDown(area, { key: 'a', code: 'KeyA', isComposing: false });
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  expect(screen.getByText('isComposing', { selector: 'dt' }).parentElement).toHaveTextContent(
    'false',
  );
  fireEvent.compositionEnd(area);
  fireEvent.keyDown(area, { key: 'x', code: '' });
  expect(screen.getByText('code', { selector: 'dt' }).parentElement).toHaveTextContent('""');
});
it('filters event review without logging input typed outside capture, and clears only the log', () => {
  mount('B05');
  const area = activate();
  for (const [key, code] of [
    ['a', 'KeyA'],
    ['b', 'KeyB'],
  ]) {
    fireEvent.keyDown(area, { key, code });
    fireEvent.keyUp(area, { key, code });
  }
  const filter = screen.getByRole('searchbox', { name: 'Filter key or code' });
  fireEvent.change(filter, { target: { value: 'KeyB' } });
  fireEvent.keyDown(filter, { key: 'q', code: 'KeyQ' });
  expect(document.querySelectorAll('.keyboard-event-table tbody tr')).toHaveLength(2);
  expect(document.querySelector('[data-code="KeyQ"]')).toHaveAttribute('data-tested', 'false');
  fireEvent.click(screen.getByRole('button', { name: 'Clear event log' }));
  expect(document.querySelectorAll('.keyboard-event-table tbody tr')).toHaveLength(0);
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '2');
});
