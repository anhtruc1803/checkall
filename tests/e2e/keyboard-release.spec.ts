import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const copy = (locale: string) =>
  locale === 'vi'
    ? {
        toggle: 'Tương thích EVKey qua keyup (A–Z)',
        activate: 'Kích hoạt vùng thử',
        exit: 'Thoát vùng thử',
        reset: 'Đặt lại',
        received: 'Đã nhận qua keyup',
      }
    : {
        toggle: 'EVKey compatibility via keyup (A–Z)',
        activate: 'Activate test area',
        exit: 'Exit test area',
        reset: 'Reset',
        received: 'Received via keyup',
      };

test('letter recognition survives IME fixtures without entering press statistics in VI/EN', async ({
  page,
}) => {
  test.info().annotations.push({
    type: 'fixture',
    description:
      'Browser key input plus synthetic Unicode/Backspace replacement, not native EVKey certification.',
  });
  for (const locale of ['vi', 'en']) {
    const c = copy(locale);
    await page.goto(`/${locale}/keyboard/tester`);
    const toggle = page.getByRole('checkbox', { name: c.toggle, exact: true });
    const activate = page.getByRole('button', { name: c.activate, exact: true });
    const area = page.locator('.keyboard-capture');
    await expect(toggle).not.toBeChecked();
    await activate.click();
    await page.keyboard.press('a');
    await expect(page.locator('[data-code=KeyA] .key-count')).toHaveText('✓ 1');
    await toggle.check();
    await expect(area).toHaveAttribute('data-active', 'false');
    await expect(page.getByRole('progressbar')).toHaveAttribute('max', '26');
    await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
    await activate.click();
    await page.keyboard.down('d');
    await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
    await area.dispatchEvent('keydown', { key: '·', code: '', keyCode: 231 });
    await area.dispatchEvent('keydown', { key: 'Backspace', code: 'Backspace' });
    await area.dispatchEvent('keyup', { key: 'Backspace', code: 'Backspace' });
    await area.dispatchEvent('keyup', { key: 'đ', code: '', keyCode: 231 });
    await page.keyboard.up('d');
    await page.keyboard.press('d');
    await expect(area).toHaveAttribute('data-active', 'true');
    await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
    const d = page.locator('[data-code=KeyD]');
    await expect(d).toHaveAttribute('data-received-via', 'keyup');
    await expect(d).toHaveAttribute('aria-label', `KeyD: ${c.received}`);
    await expect(d).toHaveAttribute('data-tested', 'false');
    await expect(d).toHaveAttribute('data-held', 'false');
    await expect(d.locator('.key-count')).toHaveCount(0);
    await expect(page.locator('[data-code=Backspace]')).not.toHaveAttribute('data-received-via');
    await expect(page.locator('.tool-workspace dl')).toHaveCount(0);
    await expect(page.locator('.keyboard-input-issue')).toHaveCount(0);
    await page.getByRole('button', { name: c.exit, exact: true }).click();
    await expect(area).toHaveAttribute('data-active', 'false');
    await toggle.uncheck();
    await expect(page.locator('.keyboard-release-result')).toHaveCount(0);
    await expect(page.locator('.tool-workspace .results-grid dd')).toHaveText([
      '0',
      '0',
      '0',
      '0',
      '0',
    ]);
    await activate.click();
    await page.keyboard.press('d');
    await expect(d.locator('.key-count')).toHaveText('✓ 1');
    await expect(d).not.toHaveAttribute('data-received-via');
  }
});

