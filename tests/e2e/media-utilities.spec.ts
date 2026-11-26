import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Download, type Page } from '@playwright/test';
import jsQR from 'jsqr';
import en from '../../src/messages/en.json';
import vi from '../../src/messages/vi.json';

async function downloadedFile(download: Download) {
  const path = await download.path();
  expect(path).not.toBeNull();
  return readFile(path!);
}

async function readPixels(page: Page, dataUrl: string, allPixels = false) {
  return page.evaluate(
    async ({ dataUrl, allPixels }) => {
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return {
        width: canvas.width,
        height: canvas.height,
        pixels: Array.from(
          context.getImageData(0, 0, allPixels ? canvas.width : 1, allPixels ? canvas.height : 1)
            .data,
        ),
      };
    },
    { dataUrl, allPixels },
  );
}

async function sampleImage(page: Page) {
  const image = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const context = canvas.getContext('2d')!;
    const pixels = context.createImageData(640, 360);
    let state = 17;
    for (let i = 0; i < pixels.data.length; i += 4) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      pixels.data[i] = state >>> 24;
      pixels.data[i + 1] = state >>> 16;
      pixels.data[i + 2] = state >>> 8;
      pixels.data[i + 3] = (i / 4) % 640 < 80 ? 0 : 255;
    }
    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  return { name: 'sample.png', mimeType: 'image/png', buffer: Buffer.from(image, 'base64') };
}

test('generates downloadable and independently decodable PNG QR codes in VI and EN', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.addInitScript(() => {
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (url) => {
      revoke(url);
      document.documentElement.dataset.revokedMediaUrl = url;
    };
  });
  for (const [locale, messages, text] of [
    ['vi', vi, '  Thi gõ tiếng Việt — Đề số 1 🏆\nGiữ cả khoảng trắng.  '],
    ['en', en, 'https://example.com/vi/keyboard/vietnamese-typing?challenge=morning-v1'],
  ] as const) {
    await page.goto(`/${locale}/utilities/qr-code`);
    const t = messages.mediaTools.qr;
    const button = page.getByRole('button', { name: t.create, exact: true });
    const field = page.getByRole('textbox', { name: t.input });
    const downloadLink = page.getByRole('link', { name: t.download });
    await expect(button).toBeDisabled();
    await field.fill('ệ'.repeat(400));
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(button).toBeDisabled();
    // Load the lazy encoder, then generate and download with the browser offline.
    await field.fill('Device Lab');
    await button.click();
    await expect(downloadLink).toBeVisible();
    await page.context().setOffline(true);
    await field.fill(text);
    await button.click();
    await expect(page.getByRole('img', { name: t.alt })).toBeVisible();
    const event = page.waitForEvent('download');
    await downloadLink.click();
    const png = await downloadedFile(await event);
    expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    const { width, height, pixels } = await readPixels(
      page,
      `data:image/png;base64,${png.toString('base64')}`,
      true,
    );
    expect(width).toBe(height);
    expect(jsQR(Uint8ClampedArray.from(pixels), width, height)?.data).toBe(text);
    const oldUrl = await downloadLink.getAttribute('href');
    await field.fill(`${text}x`);
    await expect(downloadLink).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-revoked-media-url', oldUrl!);
    await page.context().setOffline(false);
    expect(await page.evaluate(() => localStorage.getItem('device-lab:summaries'))).toBeNull();
  }
});

