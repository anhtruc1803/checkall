import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { it, expect, afterEach } from 'vitest';
import KeyboardTool from '@/features/keyboard/keyboard';
import messages from '@/messages/en.json';
afterEach(cleanup);
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
