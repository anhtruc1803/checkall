import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanText,
  convertCase,
  countText,
  createSlug,
  defaultCleanupOptions,
  removeLatinAccents,
  textInputLimit,
  validateText,
  type CleanupOptions,
} from '@/lib/utilities/text';

const off: CleanupOptions = Object.fromEntries(
  Object.keys(defaultCleanupOptions).map((key) => [key, false]),
) as unknown as CleanupOptions;
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Unicode text counts', () => {
  it('distinguishes graphemes, code points, UTF-16 and UTF-8 without modifying input', () => {
    const input = 'e\u0301 👨‍👩‍👧‍👦 🇻🇳';
    expect(countText(input, 'vi')).toEqual({
      words: 1,
      characters: 5,
      charactersWithoutWhitespace: 3,
      codePoints: 13,
      utf16Units: 19,
      utf8Bytes: 38,
      lines: 1,
      paragraphs: 1,
    });
    expect(input).toBe('e\u0301 👨‍👩‍👧‍👦 🇻🇳');
  });
  it('uses native word boundaries rather than spaces, and counts blank lines/paragraphs explicitly', () => {
    expect(countText('Xin chào, Việt Nam! 2026', 'vi').words).toBe(5);
    expect(countText('Hello,world!', 'en').words).toBe(2);
    const counts = countText('First\r\nsecond\r\n \r\nthird\u2028', 'en');
    expect(counts.lines).toBe(5);
    expect(counts.paragraphs).toBe(2);
    expect(countText('', 'vi')).toEqual({
      words: 0,
      characters: 0,
      charactersWithoutWhitespace: 0,
      codePoints: 0,
      utf16Units: 0,
      utf8Bytes: 0,
      lines: 0,
      paragraphs: 0,
    });
    expect(countText(' \t\n', 'en').paragraphs).toBe(0);
  });
  it('reports unsupported semantic counts instead of inventing fallback values', () => {
    vi.stubGlobal('Intl', Object.create(Intl, { Segmenter: { value: undefined } }));
    expect(countText('Đ 👨‍👩‍👧‍👦', 'vi')).toMatchObject({
      words: null,
      characters: null,
      charactersWithoutWhitespace: null,
      lines: 1,
      paragraphs: 1,
      codePoints: 9,
    });
  });
});

describe('case and accent conversion', () => {
  it.each([
    ['upper', 'Đặng thị ß', 'ĐẶNG THỊ SS'],
    ['lower', 'ĐẶNG THỊ', 'đặng thị'],
    ['title', "ĐẶNG thị o'NEILL 123abc", "Đặng Thị O'neill 123Abc"],
    [
      'sentence',
      '  XIN CHÀO! ANH ỔN? CÓ. 3.14\nDÒNG MỚI',
      '  Xin chào! Anh ổn? Có. 3.14\nDòng mới',
    ],
  ] as const)('%s keeps spacing and maps Vietnamese letters', (mode, input, expected) => {
    expect(convertCase(input, mode, 'vi')).toBe(expected);
    expect(convertCase('', mode, 'en')).toBe('');
  });
  it('removes Latin marks and đ/Đ while preserving non-Latin marks and emoji', () => {
    expect(removeLatinAccents('Đặng Ắ ế e\u0301 — क़ 👩🏽‍💻')).toBe('Dang A e e — क़ 👩🏽‍💻');
    expect(removeLatinAccents('<b>Đẹp</b>')).toBe('<b>Dep</b>');
  });
  it('is stable when removing accents twice', () => {
    const result = removeLatinAccents('Đà Nẵng, Ελληνικά, क़, 👨‍👩‍👧‍👦');
    expect(removeLatinAccents(result)).toBe(result);
  });
});