test('resizes proportionally, compares real file sizes and exports PNG and JPEG', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const [locale, messages] of [
    ['vi', vi],
    ['en', en],
  ] as const) {
    const t = messages.mediaTools.image;
    await page.goto(`/${locale}/utilities/image-resizer`);
    const fixture = await sampleImage(page);
    const picker = page.getByLabel(t.file, { exact: true });
    const width = page.getByRole('textbox', { name: t.width });
    const format = page.getByRole('combobox', { name: t.format });
    const button = page.getByRole('button', { name: t.process, exact: true });
    const downloadLink = page.getByRole('link', { name: t.download });
    await expect(picker).toBeEnabled();
    await page.context().setOffline(true);
    await picker.setInputFiles(fixture);
    await expect(width).toHaveValue('640');
    await expect(page.getByTestId('image-source-stats')).toContainText('640 × 360 px');
    await width.fill('0');
    await expect(width).toHaveAttribute('aria-invalid', 'true');
    await expect(button).toBeDisabled();
    await width.fill('320');
    await button.click();
    await expect(page.getByTestId('image-output-stats')).toContainText('320 × 180 px');
    const pngEvent = page.waitForEvent('download');
    await downloadLink.click();
    const png = await downloadedFile(await pngEvent);
    const pngImage = await readPixels(page, `data:image/png;base64,${png.toString('base64')}`);
    expect(pngImage.width).toBe(320);
    expect(pngImage.height).toBe(180);
    expect(pngImage.pixels[3]).toBe(0);
    await format.selectOption('jpeg');
    await expect(downloadLink).toHaveCount(0);
    const quality = page.getByRole('slider', { name: new RegExp(t.quality) });
    await quality.focus();
    await page.keyboard.press('Home');
    await expect(quality).toHaveValue('10');
    await button.click();
    await expect(downloadLink).toBeVisible();
    const jpegEvent = page.waitForEvent('download');
    await downloadLink.click();
    const jpegDownload = await jpegEvent;
    expect(jpegDownload.suggestedFilename()).toBe('sample-320w.jpg');
    const jpeg = await downloadedFile(jpegDownload);
    expect([...jpeg.subarray(0, 3)]).toEqual([255, 216, 255]);
    expect(jpeg.length).toBeLessThan(fixture.buffer.length);
    await expect(
      page.getByText(locale === 'vi' ? /Giảm .*% dung lượng/ : /% smaller/),
    ).toBeVisible();
    const jpegImage = await readPixels(page, `data:image/jpeg;base64,${jpeg.toString('base64')}`);
    expect(jpegImage.width).toBe(320);
    expect(jpegImage.height).toBe(180);
    expect(jpegImage.pixels.every((channel) => channel >= 245)).toBe(true);
    await page.context().setOffline(false);
    expect(await page.evaluate(() => localStorage.getItem('device-lab:summaries'))).toBeNull();
  }
});

test('rejects non-raster files and checks actual WebP support', async ({ page }) => {
  const t = en.mediaTools.image;
  await page.goto('/en/utilities/image-resizer');
  const picker = page.getByLabel(t.file, { exact: true });
  const button = page.getByRole('button', { name: t.process, exact: true });
  await expect(picker).toBeEnabled();
  await picker.setInputFiles({
    name: 'wrong.png',
    mimeType: 'image/png',
    buffer: Buffer.from('<svg></svg>'),
  });
  await expect(page.getByText(t.errors.type, { exact: true })).toBeVisible();
  await expect(button).toBeDisabled();
  await picker.setInputFiles(await sampleImage(page));
  await page.getByRole('combobox', { name: t.format }).selectOption('webp');
  const supported = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    return new Promise<boolean>((resolve) =>
      canvas.toBlob((blob) => resolve(blob?.type === 'image/webp'), 'image/webp'),
    );
  });
  await button.click();
  if (supported) {
    const downloadLink = page.getByRole('link', { name: t.download });
    const event = page.waitForEvent('download');
    await downloadLink.click();
    const webp = await downloadedFile(await event);
    expect(webp.toString('ascii', 0, 4)).toBe('RIFF');
    expect(webp.toString('ascii', 8, 12)).toBe('WEBP');
  } else {
    await expect(page.getByText(t.errors.unsupportedFormat, { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: t.download })).toHaveCount(0);
  }
});

test('both media utilities reflow and pass axe in the two themes', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 320, height: 760 });
  for (const tool of ['qr-code', 'image-resizer']) {
    await page.goto(`/vi/utilities/${tool}`);
    if (tool === 'qr-code') {
      await page.getByRole('textbox', { name: vi.mediaTools.qr.input }).fill('Thi gõ tiếng Việt');
      await page.getByRole('button', { name: vi.mediaTools.qr.create, exact: true }).click();
      await expect(page.getByRole('img', { name: vi.mediaTools.qr.alt })).toBeVisible();
    } else {
      const picker = page.getByLabel(vi.mediaTools.image.file);
      await expect(picker).toBeEnabled();
      await picker.setInputFiles(await sampleImage(page));
      await page.getByRole('button', { name: vi.mediaTools.image.process, exact: true }).click();
      await expect(page.getByRole('img', { name: vi.mediaTools.image.alt })).toBeVisible();
    }
    for (const theme of ['dark', 'light']) {
      await page.evaluate((mode) => {
        document.documentElement.dataset.theme = mode;
        document.documentElement.style.fontSize = '200%';
      }, theme);
      const overflow = await page
        .locator(
          '.engine-surface input, .engine-surface select, .engine-surface textarea, .engine-surface img, .engine-surface .button',
        )
        .evaluateAll((controls) =>
          controls
            .filter((element) => {
              const bounds = element.getBoundingClientRect();
              return bounds.left < -1 || bounds.right > innerWidth + 1;
            })
            .map((element) => element.tagName),
        );
      expect(overflow, `${tool}/${theme}`).toEqual([]);
      expect(
        (
          await new AxeBuilder({ page })
            .include('.engine-surface')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  }
});
