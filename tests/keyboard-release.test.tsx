import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, expect, it, vi } from 'vitest';
import KeyboardTool from '@/features/keyboard/keyboard';
import en from '@/messages/en.json';
import viMessages from '@/messages/vi.json';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const mount = (toolId = 'B01', locale: 'en' | 'vi' = 'en') =>
  render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : viMessages}>
      <KeyboardTool toolId={toolId} />
    </NextIntlClientProvider>,
  );
const toggle = () => screen.getByRole('checkbox', { name: en.keyboardTools.release.toggle });
const activate = () => {
  fireEvent.click(screen.getByRole('button', { name: en.activate }));
  return screen.getByRole('group', { name: en.activate });
};
const key = (code: string) => document.querySelector(`[data-code="${code}"]`);
const enable = () => {
  fireEvent.click(toggle());
  return activate();
};

it('defaults to the existing strict mode; enabling release recognition clears and stops that session', () => {
  mount();
  expect(toggle()).not.toBeChecked();
  const area = activate();
  fireEvent.keyDown(area, { key: 'a', code: 'KeyA' });
  expect(key('KeyA')).toHaveAttribute('data-held', 'true');
  fireEvent.click(toggle());
  expect(area).toHaveAttribute('data-active', 'false');
  expect(area).toHaveAttribute('data-mode', 'evkey-keyup');
  expect(key('KeyA')).toHaveAttribute('data-tested', 'false');
  expect(key('KeyA')).toHaveAttribute('data-held', 'false');
  expect(screen.getByRole('progressbar')).toHaveAttribute('max', '26');
  expect(screen.queryByText(en.presses, { selector: 'dt' })).not.toBeInTheDocument();
});

it('recognizes an unmatched letter release after an IME replacement without counting presses or Backspace', () => {
  mount();
  const area = enable();
  fireEvent.keyDown(area, { key: 'd', code: 'KeyD' });
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  fireEvent.keyDown(area, { key: '·', code: '', keyCode: 231 });
  fireEvent.keyDown(area, { key: 'Backspace', code: 'Backspace' });
  fireEvent.keyUp(area, { key: 'Backspace', code: 'Backspace' });
  fireEvent.keyDown(area, { key: 'đ', code: '', keyCode: 231 });
  fireEvent.keyUp(area, { key: 'Unidentified', code: '', keyCode: 231 });
  fireEvent.keyUp(area, { key: 'd', code: 'KeyD', keyCode: 68 });
  fireEvent.keyUp(area, { key: 'd', code: 'KeyD', keyCode: 68 });
  expect(area).toHaveAttribute('data-active', 'true');
  expect(key('KeyD')).toHaveAttribute('data-received-via', 'keyup');
  expect(key('KeyD')).toHaveAttribute('data-tested', 'false');
  expect(key('KeyD')).toHaveAttribute('data-held', 'false');
  expect(key('KeyD')?.querySelector('.key-count')).toBeNull();
  expect(key('Backspace')).not.toHaveAttribute('data-received-via');
  expect(key('Backspace')).toHaveAttribute('data-tested', 'false');
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
  expect(screen.getByText(en.keyboardTools.release.interference)).toBeInTheDocument();
  expect(document.querySelector('[data-chatter]')).toBeNull();
  fireEvent.click(toggle());
  expect(screen.getByText(en.presses, { selector: 'dt' }).nextElementSibling).toHaveTextContent(
    '0',
  );
  expect(screen.getByText(en.maxHeld, { selector: 'dt' }).nextElementSibling).toHaveTextContent(
    '0',
  );
  expect(screen.getByText(en.repeats, { selector: 'dt' }).nextElementSibling).toHaveTextContent(
    '0',
  );
  expect(key('KeyD')).not.toHaveAttribute('data-received-via');
});

it.each([
  { key: 'd', code: '', keyCode: 68 },
  { key: 'Unidentified', code: 'KeyD' },
  { key: 'd', code: 'Unidentified' },
  { key: 'd', code: 'KeyD', keyCode: 231 },
  { key: 'd', code: 'KeyD', keyCode: 229 },
  { key: 'Process', code: 'KeyD' },
  { key: 'd', code: 'KeyD', isComposing: true },
  { key: 'd', code: 'KeyD', repeat: true },
  { key: 'Backspace', code: 'Backspace' },
  { key: '1', code: 'Digit1' },
  { key: 'ArrowLeft', code: 'ArrowLeft' },
])('does not infer a letter from an ambiguous, repeated or out-of-scope release: %o', (event) => {
  mount();
  const area = enable();
  fireEvent.keyUp(area, event);
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  expect(area).toHaveAttribute('data-active', 'true');
});

