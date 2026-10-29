import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('representative pages pass automated WCAG AA checks in both themes', async ({ page }) => {
  test.setTimeout(120000);
  for (const path of [
    '/vi',
    '/en/screen/ppi',
    '/vi/keyboard/tester',
    '/en/mouse/buttons',
    '/vi/privacy',
  ]) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('data-theme', /(dark|light)/);
    for (const theme of ['dark', 'light']) {
      if ((await page.locator('html').getAttribute('data-theme')) !== theme)
        await page
          .locator('.header-actions button')
          .filter({ has: page.locator('svg.lucide-sun,svg.lucide-moon') })
          .click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations.map((item) => ({
          id: item.id,
          impact: item.impact,
          nodes: item.nodes.map((node) => ({
            target: node.target,
            failureSummary: node.failureSummary,
          })),
        })),
        `${path} / ${theme}`,
      ).toEqual([]);
    }
  }
});
test('privacy opt-in, save and delete keep unrelated local data', async ({ page }) => {
  await page.goto('/en/screen/ppi');
  await page.getByRole('checkbox', { name: 'Allow up to 30 local test summaries' }).check();
  await page.getByRole('button', { name: 'Save summary', exact: true }).click();
  await expect(page.getByText('Saved on this device', { exact: true })).toBeVisible();
  await page.evaluate(() => localStorage.setItem('other-app', 'keep'));
  await page.goto('/en/privacy');
  await expect(page.locator('.tool-workspace')).toContainText('91.8 PPI');
  await page.getByRole('button', { name: 'Delete local data' }).click();
  await expect(page.getByText('No summaries saved yet.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('other-app'))).toBe('keep');
});
test('search dialog supports focus, arrow navigation and escape', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('button', { name: 'Search testing tools' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox').fill('polling');
  await page.keyboard.press('ArrowDown');
  await expect(dialog.getByRole('link', { name: /Polling Rate/ })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});
test('unsupported capabilities and hidden sampling never invent results', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'PointerEvent', { value: undefined, configurable: true });
  });
  await page.goto('/en/mouse/polling-rate');
  await expect(
    page.getByText('Not supported by this browser or device.', { exact: true }),
  ).toBeVisible();
  await page.goto('/en/screen/refresh-rate');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.status')).toContainText('Testing');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('.status')).toContainText('Warning');
  await expect(page.locator('.big-result')).toContainText('—');
});
test('representative tools fit mobile and tablet widths', async ({ page }) => {
  test.setTimeout(120000);
  for (const path of [
    '/vi',
    '/en/screen/refresh-rate',
    '/vi/keyboard/tester',
    '/en/mouse/polling-rate',
    '/vi/privacy',
  ]) {
    await page.goto(path);
    for (const width of [320, 375, 414, 768]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page
        .locator('main button, main input, main select')
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return rect.width > 0 && (rect.left < 0 || rect.right > innerWidth + 1);
            })
            .map((element) => element.textContent || element.getAttribute('aria-label')),
        );
      expect(overflow).toEqual([]);
    }
  }
});
