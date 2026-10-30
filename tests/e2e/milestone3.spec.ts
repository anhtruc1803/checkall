import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
declare global {
  interface Window {
    __audioProbe: {
      contexts: AudioContext[];
      oscillators: OscillatorNode[];
      gains: GainNode[];
      capture: number;
      permission: number;
    };
  }
}
const paths = ['speaker', 'stereo', 'frequency-generator'];
test.beforeEach(async ({ page }, testInfo) => {
  if (/missing AudioContext|forced unavailable/.test(testInfo.title)) return;
  const available = await page.evaluate(() => typeof AudioContext === 'function');
  // CI must execute real Web Audio coverage. Windows WebKit can lack the API entirely.
  if (process.env.CI)
    expect(available, 'CI requires native Web Audio, never a mocked replacement').toBe(true);
  test.skip(
    !available,
    'Native Web Audio is unavailable in this browser build; real playback requires Linux CI or hardware QA.',
  );
});
const ready = async (page: Page) =>
  expect(page.locator('.tool-workspace [aria-busy]')).toHaveAttribute('aria-busy', 'false');
const observe = async (page: Page) =>
  page.addInitScript(() => {
    const probe: Window['__audioProbe'] = {
      contexts: [],
      oscillators: [],
      gains: [],
      capture: 0,
      permission: 0,
    };
    window.__audioProbe = probe;
    const Native = window.AudioContext;
    window.AudioContext = class extends Native {
      constructor(options?: AudioContextOptions) {
        super(options);
        probe.contexts.push(this);
      }
      createOscillator() {
        const node = super.createOscillator();
        probe.oscillators.push(node);
        return node;
      }
      createGain() {
        const node = super.createGain();
        probe.gains.push(node);
        return node;
      }
    };
    if (navigator.mediaDevices)
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: () => {
          probe.capture++;
          return Promise.reject(new Error('unexpected capture'));
        },
      });
    if (navigator.permissions)
      Object.defineProperty(navigator.permissions, 'query', {
        configurable: true,
        value: () => {
          probe.permission++;
          return Promise.reject(new Error('unexpected query'));
        },
      });
  });
