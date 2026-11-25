import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import en from '../../src/messages/en.json';
import vi from '../../src/messages/vi.json';

test('reports five real browser intervals and keeps both early clicks out of the results', async ({
  page,
}) => {
  test.setTimeout(60000);
  const t = en.mouseReaction;
  await page.clock.install();
  await page.goto('/en/mouse/reaction');
  const target = page.getByTestId('reaction-target');
  const progress = page.getByTestId('reaction-progress');
  const early = page.getByTestId('reaction-early-count');
  await expect(target).toBeEnabled();
  await expect(target).toHaveAttribute('data-stage', 'ready');
  const height = await target.evaluate((element) => element.getBoundingClientRect().height);

  await target.click();
  await page.clock.runFor(250);
  await expect(target).toHaveAttribute('data-stage', 'waiting');
  await target.click();
  await expect(target).toHaveAttribute('data-stage', 'early');
  await expect(progress).toHaveText('Valid rounds 0/5');
  await expect(early).toHaveText('Early clicks 1');
  await page.clock.fastForward(4200);
  await expect(target).toHaveAttribute('data-stage', 'early');

  await target.click();
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.clock.fastForward(4200);
  await expect(target).toHaveAttribute('data-stage', 'signal');
  await page.mouse.up();
  await expect(target).toHaveAttribute('data-stage', 'early');
  await expect(early).toHaveText('Early clicks 2');
  await expect(progress).toHaveText('Valid rounds 0/5');

  for (const [index, delay] of [260, 180, 340, 210, 300].entries()) {
    await target.click();
    await expect(target).toHaveAttribute('data-stage', 'waiting');
    await page.clock.fastForward(4200);
    await expect(target).toHaveAttribute('data-stage', 'signal');
    expect(await target.evaluate((element) => element.getBoundingClientRect().height)).toBe(height);
    await page.clock.runFor(delay);
    await target.click();
    await expect(progress).toHaveText(`Valid rounds ${index + 1}/5`);
    await expect(target).toHaveAttribute('data-stage', index === 4 ? 'complete' : 'next');
  }

  const results = page.getByRole('region', { name: t.results });
  const sampleList = results.getByTestId('reaction-sample');
  await expect(sampleList).toHaveCount(5);
  const times = (await sampleList.allTextContents()).map((value) =>
    Number(value.replace(/[^\d]/g, '')),
  );
  expect(times.every((value) => value >= 180)).toBe(true);
  const sorted = [...times].sort((a, b) => a - b);
  await expect(results.locator('.metric').filter({ hasText: t.median }).locator('dd')).toHaveText(
    `${sorted[2]}ms`,
  );
  await expect(results.locator('.metric').filter({ hasText: t.fastest }).locator('dd')).toHaveText(
    `${sorted[0]}ms`,
  );
  await expect(
    results.locator('.metric').filter({ hasText: t.earlyMetric }).locator('dd'),
  ).toHaveText('2');
  expect(await page.evaluate(() => localStorage.getItem('device-lab:summaries'))).toBeNull();

  await target.click();
  await expect(target).toHaveAttribute('data-stage', 'waiting');
  await expect(progress).toHaveText('Valid rounds 0/5');
  await expect(early).toHaveText('Early clicks 0');
  await expect(results).toHaveCount(0);
});

test('pauses an active round on blur and accepts a fresh mouse click after retry in Vietnamese', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/vi/mouse/reaction');
  const target = page.getByTestId('reaction-target');
  await target.click();
  await expect(target).toHaveAttribute('data-stage', 'waiting');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(target).toContainText(vi.mouseReaction.stages.interrupted);
  await page.clock.fastForward(4200);
  await expect(target).toHaveAttribute('data-stage', 'interrupted');

  await target.press('Enter');
  await expect(target).toHaveAttribute('data-stage', 'waiting');
  await page.clock.fastForward(4200);
  await expect(target).toContainText(vi.mouseReaction.stages.signal);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(target).toHaveAttribute('data-stage', 'interrupted');
  await expect(page.getByTestId('reaction-progress')).toHaveText('Lượt hợp lệ 0/5');
  await expect(page.getByTestId('reaction-early-count')).toHaveText('Nhấp sớm 0');
  await target.click();
  await expect(target).toHaveAttribute('data-stage', 'waiting');
  await page.clock.fastForward(4200);
  await expect(target).toHaveAttribute('data-stage', 'signal');
  await page.clock.runFor(250);
  await target.click();
  await expect(page.getByTestId('reaction-progress')).toHaveText('Lượt hợp lệ 1/5');
});

test('shows an accessible signal at 320 px and never scores a keyboard or touch activation', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 320, height: 720 });
  await page.clock.install();
  await page.goto('/en/mouse/reaction');
  const target = page.getByTestId('reaction-target');
  await target.click();
  await expect(target).toHaveAttribute('data-stage', 'waiting');
  await page.clock.fastForward(4200);
  await expect(target).toHaveAttribute('data-stage', 'signal');
  await target.press('Enter');
  await expect(page.getByText(en.mouseReaction.mouseRequired)).toBeVisible();
  await target.dispatchEvent('pointerdown', { pointerType: 'touch', isPrimary: true, button: 0 });
  await target.dispatchEvent('click', { detail: 1 });
  await expect(target).toHaveAttribute('data-stage', 'signal');
  await expect(page.getByTestId('reaction-progress')).toHaveText('Valid rounds 0/5');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  for (const theme of ['dark', 'light']) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    expect(
      await target.evaluate((element) => element.scrollWidth - element.clientWidth),
    ).toBeLessThanOrEqual(1);
    expect(
      (
        await new AxeBuilder({ page })
          .include('.tool-workspace')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});
