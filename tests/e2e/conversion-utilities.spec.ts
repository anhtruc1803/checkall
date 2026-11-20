import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import vi from '../../src/messages/vi.json';
import en from '../../src/messages/en.json';

test.use({ timezoneId: 'America/New_York' });
const paths = ['unit-converter', 'date-calculator'];
const result = (page: Page) => page.locator('.utility-output');
test('all eight unit groups convert defined values in VI/EN without changing input', async ({
  page,
}) => {
  for (const locale of ['vi', 'en'] as const) {
    const t = (locale === 'vi' ? vi : en).unitTool;
    await page.goto(`/${locale}/utilities/unit-converter`);
    await expect(
      page.getByRole('button', { name: (locale === 'vi' ? vi : en).utilitiesTool.copy }),
    ).toHaveCount(0);
    for (const [group, from, to, input, output] of [
      ['length', 'in', 'cm', '1', '2.54'],
      ['mass', 'oz', 'lb', '16', '1'],
      ['area', 'ha', 'm2', '1', '10,000'],
      ['volume', 'uk_gal', 'l', '1', '4.54609'],
      ['temperature', 'f', 'c', '212', '100'],
      ['speed', 'knot', 'kph', '1', '1.852'],
      ['duration', 'week', 'h', '1', '168'],
      ['data', 'mib', 'byte', '1', '1,048,576'],
    ]) {
      await page.getByLabel(t.group, { exact: true }).selectOption(group);
      await page.getByLabel(t.from, { exact: true }).selectOption(from);
      await page.getByLabel(t.to, { exact: true }).selectOption(to);
      await page.getByLabel(t.value, { exact: true }).fill(input);
      const expected =
        locale === 'vi'
          ? output.replaceAll(',', '_').replaceAll('.', ',').replaceAll('_', '.')
          : output;
      await expect(result(page)).toContainText(expected);
      await expect(page.getByLabel(t.value, { exact: true })).toHaveValue(input);
    }
    await page.getByRole('button', { name: t.clear, exact: true }).click();
    await expect(page.getByLabel(t.value, { exact: true })).toHaveValue('');
  }
});
test('unit formats, bounds, swap and absolute zero errors remove stale results', async ({
  page,
}) => {
  await page.goto('/en/utilities/unit-converter');
  const t = en.unitTool,
    input = page.getByLabel(t.value, { exact: true });
  await input.fill('1.25');
  await expect(result(page)).toHaveText('125 cm');
  await page.getByRole('button', { name: t.swap, exact: true }).click();
  await expect(result(page)).toHaveText('0.0125 m');
  await expect(input).toHaveValue('1.25');
  await page.getByRole('combobox', { name: en.utilitiesTool.inputFormat }).selectOption('vi');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await input.fill('1,25');
  await expect(result(page)).toHaveText('0,0125 m');
  await input.fill('9'.repeat(129));
  await expect(input).toHaveValue('9'.repeat(129));
  await expect(page.getByText(en.utilitiesTool.errors.range, { exact: true })).toBeVisible();
  await page.getByLabel(t.group, { exact: true }).selectOption('temperature');
  await page.getByLabel(t.to, { exact: true }).selectOption('k');
  await input.fill('-273,15');
  await expect(result(page)).toHaveText('0 K');
  await input.fill('-273,150001');
  await expect(page.getByText(t.errors.absoluteZero, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: en.utilitiesTool.copy, exact: true })).toHaveCount(
    0,
  );
  await page.getByLabel(t.group, { exact: true }).selectOption('data');
  await expect(page.getByText(t.errors.negative, { exact: true })).toBeVisible();
});
test('calendar difference and signed addition respect leap centuries, date bounds and DST in VI/EN', async ({
  page,
}) => {
  for (const locale of ['vi', 'en'] as const) {
    const t = (locale === 'vi' ? vi : en).dateTool;
    await page.goto(`/${locale}/utilities/date-calculator`);
    for (const [start, end, count] of [
      ['2024-02-28', '2024-03-01', '2'],
      ['1900-02-28', '1900-03-01', '1'],
      ['2000-02-28', '2000-03-01', '2'],
      ['2026-03-07', '2026-03-09', '2'],
      ['2026-10-31', '2026-11-02', '2'],
      ['0099-12-31', '0100-01-01', '1'],
    ]) {
      await page.getByLabel(t.start, { exact: true }).fill(start);
      await page.getByLabel(t.end, { exact: true }).fill(end);
      await expect(result(page)).toContainText(count);
    }
    await page.getByRole('button', { name: t.swap, exact: true }).click();
    await expect(result(page)).toContainText('-1');
    await page.getByLabel(t.mode, { exact: true }).selectOption('add');
    await page.getByLabel(t.start, { exact: true }).fill('2024-03-01');
    await page.getByLabel(t.days, { exact: true }).fill('-1');
    await expect(result(page)).toHaveText('2024-02-29');
    await page.getByLabel(t.days, { exact: true }).fill('1.5');
    await expect(page.getByText(t.errors.days, { exact: true })).toBeVisible();
    await page.getByLabel(t.start, { exact: true }).fill('9999-12-31');
    await page.getByLabel(t.days, { exact: true }).fill('1');
    await expect(page.getByText(t.errors.dateRange, { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: (locale === 'vi' ? vi : en).utilitiesTool.copy,
        exact: true,
      }),
    ).toHaveCount(0);
    await page.getByRole('button', { name: t.clear, exact: true }).click();
    await expect(page.getByLabel(t.start, { exact: true })).toHaveValue('');
    await expect(page.getByLabel(t.days, { exact: true })).toHaveValue('');
  }
});
test('new tools are discoverable, have scoped headers and keep routes on locale changes', async ({
  page,
  request,
}) => {
  for (const [slug, name] of [
    ['unit-converter', 'Đổi đơn vị'],
    ['date-calculator', 'Tính ngày'],
  ]) {
    await page.goto('/vi/utilities');
    await page.getByRole('textbox', { name: vi.searchLabel }).fill(name);
    await expect(page.locator('.catalog-item')).toHaveCount(1);
    await page.locator('.catalog-item').click();
    await expect(page).toHaveURL(new RegExp(`/vi/utilities/${slug}$`));
    await page.getByRole('link', { name: 'Chuyển sang tiếng Anh' }).click();
    await expect(page).toHaveURL(new RegExp(`/en/utilities/${slug}$`));
    const response = await request.get(`/en/utilities/${slug}`);
    expect(response.status()).toBe(200);
    expect(response.headers()['permissions-policy']).toBe(
      'camera=(), microphone=(), geolocation=(), gamepad=()',
    );
    expect(await response.text()).toContain('rel="canonical"');
  }
});
test('clipboard is explicit, supports failure and never reads clipboard; feedback resets', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const writes: string[] = [];
    Object.defineProperty(window, '__conversionClipboard', {
      value: { writes, fail: false, reads: 0 },
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          const s = (
            window as unknown as { __conversionClipboard: { writes: string[]; fail: boolean } }
          ).__conversionClipboard;
          if (s.fail) throw Error('denied');
          s.writes.push(value);
        },
        readText: async () => {
          (window as unknown as { __conversionClipboard: { reads: number } }).__conversionClipboard
            .reads++;
          return 'private';
        },
      },
    });
  });
  for (const slug of paths) {
    await page.goto(`/en/utilities/${slug}`);
    if (slug === 'unit-converter')
      await page.getByLabel(en.unitTool.value, { exact: true }).fill('1');
    else {
      await page.getByLabel(en.dateTool.start, { exact: true }).fill('2024-02-28');
      await page.getByLabel(en.dateTool.end, { exact: true }).fill('2024-03-01');
    }
    const state = () =>
      page.evaluate(
        () =>
          (
            window as unknown as {
              __conversionClipboard: { writes: string[]; fail: boolean; reads: number };
            }
          ).__conversionClipboard,
      );
    expect((await state()).writes).toEqual([]);
    const expected = await result(page).innerText();
    await page.getByRole('button', { name: en.utilitiesTool.copy, exact: true }).click();
    await expect(page.getByText(en.utilitiesTool.copied, { exact: true })).toBeVisible();
    expect((await state()).writes).toEqual([expected]);
    await page.evaluate(
      () =>
        ((
          window as unknown as { __conversionClipboard: { fail: boolean } }
        ).__conversionClipboard.fail = true),
    );
    await page.getByRole('button', { name: en.utilitiesTool.copy, exact: true }).click();
    await expect(page.getByText(en.utilitiesTool.copyError, { exact: true })).toBeVisible();
    expect((await state()).reads).toBe(0);
    if (slug === 'unit-converter')
      await page.getByLabel(en.unitTool.value, { exact: true }).fill('2');
    else await page.getByLabel(en.dateTool.end, { exact: true }).fill('2024-03-02');
    await expect(page.getByText(en.utilitiesTool.copyError, { exact: true })).toHaveCount(0);
  }
});
test('both tools pass WCAG checks in VI/EN, dark/light with active results', async ({ page }) => {
  test.setTimeout(120000);
  for (const locale of ['vi', 'en'] as const)
    for (const slug of paths) {
      const m = locale === 'vi' ? vi : en;
      await page.goto(`/${locale}/utilities/${slug}`);
      if (slug === 'unit-converter')
        await page.getByLabel(m.unitTool.value, { exact: true }).fill('1');
      else {
        await page.getByLabel(m.dateTool.start, { exact: true }).fill('2024-02-28');
        await page.getByLabel(m.dateTool.end, { exact: true }).fill('2024-03-01');
      }
      for (const theme of ['light', 'dark']) {
        if ((await page.locator('html').getAttribute('data-theme')) !== theme)
          await page.getByRole('button', { name: m.theme, exact: true }).click();
        const scan = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(scan.violations, `${locale}/${slug}/${theme}`).toEqual([]);
      }
    }
});
test('both tools reflow at 320px and enlarged text without horizontal page overflow', async ({
  page,
}) => {
  for (const locale of ['vi', 'en'] as const)
    for (const slug of paths) {
      await page.goto(`/${locale}/utilities/${slug}`);
      for (const width of [320, 375, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale}/${slug}/${width}`,
        ).toBe(true);
        await page.evaluate(() => (document.documentElement.style.fontSize = ''));
      }
    }
});
test('numeric and date input stay in memory, never upload or request hardware, and reset after navigation', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const calls: string[] = [];
    Object.defineProperty(window, '__conversionRequests', { value: calls });
    navigator.mediaDevices.getUserMedia = async () => {
      calls.push('media');
      throw Error('unexpected media');
    };
    navigator.permissions.query = async () => {
      calls.push('permission');
      throw Error('unexpected permission');
    };
    localStorage.setItem('device-lab:save', 'true');
  });
  for (const slug of paths) {
    await page.goto(`/en/utilities/${slug}`);
    const stored = await page.evaluate(() => JSON.stringify(localStorage));
    const requests: string[] = [];
    const listener = (r: import('@playwright/test').Request) => {
      if (!['GET', 'HEAD'].includes(r.method())) requests.push(`${r.method()} ${r.url()}`);
    };
    page.on('request', listener);
    if (slug === 'unit-converter')
      await page.getByLabel(en.unitTool.value, { exact: true }).fill('9007199254740993');
    else {
      await page.getByLabel(en.dateTool.start, { exact: true }).fill('1999-01-01');
      await page.getByLabel(en.dateTool.end, { exact: true }).fill('2024-01-01');
    }
    await page.waitForTimeout(350);
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(stored);
    expect(
      await page.evaluate(
        () => (window as unknown as { __conversionRequests: string[] }).__conversionRequests,
      ),
    ).toEqual([]);
    page.off('request', listener);
    await page.reload();
    await expect(
      page.getByLabel(slug === 'unit-converter' ? en.unitTool.value : en.dateTool.start, {
        exact: true,
      }),
    ).toHaveValue('');
  }
});
