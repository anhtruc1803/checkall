import { test, expect } from '@playwright/test';
import { publishedTools as tools } from '../../src/lib/tools/registry';
test('all 21 Phase 1 registry entries mount real engines or an honest capability fallback', async ({
  page,
}) => {
  test.setTimeout(120000);
  expect(tools.filter((tool) => tool.status === 'published' && tool.phase === 1)).toHaveLength(21);
  for (const tool of tools) {
    await page.goto(`/en/${tool.category}/${tool.slug}`);
    const workspace = page.locator('.tool-workspace');
    await expect(workspace).toHaveAttribute('data-engine', tool.engine);
    if (tool.engine === 'touch' && !(await page.evaluate(() => navigator.maxTouchPoints > 0))) {
      await expect(
        workspace.getByText('Not supported by this browser or device.', { exact: true }),
      ).toBeVisible();
      continue;
    }
    if (tool.engine === 'screen-info') await expect(workspace.locator('.metric')).toHaveCount(8);
    if (tool.engine === 'calculator')
      await expect(workspace.getByLabel('Width (px)')).toBeVisible();
    if (tool.engine === 'refresh')
      await expect(workspace.getByRole('button', { name: 'Start', exact: true })).toBeEnabled();
    if (['patterns', 'motion', 'touch'].includes(tool.engine))
      await expect(workspace.locator('canvas').first()).toBeVisible();
    if (tool.engine === 'keyboard')
      await expect(workspace.locator('[data-code=KeyA]')).toBeVisible();
    if (tool.engine === 'mouse') await expect(workspace.getByTestId('mouse-area')).toBeVisible();
    await expect(workspace.getByText('Preparing', { exact: true })).toHaveCount(0);
  }
});
test('server HTML includes an inert tool interface before capability detection', async ({
  request,
}) => {
  const keyboard = await request.get('/en/keyboard/tester');
  const html = await keyboard.text();
  expect(html).toContain('data-code="KeyA"');
  expect(html).toContain('inert=""');
  expect(html).toContain('data-engine-ready="false"');
  const refresh = await request.get('/en/screen/refresh-rate');
  expect(await refresh.text()).toContain('aria-label="Estimated frequency"');
});
