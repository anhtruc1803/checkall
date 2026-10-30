import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const paths = [
  '/device/information',
  '/browser/compatibility',
  '/device/gpu',
  '/device/pointer-capabilities',
  '/browser/storage',
  '/browser/fullscreen',
  '/mouse/movement',
  '/mouse/accuracy',
];
const ready = async (page: Page) => {
  await expect(page.locator('.tool-workspace [aria-busy]')).toHaveAttribute('aria-busy', 'false');
};
const metric = (page: Page, name: string) =>
  page
    .locator('.metric')
    .filter({ has: page.getByText(name, { exact: true }) })
    .locator('dd');

test('device/browser snapshots are explicit, resettable and do not request permissions', async ({
  page,
}) => {
  await page.goto('/en/device/information');
  await ready(page);
  await expect(metric(page, 'Reported logical processors')).toContainText('—');
  await page.getByRole('button', { name: 'Read data' }).click();
  await expect(page.locator('.status')).toContainText('Completed');
  const processors = await page.evaluate(() => navigator.hardwareConcurrency);
  await expect(metric(page, 'Reported logical processors')).toHaveText(String(processors));
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(metric(page, 'Reported logical processors')).toContainText('—');
  await page.goto('/en/browser/compatibility');
  await ready(page);
  await page.getByRole('button', { name: 'Read data' }).click();
  await expect(page.locator('.status')).toContainText('Completed');
  await expect(page.locator('.inspection-list')).toContainText('Pointer Events API');
  await expect(page.locator('.inspection-list')).toContainText('Camera access / policy');
});
test('storage round-trip removes only its temporary keys and retains existing data', async ({
  page,
}) => {
  await page.goto('/en/browser/storage');
  await ready(page);
  await page.evaluate(() => {
    localStorage.setItem('other-app', 'keep');
    sessionStorage.setItem('other-session', 'keep');
  });
  await page.getByRole('button', { name: 'Read data' }).click();
  await expect(page.locator('.status')).toContainText('Completed');
  await expect(page.getByText('Round-trip passed', { exact: true })).toHaveCount(2);
  expect(
    await page.evaluate(() => ({
      other: localStorage.getItem('other-app'),
      session: sessionStorage.getItem('other-session'),
      probes: [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter((key) =>
        key.startsWith('device-lab:storage-probe:'),
      ),
    })),
  ).toEqual({ other: 'keep', session: 'keep', probes: [] });
});
test('GPU reads only on demand and supports honest unavailable contexts', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    const calls: string[] = [];
    Object.defineProperty(window, '__contextCalls', { value: calls });
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...options: unknown[]
    ) {
      calls.push(kind);
      return Reflect.apply(original, this, [kind, ...options]);
    } as typeof original;
  });
  await page.goto('/en/device/gpu');
  await ready(page);
  expect(
    await page.evaluate(() =>
      ((window as Window & { __contextCalls?: string[] }).__contextCalls ?? []).some((kind) =>
        kind.startsWith('webgl'),
      ),
    ),
  ).toBe(false);
  await expect(
    page.getByRole('checkbox', { name: 'Opt in to detailed renderer information' }),
  ).not.toBeChecked();
  await page.getByRole('button', { name: 'Read data' }).click();
  await expect(page.locator('.status')).toContainText(/Completed|Error/);
  expect(
    await page.evaluate(() => (window as Window & { __contextCalls?: string[] }).__contextCalls),
  ).toContain('webgl2');
  if (await page.getByText(/A WebGL context could not be read/).count())
    await expect(metric(page, 'Graphics API')).toContainText('—');
  else await expect(metric(page, 'Graphics API')).toContainText(/WebGL [12]/);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(metric(page, 'Graphics API')).toContainText('—');
});
test('blocked GPU and storage APIs produce fallback states rather than fabricated results', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...options: unknown[]
    ) {
      return kind.startsWith('webgl') ? null : Reflect.apply(original, this, [kind, ...options]);
    } as typeof original;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('blocked', 'SecurityError');
      },
    });
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      get() {
        throw new DOMException('blocked', 'SecurityError');
      },
    });
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: {
        estimate: () => Promise.reject(new Error('blocked')),
        persisted: () => Promise.reject(new Error('blocked')),
      },
    });
  });
  await page.goto('/en/device/gpu');
  await ready(page);
  await page.getByRole('button', { name: 'Read data' }).click();
  await expect(page.getByText(/A WebGL context could not be read/)).toBeVisible();
  await page.goto('/en/browser/storage');
  await ready(page);
  await page.getByRole('button', { name: 'Read data' }).click();
  await expect(page.locator('.status')).toContainText('Completed');
  await expect(page.getByText('Blocked or failed', { exact: true })).toHaveCount(2);
  await expect(metric(page, 'Estimated origin quota')).toContainText('—');
});
test('pointer capability sampling receives actual events and resets', async ({
  page,
  isMobile,
}) => {
  await page.goto('/en/device/pointer-capabilities');
  await ready(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  const area = page.getByTestId('pointer-capability-area');
  if (isMobile) {
    await area.tap();
    await expect(metric(page, 'Last observed pointer type')).toHaveText('Touch');
  } else {
    await area.hover();
    await page.mouse.down();
    await expect(metric(page, 'Active contacts in this test')).toHaveText('1');
    await page.mouse.up();
  }
  await expect(metric(page, 'Active contacts in this test')).toHaveText('0');
  await expect(metric(page, 'Observed samples')).not.toHaveText('0');
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(metric(page, 'Last observed pointer type')).toContainText('—');
  await expect(metric(page, 'Observed samples')).toHaveText('0');
});
test('mouse movement collects real positions, stops and resets', async ({ page }) => {
  await page.goto('/en/mouse/movement');
  await ready(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  const area = page.getByTestId('movement-area');
  await area.scrollIntoViewIfNeeded();
  const box = await area.boundingBox();
  if (!box) throw Error('missing region');
  expect(box.y + 100).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.mouse.move(box.x + 30, box.y + 50);
  await page.mouse.move(box.x + 100, box.y + 50);
  await page.mouse.move(box.x + 100, box.y + 100);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  const samples = await metric(page, 'Observed samples').textContent();
  expect(Number(samples)).toBeGreaterThanOrEqual(3);
  expect(
    parseFloat((await metric(page, 'Observed path length').textContent()) ?? '0'),
  ).toBeGreaterThanOrEqual(120);
  await page.mouse.move(box.x + 150, box.y + 100);
  await expect(metric(page, 'Observed samples')).toHaveText(samples!);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(metric(page, 'Observed path length')).toContainText('—');
});
test('accuracy scores real mouse attempts, ignores keyboard activation and completes ten targets', async ({
  page,
}) => {
  await page.goto('/en/mouse/accuracy');
  await ready(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  const target = page.getByTestId('accuracy-target');
  await target.focus();
  await page.keyboard.press('Enter');
  await expect(metric(page, 'Scored attempts')).toHaveText('0');
  await page.getByTestId('accuracy-area').click({ position: { x: 5, y: 5 } });
  await expect(metric(page, 'Misses')).toHaveText('1');
  for (let i = 0; i < 10; i++) await target.click();
  await expect(page.locator('.status')).toContainText('Completed');
  await expect(metric(page, 'Targets hit')).toHaveText('10 / 10');
  await expect(metric(page, 'Scored attempts')).toHaveText('11');
  await expect(metric(page, 'Task hit ratio')).toContainText('90.9');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(metric(page, 'Task hit ratio')).toContainText('—');
});
test('dedicated fullscreen enters/exits when supported and provides an inline fallback', async ({
  page,
}) => {
  await page.goto('/en/browser/fullscreen');
  await ready(page);
  const button = page.getByRole('button', { name: 'Fullscreen', exact: true });
  if (await button.isEnabled()) {
    await button.click();
    await expect(page.getByText('Fullscreen active', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click();
    await expect(page.getByText('Inline mode', { exact: true })).toBeVisible();
  } else await expect(page.getByText(/Fullscreen is unavailable/)).toBeVisible();
  expect(
    parseFloat((await metric(page, 'Rendered region width').textContent()) ?? '0'),
  ).toBeGreaterThan(0);
});
test('all eight tools pass automated WCAG AA checks in both themes', async ({ page }) => {
  test.setTimeout(240000);
  for (const path of paths) {
    await page.goto(`/en${path}`);
    await ready(page);
    for (const theme of ['dark', 'light']) {
      if ((await page.locator('html').getAttribute('data-theme')) !== theme)
        await page.getByRole('button', { name: 'Toggle light/dark theme' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => ({
            target: node.target,
            summary: node.failureSummary,
          })),
        })),
        `${path} / ${theme}`,
      ).toEqual([]);
    }
  }
});
test('new tool controls fit target widths and locale switching preserves the tool', async ({
  page,
}) => {
  test.setTimeout(180000);
  for (const path of paths) {
    await page.goto(`/vi${path}`);
    await ready(page);
    for (const width of [320, 375, 414, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page
        .locator('main button, main select, .header-actions button')
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              const box = element.getBoundingClientRect();
              return box.width > 0 && (box.left < 0 || box.right > innerWidth + 1);
            })
            .map((element) => element.textContent),
        );
      expect(overflow, `${path}/${width}`).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
  await page.goto('/vi/device/gpu');
  await page.getByRole('link', { name: /Chuyển sang tiếng Anh/ }).click();
  await expect(page).toHaveURL(/\/en\/device\/gpu$/);
});
