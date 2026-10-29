import { test, expect } from '@playwright/test';
import { tools } from '../../src/lib/tools/registry';

test('all Phase 2 drafts stay out of VI/EN routes, navigation, search and sitemap', async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  const drafts = tools.filter((tool) => tool.phase === 2);
  expect(drafts).toHaveLength(19);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const locale of ['vi', 'en']) {
    await page.goto(`/${locale}`);
    await expect(page.locator('.catalog-item')).toHaveCount(21);
    await expect(page.locator('.desktop-nav a')).toHaveCount(3);
    for (const tool of drafts) {
      const route = `/${locale}/${tool.category}/${tool.slug}`;
      expect((await request.get(route)).status(), route).toBe(404);
      expect(sitemap).not.toContain(route);
      await expect(page.locator(`a[href="${route}"]`)).toHaveCount(0);
    }
    for (const category of ['audio', 'camera', 'gamepad', 'device', 'browser'])
      expect((await request.get(`/${locale}/${category}`)).status()).toBe(404);
    await page
      .getByRole('textbox', { name: locale === 'vi' ? 'Tìm kiếm công cụ' : 'Search testing tools' })
      .fill('webcam');
    await expect(page.locator('.catalog-item')).toHaveCount(0);
  }
});

test('Phase 1 never requests media or permission status and retains restrictive headers', async ({
  page,
  request,
}) => {
  await page.addInitScript(() => {
    const counters = { capture: 0, query: 0 };
    Object.defineProperty(window, '__mediaCalls', { value: counters });
    if (navigator.mediaDevices)
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: () => {
          counters.capture++;
          return Promise.reject(new Error('unexpected capture'));
        },
      });
    if (navigator.permissions)
      Object.defineProperty(navigator.permissions, 'query', {
        configurable: true,
        value: () => {
          counters.query++;
          return Promise.reject(new Error('unexpected query'));
        },
      });
  });
  for (const path of [
    '/vi',
    '/en/screen/refresh-rate',
    '/vi/keyboard/tester',
    '/en/mouse/buttons',
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const workspace = page.locator('.tool-workspace [aria-busy]');
    if (await workspace.count()) await expect(workspace).toHaveAttribute('aria-busy', 'false');
    expect(
      await page.evaluate(() => (window as Window & { __mediaCalls?: unknown }).__mediaCalls),
    ).toEqual({ capture: 0, query: 0 });
    const response = await request.get(path);
    expect(response.headers()['permissions-policy']).toBe(
      'camera=(), microphone=(), geolocation=()',
    );
  }
});
