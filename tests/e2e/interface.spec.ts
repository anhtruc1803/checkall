import { test, expect } from '@playwright/test';
import { categories, publishedTools } from '../../src/lib/tools/registry';

test('category shortcuts and clear search preserve the selected group in both locales', async ({
  page,
}) => {
  for (const locale of ['vi', 'en']) {
    await page.goto(`/${locale}`);
    const shortcuts = page.locator('.category-rail a');
    await expect(shortcuts).toHaveCount(categories.length);
    for (const category of categories) {
      const shortcut = page.locator(`.category-shortcut[data-category="${category}"]`);
      await expect(shortcut).toHaveAttribute('href', `/${locale}/${category}`);
      await expect(shortcut.locator('.category-count')).toHaveText(
        String(publishedTools.filter((tool) => tool.category === category).length),
      );
    }
    const camera = page
      .locator('.filters button')
      .filter({ has: page.locator('svg.lucide-camera') });
    await expect(camera).toBeEnabled();
    await camera.click();
    await expect(page.locator('.catalog-item')).toHaveCount(3);
    await page.locator('#catalog-search').fill('no-such-tool');
    await expect(page.locator('.catalog-item')).toHaveCount(0);
    await expect(page.locator('.catalog-result-count')).toContainText('0');
    await page
      .getByRole('button', {
        name: locale === 'vi' ? 'Xóa từ khóa tìm kiếm' : 'Clear search query',
      })
      .click();
    await expect(camera).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.catalog-item')).toHaveCount(3);
    await page.locator('.catalog-item').first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/camera/`));
  }
});

test('discovery controls reflow across sizes, languages and themes', async ({ page }) => {
  test.setTimeout(120000);
  for (const locale of ['vi', 'en']) {
    await page.goto(`/${locale}`);
    await expect(page.locator('#catalog-search')).toBeEnabled();
    for (const theme of ['dark', 'light']) {
      if ((await page.locator('html').getAttribute('data-theme')) !== theme)
        await page
          .getByRole('button', {
            name: locale === 'vi' ? 'Đổi giao diện sáng/tối' : 'Toggle light/dark theme',
          })
          .click();
      for (const width of [320, 375, 414, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        if (width <= 1024) await page.locator('.menu-toggle').click();
        const overflow = await page
          .locator(
            '.brand, .header-actions, .mobile-nav a, .hero h1, .hero-actions a, .category-shortcut, .filter, .catalog-item, .searchbox',
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
        expect(overflow, `${locale}/${theme}/${width}`).toEqual([]);
        if (width <= 1024) await page.locator('.menu-toggle').click();
      }
    }
  }
});

test('discovery remains usable with reduced motion and enlarged text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/vi');
  await expect(page.locator('#catalog-search')).toBeEnabled();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await page.locator('.menu-toggle').click();
  const overflow = await page
    .locator(
      '.brand, .header-actions, .mobile-nav a, .hero-actions a, .category-shortcut, .filter, .catalog-item',
    )
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.left < -1 ||
            rect.right > innerWidth + 1 ||
            element.scrollWidth > element.clientWidth + 1
          );
        })
        .map((element) => element.className),
    );
  expect(overflow).toEqual([]);
  await page.locator('.menu-toggle').click();
  await page.locator('#catalog-search').fill('ppi');
  await expect(page.locator('.catalog-item')).toHaveCount(1);
  await page.getByRole('button', { name: 'Xóa từ khóa tìm kiếm' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#catalog-search')).toBeFocused();
  await expect(page.locator('.catalog-item')).toHaveCount(publishedTools.length);
  expect(
    await page.locator('html').evaluate((element) => getComputedStyle(element).scrollBehavior),
  ).toBe('auto');
});
