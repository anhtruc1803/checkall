import { test, expect } from '@playwright/test';
test('mouse buttons count presses and clear after release', async ({ page }) => {
  await page.goto('/en/mouse/buttons');
  const area = page.getByTestId('mouse-area');
  await area.click();
  await area.click({ button: 'right' });
  await area.click({ button: 'middle' });
  const results = page.locator('.results-grid');
  await expect(results).toContainText('Left button');
  await expect(results).toContainText('1 · Released');
  await expect(page.locator('.mouse-half.active')).toHaveCount(0);
});
test('double-click shows observed click gaps', async ({ page }) => {
  await page.goto('/en/mouse/double-click');
  await expect(page.locator('.tool-workspace [aria-busy]')).toHaveAttribute('aria-busy', 'false');
  await page.getByLabel('Investigation threshold (ms)').fill('1000');
  await page.getByTestId('mouse-area').dblclick({ delay: 30 });
  await expect(page.locator('tbody')).toContainText('Notable intervals');
  await expect(page.locator('.results-grid').first()).toContainText('2');
});
test('CPS counts only clicks within the chosen time window', async ({ page }) => {
  await page.goto('/en/mouse/cps');
  const area = page.getByTestId('mouse-area');
  await area.click();
  await expect(area.locator('.big-result')).toHaveText('0');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await area.click({ clickCount: 3, delay: 100 });
  await expect(area.locator('.big-result')).toHaveText('3');
  await expect(page.locator('.status')).toContainText('Completed', { timeout: 10000 });
  await area.click();
  await expect(area.locator('.big-result')).toHaveText('3');
});
test('wheel data updates within the dedicated region and resets', async ({ page }) => {
  await page.goto('/en/mouse/scroll');
  const area = page.getByTestId('mouse-area');
  await area.hover();
  await area.evaluate((element) =>
    element.addEventListener(
      'wheel',
      (event) => element.setAttribute('data-observed-wheel', String((event as WheelEvent).deltaY)),
      { once: true },
    ),
  );
  await page.mouse.wheel(0, 120);
  await expect(page.locator('.results-grid')).toContainText('Down');
  await expect(area).toHaveAttribute('data-observed-wheel', /\d/);
  const observed = await area.getAttribute('data-observed-wheel');
  await expect(
    page
      .locator('.metric')
      .filter({ has: page.getByText('deltaY', { exact: true }) })
      .locator('dd'),
  ).toHaveText(observed ?? '');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('.results-grid').locator('dd').last()).toHaveText('0');
});
test('pointer sampling reports browser-observed rate and can reset', async ({ page }) => {
  await page.goto('/en/mouse/polling-rate');
  await expect(page.locator('.tool-workspace [aria-busy]')).toHaveAttribute('aria-busy', 'false');
  await page.getByLabel('Duration', { exact: true }).selectOption('20');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  const box = await page.getByTestId('mouse-area').boundingBox();
  if (!box) throw new Error('missing region');
  for (let i = 0; i < 35; i++) {
    await page.mouse.move(box.x + 30 + (i % 10) * 20, box.y + 40 + (i % 4) * 20);
    await page.waitForTimeout(20);
  }
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(page.locator('.big-result')).not.toContainText('—');
  await expect(
    page.getByText('Browser event frequency does not confirm USB Polling Rate.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('.big-result')).toContainText('—');
});
