import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, expect, it, vi } from 'vitest';
import UnitConverter from '@/features/utilities/unit-converter';
import DateCalculator from '@/features/utilities/date-calculator';
import en from '@/messages/en.json';
import vietnamese from '@/messages/vi.json';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});
function mount(node: React.ReactNode, locale: 'vi' | 'en' = 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : vietnamese}>
      {node}
    </NextIntlClientProvider>,
  );
}
const change = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const output = () => document.querySelector('.utility-output');
it.each(['vi', 'en'] as const)(
  'converts and swaps units without losing the original number in %s',
  (locale) => {
    mount(<UnitConverter />, locale);
    const t = (locale === 'vi' ? vietnamese : en).unitTool;
    expect(screen.queryByRole('button', { name: en.utilitiesTool.copy })).not.toBeInTheDocument();
    change(t.value, locale === 'vi' ? '1,25' : '1.25');
    expect(output()).toHaveTextContent('125 cm');
    fireEvent.click(screen.getByRole('button', { name: t.swap }));
    expect(output()).toHaveTextContent(locale === 'vi' ? '0,0125 m' : '0.0125 m');
    expect(screen.getByLabelText(t.value)).toHaveValue(locale === 'vi' ? '1,25' : '1.25');
    change(t.value, '1e3');
    expect(screen.getByLabelText(t.value)).toHaveAttribute('aria-invalid', 'true');
    expect(
      screen.queryByRole('button', {
        name: (locale === 'vi' ? vietnamese : en).utilitiesTool.copy,
      }),
    ).not.toBeInTheDocument();
  },
);
it('validates temperature and resets unit choices safely when changing groups', () => {
  mount(<UnitConverter />);
  change(en.unitTool.group, 'temperature');
  change(en.unitTool.value, '-273.15');
  change(en.unitTool.to, 'k');
  expect(output()).toHaveTextContent('0 K');
  change(en.unitTool.value, '-273.150001');
  expect(screen.getByText(en.unitTool.errors.absoluteZero)).toBeVisible();
  expect(output()).not.toHaveTextContent('0 K');
  change(en.unitTool.group, 'data');
  expect(screen.getByLabelText(en.unitTool.from)).toHaveValue('bit');
  expect(screen.getByLabelText(en.unitTool.to)).toHaveValue('byte');
  expect(screen.getByText(en.unitTool.errors.negative)).toBeVisible();
  change(en.unitTool.value, '8');
  expect(output()).toHaveTextContent('1 B (byte)');
});
it('retains oversize input while rejecting it and clears clipboard feedback with a changed result', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
  mount(<UnitConverter />);
  change(en.unitTool.value, '1');
  fireEvent.click(screen.getByRole('button', { name: en.utilitiesTool.copy }));
  expect(writeText).toHaveBeenCalledWith('100 cm');
  await screen.findByText(en.utilitiesTool.copied);
  change(en.unitTool.value, '2');
  expect(screen.queryByText(en.utilitiesTool.copied)).not.toBeInTheDocument();
  const long = '9'.repeat(129);
  change(en.unitTool.value, long);
  expect(screen.getByLabelText(en.unitTool.value)).toHaveValue(long);
  expect(screen.getByText(en.utilitiesTool.errors.range)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: en.unitTool.clear }));
  expect(screen.getByLabelText(en.unitTool.value)).toHaveValue('');
});
it.each(['vi', 'en'] as const)(
  'counts leap days, swaps direction and adds/subtracts in %s',
  (locale) => {
    mount(<DateCalculator />, locale);
    const m = locale === 'vi' ? vietnamese : en,
      t = m.dateTool;
    expect(output()).toHaveTextContent(m.utilitiesTool.enterValues);
    change(t.start, '2024-02-28');
    change(t.end, '2024-03-01');
    expect(output()).toHaveTextContent(locale === 'vi' ? '2 ngày' : '2 days');
    fireEvent.click(screen.getByRole('button', { name: t.swap }));
    expect(output()).toHaveTextContent('-2');
    change(t.mode, 'add');
    change(t.days, '-1');
    expect(output()).toHaveTextContent('2024-02-29');
    change(t.days, '1.5');
    expect(screen.getByText(t.errors.days)).toBeVisible();
    expect(screen.getByLabelText(t.days)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('button', { name: m.utilitiesTool.copy })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.clear }));
    expect(screen.getByLabelText(t.start)).toHaveValue('');
    expect(screen.getByLabelText(t.days)).toHaveValue('');
  },
);
it('rejects output overflow and never reuses a stale valid date', () => {
  mount(<DateCalculator />);
  change(en.dateTool.mode, 'add');
  change(en.dateTool.start, '9999-12-31');
  change(en.dateTool.days, '0');
  expect(output()).toHaveTextContent('9999-12-31');
  change(en.dateTool.days, '1');
  expect(screen.getByText(en.dateTool.errors.dateRange)).toBeVisible();
  expect(screen.getByLabelText(en.dateTool.start)).toHaveAttribute('aria-invalid', 'true');
  expect(output()).not.toHaveTextContent('9999-12-31');
});
it('handles denied copying without reading clipboard, persisting input or making requests; resets after unmount', async () => {
  const writeText = vi.fn().mockRejectedValue(new Error('denied')),
    readText = vi.fn();
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText, readText } });
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  localStorage.setItem('device-lab:save', 'true');
  const store = vi.spyOn(Storage.prototype, 'setItem');
  const view = mount(<DateCalculator />);
  change(en.dateTool.start, '2024-01-01');
  change(en.dateTool.end, '2024-01-02');
  fireEvent.click(screen.getByRole('button', { name: en.utilitiesTool.copy }));
  await screen.findByText(en.utilitiesTool.copyError);
  expect(readText).not.toHaveBeenCalled();
  expect(store).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
  view.unmount();
  mount(<DateCalculator />);
  expect(screen.getByLabelText(en.dateTool.start)).toHaveValue('');
});