// Real Web Audio graph, muted deliberately: automation cannot establish physical audibility.
const mute = async (page: Page) => {
  const slider = page.getByRole('slider', { name: /Signal level/ });
  await slider.focus();
  await slider.press('Home');
  await expect(slider).toHaveValue('0');
};
const start = async (page: Page) => {
  await mute(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.status')).toContainText('Playing signal');
};
const closed = async (page: Page) =>
  expect
    .poll(() =>
      page.evaluate(() =>
        window.__audioProbe.contexts.every((context) => context.state === 'closed'),
      ),
    )
    .toBe(true);

test('all three audio tools are idle until Start and Stop/Reset release real audio without capture or persistence', async ({
  page,
}) => {
  await observe(page);
  for (const path of paths) {
    await page.goto(`/en/audio/${path}`);
    await ready(page);
    expect(await page.evaluate(() => window.__audioProbe.contexts.length)).toBe(0);
    await expect(page.locator('.metric dd').first()).toContainText('—');
    const storage = await page.evaluate(() => ({ ...localStorage }));
    await start(page);
    expect(
      await page.evaluate(() => ({
        contexts: window.__audioProbe.contexts.length,
        capture: window.__audioProbe.capture,
        permission: window.__audioProbe.permission,
        level: window.__audioProbe.gains[2].gain.value,
      })),
    ).toEqual({ contexts: 1, capture: 0, permission: 0, level: 0 });
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    await closed(page);
    await expect(page.locator('.status')).toContainText('Stopped');
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.locator('.metric dd').first()).toContainText('—');
    expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(storage);
  }
});
test('stereo switches left/right/both on the same real oscillator', async ({ page }) => {
  await observe(page);
  await page.goto('/en/audio/stereo');
  await ready(page);
  await page.getByRole('combobox', { name: 'Output channel' }).selectOption('left');
  await start(page);
  expect(
    await page.evaluate(() => window.__audioProbe.gains.slice(0, 2).map((node) => node.gain.value)),
  ).toEqual([1, 0]);
  for (const [channel, expected] of [
    ['right', [0, 1]],
    ['both', [1, 1]],
  ] as const) {
    await page.getByRole('combobox', { name: 'Output channel' }).selectOption(channel);
    await expect
      .poll(() =>
        page.evaluate(() =>
          window.__audioProbe.gains.slice(0, 2).map((node) => Math.round(node.gain.value)),
        ),
      )
      .toEqual(expected);
  }
  expect(await page.evaluate(() => window.__audioProbe.oscillators.length)).toBe(1);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await closed(page);
});
test('generator updates real frequency/waveform and stops invalid input without synthetic readings', async ({
  page,
}) => {
  await observe(page);
  await page.goto('/en/audio/frequency-generator');
  await ready(page);
  const frequency = page.getByRole('spinbutton', { name: 'Frequency (Hz)' });
  await frequency.fill('1000');
  await page.getByRole('combobox', { name: 'Waveform' }).selectOption('triangle');
  await start(page);
  await expect
    .poll(() => page.evaluate(() => Math.round(window.__audioProbe.oscillators[0].frequency.value)))
    .toBe(1000);
  await frequency.fill('2000');
  await page.getByRole('combobox', { name: 'Waveform' }).selectOption('square');
  await expect
    .poll(() => page.evaluate(() => Math.round(window.__audioProbe.oscillators[0].frequency.value)))
    .toBe(2000);
  expect(await page.evaluate(() => window.__audioProbe.oscillators[0].type)).toBe('square');
  expect(await page.evaluate(() => window.__audioProbe.oscillators.length)).toBe(1);
  const sampleRate = await page.evaluate(() => window.__audioProbe.contexts[0].sampleRate);
  await expect(page.locator('.metric dd').nth(1)).toContainText(String(sampleRate));
  await frequency.fill('');
  await expect(frequency).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeDisabled();
  await expect(page.locator('.status')).toContainText('Error');
  await closed(page);
});
test('audio automatically ends after its real ten-second limit', async ({ page }) => {
  await observe(page);
  await page.goto('/en/audio/speaker');
  await ready(page);
  await start(page);
  await expect(page.locator('.status')).toContainText('Completed', { timeout: 15000 });
  await closed(page);
});
test('focus loss and SPA navigation release audio; returning does not restart', async ({
  page,
}) => {
  await observe(page);
  await page.goto('/en/audio/speaker');
  await ready(page);
  await start(page);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('.status')).toContainText('Warning');
  await closed(page);
  await start(page);
  await page.getByRole('link', { name: /Switch to Vietnamese/ }).click();
  await expect(page).toHaveURL(/\/vi\/audio\/speaker$/);
  await ready(page);
  await closed(page);
  await expect(page.locator('.status')).not.toHaveAttribute('data-state', 'running');
});
test('missing AudioContext and rejected playback remain explicit failures', async ({ page }) => {
  await page.addInitScript(() => {
    class BlockedContext {
      sampleRate = 48000;
      state = 'suspended';
      onstatechange = null;
      resume() {
        return Promise.reject(new DOMException('blocked', 'NotAllowedError'));
      }
      close() {
        this.state = 'closed';
        return Promise.resolve();
      }
    }
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: location.search.includes('blocked') ? BlockedContext : undefined,
    });
  });
  await page.goto('/en/audio/speaker');
  await expect(page.getByText(/Not supported by this browser or device/)).toBeVisible();
  await page.goto('/en/audio/speaker?blocked=1');
  await ready(page);
  await mute(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.status')).toContainText('Error');
  await expect(page.locator('.tool-workspace').getByRole('alert')).toContainText('not allowed');
});
test('forced unavailable audio pages expose honest fallback in VI/EN, both themes and target widths', async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.addInitScript(() =>
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: undefined }),
  );
  for (const locale of ['vi', 'en'])
    for (const path of paths) {
      await page.goto(`/${locale}/audio/${path}`);
      await expect(page.locator('.tool-workspace')).toContainText(
        locale === 'en'
          ? 'Not supported by this browser or device.'
          : 'Không được hỗ trợ trên trình duyệt hoặc thiết bị này.',
      );
      await expect(page.locator('.tool-workspace button')).toHaveCount(0);
      for (const theme of ['dark', 'light']) {
        if ((await page.locator('html').getAttribute('data-theme')) !== theme)
          await page
            .getByRole('button', {
              name: locale === 'en' ? 'Toggle light/dark theme' : 'Đổi giao diện sáng/tối',
            })
            .click();
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
      }
      for (const width of [320, 375, 414, 768, 1024]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    }
});
test('audio pages pass axe in both themes, including running and invalid states', async ({
  page,
}) => {
  test.setTimeout(180000);
  for (const path of paths) {
    await page.goto(`/en/audio/${path}`);
    await ready(page);
    for (const theme of ['dark', 'light']) {
      if ((await page.locator('html').getAttribute('data-theme')) !== theme)
        await page.getByRole('button', { name: 'Toggle light/dark theme' }).click();
      await start(page);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations.map((item) => ({
          id: item.id,
          nodes: item.nodes.map((node) => node.target),
        })),
        `${path}/${theme}`,
      ).toEqual([]);
      await page.getByRole('button', { name: 'Stop', exact: true }).click();
    }
    if (path === 'frequency-generator') {
      await page.getByRole('spinbutton').fill('');
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
test('VI/EN audio controls fit mobile/tablet/desktop widths and locale preserves route', async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const locale of ['vi', 'en'])
    for (const path of paths) {
      await page.goto(`/${locale}/audio/${path}`);
      await ready(page);
      for (const width of [320, 375, 414, 768, 1024, 1150, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${locale}/${path}/${width}`,
        ).toBe(true);
        expect(
          await page
            .locator('main button, main select, main input, .header-actions button')
            .evaluateAll((elements) =>
              elements
                .filter((element) => {
                  const rect = element.getBoundingClientRect();
                  return rect.width > 0 && (rect.left < 0 || rect.right > innerWidth + 1);
                })
                .map((element) => element.textContent),
            ),
        ).toEqual([]);
      }
    }
  await page.goto('/vi/audio/stereo');
  await page.getByRole('link', { name: /Chuyển sang tiếng Anh/ }).click();
  await expect(page).toHaveURL(/\/en\/audio\/stereo$/);
});
