import { test, expect } from '@playwright/test';
test('calculators validate inputs and observe live viewport', async ({ page }) => {
  await page.goto('/en/screen/aspect-ratio');
  await expect(page.locator('.tool-workspace [aria-busy]')).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByText('16:9', { exact: true }).first()).toBeVisible();
  await page.getByLabel('Width (px)').fill('0');
  await expect(page.locator('p[role=alert]')).toBeVisible();
  await page.goto('/en/screen/ppi');
  await expect(page.getByText('91.8PPI', { exact: true })).toBeVisible();
  await page.goto('/en/screen/viewport');
  await page.setViewportSize({ width: 900, height: 700 });
  await expect(page.getByText('900 × 700CSS px', { exact: true }).first()).toBeVisible();
});
test('refresh lifecycle collects real RAF timestamps then resets', async ({ page }) => {
  await page.goto('/en/screen/refresh-rate');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.status')).toContainText('Completed', { timeout: 12000 });
  await expect(page.locator('.big-result')).not.toContainText('—');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('.big-result')).toContainText('—');
  await expect(page.locator('.status')).toHaveText('Ready');
});
test('pixel patterns navigate and fullscreen can exit', async ({ page }) => {
  await page.goto('/en/screen/dead-pixel');
  await expect(page.getByLabel('Black', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next pattern', exact: true }).click();
  await expect(page.getByLabel('White', { exact: true })).toBeVisible();
  await page.locator('.pattern-stage').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('Red', { exact: true })).toBeVisible();
  const fullscreen = page.getByRole('button', { name: 'Fullscreen', exact: true });
  if (await fullscreen.isEnabled()) {
    await fullscreen.click();
    await expect(page.getByRole('button', { name: 'Exit fullscreen · Esc' })).toBeVisible();
    await page.getByRole('button', { name: 'Exit fullscreen · Esc' }).click();
    await expect(page.getByRole('button', { name: 'Exit fullscreen · Esc' })).toHaveCount(0);
  }
});
test('ghosting starts and stops; touch fallback is honest', async ({ page }) => {
  await page.goto('/en/screen/ghosting');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.status')).toHaveText('Testing');
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(page.locator('.status')).toHaveText('Ready');
  await page.goto('/en/screen/touch');
  if (!(await page.evaluate(() => navigator.maxTouchPoints > 0))) {
    await expect(
      page.getByText('Not supported by this browser or device.', { exact: true }),
    ).toBeVisible();
  } else {
    await page.getByLabel('Touch or use a pen inside this area').tap();
    await expect(page.getByText('1', { exact: true }).last()).toBeVisible();
  }
});
