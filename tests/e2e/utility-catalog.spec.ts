import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { publishedTools } from '../../src/lib/tools/registry';
import vi from '../../src/messages/vi.json';
import en from '../../src/messages/en.json';

test('utilities are grouped and searchable in both languages', async ({ page }) => {
  for (const locale of ['vi', 'en'] as const) {
    const messages = locale === 'vi' ? vi : en;
    await page.goto(`/${locale}/utilities`);
    const catalog = page.getByRole('main');
    const input = catalog.getByRole('textbox', { name: messages.searchLabel });
    const cards = catalog.locator('.catalog-item');
    await expect(input).toBeEnabled();
    await expect(catalog.locator('.filters')).toHaveCount(0);
    await expect(cards).toHaveCount(8);

    for (const [group, count] of [
      ['numbers', 2],
      ['text', 4],
      ['conversion', 2],
    ] as const) {
      const section = catalog.getByRole('region', {
        name: messages.utilityCatalog.sections[group],
      });
      await expect(section.getByRole('link')).toHaveCount(count);
    }
    for (const tool of publishedTools.filter(({ category }) => category === 'utilities')) {
      const card = catalog.locator(`a[href="/${locale}/utilities/${tool.slug}"]`);
      await expect(card.locator('p')).toHaveText(
        messages.toolPreviews[tool.id as keyof typeof messages.toolPreviews],
      );
      await expect(card.locator(`[data-tool-art="${tool.id}"]`)).toBeVisible();
    }
    await expect(cards.first().locator('h3')).toHaveCSS('font-size', '18px');
    await expect(cards.first().locator('p')).toHaveCSS('font-size', '16px');

    await input.fill('unmatched-search-example');
    await expect(cards).toHaveCount(0);
    await expect(catalog.getByText(messages.utilityCatalog.noResults)).toBeVisible();
    const clear = catalog.getByRole('button', { name: messages.interface.clearSearch });
    await clear.focus();
    await page.keyboard.press('Enter');
    await expect(input).toBeFocused();
    await expect(cards).toHaveCount(8);

    await input.fill(locale === 'vi' ? 'doi don vi' : 'unit converter');
    await expect(cards).toHaveCount(1);
    await cards.first().focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`/${locale}/utilities/unit-converter`);
  }
});

test('utility typography reflows at 320px and stays accessible in dark and light themes', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 320, height: 750 });
  for (const locale of ['vi', 'en']) {
    await page.goto(`/${locale}/utilities`);
    await expect(page.locator('#catalog-search')).toBeEnabled();
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
        document.documentElement.style.fontSize = '200%';
      }, theme);
      const overflow = await page
        .locator('#main h1, #main h2, #main p, #main a, #catalog-search')
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              const box = element.getBoundingClientRect();
              return (
                box.left < -1 ||
                box.right > innerWidth + 1 ||
                element.scrollWidth > element.clientWidth + 1
              );
            })
            .map((element) => element.textContent),
        );
      expect(overflow, `${locale}/${theme}`).toEqual([]);
      expect(
        (
          await new AxeBuilder({ page })
            .include('#main')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  }
});
