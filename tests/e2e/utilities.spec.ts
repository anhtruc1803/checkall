import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import vi from '../../src/messages/vi.json';
import en from '../../src/messages/en.json';
import { publishedTools } from '../../src/lib/tools/registry';

const wordsPath = (locale: string) => `/${locale}/utilities/number-to-words`;
const percentPath = (locale: string) => `/${locale}/utilities/percentage`;

test('utility groups discover all 52 tools and preserve the original 40 in VI/EN', async ({
  page,
  request,
}) => {
  for (const locale of ['vi', 'en'] as const) {
    const t = locale === 'vi' ? vi : en;
    await page.goto(`/${locale}`);
    const groups = page.getByRole('group', { name: t.toolGroups.label, exact: true });
    await expect(page.locator('.catalog-item')).toHaveCount(52);
    await groups.getByRole('button', { name: `${t.toolGroups.utilities} 10` }).click();
    await expect(page.locator('.catalog-item')).toHaveCount(10);
    await expect(page.locator(`.catalog-item[href="${wordsPath(locale)}"]`)).toHaveCount(1);
    await groups.getByRole('button', { name: `${t.toolGroups['device-tests']} 42` }).click();
    await expect(page.locator('.catalog-item')).toHaveCount(42);
    for (const tool of publishedTools.filter((tool) => tool.category !== 'utilities'))
      await expect(
        page.locator(`.catalog-item[href="/${locale}/${tool.category}/${tool.slug}"]`),
      ).toHaveCount(1);
    for (const path of [wordsPath(locale), percentPath(locale)]) {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      expect(response.headers()['permissions-policy']).toContain('microphone=()');
      expect(response.headers()['permissions-policy']).toContain('camera=()');
    }
    await page.goto(`/${locale}/utilities`);
    await expect(page.locator('.catalog-item')).toHaveCount(10);
    await page
      .getByRole('textbox', { name: t.searchLabel })
      .fill(locale === 'vi' ? 'so tien' : 'money');
    await expect(page.locator('.catalog-item')).toHaveCount(1);
  }
});

test('number words and VND keep separators, precision and output language independent in VI/EN', async ({
  page,
}) => {
  for (const locale of ['vi', 'en'] as const) {
    const t = (locale === 'vi' ? vi : en).utilitiesTool;
    await page.goto(wordsPath(locale));
    const input = page.getByRole('textbox', { name: t.numberInput, exact: true });
    const output = page.locator('.utility-output');
    await expect(input).toHaveValue('');
    await input.fill('125');
    await page.getByRole('combobox', { name: t.outputLanguage }).selectOption('vi');
    await expect(output).toHaveText('Một trăm hai mươi lăm');
    await page.getByRole('combobox', { name: t.inputFormat, exact: true }).selectOption('en');
    await input.fill('1,234');
    await expect(output).toHaveText('Một nghìn hai trăm ba mươi bốn');
    await page.getByRole('combobox', { name: t.inputFormat, exact: true }).selectOption('vi');
    await expect(output).toHaveText('Một phẩy hai ba bốn');
    await page.getByRole('combobox', { name: t.mode }).selectOption('money');
    await expect(page.locator('#words-error')).toHaveText(t.errors.vndFraction);
    await expect(page.getByRole('button', { name: t.copy })).toHaveCount(0);
    await input.fill('1.250.000');
    await expect(output).toHaveText('Một triệu hai trăm năm mươi nghìn đồng chẵn');
    await page.getByRole('combobox', { name: t.thousand }).selectOption('ngàn');
    await expect(output).toContainText('ngàn đồng chẵn');
    await page.getByRole('checkbox', { name: t.exactSuffix }).uncheck();
    await expect(output).not.toContainText('chẵn');
    await page.getByRole('combobox', { name: t.outputLanguage }).selectOption('en');
    await expect(output).toHaveText('One million two hundred fifty thousand Vietnamese dong');
    await expect(output).toHaveAttribute('lang', 'en');
    await input.fill('1e6');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#words-error')).toHaveText(t.errors.format);
    await input.fill('9007199254740993');
    await expect(page.locator('.utility-preview')).toContainText('9007199254740993');
    await expect(output).toContainText('nine hundred ninety-three');
  }
});

test('all five percentage modes, exact decimals, rounding and zero errors work in VI/EN', async ({
  page,
}) => {
  for (const locale of ['vi', 'en'] as const) {
    const t = (locale === 'vi' ? vi : en).utilitiesTool;
    await page.goto(percentPath(locale));
    const first = page.locator('#percent-0'),
      second = page.locator('#percent-1');
    const mode = page.getByRole('combobox', { name: t.calculation });
    await first.fill(locale === 'vi' ? '12,5' : '12.5');
    await second.fill('200');
    await expect(page.locator('.utility-output')).toHaveText('25');
    await mode.selectOption('ratio');
    await first.fill('1');
    await second.fill('3');
    await expect(page.locator('.utility-output')).toHaveText(
      locale === 'vi' ? '33,333333%' : '33.333333%',
    );
    await expect(page.getByText(t.rounded, { exact: true })).toBeVisible();
    await second.fill('0');
    await expect(page.locator('#percent-calculation-error')).toHaveText(t.errors.zeroBase);
    await expect(second).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('button', { name: t.copy })).toHaveCount(0);
    await mode.selectOption('change');
    await first.fill('100');
    await second.fill('80');
    await expect(page.locator('.utility-output')).toHaveText('-20%');
    await first.fill('-100');
    await expect(page.locator('#percent-calculation-error')).toHaveText(t.errors.negativeBase);
    await mode.selectOption('increase');
    await first.fill('100');
    await second.fill('10');
    await expect(page.locator('.utility-output')).toHaveText('110');
    await mode.selectOption('decrease');
    await expect(page.locator('.utility-output')).toHaveText('90');
    await mode.selectOption('of');
    await first.fill('100');
    await second.fill('9007199254740993');
    await expect(page.locator('.utility-output')).toHaveText(
      locale === 'vi' ? '9.007.199.254.740.993' : '9,007,199,254,740,993',
    );
    await first.fill('1e6');
    await expect(first).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#percent-error-0')).toHaveText(t.errors.format);
  }
});

