import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on('pageerror', (e) => console.log('PAGE_ERROR', e.message));
page.on('console', (message) => {
  if (message.type() === 'error') console.log('CONSOLE', message.text());
});
page.on('response', (response) => {
  if (response.status() >= 400) console.log('HTTP', response.status(), response.url());
});
await page.goto('http://localhost:3000/vi');
await page.waitForTimeout(3000);
console.log('THEME', await page.locator('html').getAttribute('data-theme'));
await page.screenshot({ path: 'artifacts/home-preview.png', fullPage: false });
await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });
await page.setViewportSize({ width: 375, height: 900 });
await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto('http://localhost:3000/vi/keyboard/tester');
await page.waitForSelector('.keyboard-grid');
await page.screenshot({ path: 'artifacts/keyboard-desktop.png', fullPage: true });
await browser.close();
