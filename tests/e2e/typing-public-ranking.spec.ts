import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { leaderboardPath } from '../../src/lib/typing/leaderboard';
import en from '../../src/messages/en.json';
import vi from '../../src/messages/vi.json';

test('publishes only after consent, shares the same challenge and lets admin hide the score', async ({
  page,
  browser,
  baseURL,
  request,
}, testInfo) => {
  test.setTimeout(130_000);
  const key = process.env.TYPING_LEADERBOARD_TEST_KEY!;
  const nickname = `Ánh-${testInfo.project.name}-${Date.now().toString(36)}`;
  const challenge = 'morning-v1';
  const t = vi.typing.competition;
  const payloads: object[] = [];
  page.on('request', (sent) => {
    if (sent.method() === 'POST' && new URL(sent.url()).pathname === leaderboardPath)
      payloads.push(sent.postDataJSON());
  });
  await page.goto(`/vi/keyboard/vietnamese-typing?challenge=${challenge}`);
  const view = page.getByRole('region', { name: t.public.heading });
  await expect(view).toBeVisible();
  await expect(page.getByText(t.public.moderation, { exact: true })).toHaveCount(0);
  await expect(page.getByLabel(t.public.adminKey)).toHaveCount(0);
  await expect(page.locator('a[href*="/admin/typing-leaderboard"]')).toHaveCount(0);
  expect(payloads).toEqual([]);
  await page.getByRole('button', { name: t.public.start }).click();
  await expect(page.getByRole('button', { name: t.public.ready })).toBeVisible();
  expect(payloads).toEqual([{ action: 'start', challenge }]);
  const input = page.getByRole('textbox', { name: vi.typing.input });
  await expect(input).toBeEditable();
  await input.fill('Buổi sáng');

  const guest = await browser.newContext({ baseURL });
  try {
    const viewer = await guest.newPage();
    await viewer.goto(`/en/keyboard/vietnamese-typing?challenge=${challenge}`);
    const english = en.typing.competition.public;
    const board = viewer.getByRole('region', { name: english.heading });
    await expect(board.getByRole('button', { name: english.refresh })).toBeEnabled();
    await expect(board.getByText(nickname)).toHaveCount(0);

    await expect(page.getByRole('heading', { name: vi.typing.result })).toBeVisible({
      timeout: 75_000,
    });
    const archive = page.getByRole('region', { name: t.ranking });
    const publish = archive.getByRole('button', { name: t.public.publish });
    await expect(publish).toBeDisabled();
    await expect(archive.getByRole('button', { name: t.download, exact: true })).toBeEnabled();
    await archive.getByLabel(t.nickname).fill(nickname);
    await expect(publish).toBeEnabled();
    expect(payloads).toHaveLength(1);
    await expect(board.getByText(nickname)).toHaveCount(0);
    await publish.click();
    await expect(archive.getByRole('button', { name: t.public.published })).toBeDisabled();
    expect(payloads).toEqual([
      { action: 'start', challenge },
      {
        action: 'submit',
        challenge,
        ticket: expect.any(String),
        correct: 9,
        accuracy: 100,
        nickname,
      },
    ]);
    expect(await page.evaluate(() => localStorage.getItem('device-lab:summaries'))).toBeNull();
    await expect(view.getByText(nickname, { exact: true })).toBeVisible();

    await board.getByRole('button', { name: english.refresh }).click();
    const score = board.getByRole('listitem').filter({ hasText: nickname });
    await expect(score).toContainText('1.8 WPM');
    await expect(score).toContainText('100%');
    await expect(
      score.getByRole('button', { name: english.hideNamed.replace('{name}', nickname) }),
    ).toHaveCount(0);
    const before = await request.get(`${leaderboardPath}?challenge=${challenge}`);
    const { entries } = await before.json();
    const { id } = entries.find((entry: { nickname: string }) => entry.nickname === nickname);
    const denied = await request.post(`${leaderboardPath}/admin`, {
      data: { action: 'hide', challenge, id },
    });
    expect(denied.status()).toBe(401);

    const sitemap = await request.get('/sitemap.xml');
    expect(await sitemap.text()).not.toContain('/admin/typing-leaderboard');
    const admin = await guest.newPage();
    const loginPage = await admin.goto('/en/admin/typing-leaderboard');
    expect(loginPage?.headers()['cache-control']).toContain('no-store');
    await expect(admin.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(admin.getByRole('heading', { name: english.loginTitle })).toBeVisible();
    const privateBoard = admin.getByRole('region', { name: english.heading });
    await expect(privateBoard).toHaveCount(0);
    await admin.getByLabel(english.adminKey).fill('wrong code');
    await admin.getByRole('button', { name: english.signIn }).click();
    await expect(admin.getByText(english.errors.unauthorized)).toBeVisible();
    await expect(privateBoard).toHaveCount(0);
    await admin.getByLabel(english.adminKey).fill(key);
    const signedIn = admin.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === `${leaderboardPath}/admin` && response.ok(),
    );
    await admin.getByRole('button', { name: english.signIn }).click();
    const cookieHeader = await (await signedIn).headerValue('set-cookie');
    expect(cookieHeader).toMatch(/;\s*HttpOnly\b/i);
    expect(cookieHeader).toMatch(/;\s*SameSite=Strict\b/i);
    await expect(admin.getByRole('heading', { name: english.moderation })).toBeVisible();
    expect(
      (await guest.cookies()).some(
        ({ httpOnly, name }) => name === 'device-lab-typing-admin' && httpOnly,
      ),
    ).toBe(true);

    await admin.setViewportSize({ width: 320, height: 760 });
    await admin.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    for (const theme of ['dark', 'light']) {
      await admin.locator('html').evaluate((html, value) => {
        html.dataset.theme = value;
      }, theme);
      expect(await admin.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        (
          await new AxeBuilder({ page: admin })
            .include('main')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await admin
      .getByLabel(en.typing.competition.challenge, { exact: true })
      .selectOption('riverside-v1');
    await expect(privateBoard.getByText(nickname)).toHaveCount(0);
    await admin
      .getByLabel(en.typing.competition.challenge, { exact: true })
      .selectOption(challenge);
    const name = english.hideNamed.replace('{name}', nickname);
    const hide = privateBoard.getByRole('button', { name });
    await expect(hide).toBeVisible();
    await viewer.reload();
    await expect(score).toBeVisible();
    await expect(viewer.getByRole('button', { name })).toHaveCount(0);
    await expect(viewer.getByText(english.moderation, { exact: true })).toHaveCount(0);
    admin.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await hide.click();
    await expect(admin.getByText(english.hidden)).toBeVisible();
    await expect(privateBoard.getByText(nickname)).toHaveCount(0);
    await board.getByRole('button', { name: english.refresh }).click();
    await expect(score).toHaveCount(0);
    await page.reload();
    await expect(view.getByRole('button', { name: t.public.refresh })).toBeEnabled();
    await expect(view.getByText(nickname)).toHaveCount(0);

    await admin.goto('/vi/admin/typing-leaderboard');
    await expect(admin.getByRole('heading', { name: t.public.moderation })).toBeVisible();
    await admin.getByRole('button', { name: t.public.signOut }).click();
    await expect(admin.getByRole('heading', { name: t.public.loginTitle })).toBeVisible();
    await expect(admin.getByRole('region', { name: t.public.heading })).toHaveCount(0);
    expect(
      (
        await guest.request.post(`${leaderboardPath}/admin`, {
          data: { action: 'hide', challenge, id },
        })
      ).status(),
    ).toBe(401);
  } finally {
    await guest.close();
  }
});
