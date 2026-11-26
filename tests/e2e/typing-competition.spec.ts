import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Download } from '@playwright/test';
import vi from '../../src/messages/vi.json';
import en from '../../src/messages/en.json';

async function expectPng(download: Download, width: number, height: number) {
  const path = await download.path();
  expect(path).not.toBeNull();
  const png = await readFile(path!);
  expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(png.readUInt32BE(16)).toBe(width);
  expect(png.readUInt32BE(20)).toBe(height);
}

test('a shared challenge supports 60-second scoring, opt-in storage and both PNG formats', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (value: string) => {
          document.body.dataset.copiedLink = value;
        },
      },
    });
  });
  await page.clock.install();
  await page.goto('/vi/keyboard/vietnamese-typing?challenge=morning-v1');
  const t = vi.typing.competition;
  const input = page.getByRole('textbox', { name: vi.typing.input });
  const board = page.getByRole('region', { name: t.ranking });
  await expect(page.getByRole('button', { name: t.mode })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel(t.challenge, { exact: true })).toHaveValue('morning-v1');
  await page.getByRole('button', { name: t.copyLink }).click();
  await expect(page.locator('body')).toHaveAttribute('data-copied-link', page.url());
  await expect(input).toBeEditable();
  expect(
    await input.evaluate((element) =>
      element.dispatchEvent(new Event('paste', { bubbles: true, cancelable: true })),
    ),
  ).toBe(false);
  expect(
    await input.evaluate((element) =>
      element.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true })),
    ),
  ).toBe(false);
  await expect(page.getByText(vi.typing.pasteBlocked)).toBeVisible();
  await input.evaluate((field: HTMLTextAreaElement) => {
    field.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    field.value = 'Buoi';
    field.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
  });
  await expect(page.getByTestId('typing-timer')).toHaveText('1:00');
  await input.evaluate((field: HTMLTextAreaElement) => {
    field.value = 'Buổi sáng';
    field.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true, data: 'Buổi sáng' }),
    );
  });
  await page.clock.fastForward(58_000);
  await expect(page.getByRole('heading', { name: vi.typing.result })).toHaveCount(0);
  await page.clock.fastForward(3_000);
  await expect(input).not.toBeEditable();
  await expect(page.getByRole('heading', { name: vi.typing.result })).toBeVisible();
  await expect(board.getByRole('button', { name: t.save })).toBeDisabled();
  await board.getByLabel(t.nickname).fill('Ánh');
  const landscape = page.waitForEvent('download');
  await board.getByRole('button', { name: t.download, exact: true }).click();
  await expectPng(await landscape, 1200, 630);
  expect(await page.evaluate(() => localStorage.getItem('device-lab:summaries'))).toBeNull();
  await board.getByRole('checkbox', { name: vi.typing.history.allow }).check();
  expect(await page.evaluate(() => localStorage.getItem('device-lab:summaries'))).toBeNull();
  await board.getByRole('button', { name: t.save }).click();
  await expect(board.getByRole('button', { name: t.saved })).toBeDisabled();
  await expect(board.getByRole('listitem')).toContainText('Ánh');
  await expect(board.getByRole('listitem')).toContainText('1,8 WPM');
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('device-lab:summaries')!)[0].competition,
    ),
  ).toEqual({
    challenge: 'morning-v1',
    nickname: 'Ánh',
    correct: 9,
    accuracy: 100,
  });

  await page.goto('/en/keyboard/vietnamese-typing?challenge=morning-v1');
  const english = en.typing.competition;
  const archive = page.getByRole('region', { name: english.ranking });
  await expect(archive.getByRole('listitem')).toContainText('1.8 WPM');
  await archive.getByLabel(english.layout).selectOption('square');
  const square = page.waitForEvent('download');
  await archive
    .getByRole('button', { name: english.downloadAttempt.replace('{nickname}', 'Ánh') })
    .click();
  await expectPng(await square, 1080, 1080);
  await page.getByLabel(english.challenge, { exact: true }).selectOption('riverside-v1');
  await expect(archive.getByText(english.empty)).toBeVisible();
});

test('challenge rankings filter other tests, show tied ranks and reflow in both themes', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.addInitScript(() => {
    const scores = [
      { challenge: 'riverside-v1', nickname: 'Other challenge', correct: 400, accuracy: 100 },
      { challenge: 'morning-v1', nickname: 'Hà', correct: 250, accuracy: 98.2 },
      { challenge: 'morning-v1', nickname: 'Minh', correct: 250, accuracy: 98.2 },
      { challenge: 'morning-v1', nickname: 'An', correct: 250, accuracy: 98 },
      { challenge: 'morning-v1', nickname: 'Vy', correct: 255, accuracy: 90 },
    ];
    localStorage.setItem(
      'device-lab:summaries',
      JSON.stringify(
        scores.map((competition) => ({
          toolId: 'B06',
          time: '2026-11-26T01:00:00.000Z',
          value: 'Test summary',
          competition,
        })),
      ),
    );
  });
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto('/en/keyboard/vietnamese-typing?challenge=morning-v1');
  const board = page.getByRole('region', { name: en.typing.competition.ranking });
  await expect(board.getByRole('listitem')).toHaveCount(4);
  await expect(board.locator('[data-rank]')).toHaveText(['Rank 1', 'Rank 2', 'Rank 2', 'Rank 4']);
  await expect(board.getByRole('listitem').first()).toContainText('Vy');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  for (const theme of ['dark', 'light']) {
    await page.locator('html').evaluate((html, value) => {
      html.dataset.theme = value;
    }, theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const overflow = await board.locator('li, button, select').evaluateAll(
      (elements) =>
        elements.filter((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.left < -1 || bounds.right > innerWidth + 1;
        }).length,
    );
    expect(overflow).toBe(0);
    expect(
      (
        await new AxeBuilder({ page })
          .include('[aria-labelledby="typing-ranking-label"]')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});
