import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium', args: ['--disable-extensions'] });
try {
  for (const origin of (
    process.env.QA_ORIGINS ?? 'http://localhost:3000,http://127.0.0.1:3000,https://127.0.0.1:3443'
  ).split(',')) {
    const page = await browser.newPage({ ignoreHTTPSErrors: true });
    const resources = [];
    page.on('request', (request) => resources.push(request.url()));
    try {
      const response = await page.goto(`${origin}/vi`);
      await page.waitForTimeout(2500);
      const html = await page.content();
      const externalOrigins = [
        ...new Set(
          resources
            .filter((url) => /^https?:/.test(url) && new URL(url).origin !== origin)
            .map((url) => new URL(url).origin),
        ),
      ];
      console.log(
        JSON.stringify(
          {
            origin,
            browser: browser.version(),
            status: response?.status(),
            externalOrigins,
            injectedSecurityScript: /kaspersky|kis\.v2\.scr/i.test(html),
            extensionRequests: resources.filter((url) => url.startsWith('chrome-extension:'))
              .length,
            csp: response?.headers()['content-security-policy'],
          },
          null,
          2,
        ),
      );
    } catch (error) {
      console.log(origin, error.message);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
