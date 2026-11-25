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
  await expect(lesson).toHaveValue('homeRow');
  await expect(lesson.locator('option')).toHaveText([
    vi.typing.lessons.homeRow,
    vi.typing.lessons.accents,
    vi.typing.lessons.shortNote,
  ]);
  await page.locator('button[data-level="medium"]').click();
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
  await lesson.selectOption('market');
  await expect(input).toHaveValue('');
  await expect(page.getByRole('heading', { name: vi.typing.result })).toHaveCount(0);
});

test('typing controls and results reflow with 200% text in both themes', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/en/keyboard/vietnamese-typing');
  await page.getByRole('button', { name: en.typing.practice }).click();
  const lesson = page.getByLabel(en.typing.lesson, { exact: true });
  await expect(lesson).toHaveValue('homeRow');
  await expect(lesson.locator('option')).toHaveText([
    en.typing.lessons.homeRow,
    en.typing.lessons.accents,
    en.typing.lessons.shortNote,
  ]);
  await lesson.selectOption('accents');
  await page.getByText(en.typing.guide.title, { exact: true }).click();
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
      .locator(
        `${workspace} button, ${workspace} textarea, ${workspace} select, ${workspace} dd, ${workspace} summary, ${workspace} [data-key]`,
      )
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

test('all nine lessons are selectable and the guide follows the sample on the home row', async ({
  page,
}) => {
  await page.goto('/vi/keyboard/vietnamese-typing');
  await page.getByRole('button', { name: vi.typing.practice }).click();
  const selector = page.getByLabel(vi.typing.lesson, { exact: true });
  for (const [level, labels] of [
    ['easy', [vi.typing.lessons.homeRow, vi.typing.lessons.accents, vi.typing.lessons.shortNote]],
    ['medium', [vi.typing.lessons.everyday, vi.typing.lessons.market, vi.typing.lessons.weekend]],
    ['hard', [vi.typing.lessons.schedule, vi.typing.lessons.weather, vi.typing.lessons.receipt]],
  ] as const) {
    await page.locator(`button[data-level="${level}"]`).click();
    await expect(selector.locator('option')).toHaveText([...labels]);
  }
  await page.locator('button[data-level="easy"]').click();
  const input = page.getByRole('textbox', { name: vi.typing.input });
  await page.getByText(vi.typing.guide.title, { exact: true }).click();
  const guide = page.locator('details').filter({ hasText: vi.typing.guide.title });
  await expect(guide.locator('[data-home="true"]')).toHaveText(['F', 'J']);
  await expect(guide.locator('[data-next-key="true"]')).toHaveText('A');
  await input.fill('asdf ');
  await expect(guide.locator('[data-next-key="true"]')).toHaveText('J');
  await expect(guide.locator('kbd')).toHaveText('J');
  await page.getByRole('button', { name: vi.typing.finish }).click();
  await expect(page.getByRole('button', { name: vi.typing.history.save })).toHaveCount(0);
  await page.getByRole('button', { name: vi.typing.nextLesson }).click();
  await expect(selector).toHaveValue('accents');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('');
});

test('60-second history saves only on opt-in and click, follows difficulty, and clears with local data', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.clock.install();
  await page.goto('/en/keyboard/vietnamese-typing');
  const input = page.getByRole('textbox', { name: en.typing.input });
  const history = page.getByRole('region', { name: en.typing.history.title });
  const save = page.getByRole('button', { name: en.typing.history.save, exact: true });
  const storage = () => page.evaluate(() => localStorage.getItem('device-lab:summaries'));
  await input.fill('Buổi');
  await expect(page.locator(workspace)).toHaveAttribute('data-typing-state', 'active');
  await page.clock.fastForward(61_000);
  await expect(save).toBeDisabled();
  expect(await storage()).toBeNull();
  await page.getByRole('checkbox', { name: en.typing.history.allow }).check();
  expect(await storage()).toBeNull();
  await save.click();
  await expect(page.getByRole('button', { name: en.typing.history.saved })).toBeDisabled();
  await expect(history.getByRole('listitem')).toHaveCount(1);
  await page.getByRole('button', { name: en.typing.reset }).click();
  await input.fill('Buổi xáng');
  await expect(page.locator(workspace)).toHaveAttribute('data-typing-state', 'active');
  await page.clock.fastForward(61_000);
  await save.click();
  await expect(history.getByRole('listitem')).toHaveCount(2);
  await expect(history.locator('[data-metric="wpm"] [data-selected]')).toHaveCount(2);
  await expect(history.getByRole('listitem').first()).toContainText('1.6 WPM');
  await expect(history.getByRole('listitem').first()).toContainText('88.9%');
  await history.getByRole('button', { name: en.typing.accuracy }).click();
  await expect(history.locator('[data-metric="accuracy"]')).toBeVisible();
  await history.getByRole('button', { name: /^Attempt 1/ }).click();
  await expect(history.getByRole('button', { name: /^Attempt 1/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const saved = JSON.parse((await storage()) ?? '[]');
  expect(saved).toHaveLength(2);
  expect(saved[0]).toEqual({
    toolId: 'B06',
    time: expect.any(String),
    value: '1.6 WPM · 88.9%',
    typing: { difficulty: 'medium', wpm: 1.6, accuracy: expect.closeTo(88.89) },
  });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  expect(
    await history.evaluate((element) => element.scrollWidth - element.clientWidth),
  ).toBeLessThanOrEqual(1);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[aria-labelledby="typing-history-label"]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByLabel(en.typing.history.level).selectOption('easy');
  await expect(history.getByText(en.typing.history.empty)).toBeVisible();
  await page.locator('button[data-level="easy"]').click();
  await expect(page.getByTestId('typing-timer')).toHaveText('1:00');
  await input.fill('Sáng');
  await expect(page.locator(workspace)).toHaveAttribute('data-typing-state', 'active');
  await page.clock.fastForward(61_000);
  await save.click();
  await expect(history.getByRole('listitem')).toHaveCount(1);
  await expect(history.getByRole('listitem').first()).toContainText('0.8 WPM');
  await page.getByLabel(en.typing.history.level).selectOption('medium');
  await expect(history.getByRole('listitem')).toHaveCount(2);
  await page.goto('/vi/keyboard/vietnamese-typing');
  await expect(
    page.getByRole('region', { name: vi.typing.history.title }).getByRole('listitem'),
  ).toHaveCount(2);
  await page.goto('/vi/privacy');
  await page.getByRole('button', { name: vi.deleteData }).click();
  expect(await storage()).toBeNull();
  await page.goto('/en/keyboard/vietnamese-typing');
  await expect(history.getByText(en.typing.history.empty)).toBeVisible();
});
