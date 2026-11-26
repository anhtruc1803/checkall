import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import vi from '../../src/messages/vi.json';
import en from '../../src/messages/en.json';

test('workbench category navigation keeps the selected tool and resets private utility input', async ({
  page,
}) => {
  for (const locale of ['vi', 'en'] as const) {
    const m = locale === 'vi' ? vi : en;
    await page.goto(`/${locale}/utilities/unit-converter`);
    const navigation = page.getByRole('navigation', { name: m.workbench.toolsInCategory });
    await expect(navigation.getByRole('link')).toHaveCount(10);
    await expect(navigation.locator('[aria-current="page"]')).toHaveAttribute(
      'href',
      `/${locale}/utilities/unit-converter`,
    );
    await page.setViewportSize({ width: 375, height: 900 });
    await expect
      .poll(async () =>
        navigation.locator('[aria-current="page"]').evaluate((element) => {
          const r = element.getBoundingClientRect();
          return r.left >= 0 && r.right <= innerWidth;
        }),
      )
      .toBe(true);
    await page.getByLabel(m.unitTool.value, { exact: true }).fill('123');
    await navigation.locator(`a[href="/${locale}/utilities/date-calculator"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/utilities/date-calculator$`));
    await expect(page.getByLabel(m.dateTool.start, { exact: true })).toHaveValue('');
    await page
      .getByRole('navigation', { name: m.workbench.toolsInCategory })
      .locator(`a[href="/${locale}/utilities/unit-converter"]`)
      .click();
    await expect(page.getByLabel(m.unitTool.value, { exact: true })).toHaveValue('');
  }
});

test('workbench keeps the focused tool link visible when the viewport narrows', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/utilities/unit-converter');
  await expect(page.locator('[data-engine-ready="true"]')).toBeVisible();
  const navigation = page.getByRole('navigation', { name: en.workbench.toolsInCategory });
  const first = navigation.getByRole('link').first();
  await first.focus();
  await page.setViewportSize({ width: 375, height: 900 });

  await expect(first).toBeFocused();
  await expect
    .poll(() =>
      first.evaluate((link) => {
        const item = link.getBoundingClientRect();
        const strip = link.closest('nav')!.getBoundingClientRect();
        return item.left >= strip.left && item.right <= strip.right;
      }),
    )
    .toBe(true);
  await expect(navigation.locator('[aria-current="page"]')).toHaveAttribute(
    'href',
    '/en/utilities/unit-converter',
  );
});

test('workbench utility controls reflow in DOM order at 320px and 200 percent text', async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const locale of ['vi', 'en'])
    for (const slug of [
      'number-to-words',
      'percentage',
      'word-counter',
      'text-cleaner',
      'unit-converter',
      'date-calculator',
    ]) {
      await page.goto(`/${locale}/utilities/${slug}`);
      await expect(page.locator('[data-engine-ready="true"]')).toBeVisible();
      for (const width of [320, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale}/${slug}/${width}`,
        ).toBe(true);
        const outside = await page
          .locator(
            '.utility-input-panel input:not([type="checkbox"]), .utility-input-panel select, .utility-input-panel textarea, .utility-copy button',
          )
          .evaluateAll((elements) =>
            elements
              .filter((el) => {
                const r = el.getBoundingClientRect();
                return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
              })
              .map((el) => el.tagName),
          );
        expect(outside, `${locale}/${slug}/${width} control bounds`).toEqual([]);
        await page.evaluate(() => (document.documentElement.style.fontSize = ''));
      }
    }
});

test('workbench chrome and idle hardware panels pass WCAG in both themes', async ({ page }) => {
  test.setTimeout(120000);
  for (const path of [
    '/vi/device/information',
    '/en/browser/compatibility',
    '/vi/camera/preview',
    '/en/audio/microphone',
    '/vi/gamepad/tester',
  ]) {
    await page.goto(path);
    await expect(page.locator('[data-engine-ready="true"]')).toBeVisible();
    for (const theme of ['dark', 'light']) {
      if ((await page.locator('html').getAttribute('data-theme')) !== theme)
        await page
          .getByRole('button', { name: path.startsWith('/vi') ? vi.theme : en.theme, exact: true })
          .click();
      const scan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        scan.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
        })),
        `${path}/${theme}`,
      ).toEqual([]);
    }
  }
});

test('camera idle panel does not start capture and reduced motion keeps controls visible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['vi', 'en']) {
    await page.goto(`/${locale}/camera/preview`);
    await expect(page.locator('[data-engine-ready="true"]')).toBeVisible();
    await expect(page.locator('.camera-empty')).toBeVisible();
    expect(
      await page.locator('video').evaluate((video) => (video as HTMLVideoElement).srcObject),
    ).toBeNull();
    await page.setViewportSize({ width: 375, height: 900 });
    const stage = await page.locator('.camera-stage').boundingBox();
    const message = await page.locator('.camera-empty p').boundingBox();
    expect(stage).not.toBeNull();
    expect(message).not.toBeNull();
    expect(message!.x).toBeGreaterThanOrEqual(stage!.x);
    expect(message!.y + message!.height).toBeLessThanOrEqual(stage!.y + stage!.height);
    const m = locale === 'vi' ? vi : en;
    await expect(page.getByRole('button', { name: m.start, exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: m.stop, exact: true })).toBeDisabled();
  }
});
