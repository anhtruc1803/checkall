import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gamepadFixture } from './helpers/gamepad-fixture';
import { publishedTools } from '../../src/lib/tools/registry';
const ready = async (page: Page) =>
  expect(page.locator('[data-engine-ready]')).toHaveAttribute('data-engine-ready', 'true');
const start = async (page: Page) => {
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.status')).toHaveAttribute('data-state', 'running');
};
const metric = (page: Page, label: string) =>
  page
    .locator('.metric')
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator('dd');
const restrictive = 'camera=(), microphone=(), geolocation=(), gamepad=()';
const allowed = 'camera=(), microphone=(), geolocation=(), gamepad=(self)';
test('only six gamepad URLs allow self access; all published policy scopes remain exact', async ({
  request,
}) => {
  for (const locale of ['vi', 'en'])
    for (const tool of publishedTools) {
      const response = await request.get(`/${locale}/${tool.category}/${tool.slug}`);
      expect(response.status()).toBe(200);
      const expected =
        tool.engine === 'gamepad'
          ? allowed
          : tool.engine === 'camera'
            ? 'camera=(self), microphone=(), geolocation=(), gamepad=()'
            : tool.permissions.includes('microphone')
              ? 'camera=(), microphone=(self), geolocation=(), gamepad=()'
              : restrictive;
      expect(response.headers()['permissions-policy']).toBe(expected);
    }
  for (const path of [
    '/en/gamepad',
    '/vi/gamepad/tester-extra',
    '/en/gamepad/stick-drift/extra',
    '/en/privacy',
    '/en',
    '/api/health',
  ])
    expect((await request.get(path)).headers()['permissions-policy']).toBe(restrictive);
});
test('native Gamepad API discovery is passive until Start, or exposes the actual runtime fallback', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const native = navigator.getGamepads?.bind(navigator);
    Object.defineProperty(window, '__nativePadReads', {
      value: { count: 0, available: Boolean(native) },
    });
    if (native)
      Object.defineProperty(navigator, 'getGamepads', {
        configurable: true,
        value: () => {
          window.__nativePadReads.count++;
          return native();
        },
      });
  });
  await page.goto('/en/gamepad/tester');
  await ready(page);
  const probe = await page.evaluate(() => window.__nativePadReads);
  expect(probe.count).toBe(0);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  if (probe.available) {
    await expect(page.locator('.status')).toHaveAttribute('data-state', 'running');
    await expect.poll(() => page.evaluate(() => window.__nativePadReads.count)).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    const count = await page.evaluate(() => window.__nativePadReads.count);
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => window.__nativePadReads.count)).toBe(count);
  } else {
    await expect(page.locator('.status')).toHaveAttribute('data-state', 'unsupported');
    await expect(page.getByText(/runtime does not provide/)).toBeVisible();
  }
});
test('native gamepad policy denial is checked separately when advertised by the runtime', async ({
  page,
}) => {
  await page.goto('/en/gamepad/tester');
  await ready(page);
  const supported = await page.evaluate(() => {
    const doc = document as Document & {
      permissionsPolicy?: { features?: () => string[] };
      featurePolicy?: { features?: () => string[] };
    };
    return Boolean(
      (doc.permissionsPolicy ?? doc.featurePolicy)?.features?.().includes('gamepad') &&
        typeof navigator.getGamepads === 'function',
    );
  });
  test.skip(
    !supported,
    'Runtime does not advertise the gamepad policy directive; native enforcement remains unverified.',
  );
  await page.route('**/en/gamepad/tester', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'permissions-policy': restrictive },
    });
  });
  await page.goto('/en/gamepad/tester');
  await ready(page);
  expect(
    await page.evaluate(() => {
      try {
        navigator.getGamepads();
        return 'allowed';
      } catch (error) {
        return error instanceof DOMException ? error.name : 'unknown';
      }
    }),
  ).toBe('SecurityError');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.status')).toHaveAttribute('data-state', 'unsupported');
  await expect(page.getByText(/Document policy blocks/)).toBeVisible();
});
test('simulated buttons/axes are read-only, bounded and never captured, vibrated, stored or uploaded', async ({
  page,
}) => {
  await gamepadFixture(page);
  const uploads: string[] = [];
  page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH'].includes(request.method())) uploads.push(request.url());
  });
  await page.goto('/en/gamepad/tester');
  await ready(page);
  expect(await page.evaluate(() => window.__gamepadProbe.calls)).toBe(0);
  const storage = await page.evaluate(() => JSON.stringify(localStorage));
  await start(page);
  await expect(metric(page, 'Button 0')).toContainText('0.650');
  await expect(metric(page, 'Button 0')).toContainText('Pressed');
  await expect(metric(page, 'Raw X')).toHaveText('0.120');
  await page.evaluate(() => {
    window.__gamepadProbe.pads[0]!.buttons[0] = { value: 0, pressed: false, touched: false };
    window.__gamepadProbe.pads[0]!.axes[0] = -0.4;
  });
  await expect(metric(page, 'Button 0')).toContainText('Released');
  await expect(metric(page, 'Raw X')).toHaveText('-0.400');
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(page.locator('.gamepad-buttons')).toHaveCount(0);
  const calls = await page.evaluate(() => window.__gamepadProbe.calls);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.__gamepadProbe.calls)).toBe(calls);
  expect(
    await page.evaluate(() => ({
      capture: window.__gamepadProbe.capture,
      query: window.__gamepadProbe.query,
      haptics: window.__gamepadProbe.haptics,
    })),
  ).toEqual({ capture: 0, query: 0, haptics: 0 });
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(storage);
  expect(uploads).toEqual([]);
});
test('non-standard mapping requires both axes; plot and reference radius retain raw coordinates', async ({
  page,
}) => {
  await gamepadFixture(page, 'unmapped');
  await page.goto('/en/gamepad/analog-stick');
  await ready(page);
  await start(page);
  await expect(metric(page, 'Raw X')).toHaveText('—');
  await page.getByLabel('X axis', { exact: true }).selectOption('2');
  await expect(metric(page, 'Raw X')).toHaveText('—');
  await page.getByLabel('Y axis', { exact: true }).selectOption('3');
  await expect(metric(page, 'Raw X')).toHaveText('0.250');
  await expect(metric(page, 'Raw Y')).toHaveText('-0.300');
  await expect(page.locator('.gamepad-point')).toHaveAttribute('cx', '145');
  await expect(page.locator('.gamepad-point')).toHaveAttribute('cy', '90');
  await page.getByLabel(/Reference deadzone/).fill('0.4');
  await expect(metric(page, 'Raw X')).toHaveText('0.250');
  await expect(page.locator('.gamepad-deadzone')).toHaveAttribute('r', '40');
});
test('rest-window statistics measure raw fixture offsets, preserve genuine zero and reset on settings changes', async ({
  page,
}) => {
  await page.clock.install();
  await gamepadFixture(page);
  await page.goto('/en/gamepad/stick-drift');
  await ready(page);
  await start(page);
  await page
    .getByRole('button', { name: 'Measure rest position (5 seconds)', exact: true })
    .click();
  await page.clock.runFor(6200);
  await expect(page.getByText(/Window complete/)).toBeVisible();
  await expect(metric(page, 'Mean X')).toHaveText('0.120');
  await expect(metric(page, 'Mean Y')).toHaveText('-0.050');
  await expect(metric(page, 'Mean radius')).toHaveText('0.130');
  expect(
    parseFloat(await metric(page, 'Observation time span').innerText()),
  ).toBeGreaterThanOrEqual(4.5);
  expect(
    Number(await metric(page, 'Browser observation count').innerText()),
  ).toBeGreaterThanOrEqual(30);
  await page.screenshot({
    path: `artifacts/gamepad-qa/${test.info().project.name}-drift.png`,
    fullPage: true,
  });
  await page.getByLabel(/Reference deadzone/).fill('0.2');
  await expect(metric(page, 'Mean X')).toHaveText('—');
  await page.evaluate(() => {
    window.__gamepadProbe.pads[0]!.axes = [0, 0, 0, 0];
  });
  await page.clock.runFor(160);
  await page
    .getByRole('button', { name: 'Measure rest position (5 seconds)', exact: true })
    .click();
  await page.clock.runFor(6200);
  await expect(metric(page, 'Mean radius')).toHaveText('0.000');
  await page.getByLabel('X axis', { exact: true }).selectOption('2');
  await expect(metric(page, 'Mean X')).toHaveText('—');
});
test('disconnection, silent slot loss and replacement stop without switching to another controller', async ({
  page,
}) => {
  await gamepadFixture(page);
  for (const mode of ['event', 'silent', 'replace']) {
    await page.goto('/en/gamepad/tester');
    await ready(page);
    await start(page);
    await page.evaluate((mode) => {
      if (mode === 'replace') window.__gamepadProbe.replace(0);
      else window.__gamepadProbe.disconnect(0, mode === 'event');
    }, mode);
    await expect(page.locator('.status')).toHaveAttribute('data-state', 'warning');
    await expect(metric(page, 'Raw X')).toHaveText('—');
    await expect(page.getByLabel(/Controller \(browser-reported ID\)/)).toBeDisabled();
    const calls = await page.evaluate(() => window.__gamepadProbe.calls);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.__gamepadProbe.calls)).toBe(calls);
  }
});
test('blur, hidden, pagehide and the session deadline clean polling without automatic resumption', async ({
  page,
}) => {
  await page.clock.install();
  await gamepadFixture(page);
  for (const reason of ['blur', 'hidden', 'pagehide', 'timeout']) {
    await page.goto('/en/gamepad/analog-stick');
    await ready(page);
    await start(page);
    if (reason === 'timeout') await page.clock.fastForward(120001);
    else
      await page.evaluate((reason) => {
        if (reason === 'hidden') window.__gamepadProbe.hidden();
        else window.dispatchEvent(new Event(reason));
      }, reason);
    await expect(metric(page, 'Raw X')).toHaveText('—');
    await expect(page.locator('.status')).toHaveAttribute(
      'data-state',
      reason === 'timeout' ? 'completed' : 'warning',
    );
    const calls = await page.evaluate(() => window.__gamepadProbe.calls);
    await page.clock.runFor(300);
    expect(await page.evaluate(() => window.__gamepadProbe.calls)).toBe(calls);
  }
});
test('missing API, insecure context, policy denial and native read refusal have honest fallbacks', async ({
  context,
}) => {
  for (const mode of ['unsupported', 'insecure', 'policy', 'blocked'] as const) {
    const page = await context.newPage();
    await gamepadFixture(page, mode);
    await page.goto('/en/gamepad/tester');
    await ready(page);
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await expect(page.locator('.status')).toHaveAttribute(
      'data-state',
      mode === 'blocked' ? 'error' : 'unsupported',
    );
    await expect(metric(page, 'Raw X')).toHaveText('—');
    expect(await page.evaluate(() => window.__gamepadProbe.calls)).toBe(mode === 'blocked' ? 1 : 0);
    await page.close();
  }
});
test('catalog, related, locale and mobile menus navigate documents across gamepad/camera/microphone policy', async ({
  page,
}) => {
  await page.goto('/en');
  const navigate = async (action: () => Promise<unknown>, path: string, policy: string) => {
    const response = page.waitForResponse(
      (r) => r.request().isNavigationRequest() && new URL(r.url()).pathname === path,
    );
    await action();
    expect((await response).headers()['permissions-policy']).toBe(policy);
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  };
  const category = async (href: string) => {
    const desktop = page.locator(`.desktop-nav a[href="${href}"]`);
    if (await desktop.isVisible()) await desktop.click();
    else {
      await page.locator('.menu-toggle').click();
      await page.locator(`#mobile-nav a[href="${href}"]`).click();
    }
  };
  await navigate(
    () => page.locator('.catalog-item[href="/en/gamepad/tester"]').click(),
    '/en/gamepad/tester',
    allowed,
  );
  await navigate(
    () => page.locator('a[href="/en/gamepad/stick-drift"]').first().click(),
    '/en/gamepad/stick-drift',
    allowed,
  );
  await navigate(
    () => page.getByRole('link', { name: /Switch to Vietnamese/ }).click(),
    '/vi/gamepad/stick-drift',
    allowed,
  );
  await navigate(() => category('/vi/camera'), '/vi/camera', restrictive);
  await navigate(
    () => page.locator('.catalog-item[href="/vi/camera/preview"]').click(),
    '/vi/camera/preview',
    'camera=(self), microphone=(), geolocation=(), gamepad=()',
  );
  await navigate(() => category('/vi/audio'), '/vi/audio', restrictive);
  await navigate(
    () => page.locator('.catalog-item[href="/vi/audio/microphone"]').click(),
    '/vi/audio/microphone',
    'camera=(), microphone=(self), geolocation=(), gamepad=()',
  );
});
test('device selection, Reset, keyboard controls and active locale navigation clear prior state', async ({
  page,
}) => {
  await gamepadFixture(page);
  await page.goto('/en/gamepad/tester');
  await ready(page);
  await page.getByRole('button', { name: 'Start', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.status')).toHaveAttribute('data-state', 'running');
  await page.getByLabel(/Controller \(browser-reported ID\)/).selectOption('2');
  await expect(page.getByLabel(/Controller \(browser-reported ID\)/)).toHaveValue('2');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(metric(page, 'Raw X')).toHaveText('—');
  await start(page);
  await page.getByRole('button', { name: 'Stop', exact: true }).focus();
  await page.keyboard.press('Space');
  await expect(metric(page, 'Raw X')).toHaveText('—');
  await start(page);
  await page.evaluate(() =>
    window.addEventListener('pagehide', () =>
      sessionStorage.setItem('__qa_gamepad_had_run', String(window.__gamepadProbe.calls > 0)),
    ),
  );
  await page.getByRole('link', { name: /Switch to Vietnamese/ }).click();
  await expect(page).toHaveURL(/\/vi\/gamepad\/tester$/);
  expect(await page.evaluate(() => sessionStorage.getItem('__qa_gamepad_had_run'))).toBe('true');
  expect(await page.evaluate(() => window.__gamepadProbe.calls)).toBe(0);
});
test('gamepad tools support VI/EN, Dark/Light, responsive and accessible idle/running/error states', async ({
  page,
}) => {
  test.setTimeout(120000);
  await gamepadFixture(page);
  for (const locale of ['vi', 'en'])
    for (const slug of ['tester', 'analog-stick', 'stick-drift']) {
      await page.goto(`/${locale}/gamepad/${slug}`);
      await ready(page);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      for (const theme of ['dark', 'light']) {
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
        }, theme);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      }
      for (const width of [320, 375, 768, 1024, 1150, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    }
  await page.goto('/en/gamepad/tester');
  await ready(page);
  await start(page);
  for (const state of ['running', 'error']) {
    if (state === 'error') await page.evaluate(() => window.__gamepadProbe.disconnect(0));
    for (const theme of ['dark', 'light']) {
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
      }, theme);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
  }
});
