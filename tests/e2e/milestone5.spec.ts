import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { cameraFixture } from './helpers/camera-fixture';
const test = base.extend({
  launchOptions: [
    async ({ browserName }, use) => {
      await use(
        browserName === 'chromium'
          ? { args: ['--use-fake-device-for-media-stream'] }
          : browserName === 'firefox'
            ? {
                firefoxUserPrefs: {
                  'media.navigator.streams.fake': true,
                  'media.navigator.permission.disabled': true,
                },
              }
            : {},
      );
    },
    { scope: 'worker' },
  ],
});
const ready = async (page: Page) =>
  expect(page.locator('[data-engine-ready]')).toHaveAttribute('data-engine-ready', 'true');
const metric = (page: Page, label: string) =>
  page
    .locator('.metric')
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator('dd');
const start = async (page: Page) => {
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.status')).toHaveAttribute('data-state', 'running');
};
const closed = async (page: Page) => {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.__cameraProbe.tracks.length > 0 &&
          window.__cameraProbe.tracks.every((track) => track.readyState === 'ended'),
      ),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page.locator('video').evaluate((video) => (video as HTMLVideoElement).srcObject === null),
    )
    .toBe(true);
};
async function nativeCamera(page: Page) {
  const available = await page.evaluate(
    () => typeof navigator.mediaDevices?.getUserMedia === 'function',
  );
  if (process.env.CI) expect(available, 'CI requires native camera capture').toBe(true);
  test.skip(
    !available,
    'Native mediaDevices unavailable in this runtime; Linux CI must verify camera capture.',
  );
}
test('camera policy is confined to six VI/EN tool URLs, with microphone still blocked', async ({
  request,
}) => {
  for (const locale of ['vi', 'en'])
    for (const slug of ['preview', 'resolution', 'fps']) {
      const response = await request.get(`/${locale}/camera/${slug}`);
      expect(response.status()).toBe(200);
      expect(response.headers()['permissions-policy']).toBe(
        'camera=(self), microphone=(), geolocation=()',
      );
    }
  for (const path of [
    '/en/camera',
    '/vi/camera/fps-extra',
    '/en/camera/preview/extra',
    '/en',
    '/api/health',
  ])
    expect((await request.get(path)).headers()['permissions-policy']).toBe(
      'camera=(), microphone=(), geolocation=()',
    );
  expect((await request.get('/en/audio/microphone')).headers()['permissions-policy']).toBe(
    'camera=(), microphone=(self), geolocation=()',
  );
});
test('native virtual camera renders all tools and measures compositor FPS without storage or upload', async ({
  page,
  context,
  browserName,
}) => {
  test.setTimeout(60000);
  await page.goto('/en');
  await nativeCamera(page);
  if (browserName !== 'firefox') await context.grantPermissions(['camera']);
  const uploads: string[] = [];
  page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH'].includes(request.method())) uploads.push(request.url());
  });
  for (const slug of ['preview', 'resolution', 'fps']) {
    if (slug === 'preview') await page.locator('.catalog-item[href="/en/camera/preview"]').click();
    else await page.goto(`/en/camera/${slug}`);
    await ready(page);
    await page.evaluate(() => {
      const native = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      window.__cameraProbe = { calls: 0, tracks: [] };
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {
          getUserMedia: async (constraints: MediaStreamConstraints) => {
            window.__cameraProbe.calls++;
            if (constraints.video !== true || constraints.audio !== false)
              throw new Error('unexpected capture');
            const stream = await native(constraints);
            window.__cameraProbe.tracks.push(...stream.getTracks());
            return stream;
          },
        },
      });
    });
    expect(await page.evaluate(() => window.__cameraProbe.calls)).toBe(0);
    const storage = await page.evaluate(() => JSON.stringify(localStorage));
    await start(page);
    await expect(metric(page, 'Current video dimensions')).not.toContainText('—');
    await expect(metric(page, 'Reported stream resolution')).not.toContainText('—');
    expect(
      await page.evaluate(() =>
        window.__cameraProbe.tracks.every(
          (track) => track.kind === 'video' && track.readyState === 'live',
        ),
      ),
    ).toBe(true);
    expect(
      await page
        .locator('video')
        .evaluate((v) => (v as HTMLVideoElement).muted && (v as HTMLVideoElement).playsInline),
    ).toBe(true);
    if (slug === 'fps') {
      const callbacks = await page
        .locator('video')
        .evaluate((v) => typeof (v as HTMLVideoElement).requestVideoFrameCallback === 'function');
      expect(
        callbacks,
        'CI/native target must expose rVFC; missing support remains an open criterion',
      ).toBe(true);
      await expect(metric(page, 'Observed compositor FPS')).not.toContainText('—', {
        timeout: 15000,
      });
      const fps = parseFloat(await metric(page, 'Observed compositor FPS').innerText());
      expect(fps).toBeGreaterThan(0);
      expect(fps).toBeLessThan(150);
      expect(
        parseFloat(await metric(page, 'Measurement window duration').innerText()),
      ).toBeGreaterThanOrEqual(2);
      await page.screenshot({
        path: `artifacts/camera-qa/${browserName}-${test.info().project.name}-fps.png`,
        fullPage: true,
      });
    }
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    await closed(page);
    await expect(metric(page, 'Current video dimensions')).toContainText('—');
    expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(storage);
    expect(await page.evaluate(() => window.__cameraProbe.calls)).toBe(1);
  }
  expect(uploads).toEqual([]);
});
test('native camera policy denial is enforced when the runtime exposes policy support', async ({
  page,
  context,
  browserName,
}) => {
  await page.goto('/en/camera/preview');
  await nativeCamera(page);
  const supported = await page.evaluate(() => {
    const doc = document as Document & { permissionsPolicy?: unknown; featurePolicy?: unknown };
    return Boolean(doc.permissionsPolicy || doc.featurePolicy);
  });
  test.skip(
    !supported,
    'Native Permissions-Policy unavailable; HTTP scope and app guard are verified separately.',
  );
  if (browserName !== 'firefox') await context.grantPermissions(['camera']);
  await page.route('**/en/camera/preview', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'permissions-policy': 'camera=(), microphone=(), geolocation=()',
      },
    });
  });
  await page.goto('/en/camera/preview');
  await ready(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.status')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('.tool-workspace').getByRole('alert')).toContainText(/policy|refused/);
});
test('document navigation updates camera, locale, microphone and restrictive policies', async ({
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
  const camera = 'camera=(self), microphone=(), geolocation=()';
  const category = async (href: string) => {
    const desktop = page.locator(`.desktop-nav a[href="${href}"]`);
    if (await desktop.isVisible()) await desktop.click();
    else {
      await page.locator('.menu-toggle').click();
      await expect(page.locator('#mobile-nav')).toBeVisible();
      await page.locator(`#mobile-nav a[href="${href}"]`).click();
    }
  };
  await navigate(
    () => page.locator('.catalog-item[href="/en/camera/preview"]').click(),
    '/en/camera/preview',
    camera,
  );
  await navigate(
    () => page.locator('a[href="/en/camera/fps"]').first().click(),
    '/en/camera/fps',
    camera,
  );
  await navigate(
    () => page.getByRole('link', { name: /Switch to Vietnamese/ }).click(),
    '/vi/camera/fps',
    camera,
  );
  await navigate(
    () => category('/vi/audio'),
    '/vi/audio',
    'camera=(), microphone=(), geolocation=()',
  );
  await navigate(
    () => page.locator('.catalog-item[href="/vi/audio/microphone"]').click(),
    '/vi/audio/microphone',
    'camera=(), microphone=(self), geolocation=()',
  );
  await navigate(
    () => category('/vi/camera'),
    '/vi/camera',
    'camera=(), microphone=(), geolocation=()',
  );
});
test('pending permission cannot recapture after Stop and a late stream is released', async ({
  page,
}) => {
  await cameraFixture(page, 'pending');
  await page.goto('/en/camera/preview');
  await ready(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__cameraProbe.calls)).toBe(1);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeDisabled();
  await expect(page.getByText(/request is still pending/)).toBeVisible();
  await page.evaluate(() => window.__cameraProbe.resolve?.());
  await closed(page);
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => window.__cameraProbe.calls)).toBe(1);
});
test('capture errors and rejected video playback release the session', async ({ page }) => {
  await cameraFixture(page, 'error', 'NotReadableError');
  await page.goto('/en/camera/preview');
  await ready(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.status')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('.tool-workspace').getByRole('alert')).toContainText(
    'The device cannot be read or may be in use.',
  );
});
test('rejected playback releases the camera', async ({ page }) => {
  await cameraFixture(page, 'blocked-play');
  await page.goto('/en/camera/preview');
  await ready(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.status')).toHaveAttribute('data-state', 'error');
  await closed(page);
  await expect(page.locator('.tool-workspace').getByRole('alert')).toContainText(/could not play/);
});
test('muted, revoked, ended, blurred and pagehide sessions clear video and do not resume automatically', async ({
  page,
}) => {
  await cameraFixture(page, 'active');
  await page.goto('/en/camera/fps');
  await ready(page);
  await start(page);
  await expect(page.getByText(/does not expose requestVideoFrameCallback/)).toBeVisible();
  await expect(metric(page, 'Observed compositor FPS')).toContainText('—');
  await page.evaluate(() => window.__cameraProbe.mute?.(true));
  await expect(page.getByText(/reports a muted camera/)).toBeVisible();
  await page.evaluate(() => window.__cameraProbe.mute?.(false));
  await page.evaluate(() => window.__cameraProbe.revoke?.());
  await closed(page);
  for (const reason of ['ended', 'blur', 'pagehide']) {
    await page.reload();
    await ready(page);
    await start(page);
    await page.evaluate((reason) => {
      if (reason === 'ended') window.__cameraProbe.tracks[0].stop();
      else window.dispatchEvent(new Event(reason));
    }, reason);
    await closed(page);
    await expect(page.locator('.status')).toHaveAttribute('data-state', 'warning');
    expect(await page.evaluate(() => window.__cameraProbe.calls)).toBe(1);
  }
});
test('Stop, Reset and active locale navigation release tracks and erase preview data', async ({
  page,
}) => {
  await cameraFixture(page, 'active');
  await page.goto('/en/camera/resolution');
  await ready(page);
  await start(page);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await closed(page);
  await expect(metric(page, 'Reported stream resolution')).toContainText('—');
  await page.reload();
  await ready(page);
  await start(page);
  await page.evaluate(() =>
    window.addEventListener('pagehide', () =>
      sessionStorage.setItem(
        '__qa_camera_ended',
        String(window.__cameraProbe.tracks.every((t) => t.readyState === 'ended')),
      ),
    ),
  );
  await page.getByRole('link', { name: /Switch to Vietnamese/ }).click();
  await expect(page).toHaveURL(/\/vi\/camera\/resolution$/);
  expect(await page.evaluate(() => sessionStorage.getItem('__qa_camera_ended'))).toBe('true');
  expect(await page.evaluate(() => window.__cameraProbe.calls)).toBe(0);
});
test('all camera tools support VI/EN, Dark/Light, keyboard and responsive layouts without axe violations', async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const locale of ['vi', 'en'])
    for (const slug of ['preview', 'resolution', 'fps']) {
      await page.goto(`/${locale}/camera/${slug}`);
      await ready(page);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      for (const theme of ['light', 'dark']) {
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
        }, theme);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      }
      for (const width of [320, 375, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
      const button = page.getByRole('button', {
        name: locale === 'en' ? 'Start' : 'Bắt đầu',
        exact: true,
      });
      await button.focus();
      await expect(button).toBeFocused();
      expect(
        await page.locator('video').evaluate((v) => (v as HTMLVideoElement).srcObject),
      ).toBeNull();
    }
});
test('keyboard starts and stops preview; running and revoked states pass axe in both themes', async ({
  page,
}) => {
  await cameraFixture(page, 'active');
  await page.goto('/en/camera/preview');
  await ready(page);
  const button = page.getByRole('button', { name: 'Start', exact: true });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.status')).toHaveAttribute('data-state', 'running');
  for (const state of ['running', 'error']) {
    if (state === 'error') {
      await page.evaluate(() => window.__cameraProbe.revoke?.());
      await closed(page);
    }
    for (const theme of ['dark', 'light']) {
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
      }, theme);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
  }
  await page.reload();
  await ready(page);
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.status')).toHaveAttribute('data-state', 'running');
  await page.getByRole('button', { name: 'Stop', exact: true }).focus();
  await page.keyboard.press('Space');
  await closed(page);
});
