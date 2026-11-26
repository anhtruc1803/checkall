export const maxImageBytes = 20 * 1024 * 1024;
export const maxSourcePixels = 24_000_000;
export const maxOutputSide = 4096;

export const imageFormats = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
} as const;

export type ImageFormat = keyof typeof imageFormats;
type Dimensions = { width: number; height: number };

export function detectImageFormat(header: Uint8Array): ImageFormat | undefined {
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => header[i] === byte)) return 'png';
  if (header[0] === 255 && header[1] === 216 && header[2] === 255) return 'jpeg';
  if (
    header.length >= 12 &&
    String.fromCharCode(...header.subarray(0, 4)) === 'RIFF' &&
    String.fromCharCode(...header.subarray(8, 12)) === 'WEBP'
  )
    return 'webp';
}

export function maxOutputWidth({ width, height }: Dimensions) {
  return Math.min(maxOutputSide, Math.max(1, Math.floor((maxOutputSide * width) / height)));
}

export function resizeDimensions(source: Dimensions, value: string): Dimensions | null {
  if (!/^\d{1,4}$/.test(value)) return null;
  const width = Number(value);
  const height = Math.max(1, Math.round((source.height * width) / source.width));
  if (width < 1 || width > maxOutputWidth(source) || height > maxOutputSide) return null;
  return { width, height };
}
