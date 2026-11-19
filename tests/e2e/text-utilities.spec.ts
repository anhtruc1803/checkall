import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import vi from '../../src/messages/vi.json';
import en from '../../src/messages/en.json';

const slugs = ['word-counter', 'case-converter', 'remove-accents-slug', 'text-cleaner'];
const path = (slug: string, locale = 'en') => `/${locale}/utilities/${slug}`;
const metric = (page: import('@playwright/test').Page, label: string) =>
  page
    .locator('.metric')
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator('dd');

test('related text-tool navigation resets input and locale switching preserves each new route', async ({
  page,
}) => {
  for (const slug of slugs) {
    await page.goto(path(slug, 'vi'));
    await page
      .getByRole('textbox', { name: vi.textTools.input, exact: true })
      .fill('Nội dung phiên trước');
    await page.getByRole('link', { name: 'Chuyển sang tiếng Anh' }).click();
    await expect(page).toHaveURL(new RegExp(`/en/utilities/${slug}$`));
    await expect(page.getByRole('textbox', { name: en.textTools.input, exact: true })).toHaveValue(
      '',
    );
  }
  await page.goto(path('case-converter'));
  await page
    .getByRole('textbox', { name: en.textTools.input, exact: true })
    .fill('Private original');
  await page.getByRole('button', { name: en.textTools.actions.case, exact: true }).click();
  await page
    .locator('.info-grid')
    .getByRole('link', { name: /Remove accents and create slugs/ })
    .click();
  await expect(page).toHaveURL(/\/en\/utilities\/remove-accents-slug$/);
  await expect(page.getByRole('textbox', { name: en.textTools.input, exact: true })).toHaveValue(
    '',
  );
  await expect(page.getByRole('textbox', { name: en.textTools.result, exact: true })).toHaveCount(
    0,
  );
});

test('counts Unicode accurately after an explicit action in VI/EN and clears stale results', async ({
  page,
}) => {
  for (const locale of ['vi', 'en'] as const) {
    const t = (locale === 'vi' ? vi : en).textTools;
    await page.goto(path(slugs[0], locale));
    const input = page.getByRole('textbox', { name: t.input, exact: true });
    await input.fill('e\u0301 👨‍👩‍👧‍👦 🇻🇳');
    await expect(page.locator('.text-tool .metric')).toHaveCount(0);
    await page.getByRole('button', { name: t.actions.count, exact: true }).click();
    await expect(metric(page, t.metrics.characters)).toHaveText('5');
    await expect(metric(page, t.metrics.charactersWithoutWhitespace)).toHaveText('3');
    await page.getByText(t.details, { exact: true }).click();
    await expect(metric(page, t.metrics.codePoints)).toHaveText('13');
    await expect(metric(page, t.metrics.utf16Units)).toHaveText('19');
    await expect(metric(page, t.metrics.utf8Bytes)).toHaveText('38');
    await input.fill('Xin chào\n\nViệt Nam');
    await expect(page.locator('.text-tool .metric')).toHaveCount(0);
    await page.getByRole('button', { name: t.actions.count, exact: true }).click();
    await expect(metric(page, t.metrics.words)).toHaveText('4');
    await expect(metric(page, t.metrics.lines)).toHaveText('3');
    await page.getByText(t.details, { exact: true }).click();
    await expect(metric(page, t.metrics.paragraphs)).toHaveText('2');
    await page.getByRole('button', { name: t.clear, exact: true }).click();
    await expect(input).toHaveValue('');
    await expect(page.locator('.text-tool .metric')).toHaveCount(0);
  }
});

