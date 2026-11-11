import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('repeated D and genuine Backspace remain distinct; ambiguous replacement rolls back only its capture', async ({
  page,
}) => {
  test.setTimeout(90000);
  test.info().annotations.push({
    type: 'fixture',
    description:
      'Browser keyboard input plus an explicit synthetic missing-code fixture; not real UniKey/EVKey verification.',
  });
  for (const locale of ['vi', 'en']) {
    await page.goto(`/${locale}/keyboard/tester`);
    const activate = page.getByRole('button', {
      name: locale === 'vi' ? 'Kích hoạt vùng thử' : 'Activate test area',
      exact: true,
    });
    const exit = page.getByRole('button', {
      name: locale === 'vi' ? 'Thoát vùng thử' : 'Exit test area',
      exact: true,
    });
    const area = page.locator('.keyboard-capture');
    const d = page.locator('[data-code="KeyD"] .key-count');
    const backspace = page.locator('[data-code="Backspace"]');
    await activate.click();
    for (let i = 0; i < 3; i++) await page.keyboard.press('d');
    await expect(d).toHaveText('✓ 3');
    await expect(backspace).toHaveAttribute('data-tested', 'false');
    await page.keyboard.press('Backspace');
    await expect(backspace.locator('.key-count')).toHaveText('✓ 1');
    await exit.click();
    await activate.click();
    await page.keyboard.press('d');
    await page.keyboard.press('Backspace');
    // Some input layers expose the replacement before an unidentified event.
    await area.dispatchEvent('keydown', { key: 'đ', code: '' });
    await expect(area).toHaveAttribute('data-active', 'false');
    await expect(d).toHaveText('✓ 3');
    await expect(backspace.locator('.key-count')).toHaveText('✓ 1');
    await expect(page.locator('.keyboard-input-issue[role=alert]')).toBeVisible();
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      expect(
        (
          await new AxeBuilder({ page })
            .include('.tool-workspace')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await activate.click();
    await page.keyboard.press('d');
    await expect(d).toHaveText('✓ 4');
    await expect(page.locator('.keyboard-input-issue[role=alert]')).toHaveCount(0);
    await expect(area).toBeFocused();
    expect(await area.evaluate((element) => getComputedStyle(element).outlineOffset)).toBe('-3px');
    const hint = page.locator('#keyboard-diagram-hint');
    const captureBounds = await area.boundingBox(),
      hintBounds = await hint.boundingBox();
    expect(captureBounds).not.toBeNull();
    expect(hintBounds).not.toBeNull();
    expect(hintBounds!.y + hintBounds!.height).toBeLessThan(
      captureBounds!.y + captureBounds!.height - 3,
    );
    await exit.click();
  }
});

test('IME 229 stops capture even without isComposing; later replacement events are ignored', async ({
  page,
}) => {
  test.info().annotations.push({
    type: 'fixture',
    description: 'Synthetic legacy IME 229 and replacement events, not OS input-method QA.',
  });
  await page.goto('/en/keyboard/events');
  await page.getByRole('button', { name: 'Activate test area', exact: true }).click();
  const area = page.locator('.keyboard-capture');
  await page.keyboard.press('d');
  await area.dispatchEvent('keydown', {
    key: 'Backspace',
    code: 'Backspace',
    keyCode: 229,
    isComposing: false,
  });
  await expect(area).toHaveAttribute('data-active', 'false');
  for (let i = 0; i < 22; i++) {
    await area.dispatchEvent('keydown', { key: 'Backspace', code: 'Backspace' });
    await area.dispatchEvent('keyup', { key: 'Backspace', code: 'Backspace' });
  }
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  await expect(page.locator('[data-code="Backspace"]')).toHaveAttribute('data-tested', 'false');
  await expect(page.locator('.keyboard-input-issue[role=alert]')).toContainText('IME/composition');
  const row = page.locator('.keyboard-event-table tbody tr').first();
  await expect(row).toContainText('Backspace');
  await expect(row).toContainText('229');
  await expect(row.locator('td').nth(6)).toHaveText('false');
});
