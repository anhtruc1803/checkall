import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, expect, it, vi } from 'vitest';
import NumberWords from '@/features/utilities/number-words';
import Percentage from '@/features/utilities/percentage';
import { Catalog } from '@/components/tools/catalog';
import { getToolSearchIndex } from '@/lib/tools/registry';
import en from '@/messages/en.json';
import vietnamese from '@/messages/vi.json';
vi.mock('next/navigation', () => ({ usePathname: () => '/en' }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function mount(node: React.ReactNode, locale: 'vi' | 'en' = 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : vietnamese}>
      {node}
    </NextIntlClientProvider>,
  );
}
const change = (name: string, value: string) =>
  fireEvent.change(screen.getByLabelText(name), { target: { value } });
const output = () => document.querySelector('.utility-output');
it('starts empty without invented results and keeps output language independent from input format', () => {
  mount(<NumberWords />);
  expect(output()).toHaveTextContent(en.utilitiesTool.enterNumber);
  expect(screen.queryByRole('button', { name: en.utilitiesTool.copy })).not.toBeInTheDocument();
  change(en.utilitiesTool.numberInput, '125');
  expect(output()).toHaveTextContent('One hundred twenty-five');
  change(en.utilitiesTool.outputLanguage, 'vi');
  expect(output()).toHaveTextContent('Một trăm hai mươi lăm');
  expect(screen.getByLabelText(en.utilitiesTool.inputFormat, { exact: false })).toHaveValue('en');
});
it('changes interpretation only when input format is explicitly selected', () => {
  mount(<NumberWords />);
  change(en.utilitiesTool.numberInput, '1,234');
  expect(output()).toHaveTextContent('One thousand two hundred thirty-four');
  fireEvent.change(screen.getByRole('combobox', { name: /Input format/ }), {
    target: { value: 'vi' },
  });
  expect(output()).toHaveTextContent('One point two three four');
});
it('shows localized invalid input and VND fraction errors without retaining a stale result', () => {
  mount(<NumberWords />, 'vi');
  change(vietnamese.utilitiesTool.numberInput, '125');
  expect(output()).toHaveTextContent('Một trăm hai mươi lăm');
  change(vietnamese.utilitiesTool.mode, 'money');
  expect(output()).toHaveTextContent('đồng chẵn');
  change(vietnamese.utilitiesTool.numberInput, '125,50');
  expect(screen.getByText(vietnamese.utilitiesTool.errors.vndFraction)).toBeVisible();
  expect(screen.getByLabelText(vietnamese.utilitiesTool.numberInput)).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  expect(output()).not.toHaveTextContent('đồng');
  change(vietnamese.utilitiesTool.numberInput, '1e6');
  expect(screen.getByText(vietnamese.utilitiesTool.errors.format)).toBeVisible();
});
it('copies only after an explicit action, clears feedback for a new result and recovers from clipboard refusal', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  mount(<NumberWords />);
  change(en.utilitiesTool.numberInput, '125');
  expect(writeText).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: en.utilitiesTool.copy }));
  await screen.findByText(en.utilitiesTool.copied);
  expect(writeText).toHaveBeenCalledWith('One hundred twenty-five');
  change(en.utilitiesTool.numberInput, '126');
  expect(screen.queryByText(en.utilitiesTool.copied)).not.toBeInTheDocument();
  writeText.mockRejectedValueOnce(Error('denied'));
  fireEvent.click(screen.getByRole('button', { name: en.utilitiesTool.copy }));
  await screen.findByText(en.utilitiesTool.copyError);
  expect(output()).toHaveTextContent('One hundred twenty-six');
});
it('handles unavailable clipboard with a readable failure', async () => {
  vi.stubGlobal('navigator', {});
  mount(<NumberWords />);
  change(en.utilitiesTool.numberInput, '1');
  fireEvent.click(screen.getByRole('button', { name: en.utilitiesTool.copy }));
  await screen.findByText(en.utilitiesTool.copyError);
});
it('calculates percentage modes, marks the zero base and removes stale copy output', () => {
  mount(<Percentage />);
  fireEvent.change(document.querySelector('#percent-0')!, { target: { value: '1' } });
  fireEvent.change(document.querySelector('#percent-1')!, { target: { value: '3' } });
  change(en.utilitiesTool.calculation, 'ratio');
  expect(output()).toHaveTextContent('33.333333%');
  expect(screen.getByText(en.utilitiesTool.rounded)).toBeVisible();
  fireEvent.change(document.querySelector('#percent-1')!, { target: { value: '0' } });
  expect(screen.getByText(en.utilitiesTool.errors.zeroBase)).toBeVisible();
  expect(document.querySelector('#percent-1')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.queryByRole('button', { name: en.utilitiesTool.copy })).not.toBeInTheDocument();
});
it('does not store or upload numeric input, even when history opt-in exists, and resets after unmount', () => {
  localStorage.setItem('device-lab:save', 'true');
  const store = vi.spyOn(Storage.prototype, 'setItem');
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  const view = mount(<NumberWords />);
  change(en.utilitiesTool.numberInput, '9007199254740993');
  view.unmount();
  mount(<NumberWords />);
  expect(screen.getByLabelText(en.utilitiesTool.numberInput)).toHaveValue('');
  expect(store).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
  localStorage.clear();
});
it('filters the two registry groups while retaining access to all original 40 tools', async () => {
  mount(<Catalog index={getToolSearchIndex('en')} />);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Everyday utilities 8' })).toBeEnabled(),
  );
  expect(document.querySelectorAll('.catalog-item')).toHaveLength(50);
  fireEvent.click(screen.getByRole('button', { name: 'Everyday utilities 8' }));
  expect(document.querySelectorAll('.catalog-item')).toHaveLength(8);
  fireEvent.click(screen.getByRole('button', { name: 'Device tests 42' }));
  expect(document.querySelectorAll('.catalog-item')).toHaveLength(42);
  expect(screen.getByRole('link', { name: /Vietnamese typing speed/ })).toBeInTheDocument();
});
