import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, expect, it, vi } from 'vitest';
import TextTool from '@/features/utilities/text-tool';
import en from '@/messages/en.json';
import vietnamese from '@/messages/vi.json';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});
function mount(toolId: string, locale: 'vi' | 'en' = 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : vietnamese}>
      <TextTool toolId={toolId} />
    </NextIntlClientProvider>,
  );
}
const input = () => screen.getByRole('textbox', { name: en.textTools.input });
const enter = (text: string) => fireEvent.change(input(), { target: { value: text } });
const apply = (kind: 'count' | 'case' | 'slug' | 'clean') =>
  fireEvent.click(screen.getByRole('button', { name: en.textTools.actions[kind] }));

it('has no invented counts before explicit submit, clears stale results on editing and supports empty counts', () => {
  mount('U03');
  expect(screen.queryByRole('heading', { name: en.textTools.result })).not.toBeInTheDocument();
  enter('é 👩🏽‍💻');
  expect(document.querySelectorAll('.metric')).toHaveLength(0);
  apply('count');
  expect(screen.getByText(en.textTools.metrics.characters)).toBeVisible();
  expect(screen.getByText('3')).toBeVisible();
  expect(input()).toHaveValue('é 👩🏽‍💻');
  enter('');
  expect(screen.queryByRole('heading', { name: en.textTools.result })).not.toBeInTheDocument();
  apply('count');
  expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(4);
});
it('keeps original text, blocks processing during IME and clears output on option changes', () => {
  mount('U04');
  enter('Đặng thị');
  fireEvent.compositionStart(input());
  expect(screen.getByRole('button', { name: en.textTools.actions.case })).toBeDisabled();
  apply('case');
  expect(screen.queryByRole('textbox', { name: en.textTools.result })).not.toBeInTheDocument();
  fireEvent.compositionEnd(input());
  apply('case');
  expect(screen.getByRole('textbox', { name: en.textTools.result })).toHaveValue('ĐẶNG THỊ');
  expect(input()).toHaveValue('Đặng thị');
  fireEvent.change(screen.getByRole('combobox', { name: en.textTools.caseMode }), {
    target: { value: 'title' },
  });
  expect(screen.queryByRole('textbox', { name: en.textTools.result })).not.toBeInTheDocument();
  apply('case');
  expect(screen.getByRole('textbox', { name: en.textTools.result })).toHaveValue('Đặng Thị');
  fireEvent.change(screen.getByRole('combobox', { name: en.textTools.language }), {
    target: { value: 'vi' },
  });
  expect(input()).toHaveAttribute('lang', 'vi');
  apply('case');
  expect(screen.getByRole('textbox', { name: en.textTools.result })).toHaveAttribute('lang', 'vi');
  expect(screen.getByLabelText(en.textTools.input)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: en.textTools.clear }));
  expect(input()).toHaveValue('');
  expect(screen.queryByRole('textbox', { name: en.textTools.result })).not.toBeInTheDocument();
});
it('shows VI controls, changes slug settings explicitly and renders HTML literally', () => {
  mount('U05', 'vi');
  const t = vietnamese.textTools;
  fireEvent.change(screen.getByRole('textbox', { name: t.input }), {
    target: { value: '<b>Đà Nẵng</b>' },
  });
  fireEvent.click(screen.getByRole('button', { name: t.actions.slug }));
  expect(screen.getByRole('textbox', { name: t.result })).toHaveValue('<b>Da Nang</b>');
  expect(document.querySelector('.text-output b')).toBeNull();
  fireEvent.change(screen.getByRole('combobox', { name: t.slugMode }), {
    target: { value: 'unicode' },
  });
  fireEvent.change(screen.getByRole('combobox', { name: t.separator }), { target: { value: '_' } });
  fireEvent.click(screen.getByRole('button', { name: t.actions.slug }));
  expect(screen.getByRole('textbox', { name: t.result })).toHaveValue('b_đà_nẵng_b');
});
it('keeps potentially destructive cleaning off by default and invalidates output after changing a checkbox', () => {
  mount('U06');
  expect(
    screen.getByRole('checkbox', { name: en.textTools.cleanup.deduplicateLines }),
  ).not.toBeChecked();
  expect(
    screen.getByRole('checkbox', { name: en.textTools.cleanup.removeInvisible }),
  ).not.toBeChecked();
  enter(' A\n A\n\nB ');
  apply('clean');
  expect(screen.getByRole('textbox', { name: en.textTools.result })).toHaveValue('A\nA\n\nB');
  fireEvent.click(screen.getByRole('checkbox', { name: en.textTools.cleanup.deduplicateLines }));
  expect(screen.queryByRole('textbox', { name: en.textTools.result })).not.toBeInTheDocument();
  apply('clean');
  expect(screen.getByRole('textbox', { name: en.textTools.result })).toHaveValue('A\n\nB');
});
it('retains oversized input and disables processing, without truncating it', () => {
  mount('U04');
  enter('a'.repeat(50_001));
  expect(input()).toHaveValue('a'.repeat(50_001));
  expect(input()).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('button', { name: en.textTools.actions.case })).toBeDisabled();
  enter('a'.repeat(50_000));
  expect(input()).toHaveAttribute('aria-invalid', 'false');
  apply('case');
  expect(screen.getByRole('textbox', { name: en.textTools.result })).toHaveValue(
    'A'.repeat(50_000),
  );
});
it('copies explicitly, handles denial, clears feedback and does not copy an empty slug', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  mount('U05');
  enter('Đẹp');
  apply('slug');
  expect(writeText).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: en.utilitiesTool.copy }));
  await screen.findByText(en.utilitiesTool.copied);
  expect(writeText).toHaveBeenCalledWith('Dep');
  enter('東京');
  expect(screen.queryByText(en.utilitiesTool.copied)).not.toBeInTheDocument();
  apply('slug');
  writeText.mockRejectedValueOnce(Error('denied'));
  fireEvent.click(screen.getByRole('button', { name: en.utilitiesTool.copy }));
  await screen.findByText(en.utilitiesTool.copyError);
  expect(screen.getByRole('textbox', { name: en.textTools.result })).toHaveValue('東京');
  fireEvent.change(screen.getByRole('combobox', { name: en.textTools.slugMode }), {
    target: { value: 'ascii' },
  });
  apply('slug');
  expect(screen.getByRole('textbox', { name: en.textTools.result })).toHaveValue('');
  expect(screen.queryByRole('button', { name: en.utilitiesTool.copy })).not.toBeInTheDocument();
});
it('never persists or uploads text and resets on unmount even with history opt-in', () => {
  localStorage.setItem('device-lab:save', 'true');
  const store = vi.spyOn(Storage.prototype, 'setItem');
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  for (const [id, kind] of [
    ['U03', 'count'],
    ['U04', 'case'],
    ['U05', 'slug'],
    ['U06', 'clean'],
  ] as const) {
    const view = mount(id);
    enter('Nội dung riêng tư 123');
    apply(kind);
    view.unmount();
    const fresh = mount(id);
    expect(input()).toHaveValue('');
    fresh.unmount();
  }
  expect(store).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});
it('displays an honest unsupported count notice if Segmenter is missing', () => {
  vi.stubGlobal('Intl', Object.create(Intl, { Segmenter: { value: undefined } }));
  mount('U03');
  enter('👩🏽‍💻');
  apply('count');
  expect(screen.getByText(en.textTools.segmenterUnavailable)).toBeVisible();
  expect(screen.getAllByText('—')).toHaveLength(3);
});
