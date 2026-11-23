import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import vi from '../../src/messages/vi.json';
import en from '../../src/messages/en.json';

test('inspector keeps D releases and Telex replacement diagnostics distinct in both locales', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const locale of ['vi', 'en'] as const) {
    const message = locale === 'vi' ? vi : en;
    const keyboard = message.keyboardTools;
    await page.goto(`/${locale}/keyboard/events`);
    const activate = page.getByRole('button', { name: message.activate, exact: true });
    const area = page.locator('.keyboard-capture');
    const latest = page.getByRole('region', { name: keyboard.latestEvent, exact: true });
    const events = page.locator('.keyboard-event-row');
    await expect(latest).toContainText(keyboard.inspector.empty);
    await expect(page.locator('.keyboard-inspector-tip')).toHaveText(keyboard.inspector.ddTip);

    await activate.click();
    await page.keyboard.down('d');
    await expect(latest.locator('.keyboard-event-type')).toHaveText('keydown');
    await expect(latest.locator('.keyboard-readout-values')).toHaveText('keydcodeKeyD');
    await page.keyboard.up('d');
    await expect(latest.locator('.keyboard-event-type')).toHaveText('keyup');
    await page.keyboard.press('d');
    await expect(events).toHaveCount(4);
    await expect(events.filter({ hasText: 'Backspace' })).toHaveCount(0);
    await expect(page.locator('[data-code="KeyD"] .key-count')).toHaveText('✓ 2');
    await page.getByRole('button', { name: message.deactivate, exact: true }).click();

    // Replay only signals observed in EVKey diagnostics, without assuming their physical source.
    await activate.click();
    await page.keyboard.press('d');
    await area.dispatchEvent('keydown', { key: 'Backspace', code: 'Backspace' });
    await area.dispatchEvent('keyup', { key: 'Backspace', code: 'Backspace' });
    await area.dispatchEvent('keydown', { key: 'đ', code: '', keyCode: 231 });
    await expect(area).toHaveAttribute('data-active', 'false');
    await expect(latest.locator('.keyboard-readout-values')).toHaveText('keyđcode""');
    await expect(latest).toContainText(keyboard.inspector.missingCode);
    await expect(page.locator('[data-code="KeyD"] .key-count')).toHaveText('✓ 2');
    await expect(page.locator('[data-code="Backspace"]')).toHaveAttribute('data-tested', 'false');
    await area.dispatchEvent('keyup', { key: 'd', code: 'KeyD' });
    await expect(events).toHaveCount(9);

    const details = page.getByRole('button', {
      name: keyboard.inspector.eventDetails.replace('{sequence}', '9'),
      exact: true,
    });
    await details.focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.locator('.keyboard-event-expanded').getByText('keyCode', { exact: true }).locator('..'),
    ).toHaveText('keyCode231');
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.keyboard-event-expanded')).toHaveCount(0);

    await page.getByLabel(keyboard.eventType, { exact: true }).selectOption('keyup');
    await page.getByRole('searchbox', { name: keyboard.filterEvents }).fill('KeyD');
    await expect(events).toHaveCount(3);
    for (const row of await events.all())
      await expect(row).toHaveAttribute('data-event-type', 'keyup');
    await expect(latest.locator('.keyboard-readout-values')).toHaveText('keyđcode""');
    await page.getByRole('button', { name: keyboard.clearLog, exact: true }).click();
    await expect(events).toHaveCount(0);
    await expect(page.locator('[data-code="KeyD"] .key-count')).toHaveText('✓ 2');
    await page.getByRole('button', { name: message.reset, exact: true }).click();
    await expect(latest).toContainText(keyboard.inspector.empty);
  }
});

test('inspector places the live readout beside the keyboard with mobile reflow and accessible event details', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/vi/keyboard/events');
  await page.getByRole('button', { name: vi.activate, exact: true }).click();
  await page.keyboard.press('d');
  await page.getByRole('button', { name: vi.deactivate, exact: true }).click();
  const latest = page.locator('.keyboard-event-readout');
  const area = page.locator('.keyboard-capture');
  const [readout, board] = await Promise.all([latest.boundingBox(), area.boundingBox()]);
  expect(readout!.x).toBeGreaterThanOrEqual(board!.x + board!.width);
  expect(readout!.y).toBeCloseTo(board!.y, 0);
  await page.locator('.keyboard-event-row').first().getByRole('button').click();
  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => (document.documentElement.dataset.theme = value), theme);
    const scan = await new AxeBuilder({ page })
      .include('.tool-workspace')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      scan.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })),
      theme,
    ).toEqual([]);
  }
  for (const width of [320, 375, 414, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `${width}px`,
    ).toBe(true);
    expect(
      await page
        .locator('.keyboard-event-table')
        .evaluate((table) => table.scrollWidth <= table.clientWidth + 1),
      `Event log at ${width}px`,
    ).toBe(true);
    const [mobileReadout, mobileBoard] = await Promise.all([
      latest.boundingBox(),
      area.boundingBox(),
    ]);
    expect(mobileReadout!.y + mobileReadout!.height).toBeLessThanOrEqual(mobileBoard!.y);
    expect(mobileReadout!.x + mobileReadout!.width).toBeLessThanOrEqual(width);
  }
});