test('dd advice is localized, accessible and separate from measurements in both modes', async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const locale of ['vi', 'en']) {
    const c = copy(locale);
    await page.goto(`/${locale}/keyboard/tester`);
    const area = page.locator('.keyboard-capture');
    const warning = page.locator('.keyboard-dd-warning');
    const title =
      locale === 'vi'
        ? 'Lưu ý bộ gõ khi thử D liên tiếp'
        : 'Check your input method when testing D repeatedly';
    await expect(page.locator('.keyboard-dd-note')).toContainText('dd → đ');
    for (const releaseMode of [false, true]) {
      await page.getByRole('checkbox', { name: c.toggle, exact: true }).setChecked(releaseMode);
      await expect(warning).toHaveCount(0);
      await page.getByRole('button', { name: c.activate, exact: true }).click();
      await page.keyboard.press('d');
      await expect(warning).toHaveCount(0);
      await page.keyboard.press('d');
      await expect(warning).toHaveAttribute('role', 'status');
      await expect(warning).toContainText(title);
      await expect(warning).toContainText('Backspace');
      if (releaseMode) {
        await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
        await expect(page.locator('.tool-workspace dl')).toHaveCount(0);
        await expect(page.locator('[data-code=KeyD] .key-count')).toHaveCount(0);
        await expect(page.locator('[data-code=Backspace]')).toHaveAttribute('data-tested', 'false');
      } else {
        await expect(page.locator('[data-code=KeyD] .key-count')).toHaveText('✓ 2');
      }
      await page.keyboard.press('Escape');
      await expect(area).toHaveAttribute('data-active', 'false');
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
      await page.setViewportSize({ width: 320, height: 900 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%';
      });
      const overflow = await warning.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.left < -1 || r.right > innerWidth + 1 || el.scrollWidth > el.clientWidth + 1;
      });
      expect(overflow).toBe(false);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '100%';
      });
      await page.getByRole('button', { name: c.reset, exact: true }).click();
      await expect(warning).toHaveCount(0);
      await expect(page.locator('.keyboard-dd-note')).toBeVisible();
    }
  }
});

test('release mode exits safely, resets separately and is never available in measurement tools', async ({
  page,
}) => {
  test.info().annotations.push({
    type: 'fixture',
    description:
      'Composition is a synthetic fixture; native key input verifies exit and focus behavior.',
  });
  const c = copy('en');
  await page.goto('/en/keyboard/tester');
  await page.getByRole('checkbox', { name: c.toggle, exact: true }).check();
  const activate = page.getByRole('button', { name: c.activate, exact: true });
  const area = page.locator('.keyboard-capture');
  await activate.click();
  await area.dispatchEvent('compositionstart');
  await area.dispatchEvent('keyup', { key: 'd', code: 'KeyD' });
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  await area.dispatchEvent('compositionend');
  await page.keyboard.press('d');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
  await page.keyboard.press('Tab');
  await expect(area).toHaveAttribute('data-active', 'false');
  await page.keyboard.press('q');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
  await activate.click();
  await page.keyboard.press('Escape');
  await expect(area).toHaveAttribute('data-active', 'false');
  await expect(page.locator('[data-code=Escape]')).not.toHaveAttribute('data-received-via');
  await page.setViewportSize({ width: 375, height: 900 });
  await page.locator('.keyboard-diagram').focus();
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(() => page.locator('.keyboard-diagram').evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: c.reset, exact: true }).click();
  await expect(page.getByRole('checkbox', { name: c.toggle, exact: true })).toBeChecked();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  for (const slug of ['rollover', 'chatter', 'hold', 'events']) {
    await page.goto(`/en/keyboard/${slug}`);
    await expect(page.getByRole('checkbox', { name: c.toggle, exact: true })).toHaveCount(0);
    await expect(page.locator('.keyboard-capture')).toHaveAttribute('data-mode', 'standard');
    await expect(page.locator('.keyboard-release-result')).toHaveCount(0);
  }
});

test('mode controls and release results remain accessible across themes, locales and responsive sizes', async ({
  page,
}) => {
  test.setTimeout(180000);
  for (const locale of ['vi', 'en']) {
    const c = copy(locale);
    await page.goto(`/${locale}/keyboard/tester`);
    for (const releaseMode of [false, true]) {
      await page.getByRole('checkbox', { name: c.toggle, exact: true }).setChecked(releaseMode);
      await page.getByRole('button', { name: c.activate, exact: true }).click();
      await page.keyboard.press('d');
      await page.keyboard.press('Escape');
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
      expect(
        (await new AxeBuilder({ page }).withRules(['heading-order']).analyze()).violations,
      ).toEqual([]);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = '200%';
        });
        const overflow = await page
          .locator(
            '.keyboard-release-toggle, .keyboard-input-help, .keyboard-release-result, .keyboard-progress, .keyboard-notice',
          )
          .evaluateAll((elements) =>
            elements
              .filter((el) => {
                const r = el.getBoundingClientRect();
                return (
                  r.width > 0 &&
                  (r.left < -1 || r.right > innerWidth + 1 || el.scrollWidth > el.clientWidth + 1)
                );
              })
              .map((el) => el.className),
          );
        expect(overflow, `${locale}/${releaseMode}/${width}`).toEqual([]);
        const target = await page.locator('.keyboard-release-toggle').boundingBox();
        expect(target!.height).toBeGreaterThanOrEqual(44);
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '100%';
      });
    }
  }
});