it('waits through composition, accepts valid releases after composition ends and stays bounded at 26 codes', () => {
  mount();
  const area = enable();
  fireEvent.compositionStart(area);
  fireEvent.keyUp(area, { key: 'd', code: 'KeyD', isComposing: false });
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  fireEvent.compositionEnd(area);
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    for (let j = 0; j < 2; j++)
      fireEvent.keyUp(area, { key: letter, code: `Key${letter}`, shiftKey: true });
  }
  for (const code of ['KeyAA', 'Keyd', 'Key0', 'constructor', '__proto__', 'ShiftLeft'])
    fireEvent.keyUp(area, { key: 'd', code });
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '26');
  expect(document.querySelectorAll('.key-release-source')).toHaveLength(26);
  expect(document.querySelectorAll('.keyboard-release-result .key-tag')).toHaveLength(26);
});

it.each(['Tab', 'Escape'])(
  'exits on %s without preventing its default or creating a result',
  (exit) => {
    mount();
    const area = enable();
    const event = new KeyboardEvent('keydown', {
      key: exit,
      code: exit,
      cancelable: true,
      bubbles: true,
    });
    fireEvent(area, event);
    expect(event.defaultPrevented).toBe(false);
    expect(area).toHaveAttribute('data-active', 'false');
    fireEvent.keyUp(area, { key: 'd', code: 'KeyD' });
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  },
);

it('retains recognized codes when changing layouts; Reset clears them and the signal without changing mode', () => {
  mount();
  const area = enable();
  fireEvent.keyUp(area, { key: 'd', code: 'KeyD' });
  fireEvent.keyDown(area, { key: 'đ', code: '' });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '60%' } });
  expect(area).toHaveAttribute('data-active', 'false');
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
  fireEvent.click(screen.getByRole('button', { name: en.reset }));
  expect(toggle()).toBeChecked();
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  expect(screen.queryByText(en.keyboardTools.release.interference)).not.toBeInTheDocument();
});

it('stops on focus loss or a hidden tab, requires explicit reactivation and cleans up without storage/network/timers', () => {
  const storage = vi.spyOn(Storage.prototype, 'setItem');
  const fetch = vi.spyOn(globalThis, 'fetch');
  const interval = vi.spyOn(window, 'setInterval');
  const remove = vi.spyOn(window, 'removeEventListener');
  const { unmount } = mount();
  const area = enable();
  fireEvent.keyUp(area, { key: 'a', code: 'KeyA' });
  fireEvent.blur(window);
  fireEvent.keyUp(area, { key: 'd', code: 'KeyD' });
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
  activate();
  const hidden = Object.getOwnPropertyDescriptor(document, 'hidden');
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  try {
    fireEvent(document, new Event('visibilitychange'));
    expect(area).toHaveAttribute('data-active', 'false');
    fireEvent.keyUp(area, { key: 'd', code: 'KeyD' });
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
  } finally {
    if (hidden) Object.defineProperty(document, 'hidden', hidden);
    else Reflect.deleteProperty(document, 'hidden');
  }
  activate();
  unmount();
  expect(remove.mock.calls.some(([type]) => type === 'blur')).toBe(true);
  expect(interval).not.toHaveBeenCalled();
  expect(storage).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});

it.each(['B02', 'B03', 'B04', 'B05'])(
  'never exposes release mode in %s, including after a tool change',
  (toolId) => {
    const view = mount();
    fireEvent.keyUp(enable(), { key: 'd', code: 'KeyD' });
    view.rerender(
      <NextIntlClientProvider locale="en" messages={en}>
        <KeyboardTool toolId={toolId} />
      </NextIntlClientProvider>,
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(document.querySelector('.keyboard-release-result')).toBeNull();
    expect(key('KeyD')).not.toHaveAttribute('data-received-via');
    const area = activate();
    fireEvent.keyUp(area, { key: 'd', code: 'KeyD' });
    expect(key('KeyD')).toHaveAttribute('data-tested', 'false');
  },
);

it('provides Vietnamese mode labels and a release source without a fabricated press count', () => {
  mount('B01', 'vi');
  fireEvent.click(screen.getByRole('checkbox', { name: viMessages.keyboardTools.release.toggle }));
  fireEvent.click(screen.getByRole('button', { name: viMessages.activate }));
  const area = screen.getByRole('group', { name: viMessages.activate });
  act(() => {
    fireEvent.keyUp(area, { key: 'd', code: 'KeyD' });
  });
  expect(key('KeyD')).toHaveAttribute(
    'aria-label',
    `KeyD: ${viMessages.keyboardTools.release.received}`,
  );
  expect(screen.queryByText(viMessages.presses, { selector: 'dt' })).not.toBeInTheDocument();
});

it.each(['en', 'vi'] as const)(
  'warns about dd in %s without changing recognition or strict counters',
  (locale) => {
    const messages = locale === 'vi' ? viMessages : en;
    mount('B01', locale);
    expect(screen.getByText(messages.keyboardTools.doubleD.note)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: messages.activate }));
    const area = screen.getByRole('group', { name: messages.activate });
    const pressD = () => {
      fireEvent.keyDown(area, { code: 'KeyD', key: 'd' });
      fireEvent.keyUp(area, { code: 'KeyD', key: 'd' });
    };
    pressD();
    expect(screen.queryByText(messages.keyboardTools.doubleD.title)).not.toBeInTheDocument();
    pressD();
    const warning = document.querySelector('.keyboard-dd-warning');
    expect(warning).toHaveAttribute('role', 'status');
    expect(warning).toHaveTextContent(messages.keyboardTools.doubleD.standard);
    expect(key('KeyD')?.querySelector('.key-count')).toHaveTextContent('✓ 2');
    expect(key('Backspace')).toHaveAttribute('data-tested', 'false');
    fireEvent.click(screen.getByRole('checkbox', { name: messages.keyboardTools.release.toggle }));
    expect(document.querySelector('.keyboard-dd-warning')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: messages.activate }));
    pressD();
    pressD();
    expect(document.querySelector('.keyboard-dd-warning')).toHaveTextContent(
      messages.keyboardTools.doubleD.compatibility,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
    expect(key('KeyD')?.querySelector('.key-count')).toBeNull();
    expect(screen.queryByText(messages.presses, { selector: 'dt' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: messages.reset }));
    expect(document.querySelector('.keyboard-dd-warning')).toBeNull();
    expect(screen.getByText(messages.keyboardTools.doubleD.note)).toBeInTheDocument();
  },
);

