import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { inputFixture } from './helpers/input-fixture';
import { publishedTools } from '../../src/lib/tools/registry';
// OS input is never opened in QA. These options affect this file's browser workers only.
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
const paths = ['microphone', 'spectrum'];
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
const closed = async (page: Page) =>
  expect
    .poll(() =>
      page.evaluate(() => window.__inputProbe.contexts.every((ctx) => ctx.state === 'closed')),
    )
    .toBe(true);
async function nativeAudio(page: Page) {
  const available = await page.evaluate(() => typeof AudioContext === 'function');
  if (process.env.CI) expect(available, 'CI requires native Web Audio for input tests').toBe(true);
  test.skip(
    !available,
    'Native Web Audio unavailable in this browser build; Linux CI must verify input graph.',
  );
}
test('only the four microphone/spectrum VI/EN routes allow self microphone access', async ({
  request,
}) => {
  for (const locale of ['vi', 'en'])
    for (const path of paths) {
      const response = await request.get(`/${locale}/audio/${path}`);
      expect(response.status()).toBe(200);
      expect(response.headers()['permissions-policy']).toBe(
        'camera=(), microphone=(self), geolocation=()',
      );
    }
  for (const locale of ['vi', 'en'])
    for (const tool of publishedTools.filter((tool) => !tool.permissions.length))
      expect(
        (await request.get(`/${locale}/${tool.category}/${tool.slug}`)).headers()[
          'permissions-policy'
        ],
      ).toBe('camera=(), microphone=(), geolocation=()');
  for (const path of [
    '/vi',
    '/en/privacy',
    '/en/audio',
    '/en/audio/speaker',
    '/vi/keyboard/tester',
    '/en/audio/microphone-extra',
    '/en/audio/microphone/extra',
    '/api/health',
  ])
    expect((await request.get(path)).headers()['permissions-policy'], path).toBe(
      'camera=(), microphone=(), geolocation=()',
    );
});
test('native getUserMedia captures virtual test devices from homepage and releases all tracks', async ({
  page,
  context,
  browserName,
}) => {
  await nativeAudio(page);
  if (browserName !== 'firefox') await context.grantPermissions(['microphone']);
  await page.goto('/en');
  await page.locator('.catalog-item[href="/en/audio/microphone"]').click();
  await expect(page).toHaveURL(/\/en\/audio\/microphone$/);
  await ready(page);
  await page.evaluate(() => {
    const native = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    window.__inputProbe = { calls: 0, stops: 0, graphs: 0, contexts: [], tracks: [] };
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async (constraints: MediaStreamConstraints) => {
        window.__inputProbe.calls++;
        if (constraints.video !== false || constraints.audio !== true)
          throw new Error('unexpected capture constraints');
        const stream = await native(constraints);
        window.__inputProbe.tracks.push(...stream.getTracks());
        return stream;
      },
    });
  });
  expect(await page.evaluate(() => window.__inputProbe.calls)).toBe(0);
  await start(page);
  await expect(metric(page, 'Digital RMS amplitude')).not.toContainText('—');
  expect(
    await page.evaluate(() =>
      window.__inputProbe.tracks.every(
        (track) => track.kind === 'audio' && track.readyState === 'live',
      ),
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  expect(
    await page.evaluate(() =>
      window.__inputProbe.tracks.every((track) => track.readyState === 'ended'),
    ),
  ).toBe(true);
});
test('native browser policy blocks microphone access when policy introspection is supported', async ({
  page,
  context,
  browserName,
}) => {
  await nativeAudio(page);
  await page.goto('/en/audio/microphone');
  await ready(page);
  const policyApi = await page.evaluate(() => {
    const doc = document as Document & { permissionsPolicy?: unknown; featurePolicy?: unknown };
    return Boolean(doc.permissionsPolicy || doc.featurePolicy);
  });
  test.skip(
    !policyApi,
    'Native Permissions-Policy enforcement is unavailable in this runtime; header scope and app permission handling are tested separately.',
  );
  if (browserName !== 'firefox') await context.grantPermissions(['microphone']);
  await page.route('**/en/audio/microphone', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'permissions-policy': 'camera=(), microphone=(), geolocation=()',
      },
    });
  });
  await page.goto('/en/audio/microphone');
  await ready(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.status')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('.tool-workspace').getByRole('alert')).toContainText(/policy|refused/);
});
test('real analysis of a synthetic 1 kHz stream populates both tools without saving or uploading', async ({
  page,
}) => {
  await nativeAudio(page);
  await inputFixture(page, 'tone', 'NotAllowedError', true);
  const uploads: string[] = [];
  page.on('request', (request) => {
    if (
      ['POST', 'PUT', 'PATCH'].includes(request.method()) &&
      request.url().startsWith('http://localhost:3000')
    )
      uploads.push(request.url());
  });
  for (const path of paths) {
    await page.goto(`/en/audio/${path}`);
    await ready(page);
    const storage = await page.evaluate(() => ({ ...localStorage }));
    expect(await page.evaluate(() => window.__inputProbe.calls)).toBe(0);
    await start(page);
    await expect
      .poll(async () => Number(await metric(page, 'Digital RMS amplitude').textContent()))
      .toBeGreaterThan(0.1);
    expect(Number(await metric(page, 'Digital peak amplitude').textContent())).toBeLessThan(0.3);
    if (path === 'spectrum') {
      await expect
        .poll(async () =>
          parseFloat((await metric(page, 'Strongest FFT bin (approx.)').textContent()) ?? '0'),
        )
        .toBeGreaterThan(970);
      expect(
        parseFloat((await metric(page, 'Strongest FFT bin (approx.)').textContent()) ?? '0'),
      ).toBeLessThan(1030);
      await expect(page.locator('.input-bar')).toHaveCount(64);
    }
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    await closed(page);
    expect(await page.evaluate(() => window.__inputProbe.stops)).toBe(1);
    await expect(metric(page, 'Digital RMS amplitude')).toHaveText('—');
    expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(storage);
  }
  expect(uploads).toEqual([]);
});
test('permission denial, no device, busy input and capture abort are localized honest failures', async ({
  page,
}) => {
  for (const [name, message] of [
    ['NotAllowedError', 'refused'],
    ['NotFoundError', 'No usable device'],
    ['NotReadableError', 'cannot be read'],
    ['OverconstrainedError', 'requested configuration'],
    ['AbortError', 'interrupted'],
  ]) {
    // One initialization dispatches on query string, avoiding ambiguous script ordering.
    await page.addInitScript(
      ({ name }) => {
        if (!location.search.includes(name)) return;
        class Context {
          state = 'running';
          resume() {
            return Promise.resolve();
          }
          close() {
            this.state = 'closed';
            return Promise.resolve();
          }
        }
        Object.defineProperty(window, 'AudioContext', { configurable: true, value: Context });
        const capture = () =>
          Promise.reject(new DOMException('private microphone identifier', name));
        Object.defineProperty(navigator, 'mediaDevices', {
          configurable: true,
          value: { getUserMedia: capture },
        });
        Object.defineProperty(navigator, 'permissions', {
          configurable: true,
          value: {
            query: () => Promise.resolve(Object.assign(new EventTarget(), { state: 'prompt' })),
          },
        });
        Object.defineProperty(document, 'permissionsPolicy', {
          configurable: true,
          value: { allowsFeature: () => true },
        });
      },
      { name },
    );
    await page.goto(`/en/audio/microphone?${name}`);
    await ready(page);
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await expect(page.locator('.status')).toHaveAttribute('data-state', 'error');
    await expect(page.locator('.tool-workspace').getByRole('alert')).toContainText(message);
    await expect(page.locator('main')).not.toContainText('private microphone identifier');
  }
});
test('Stop, Reset and navigation release late grants and prevent duplicate pending captures', async ({
  page,
}) => {
  await inputFixture(page, 'pending');
  for (const action of ['Stop', 'Reset']) {
    await page.goto('/en/audio/microphone');
    await ready(page);
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.__inputProbe.calls)).toBe(1);
    await page.getByRole('button', { name: action, exact: true }).click();
    await closed(page);
    await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeDisabled();
    await page.evaluate(() => window.__inputProbe.resolve?.());
    await expect.poll(() => page.evaluate(() => window.__inputProbe.stops)).toBe(1);
    expect(await page.evaluate(() => window.__inputProbe.graphs)).toBe(0);
  }
  await page.goto('/en/audio/microphone');
  await ready(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__inputProbe.calls)).toBe(1);
  await page.evaluate(() =>
    window.addEventListener('pagehide', () => {
      sessionStorage.setItem(
        '__qa_input_cleanup',
        JSON.stringify({
          closed: window.__inputProbe.contexts.every((ctx) => ctx.state === 'closed'),
          graphs: window.__inputProbe.graphs,
        }),
      );
    }),
  );
  await page.getByRole('link', { name: /Switch to Vietnamese/ }).click();
  await expect(page).toHaveURL(/\/vi\/audio\/microphone$/);
  expect(
    await page.evaluate(() => JSON.parse(sessionStorage.getItem('__qa_input_cleanup') ?? '{}')),
  ).toEqual({ closed: true, graphs: 0 });
  expect(await page.evaluate(() => window.__inputProbe.calls)).toBe(0);
});
test('catalog, related links and command search apply microphone policy through document navigation', async ({
  page,
}) => {
  await page.goto('/en');
  const navigate = async (action: () => Promise<unknown>, path: string, mic: boolean) => {
    const response = page.waitForResponse(
      (response) =>
        response.request().isNavigationRequest() && new URL(response.url()).pathname === path,
    );
    await action();
    expect((await response).headers()['permissions-policy']).toBe(
      mic
        ? 'camera=(), microphone=(self), geolocation=()'
        : 'camera=(), microphone=(), geolocation=()',
    );
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  };
  await navigate(
    () => page.locator('.catalog-item[href="/en/audio/microphone"]').click(),
    '/en/audio/microphone',
    true,
  );
  await navigate(
    () => page.locator('a[href="/en/audio/spectrum"]').first().click(),
    '/en/audio/spectrum',
    true,
  );
  await page.getByRole('button', { name: 'Search testing tools', exact: true }).click();
  await page.getByRole('dialog').getByRole('textbox').fill('keyboard');
  await navigate(
    () => page.getByRole('dialog').locator('a[href="/en/keyboard/tester"]').click(),
    '/en/keyboard/tester',
    false,
  );
  await page.getByRole('button', { name: 'Search testing tools', exact: true }).click();
  await page.getByRole('dialog').getByRole('textbox').fill('microphone');
  await navigate(
    () => page.getByRole('dialog').locator('a[href="/en/audio/microphone"]').click(),
    '/en/audio/microphone',
    true,
  );
});
test('revocation releases the live stream and track mute/end clear stale readings', async ({
  page,
}) => {
  await nativeAudio(page);
  await inputFixture(page, 'tone');
  await page.goto('/en/audio/spectrum');
  await ready(page);
  await start(page);
  await expect(metric(page, 'Digital RMS amplitude')).not.toContainText('—');
  await page.evaluate(() => window.__inputProbe.mute?.(true));
  await expect(metric(page, 'Digital RMS amplitude')).toHaveText('—');
  await expect(page.getByText(/reports a muted input/)).toBeVisible();
  await page.evaluate(() => window.__inputProbe.mute?.(false));
  await expect(metric(page, 'Digital RMS amplitude')).not.toContainText('—');
  await page.evaluate(() => window.__inputProbe.end?.());
  await closed(page);
  await expect(page.locator('.status')).toHaveAttribute('data-state', 'warning');
  await start(page);
  await page.evaluate(() => window.__inputProbe.revoke?.());
  await closed(page);
  await expect(page.locator('.tool-workspace').getByRole('alert')).toContainText('refused');
});
test('blur and session deadline release real stream graphs without background continuation', async ({
  page,
}) => {
  await nativeAudio(page);
  await inputFixture(page, 'tone');
  await page.clock.install();
  await page.goto('/en/audio/microphone');
  await ready(page);
  await start(page);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await closed(page);
  await start(page);
  await page.clock.fastForward(60001);
  await closed(page);
  await expect(page.locator('.tool-workspace').getByRole('alert')).toContainText('60-second');
  expect(await page.evaluate(() => window.__inputProbe.stops)).toBe(2);
});
test('missing AudioContext never opens microphone and both locale fallbacks remain accessible', async ({
  page,
}) => {
  await inputFixture(page, 'missing-audio');
  for (const locale of ['en', 'vi'])
    for (const path of paths) {
      await page.goto(`/${locale}/audio/${path}`);
      await ready(page);
      await page
        .getByRole('button', { name: locale === 'en' ? 'Start' : 'Bắt đầu', exact: true })
        .click();
      await expect(page.locator('.status')).toHaveAttribute('data-state', 'unsupported');
      expect(await page.evaluate(() => window.__inputProbe.calls)).toBe(0);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
});
test('both input tools pass axe in Dark/Light with running and denied states', async ({ page }) => {
  test.setTimeout(180000);
  await nativeAudio(page);
  await inputFixture(page, 'tone');
  for (const path of paths) {
    await page.goto(`/en/audio/${path}`);
    await ready(page);
    for (const theme of ['dark', 'light']) {
      if ((await page.locator('html').getAttribute('data-theme')) !== theme)
        await page.getByRole('button', { name: 'Toggle light/dark theme' }).click();
      await start(page);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.evaluate(() => window.__inputProbe.revoke?.());
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  }
});
test('VI/EN input controls fit mobile/tablet/desktop widths and locale switch keeps route', async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const locale of ['en', 'vi'])
    for (const path of paths) {
      await page.goto(`/${locale}/audio/${path}`);
      await ready(page);
      for (const width of [320, 375, 414, 768, 1024, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale}/${path}/${width}`,
        ).toBe(true);
      }
    }
  await page.goto('/vi/audio/spectrum');
  await page.getByRole('link', { name: /Chuyển sang tiếng Anh/ }).click();
  await expect(page).toHaveURL(/\/en\/audio\/spectrum$/);
});