test('case and slug modes preserve the source and handle Vietnamese, Unicode and literal HTML in VI/EN', async ({
  page,
}) => {
  for (const locale of ['vi', 'en'] as const) {
    const t = (locale === 'vi' ? vi : en).textTools;
    await page.goto(path(slugs[1], locale));
    const input = page.getByRole('textbox', { name: t.input, exact: true });
    const output = page.getByRole('textbox', { name: t.result, exact: true });
    await input.fill('ĐẶNG thị. XIN CHÀO!');
    for (const [mode, expected] of [
      ['upper', 'ĐẶNG THỊ. XIN CHÀO!'],
      ['lower', 'đặng thị. xin chào!'],
      ['title', 'Đặng Thị. Xin Chào!'],
      ['sentence', 'Đặng thị. Xin chào!'],
    ]) {
      await page.getByRole('combobox', { name: t.caseMode }).selectOption(mode);
      await expect(output).toHaveCount(0);
      await page.getByRole('button', { name: t.actions.case, exact: true }).click();
      await expect(output).toHaveValue(expected);
      await expect(input).toHaveValue('ĐẶNG thị. XIN CHÀO!');
    }
    const textLanguage = locale === 'vi' ? 'en' : 'vi';
    await page.getByRole('combobox', { name: t.language }).selectOption(textLanguage);
    await expect(input).toHaveAttribute('lang', textLanguage);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await page.getByRole('button', { name: t.actions.case, exact: true }).click();
    await expect(output).toHaveAttribute('lang', textLanguage);
    await page.goto(path(slugs[2], locale));
    await input.fill('Đà Nẵng / 2026!');
    await page.getByRole('button', { name: t.actions.slug, exact: true }).click();
    await expect(output).toHaveValue('Da Nang / 2026!');
    await page.getByRole('combobox', { name: t.slugMode }).selectOption('ascii');
    await page.getByRole('button', { name: t.actions.slug, exact: true }).click();
    await expect(output).toHaveValue('da-nang-2026');
    await page.getByRole('combobox', { name: t.slugMode }).selectOption('unicode');
    await page.getByRole('combobox', { name: t.separator }).selectOption('_');
    await page.getByRole('button', { name: t.actions.slug, exact: true }).click();
    await expect(output).toHaveValue('đà_nẵng_2026');
    await page.getByRole('combobox', { name: t.slugMode }).selectOption('accents');
    await input.fill('<img src=x onerror="window.__textExecuted=1">Đẹp');
    await page.getByRole('button', { name: t.actions.slug, exact: true }).click();
    await expect(output).toHaveValue('<img src=x onerror="window.__textExecuted=1">Dep');
    expect(await page.evaluate(() => '__textExecuted' in window)).toBe(false);
    await expect(page.locator('.text-tool img')).toHaveCount(0);
  }
});

test('cleanup choices keep defaults conservative and remove only selected content in VI/EN', async ({
  page,
}) => {
  for (const locale of ['vi', 'en'] as const) {
    const t = (locale === 'vi' ? vi : en).textTools;
    await page.goto(path(slugs[3], locale));
    const input = page.getByRole('textbox', { name: t.input, exact: true });
    const output = page.getByRole('textbox', { name: t.result, exact: true });
    for (const option of [
      'removeBlankLines',
      'deduplicateLines',
      'removeInvisible',
      'normalizeNfc',
    ] as const)
      await expect(
        page.getByRole('checkbox', { name: t.cleanup[option], exact: true }),
      ).not.toBeChecked();
    await input.fill('  A\t B \n\n A B \ne\u0301\u200B 👩🏽‍💻  ');
    await page.getByRole('button', { name: t.actions.clean, exact: true }).click();
    await expect(output).toHaveValue('A B\n\nA B\ne\u0301\u200B 👩🏽‍💻');
    for (const option of [
      'removeBlankLines',
      'deduplicateLines',
      'removeInvisible',
      'normalizeNfc',
    ] as const)
      await page.getByRole('checkbox', { name: t.cleanup[option], exact: true }).check();
    await expect(output).toHaveCount(0);
    await page.getByRole('button', { name: t.actions.clean, exact: true }).click();
    await expect(output).toHaveValue('A B\né 👩🏽‍💻');
    await expect(input).toHaveValue('  A\t B \n\n A B \ne\u0301\u200B 👩🏽‍💻  ');
  }
});

test('IME blocks premature conversion, oversize input stays intact and missing Segmenter is disclosed', async ({
  page,
}) => {
  const t = en.textTools;
  await page.goto(path(slugs[1]));
  const input = page.getByRole('textbox', { name: t.input, exact: true });
  const apply = page.getByRole('button', { name: t.actions.case, exact: true });
  await input.fill('Đặng');
  await input.dispatchEvent('compositionstart');
  await expect(apply).toBeDisabled();
  await input.dispatchEvent('compositionend');
  await expect(apply).toBeEnabled();
  await input.fill('a'.repeat(50_001));
  await expect(input).toHaveValue('a'.repeat(50_001));
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(apply).toBeDisabled();
  await input.fill('a'.repeat(50_000));
  await apply.click();
  await expect(page.getByRole('textbox', { name: t.result, exact: true })).toHaveValue(
    'A'.repeat(50_000),
  );
  await page.addInitScript(() => {
    Object.defineProperty(Intl, 'Segmenter', { value: undefined, configurable: true });
  });
  await page.goto(path(slugs[0]));
  await page.getByRole('textbox', { name: t.input, exact: true }).fill('👩🏽‍💻');
  await page.getByRole('button', { name: t.actions.count, exact: true }).click();
  await expect(page.getByText(t.segmenterUnavailable, { exact: true })).toBeVisible();
  await expect(metric(page, t.metrics.characters)).toHaveText('—');
});