it('does not infer dd from repeats, intervening keys, shortcuts, unknown codes or composition', () => {
  mount();
  const area = enable();
  const releaseD = () => fireEvent.keyUp(area, { code: 'KeyD', key: 'd' });
  for (const event of [
    { code: 'KeyD', key: 'd', repeat: true },
    { code: 'KeyA', key: 'a' },
    { code: 'Backspace', key: 'Backspace' },
    { code: 'KeyD', key: 'd', ctrlKey: true },
    { code: 'KeyD', key: 'd', altKey: true },
    { code: 'KeyD', key: 'd', metaKey: true },
    { code: 'KeyD', key: 'd', isComposing: true },
    { code: 'KeyD', key: 'd', keyCode: 229 },
    { code: 'KeyD', key: 'd', keyCode: 231 },
    { code: '', key: 'đ', keyCode: 231 },
    { code: 'KeyD', key: 'Process' },
    { code: 'KeyD', key: 'Unidentified' },
  ]) {
    fireEvent.click(screen.getByRole('button', { name: en.reset }));
    activate();
    releaseD();
    fireEvent.keyUp(area, event);
    expect(document.querySelector('.keyboard-dd-warning')).toBeNull();
    releaseD();
    expect(document.querySelector('.keyboard-dd-warning')).toBeNull();
  }
  fireEvent.compositionStart(area);
  fireEvent.compositionEnd(area);
  releaseD();
  expect(document.querySelector('.keyboard-dd-warning')).toBeNull();
});

it('never joins D releases across stop, focus loss, hidden tab or activation boundaries', () => {
  mount();
  const area = enable();
  const releaseD = () => fireEvent.keyUp(area, { code: 'KeyD', key: 'd' });
  for (const stop of [
    () => fireEvent.click(screen.getByRole('button', { name: en.deactivate })),
    () => fireEvent.blur(window),
    () => fireEvent.blur(area, { relatedTarget: document.body }),
    () => fireEvent.keyDown(area, { code: 'Escape', key: 'Escape' }),
    () => fireEvent.keyDown(area, { code: 'Tab', key: 'Tab' }),
    () => {
      const hidden = Object.getOwnPropertyDescriptor(document, 'hidden');
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      try {
        fireEvent(document, new Event('visibilitychange'));
      } finally {
        if (hidden) Object.defineProperty(document, 'hidden', hidden);
        else Reflect.deleteProperty(document, 'hidden');
      }
    },
  ]) {
    releaseD();
    stop();
    expect(area).toHaveAttribute('data-active', 'false');
    releaseD();
    expect(document.querySelector('.keyboard-dd-warning')).toBeNull();
    activate();
    releaseD();
    expect(document.querySelector('.keyboard-dd-warning')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: en.reset }));
    activate();
  }
});

it('keeps the dd explanation visible if the input method hides the second D from strict capture', () => {
  mount();
  const area = activate();
  fireEvent.keyDown(area, { code: 'KeyD', key: 'd' });
  fireEvent.keyUp(area, { code: 'KeyD', key: 'd' });
  fireEvent.keyDown(area, { code: '', key: 'đ', keyCode: 231 });
  expect(area).toHaveAttribute('data-active', 'false');
  expect(document.querySelector('.keyboard-input-issue')).not.toBeNull();
  expect(screen.getByText(en.keyboardTools.doubleD.note)).toBeInTheDocument();
  expect(document.querySelector('.keyboard-dd-warning')).toBeNull();
  expect(key('KeyD')?.querySelector('.key-count')).toBeNull();
});
