import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import en from '../../src/messages/en.json';
import vi from '../../src/messages/vi.json';

const workspace = '[data-typing-state]';

test('Vietnamese typing runs exactly 60 seconds and waits for committed composition', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/en/keyboard/vietnamese-typing');
  const input = page.getByRole('textbox', { name: en.typing.input });
  const timer = page.getByTestId('typing-timer');
  const progress = page.getByTestId('typing-time-progress');
  await expect(input).toBeEditable();
  await expect(timer).toHaveText('1:00');
  await expect(progress).toHaveAttribute('value', '60000');
  expect(
    await input.evaluate((field) =>
      field.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true })),
    ),
  ).toBe(false);
  await expect(page.getByText(en.typing.pasteBlocked)).toBeVisible();
  await input.evaluate((field: HTMLTextAreaElement) => {
    field.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    field.value = 'Buo';
    field.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
  });
  await page.clock.fastForward(5000);
  await expect(page.locator(workspace)).toHaveAttribute('data-typing-state', 'ready');
  await input.evaluate((field: HTMLTextAreaElement) => {
    field.value = 'Buổi';
    field.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: 'Buổi' }));
  });
  await expect(page.locator(workspace)).toHaveAttribute('data-typing-state', 'active');
  await page.clock.fastForward(58_000);
  await expect(page.getByRole('heading', { name: en.typing.result })).toHaveCount(0);
  await page.clock.fastForward(2000);
  await expect(timer).toHaveText('0:00');
  await expect(progress).toHaveAttribute('value', '0');
  await expect(input).toHaveAttribute('readonly', '');
  const results = page.getByRole('region', { name: en.typing.result });
  await expect(
    results.locator('.metric').filter({ hasText: en.typing.cpm }).locator('dd'),
  ).toHaveText('4');
  await expect(
    results.locator('.metric').filter({ hasText: en.typing.wpm }).locator('dd'),
  ).toHaveText('0.8');
  await expect(
    results.locator('.metric').filter({ hasText: en.typing.accuracy }).locator('dd'),
  ).toHaveText('100%');
  await page.getByRole('button', { name: en.typing.reset }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(timer).toHaveText('1:00');
});

test('free practice scores the final text after an EVKey-style rewrite and reports accent errors', async ({
  page,
}) => {
  await page.goto('/vi/keyboard/vietnamese-typing');
  const input = page.getByRole('textbox', { name: vi.typing.input });
  await page.getByRole('button', { name: vi.typing.practice }).click();
  const lesson = page.getByLabel(vi.typing.lesson, { exact: true });
  await expect(lesson).toHaveValue('accents');
  await expect(lesson.locator('option')).toHaveText([
    vi.typing.lessons.accents,
    vi.typing.lessons.everyday,
  ]);
  await lesson.selectOption('everyday');
  const prefix = 'Trước khi gửi thư, mình ';
  await input.fill(prefix);
  await input.press('End');
  await input.press('d');
  await input.press('Backspace');
  await page.keyboard.insertText('đ');
  await expect(input).toHaveValue(`${prefix}đ`);
  await expect(page.locator('[data-character="correct"]')).toHaveText(`${prefix}đ`);
  await page.getByRole('button', { name: vi.typing.finish }).click();
  await expect(page.locator('[data-typing-error="letterD"]')).toHaveText('0');
  await expect(
    page.locator('.metric').filter({ hasText: vi.typing.accuracy }).locator('dd'),
  ).toHaveText('100%');
  await page.getByRole('button', { name: vi.typing.reset }).click();
  await page.keyboard.insertText('Truớc khi gưi thư, mình dọc');
  await page.getByRole('button', { name: vi.typing.finish }).click();
  await expect(page.locator('[data-typing-error="letterD"]')).toHaveText('1');
  await expect(page.locator('[data-typing-error="tone"]')).toHaveText('1');
  await expect(page.locator('[data-typing-error="vowel"]')).toHaveText('1');
  await lesson.selectOption('accents');
  await expect(input).toHaveValue('');
  await expect(page.getByRole('heading', { name: vi.typing.result })).toHaveCount(0);
});

test('typing controls and results reflow with 200% text in both themes', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/en/keyboard/vietnamese-typing');
  await page.getByRole('button', { name: en.typing.practice }).click();
  const lesson = page.getByLabel(en.typing.lesson, { exact: true });
  await expect(lesson).toHaveValue('accents');
  await expect(lesson.locator('option')).toHaveText([
    en.typing.lessons.accents,
    en.typing.lessons.everyday,
  ]);
  await page.getByRole('textbox', { name: en.typing.input }).fill('Buổi sáng');
  await page.getByRole('button', { name: en.typing.finish }).click();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  for (const theme of ['dark', 'light']) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    const overflow = await page
      .locator(`${workspace} button, ${workspace} textarea, ${workspace} select, ${workspace} dd`)
      .evaluateAll((items) =>
        items
          .filter((item) => {
            const rect = item.getBoundingClientRect();
            return (
              rect.left < -1 ||
              rect.right > innerWidth + 1 ||
              item.scrollWidth > item.clientWidth + 1
            );
          })
          .map((item) => item.textContent),
      );
    expect(overflow).toEqual([]);
    expect(
      (
        await new AxeBuilder({ page })
          .include(workspace)
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});