describe('slugs', () => {
  it.each([
    ['ascii', '-', '  Đà Nẵng / 2026! ', 'da-nang-2026'],
    ['ascii', '_', 'Đặng---Thị___A', 'dang_thi_a'],
    ['unicode', '-', 'Đà Na\u0306\u0303ng / 東京 42', 'đà-nẵng-東京-42'],
    ['ascii', '-', '東京 👨‍👩‍👧‍👦', ''],
    ['unicode', '_', 'क़िताब + ไทย', 'क़िताब_ไทย'],
  ] as const)('%s/%s produces a bounded plain slug', (mode, separator, input, expected) => {
    const result = createSlug(input, mode, separator, 'vi');
    expect(result).toBe(expected);
    expect(createSlug(result, mode, separator, 'vi')).toBe(result);
  });
});

describe('explicit cleanup choices', () => {
  it('uses conservative defaults, keeping blank/duplicate lines and internal invisibles', () => {
    expect(defaultCleanupOptions.removeBlankLines).toBe(false);
    expect(defaultCleanupOptions.deduplicateLines).toBe(false);
    expect(defaultCleanupOptions.removeInvisible).toBe(false);
    expect(defaultCleanupOptions.normalizeNfc).toBe(false);
    expect(cleanText('  A\t B \r\n\r\n A  B \r\nC\u200BD  ', defaultCleanupOptions)).toBe(
      'A B\r\n\r\nA B\r\nC\u200BD',
    );
  });
  it.each(['', '\r\n', ' A\r\n B\rC\n\u2028D\u2029', 'é\te\u0301\n', '👩🏽‍💻\u200B'])(
    'keeps exact line separators and content when all steps are off: %j',
    (input) => {
      expect(cleanText(input, off)).toBe(input);
    },
  );
  it('deduplicates exact lines after trimming, preserves case/order and adds no trailing newline', () => {
    expect(
      cleanText(' A \r\nA\r\na\r\n \r\nB\r\nB', {
        ...off,
        trimLines: true,
        removeBlankLines: true,
        deduplicateLines: true,
      }),
    ).toBe('A\r\na\r\nB');
  });
  it('only removes the four documented invisibles and preserves emoji joiners', () => {
    expect(
      cleanText('a\u200Bb\uFEFFc\u2060d\u00ADe 👩🏽‍💻 \u200C \uFE0F', {
        ...off,
        removeInvisible: true,
      }),
    ).toBe('abcde 👩🏽‍💻 \u200C \uFE0F');
    expect(cleanText('e\u0301', { ...off, normalizeNfc: true })).toBe('é');
  });
  it('preserves literal HTML and script as text; cleaning is not an HTML sanitizer', () => {
    expect(
      cleanText('<script>alert(1)</script>\n<img src=x onerror=alert(2)>', defaultCleanupOptions),
    ).toBe('<script>alert(1)</script>\n<img src=x onerror=alert(2)>');
  });
  it('is idempotent for all option combinations on mixed whitespace and Unicode', () => {
    const keys = Object.keys(off) as (keyof CleanupOptions)[];
    for (let mask = 0; mask < 128; mask++) {
      const options = Object.fromEntries(
        keys.map((key, i) => [key, Boolean(mask & (1 << i))]),
      ) as unknown as CleanupOptions;
      const once = cleanText('  e\u0301\t x  \r\n\r\né  x\nA\u200B B\n A B \n', options);
      expect(cleanText(once, options), `options ${mask}`).toBe(once);
    }
  });
});

it('accepts exactly 50,000 UTF-16 units and rejects oversize without truncation', () => {
  const accepted = '😀'.repeat(textInputLimit / 2);
  expect(validateText(accepted)).toBeNull();
  expect(convertCase(accepted, 'upper', 'en')).toBe(accepted);
  expect(countText(accepted, 'en').characters).toBe(25_000);
  const oversized = accepted + 'a';
  expect(validateText(oversized)).toBe('tooLong');
  for (const process of [
    () => countText(oversized, 'en'),
    () => convertCase(oversized, 'upper', 'en'),
    () => removeLatinAccents(oversized),
    () => createSlug(oversized, 'ascii', '-', 'en'),
    () => cleanText(oversized, defaultCleanupOptions),
  ])
    expect(process).toThrow(RangeError);
  expect(oversized.length).toBe(50_001);
});
