import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const destinations = {
  screen: ['/screen/refresh-rate', '/screen/ghosting'],
  keyboard: ['/keyboard/chatter', '/keyboard/tester'],
  microphone: ['/audio/microphone', '/audio/spectrum'],
};

test('problem shortcuts open the right tools in both locales without starting capture', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.addInitScript(() => {
    const qaWindow = window as typeof window & { __problemQaMediaCalls: number };
    qaWindow.__problemQaMediaCalls = 0;
    if (typeof navigator.mediaDevices?.getUserMedia === 'function') {
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: () => {
          qaWindow.__problemQaMediaCalls++;
          return Promise.reject(
            new DOMException('Unexpected capture during navigation', 'NotAllowedError'),
          );
        },
      });
    }
  });
  for (const locale of ['vi', 'en']) {
    for (const [key, paths] of Object.entries(destinations)) {
      for (const [index, path] of paths.entries()) {
        await page.goto(`/${locale}`);
        await expect(page.locator('#catalog-search')).toBeEnabled();
        const section = page.getByRole('region', {
          name:
            locale === 'vi'
              ? 'Thiết bị đang gặp vấn đề gì?'
              : 'What is happening with your device?',
        });
        await expect(section.locator('article')).toHaveCount(3);
        const card = section.locator(`[data-problem="${key}"]`);
        await expect(card.getByRole('heading', { level: 3 })).toHaveText(
          locale === 'vi'
            ? {
                screen: 'Màn hình bị giật',
                keyboard: 'Phím bị lặp',
                microphone: 'Microphone không hoạt động',
              }[key]!
            : {
                screen: 'Screen feels choppy',
                keyboard: 'Keys keep repeating',
                microphone: 'Microphone is not working',
              }[key]!,
        );
        const link = card.getByRole('link').nth(index);
        await expect(link).toHaveAttribute('href', `/${locale}${path}`);
        await expect(link).toHaveAttribute('data-primary', String(index === 0));
        await link.focus();
        await expect(link).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(new RegExp(`/${locale}${path}$`));
        await expect(page.locator('.tool-workspace')).toBeVisible();
        await expect(page.locator('h1')).not.toBeEmpty();
        if (key === 'keyboard')
          await expect(page.locator('.keyboard-capture')).toHaveAttribute('data-active', 'false');
        if (key === 'microphone')
          await expect(
            page.getByRole('button', { name: locale === 'vi' ? 'Bắt đầu' : 'Start', exact: true }),
          ).toBeEnabled();
        expect(
          await page.evaluate(
            () =>
              (window as typeof window & { __problemQaMediaCalls: number }).__problemQaMediaCalls,
          ),
        ).toBe(0);
      }
    }
  }
});

test('problem chooser stays accessible across themes, sizes and enlarged text', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['vi', 'en']) {
    await page.goto(`/${locale}`);
    await expect(page.locator('#catalog-search')).toBeEnabled();
    const section = page.locator('#by-problem');
    await expect(section.getByRole('link')).toHaveCount(6);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      expect(
        (
          await new AxeBuilder({ page })
            .include('#by-problem')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      for (const width of [320, 375, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const fontSize of ['100%', '200%']) {
          await page.evaluate((value) => {
            document.documentElement.style.fontSize = value;
          }, fontSize);
          const issues = await section.locator('article,h2,h3,p,a').evaluateAll((elements) =>
            elements
              .filter((element) => {
                const rect = element.getBoundingClientRect();
                return (
                  rect.left < -1 ||
                  rect.right > innerWidth + 1 ||
                  element.scrollWidth > element.clientWidth + 1
                );
              })
              .map((element) => element.tagName),
          );
          expect(issues, `${locale}/${theme}/${width}/${fontSize}`).toEqual([]);
          for (const link of await section.getByRole('link').all()) {
            const box = await link.boundingBox();
            expect(box!.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '100%';
    });
    const links = section.getByRole('link');
    await links.first().focus();
    for (let index = 1; index < 6; index++) {
      await page.keyboard.press('Tab');
      await expect(links.nth(index)).toBeFocused();
    }
  }
});
