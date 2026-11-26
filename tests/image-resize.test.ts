import { expect, it } from 'vitest';
import { detectImageFormat, maxOutputWidth, resizeDimensions } from '@/lib/utilities/image-resize';

it('detects supported raster types from their signatures', () => {
  expect(detectImageFormat(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]))).toBe('png');
  expect(detectImageFormat(new Uint8Array([255, 216, 255, 224]))).toBe('jpeg');
  expect(detectImageFormat(new TextEncoder().encode('RIFFffffWEBP'))).toBe('webp');
  expect(detectImageFormat(new TextEncoder().encode('<svg></svg>'))).toBeUndefined();
  expect(detectImageFormat(new TextEncoder().encode('RIFFffffWAVE'))).toBeUndefined();
});

it('keeps the aspect ratio and bounds both canvas dimensions', () => {
  const landscape = { width: 1920, height: 1080 };
  const portrait = { width: 1080, height: 1920 };
  expect(resizeDimensions(landscape, '800')).toEqual({ width: 800, height: 450 });
  expect(resizeDimensions(landscape, '1')).toEqual({ width: 1, height: 1 });
  expect(maxOutputWidth(portrait)).toBe(2304);
  expect(resizeDimensions(portrait, '2304')).toEqual({ width: 2304, height: 4096 });
  for (const invalid of ['0', '-1', '3.5', '1e3', '2305', '10000']) {
    expect(resizeDimensions(portrait, invalid)).toBeNull();
  }
});
