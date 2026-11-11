import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('layout coverage and observed rollover combinations persist safely in VI/EN', async ({
  page,
}) => {
  for (const locale of ['vi', 'en']) {
    const activate = () =>
      page.getByRole('button', {
        name: locale === 'vi' ? 'Kích hoạt vùng thử' : 'Activate test area',
        exact: true,
      });
    await page.goto(`/${locale}/keyboard/tester`);
    await activate().click();
    await page.keyboard.press('a');
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('progressbar')).toHaveAttribute('value', '2');
    await page.getByRole('combobox').selectOption('60%');
    await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
    await expect(page.locator('.keyboard-progress')).toContainText('ArrowLeft');
    await expect(page.locator('.keyboard-capture')).toHaveAttribute('data-active', 'false');
    await page.setViewportSize({ width: 375, height: 900 });
    const diagram = page.locator('.keyboard-diagram');
    await diagram.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => diagram.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
    await page.locator('[data-code=KeyQ]').click();
    await expect(page.locator('[data-code=KeyQ]')).toHaveAttribute('data-tested', 'false');
    await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
    await page
      .getByRole('button', {
        name: locale === 'vi' ? 'Thoát vùng thử' : 'Exit test area',
        exact: true,
      })
      .click();
    await expect(page.locator('.keyboard-capture')).toHaveAttribute('data-active', 'false');
    await page.goto(`/${locale}/keyboard/rollover`);
    await activate().click();
    await page.keyboard.down('a');
    await page.keyboard.down('s');
    await page.keyboard.down('a');
    await expect(page.locator('[data-max-combination] .key-tag')).toHaveText(['KeyA', 'KeyS']);
    await page.keyboard.up('a');
    await page.keyboard.up('s');
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-max-combination] .key-tag')).toHaveCount(2);
    await page
      .getByRole('button', { name: locale === 'vi' ? 'Đặt lại' : 'Reset', exact: true })
      .click();
    await expect(page.locator('[data-max-combination] .key-tag')).toHaveCount(0);
  }
});

test('chatter keeps cumulative native-event totals when its 200-event log is truncated or cleared', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto('/en/keyboard/chatter');
  await page.getByRole('button', { name: 'Activate test area', exact: true }).click();
  await page.keyboard.type('a'.repeat(120));
  const cells = page.locator('[data-chatter] tbody tr[data-code=KeyA] td');
  await expect(cells.nth(1)).toHaveText('120');
  await expect(cells.nth(4)).toHaveText('119');
  await page.getByText('Expand/collapse event list', { exact: true }).click();
  await expect(page.locator('.keyboard-event-table tbody tr')).toHaveCount(200);
  await page.getByRole('button', { name: 'Clear event log', exact: true }).click();
  await expect(page.locator('.keyboard-event-table tbody tr')).toHaveCount(0);
  await expect(cells.nth(1)).toHaveText('120');
  await expect(cells.nth(4)).toHaveText('119');
  await page.getByRole('button', { name: 'Activate test area', exact: true }).click();
  await page.keyboard.press('a');
  await page.keyboard.press('Escape');
  await expect(cells.nth(1)).toHaveText('121');
  await expect(cells.nth(4)).toHaveText('119');
});

test('event review filters locally, labels composition fixtures and ignores unavailable physical codes', async ({
  page,
}) => {
  test.info().annotations.push({
    type: 'fixture',
    description:
      'IME and unavailable-code events are dispatched synthetic fixtures, not physical keyboard verification.',
  });
  await page.goto('/en/keyboard/events');
  await page.getByRole('button', { name: 'Activate test area', exact: true }).click();
  await page.keyboard.press('a');
  await page.keyboard.press('b');
  const area = page.locator('.keyboard-capture');
  await area.dispatchEvent('keydown', { key: 'Process', code: 'KeyC', isComposing: true });
  await area.dispatchEvent('keydown', { key: 'x', code: '' });
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '2');
  await expect(page.getByText(/events belonged to IME/)).toBeVisible();
  await expect(page.getByText(/events had no code/)).toBeVisible();
  await page.getByRole('searchbox', { name: 'Filter key or code' }).fill('KeyB');
  await expect(page.locator('.keyboard-event-table tbody tr')).toHaveCount(2);
  await page.getByRole('combobox', { name: 'Event type', exact: true }).selectOption('keyup');
  await expect(page.locator('.keyboard-event-table tbody tr')).toHaveCount(1);
  await expect(area).toHaveAttribute('data-active', 'false');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '2');
  await page.getByRole('button', { name: 'Clear event log', exact: true }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '2');
});

test('all five keyboard tools remain accessible with recorded data in both themes and locales', async ({
  page,
}) => {
  test.setTimeout(180000);
  for (const locale of ['vi', 'en'])
    for (const slug of ['tester', 'rollover', 'chatter', 'hold', 'events']) {
      await page.goto(`/${locale}/keyboard/${slug}`);
      await page
        .getByRole('button', {
          name: locale === 'vi' ? 'Kích hoạt vùng thử' : 'Activate test area',
          exact: true,
        })
        .click();
      await page.keyboard.press('a');
      await page.keyboard.press('Escape');
      for (const theme of ['light', 'dark']) {
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        expect(
          (
            await new AxeBuilder({ page })
              .include('.tool-workspace')
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = '200%';
        });
        const overflow = await page
          .locator(
            '.tool-workspace .controls > .field, .tool-workspace .controls > .button, .keyboard-progress, .keyboard-latest .metric, .keyboard-notice',
          )
          .evaluateAll((elements) =>
            elements
              .filter((element) => {
                const rect = element.getBoundingClientRect();
                return (
                  rect.width > 0 &&
                  (rect.left < -1 ||
                    rect.right > innerWidth + 1 ||
                    element.scrollWidth > element.clientWidth + 1)
                );
              })
              .map((element) => element.className),
          );
        expect(overflow, `${locale}/${slug}/${width}`).toEqual([]);
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '100%';
      });
    }
});
