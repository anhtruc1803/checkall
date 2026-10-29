import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, it, expect } from 'vitest';
import Calculator from '@/features/screen/calculator';
import messages from '@/messages/en.json';
afterEach(cleanup);
it('updates PPI and exposes invalid user input without a fabricated result', () => {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Calculator toolId="A04" />
    </NextIntlClientProvider>,
  );
  expect(screen.getByText('91.8')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Diagonal (inches)'), { target: { value: '0' } });
  expect(screen.getByRole('alert')).toHaveTextContent('positive diagonal');
  expect(screen.queryByText('91.8')).not.toBeInTheDocument();
});
it('enables explicit saving immediately after local opt-in', () => {
  localStorage.clear();
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Calculator toolId="A04" />
    </NextIntlClientProvider>,
  );
  const button = screen.getByRole('button', { name: 'Save summary' });
  expect(button).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox'));
  expect(button).toBeEnabled();
  fireEvent.click(button);
  expect(screen.getByText('Saved on this device')).toBeInTheDocument();
});
