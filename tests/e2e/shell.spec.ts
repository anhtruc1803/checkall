import { test, expect } from '@playwright/test';
import { tools } from '../../src/lib/tools/registry';
test('homepage, discovery and locale-preserving navigation', async ({ page }) => {
  await page.goto('/vi');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Kiểm tra thiết bị');
  await expect(page.getByText('Chưa đo', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Tìm kiếm công cụ' }).fill('ppi');
  await expect(page.locator('.catalog-item')).toHaveCount(1);
  await page.locator('.catalog-item').click();
  await expect(page).toHaveURL(/\/vi\/screen\/ppi$/);
  await page.getByRole('link', { name: 'Chuyển sang tiếng Anh' }).click();
  await expect(page).toHaveURL(/\/en\/screen\/ppi$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('PPI calculator');
});
test('theme persists and mobile layout fits', async ({ page }) => {
  await page.goto('/vi');
  await page.getByRole('button', { name: 'Đổi giao diện sáng/tối' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  for (const width of [320, 375, 414, 768]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
test('all 42 published tool routes have localized content', async ({ request }) => {
  test.setTimeout(180000);
  for (const locale of ['vi', 'en'] as const) {
    for (const tool of tools) {
      const response = await request.get(`/${locale}/${tool.category}/${tool.slug}`);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain(tool.copy[locale].name);
      expect(html).toContain('rel="canonical"');
    }
  }
});
