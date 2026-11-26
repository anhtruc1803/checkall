import { test, expect } from '@playwright/test';
import { categories, publishedTools } from '../../src/lib/tools/registry';
import AxeBuilder from '@axe-core/playwright';
import vi from '../../src/messages/vi.json';
import en from '../../src/messages/en.json';

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

test('quick search and problem shortcuts appear on the first mobile screen in both locales', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 664 });
  for (const locale of ['vi', 'en'] as const) {
    const messages = locale === 'vi' ? vi : en;
    await page.goto(`/${locale}`);
    const search = page.getByRole('search', { name: messages.homeDiscovery.searchLabel });
    const input = search.getByRole('searchbox', { name: messages.homeDiscovery.searchLabel });
    await expect(input).toBeEnabled();
    await expect(input).toBeInViewport();
    await expect(page.locator('#problem-title')).toBeInViewport();
    await expect(page.locator('#by-problem [data-primary="true"]').first()).toBeInViewport();
    await input.fill('nothing-matches-xyz');
    await expect(search.getByRole('status')).toHaveText(messages.homeDiscovery.noResults);
    await search.getByRole('button', { name: messages.homeDiscovery.clear }).click();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('');
    await input.fill(locale === 'vi' ? 'phim bi lap' : 'keys keep repeating');
    await expect(search.getByRole('link')).toHaveCount(2);
    await expect(search.locator(`a[href="/${locale}/keyboard/chatter"]`)).toBeVisible();
    await input.press('ArrowDown');
    await expect(search.getByRole('link').first()).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`/${locale}/keyboard/`));
    await expect(page.locator('.keyboard-capture')).toHaveAttribute('data-active', 'false');
  }
});

test('main navigation separates devices and utilities and supports keyboard dismissal', async ({
  page,
}) => {
  await page.goto('/vi');
  const nav = page.getByRole('navigation', { name: vi.homeDiscovery.navigation });
  const trigger = nav.getByRole('button', { name: vi.toolGroups['device-tests'] });
  const utilities = nav.getByRole('link', { name: vi.utilities });
  const devices = page.locator('#device-nav');
  await expect(utilities).toHaveAttribute('href', '/vi/utilities');
  await expect(devices).toBeHidden();
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(devices.getByRole('link')).toHaveCount(8);
  await page.keyboard.press('Tab');
  await expect(devices.getByRole('link').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(devices).toBeHidden();
  await trigger.click();
  await page.mouse.click(4, 4);
  await expect(devices).toBeHidden();
  await trigger.click();
  await devices.getByRole('link').last().focus();
  await page.keyboard.press('Tab');
  await expect(utilities).toBeFocused();
  await expect(devices).toBeHidden();
  await trigger.click();
  await devices.locator('a[href="/vi/camera"]').click();
  await expect(page).toHaveURL(/\/vi\/camera$/);
  await expect(trigger).toHaveAttribute('data-current', 'true');
  await expect(devices).toBeHidden();
  await utilities.click();
  await expect(page).toHaveURL(/\/vi\/utilities$/);
  await expect(utilities).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.catalog-item')).toHaveCount(10);
  await page.getByRole('link', { name: `EN — ${vi.language}` }).click();
  await expect(page).toHaveURL(/\/en\/utilities$/);
  await expect(
    page
      .getByRole('navigation', { name: en.homeDiscovery.navigation })
      .getByRole('link', { name: en.utilities }),
  ).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: en.searchLabel });
  const dialogInput = dialog.getByRole('textbox');
  await expect(dialogInput).toBeFocused();
  await dialogInput.fill('percentage');
  await expect(dialog.locator('a[href="/en/utilities/percentage"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

const reflowTargets =
  '.brand, .header-actions, .primary-nav button, .primary-nav > a, #device-nav, #device-nav a, #main h1, [role="search"], #by-problem a, .category-shortcut, .filter, .catalog-item, .searchbox, .lab-scene, .scene-control, .scene-hint, .home-device-summary .device-row';

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
        await page.locator('[aria-controls="device-nav"]').click();
        const overflow = await page.locator(reflowTargets).evaluateAll((elements) =>
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
        await page.locator('[aria-controls="device-nav"]').click();
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
  await page.locator('[aria-controls="device-nav"]').click();
  const overflow = await page.locator(reflowTargets).evaluateAll((elements) =>
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
  await page.locator('[aria-controls="device-nav"]').click();
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
  test.setTimeout(60000);
  for (const locale of ['vi', 'en']) {
    await page.goto(`/${locale}`);
    await expect(page.locator('#catalog-search')).toBeEnabled();
    const control = page.getByRole('button', {
      name:
        locale === 'vi' ? 'Đổi ánh sáng minh họa bàn lab' : 'Toggle the illustrated lab lighting',
    });
    await expect(control).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.lab-scene figcaption')).toHaveText(
      (locale === 'vi' ? vi : en).interface.sceneCaption,
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
