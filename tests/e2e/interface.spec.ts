import { test, expect } from '@playwright/test';
import { categories, publishedTools } from '../../src/lib/tools/registry';
import AxeBuilder from '@axe-core/playwright';

test('category shortcuts and clear search preserve the selected group in both locales', async ({
  page,
}) => {
  test.setTimeout(60000);
  for (const locale of ['vi', 'en']) {
    await page.goto(`/${locale}`);
    const captionVisible = await page.locator('.brand-caption').isVisible();
    await expect(page.locator('.brand')).toHaveAccessibleName(
      captionVisible
        ? locale === 'vi'
          ? 'Device Lab Hiểu rõ. Kiểm tra thật.'
          : 'Device Lab Real tests. Clear insights.'
        : 'Device Lab',
    );
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      expect(
        (
          await new AxeBuilder({ page })
            .withRules(['label-content-name-mismatch', 'color-contrast'])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
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
            '.brand, .header-actions, .mobile-nav a, .hero h1, .hero-actions a, .category-shortcut, .filter, .catalog-item, .searchbox, .lab-scene, .scene-control, .scene-hint, .home-device-summary .device-row',
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
      '.brand, .header-actions, .mobile-nav a, .hero-actions a, .category-shortcut, .filter, .catalog-item, .lab-scene, .scene-control, .scene-hint, .home-device-summary .device-row',
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
  const art = page.locator('.scene-art');
  await page.locator('.scene-control').hover();
  expect(await art.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  expect(await art.evaluate((element) => element.style.getPropertyValue('--scene-x'))).toBe('');
});

test('lab illustration responds to pointer and keyboard without changing device readings', async ({
  page,
  isMobile,
}) => {
  for (const locale of ['vi', 'en']) {
    await page.goto(`/${locale}`);
    await expect(page.locator('#catalog-search')).toBeEnabled();
    const control = page.getByRole('button', {
      name:
        locale === 'vi' ? 'Đổi ánh sáng minh họa bàn lab' : 'Toggle the illustrated lab lighting',
    });
    await expect(control).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.lab-scene figcaption')).toContainText(
      locale === 'vi' ? 'Không phải kết quả đo' : 'Not a device measurement',
    );
    await expect(page.locator('.category-art')).toHaveCount(categories.length);
    for (const svg of await page.locator('.category-art').all())
      await expect(svg).toHaveAttribute('aria-hidden', 'true');
    const refresh = page.locator('.device-row').nth(6).locator('dd');
    await expect(refresh).toHaveText(locale === 'vi' ? 'Chưa đo' : 'Not tested');
    if (isMobile) await control.tap();
    else await control.click();
    await expect(control).toHaveAttribute('aria-pressed', 'true');
    await control.focus();
    await page.keyboard.press('Space');
    await expect(control).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('Enter');
    await expect(control).toHaveAttribute('aria-pressed', 'true');
    await expect(refresh).toHaveText(locale === 'vi' ? 'Chưa đo' : 'Not tested');
    if (!isMobile) {
      await control.hover({ position: { x: 25, y: 25 } });
      expect(
        await page
          .locator('.scene-art')
          .evaluate((element) => element.style.getPropertyValue('--scene-x')),
      ).not.toBe('');
      await page.mouse.move(0, 0);
      expect(
        await page
          .locator('.scene-art')
          .evaluate((element) => element.style.getPropertyValue('--scene-x')),
      ).toBe('');
    }
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      expect(
        (
          await new AxeBuilder({ page })
            .include('.lab-scene')
            .include('.category-rail')
            .include('.home-device-summary')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await control.hover({ position: { x: 25, y: 25 } });
    expect(
      await page.locator('.scene-art').evaluate((element) => getComputedStyle(element).transform),
    ).toBe('none');
    await control.click();
    await expect(control).toHaveAttribute('aria-pressed', 'false');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }
});