test('text copying is explicit, handles denial and resets stale feedback', async ({ page }) => {
  test.info().annotations.push({
    type: 'fixture',
    description:
      'Clipboard fixture and composition events test UI behavior, not native permissions or EVKey certification.',
  });
  await page.addInitScript(() => {
    const state = { values: [] as string[], denied: false };
    Object.defineProperty(window, '__textClipboard', { value: state });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          if (state.denied) throw Error('denied');
          state.values.push(value);
        },
      },
    });
  });
  const t = en.textTools;
  await page.goto(path(slugs[1]));
  await page.getByRole('textbox', { name: t.input, exact: true }).fill('Đẹp');
  await page.getByRole('button', { name: t.actions.case, exact: true }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { __textClipboard: { values: string[] } }).__textClipboard.values,
    ),
  ).toEqual([]);
  await page.getByRole('button', { name: en.utilitiesTool.copy, exact: true }).click();
  await expect(page.getByText(en.utilitiesTool.copied, { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as unknown as { __textClipboard: { values: string[] } }).__textClipboard.values,
    ),
  ).toEqual(['ĐẸP']);
  await page.getByRole('textbox', { name: t.input, exact: true }).fill('Khác');
  await expect(page.getByText(en.utilitiesTool.copied, { exact: true })).toHaveCount(0);
  await page.evaluate(() => {
    (window as unknown as { __textClipboard: { denied: boolean } }).__textClipboard.denied = true;
  });
  await page.getByRole('button', { name: t.actions.case, exact: true }).click();
  await page.getByRole('button', { name: en.utilitiesTool.copy, exact: true }).click();
  await expect(page.getByText(en.utilitiesTool.copyError, { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: t.result, exact: true })).toHaveValue('KHÁC');
});

test('text tools neither persist content nor request device permissions or upload events', async ({
  page,
}) => {
  const uploads: string[] = [];
  page.on('request', (request) => {
    if (!['GET', 'HEAD'].includes(request.method())) uploads.push(new URL(request.url()).origin);
  });
  await page.addInitScript(() => {
    localStorage.setItem('device-lab:save', 'true');
    const state = { storage: 0, permissions: 0, capture: 0, clipboardRead: 0 };
    Object.defineProperty(window, '__textPrivacy', { value: state });
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (...args) {
      state.storage++;
      return setItem.apply(this, args);
    };
    if (navigator.permissions)
      Object.defineProperty(navigator.permissions, 'query', {
        configurable: true,
        value: async () => {
          state.permissions++;
          throw Error('unexpected');
        },
      });
    if (navigator.mediaDevices)
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: async () => {
          state.capture++;
          throw Error('unexpected');
        },
      });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        readText: async () => {
          state.clipboardRead++;
          throw Error('unexpected');
        },
      },
    });
  });
  for (const [index, slug] of slugs.entries()) {
    await page.goto(path(slug));
    await page
      .getByRole('textbox', { name: en.textTools.input, exact: true })
      .fill('Private text Đặng 123');
    await page
      .getByRole('button', { name: Object.values(en.textTools.actions)[index], exact: true })
      .click();
    expect(
      await page.evaluate(() => (window as unknown as { __textPrivacy: object }).__textPrivacy),
    ).toEqual({ storage: 0, permissions: 0, capture: 0, clipboardRead: 0 });
    await page.reload();
    await expect(page.getByRole('textbox', { name: en.textTools.input, exact: true })).toHaveValue(
      '',
    );
  }
  expect(uploads, 'No injected-software request is excluded.').toEqual([]);
});

test('all text tools are accessible in VI/EN Dark/Light and reflow at 320px with 200% text', async ({
  page,
}, testInfo) => {
  test.setTimeout(480000);
  for (const locale of ['vi', 'en'] as const) {
    const t = (locale === 'vi' ? vi : en).textTools;
    for (const [index, slug] of slugs.entries()) {
      await page.goto(path(slug, locale));
      await page
        .getByRole('textbox', { name: t.input, exact: true })
        .fill('Đặng 👩🏽‍💻 ' + 'x'.repeat(250));
      await page
        .getByRole('button', { name: Object.values(t.actions)[index], exact: true })
        .click();
      for (const theme of ['dark', 'light']) {
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
        for (const width of [320, 768, 1280]) {
          await page.setViewportSize({ width, height: 900 });
          await page.evaluate(() => {
            document.documentElement.style.fontSize = '200%';
          });
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `${slug}/${locale}/${theme}/${width}`,
          ).toBe(true);
        }
        await page.setViewportSize({ width: 375, height: 900 });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = '100%';
        });
        if (locale === 'vi') {
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({
            path: testInfo.outputPath(`${slug}-${theme}.png`),
            fullPage: true,
          });
        }
      }
    }
  }
});