test('copy is explicit and handles refusal without losing the result', async ({ page }) => {
  test.info().annotations.push({
    type: 'fixture',
    description:
      'Clipboard API fixture tests UI success and denial, not native clipboard permission certification.',
  });
  await page.addInitScript(() => {
    const state = { copied: [] as string[], deny: false };
    Object.defineProperty(window, '__utilityClipboard', { value: state });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          if (state.deny) throw Error('denied');
          state.copied.push(text);
        },
      },
    });
  });
  await page.goto(wordsPath('en'));
  await page.getByRole('textbox', { name: 'Number to convert', exact: true }).fill('125');
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __utilityClipboard: { copied: string[] } }).__utilityClipboard
          .copied,
    ),
  ).toEqual([]);
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  await expect(page.getByText('Copied.', { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __utilityClipboard: { copied: string[] } }).__utilityClipboard
          .copied,
    ),
  ).toEqual(['One hundred twenty-five']);
  await page.getByRole('textbox', { name: 'Number to convert', exact: true }).fill('126');
  await expect(page.getByText('Copied.', { exact: true })).toHaveCount(0);
  await page.evaluate(() => {
    (window as unknown as { __utilityClipboard: { deny: boolean } }).__utilityClipboard.deny = true;
  });
  await page.getByRole('button', { name: 'Copy result', exact: true }).click();
  await expect(page.getByText(en.utilitiesTool.copyError, { exact: true })).toBeVisible();
  await expect(page.locator('.utility-output')).toHaveText('One hundred twenty-six');
});

test('utilities never request device permissions, persist inputs or upload events', async ({
  page,
}) => {
  const uploads: string[] = [];
  page.on('request', (request) => {
    if (!['GET', 'HEAD'].includes(request.method())) uploads.push(new URL(request.url()).origin);
  });
  await page.addInitScript(() => {
    localStorage.setItem('device-lab:save', 'true');
    const state = { storage: 0, permission: 0, capture: 0 };
    Object.defineProperty(window, '__utilityPrivacy', { value: state });
    const store = Storage.prototype.setItem;
    Storage.prototype.setItem = function (...args) {
      state.storage++;
      return store.apply(this, args);
    };
    if (navigator.permissions)
      Object.defineProperty(navigator.permissions, 'query', {
        configurable: true,
        value: () => {
          state.permission++;
          return Promise.reject(Error('unexpected'));
        },
      });
    if (navigator.mediaDevices)
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: () => {
          state.capture++;
          return Promise.reject(Error('unexpected'));
        },
      });
  });
  for (const path of [wordsPath('en'), percentPath('en')]) {
    await page.goto(path);
    await expect(page.locator('[data-engine-ready]')).toHaveAttribute('data-engine-ready', 'true');
    for (const input of await page.locator('.utility-tool input[type=text]').all())
      await input.fill('9007199254740993');
    await expect(page.locator('.utility-output')).not.toContainText('Enter');
    expect(
      await page.evaluate(
        () => (window as unknown as { __utilityPrivacy: object }).__utilityPrivacy,
      ),
    ).toEqual({ storage: 0, permission: 0, capture: 0 });
    await page.reload();
    for (const input of await page.locator('.utility-tool input[type=text]').all())
      await expect(input).toHaveValue('');
  }
  expect(
    uploads,
    'No upload request, including injected software, is excluded from this assertion.',
  ).toEqual([]);
});

test('utilities remain accessible in both themes/locales and reflow at 320px with 200% text', async ({
  page,
}, testInfo) => {
  test.setTimeout(240000);
  for (const locale of ['vi', 'en'] as const) {
    const t = (locale === 'vi' ? vi : en).utilitiesTool;
    for (const path of [wordsPath(locale), percentPath(locale)]) {
      await page.goto(path);
      await expect(page.locator('[data-engine-ready]')).toHaveAttribute(
        'data-engine-ready',
        'true',
      );
      for (const input of await page.locator('.utility-tool input[type=text]').all())
        await input.fill('999999999999999999999999');
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
          ).toBe(true);
        }
        await page.setViewportSize({ width: 375, height: 900 });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = '100%';
        });
        if (locale === 'vi' && path.includes('number-to-words'))
          await page.screenshot({
            path: testInfo.outputPath(`utilities-${theme}.png`),
            fullPage: true,
          });
      }
      await page.locator('.utility-tool input[type=text]').first().fill('1e6');
      await expect(page.locator('.utility-tool input[aria-invalid=true]').first()).toBeVisible();
      expect(
        (
          await new AxeBuilder({ page })
            .include('.tool-workspace')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      await expect(page.getByRole('button', { name: t.copy, exact: true })).toHaveCount(0);
    }
  }
});
