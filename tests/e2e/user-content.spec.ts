import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { publishedTools } from '../../src/lib/tools/registry';
import vi from '../../src/messages/vi.json';
import en from '../../src/messages/en.json';

test('all 40 tools retain localized guidance and SEO without duplicated FAQ or implementation prose', async ({
  page,
}) => {
  test.setTimeout(240000);
  expect(publishedTools).toHaveLength(40);
  for (const locale of ['vi', 'en'] as const) {
    const messages = locale === 'vi' ? vi : en;
    for (const tool of publishedTools) {
      const copy = tool.copy[locale];
      const response = await page.goto(`/${locale}/${tool.category}/${tool.slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(copy.name);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        copy.description,
      );
      const info = page.locator('.info-grid');
      for (const field of ['instructions', 'method', 'limitations'] as const)
        await expect(info.getByText(copy[field], { exact: true })).toHaveCount(1);
      await expect(info.getByRole('heading', { name: messages.faq, exact: true })).toHaveCount(0);
      await expect(info).not.toContainText(
        /Phase [123]|Milestone|cleanup|AudioContext|OscillatorNode|AnalyserNode|ResizeObserver|requestAnimationFrame|requestVideoFrameCallback|WebKit automation/,
      );
      await expect(page.locator('.tool-heading .badges .badge')).toHaveCount(
        tool.permissions.length ? 3 : 2,
      );
    }
  }
});

test('privacy uses readable saved tool names in VI/EN and preserves unrelated data when clearing', async ({
  page,
}) => {
  test.setTimeout(90000);
  test.info().annotations.push({
    type: 'fixture',
    description: 'Opt-in summary fixtures with no hardware measurements or raw input.',
  });
  await page.addInitScript(() => {
    localStorage.setItem('device-lab:save', 'true');
    localStorage.setItem(
      'device-lab:summaries',
      JSON.stringify([
        { toolId: 'A05', time: '2026-11-12T00:00:00.000Z', value: 'Saved QA summary' },
        { toolId: 'OLD_TOOL', time: '2026-11-12T00:00:00.000Z', value: 'Older QA summary' },
        { toolId: '__proto__', time: '2026-11-12T00:00:00.000Z', value: 'Unknown QA summary' },
      ]),
    );
    localStorage.setItem('unrelated-qa-marker', 'keep');
  });
  for (const locale of ['vi', 'en'] as const) {
    const messages = locale === 'vi' ? vi : en;
    await page.goto(`/${locale}/privacy`);
    const list = page.locator('.privacy-settings .tool-workspace li');
    await expect(list).toHaveCount(3);
    await expect(list.first()).toContainText(
      publishedTools.find((tool) => tool.id === 'A05')!.copy[locale].name,
    );
    await expect(list.last()).toContainText(messages.savedTest);
    await expect(list.nth(1)).toContainText(messages.savedTest);
    await expect(page.locator('.privacy-settings .tool-workspace ul')).not.toContainText(
      /A05|OLD_TOOL|__proto__/,
    );
    for (const section of Object.values(messages.privacySections))
      await expect(page.getByRole('heading', { name: section.title, exact: true })).toBeVisible();
    await page.setViewportSize({ width: 320, height: 900 });
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      expect(
        (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
          .violations,
      ).toEqual([]);
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    expect(await page.locator('main').evaluate((el) => el.scrollWidth > el.clientWidth + 1)).toBe(
      false,
    );
    await page.getByRole('button', { name: messages.deleteData, exact: true }).click();
    await expect(list).toHaveCount(0);
    await expect(page.getByText(messages.noSaved, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('unrelated-qa-marker'))).toBe('keep');
    expect(await page.evaluate(() => localStorage.getItem('device-lab:summaries'))).toBeNull();
  }
});
