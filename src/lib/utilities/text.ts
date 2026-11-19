import type { Locale } from '@/lib/i18n/routing';

/** Limit measured in UTF-16 code units; reject rather than silently truncate. */
export const textInputLimit = 50_000;
export function validateText(text: string): 'tooLong' | null {
  return text.length > textInputLimit ? 'tooLong' : null;
}
export interface TextCounts {
  words: number | null;
  characters: number | null;
  charactersWithoutWhitespace: number | null;
  codePoints: number;
  utf16Units: number;
  utf8Bytes: number;
  lines: number;
  paragraphs: number;
}
export function countText(text: string, locale: Locale): TextCounts {
  if (validateText(text)) throw new RangeError('Text input exceeds the supported limit');
  const lines = text ? text.split(/\r\n|[\r\n\u2028\u2029]/u) : [];
  let paragraphs = 0,
    inParagraph = false;
  for (const line of lines) {
    if (!line.trim()) inParagraph = false;
    else if (!inParagraph) {
      paragraphs++;
      inParagraph = true;
    }
  }
  const result: TextCounts = {
    words: null,
    characters: null,
    charactersWithoutWhitespace: null,
    codePoints: Array.from(text).length,
    utf16Units: text.length,
    utf8Bytes: new TextEncoder().encode(text).length,
    lines: lines.length,
    paragraphs,
  };
  if (typeof Intl.Segmenter !== 'function') return result;
  let characters = 0,
    withoutWhitespace = 0,
    words = 0;
  for (const part of new Intl.Segmenter(locale, { granularity: 'grapheme' }).segment(text)) {
    characters++;
    if (!/^\s+$/u.test(part.segment)) withoutWhitespace++;
  }
  for (const part of new Intl.Segmenter(locale, { granularity: 'word' }).segment(text))
    if (part.isWordLike) words++;
  return { ...result, characters, charactersWithoutWhitespace: withoutWhitespace, words };
}

export type CaseMode = 'upper' | 'lower' | 'title' | 'sentence';
export function convertCase(text: string, mode: CaseMode, locale: Locale): string {
  if (validateText(text)) throw new RangeError('Text input exceeds the supported limit');
  if (mode === 'upper') return text.toLocaleUpperCase(locale);
  const lower = text.toLocaleLowerCase(locale);
  if (mode === 'lower') return lower;
  if (mode === 'title')
    return lower.replace(/\p{L}[\p{L}\p{M}\p{N}]*(?:['’][\p{L}\p{M}\p{N}]+)*/gu, (word) => {
      const first = Array.from(word)[0];
      return first.toLocaleUpperCase(locale) + word.slice(first.length);
    });
  return lower
    .split(/((?:[.!?]\s+)|(?:\r\n|[\r\n\u2028\u2029])+)/u)
    .map((part, index) =>
      index % 2 ? part : part.replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase(locale)),
    )
    .join('');
}

/** Remove marks only from Latin bases. Preserve emoji joiners and non-Latin marks. */
export function removeLatinAccents(text: string): string {
  if (validateText(text)) throw new RangeError('Text input exceeds the supported limit');
  return text
    .normalize('NFD')
    .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFC');
}
export function createSlug(
  text: string,
  mode: 'ascii' | 'unicode',
  separator: '-' | '_',
  locale: Locale,
): string {
  if (validateText(text)) throw new RangeError('Text input exceeds the supported limit');
  const source = (
    mode === 'ascii' ? removeLatinAccents(text) : text.normalize('NFC')
  ).toLocaleLowerCase(locale);
  const words = source.match(mode === 'ascii' ? /[a-z0-9]+/g : /[\p{L}\p{N}][\p{L}\p{M}\p{N}]*/gu);
  return (words ?? []).join(separator);
}

export interface CleanupOptions {
  trimEdges: boolean;
  trimLines: boolean;
  collapseSpaces: boolean;
  removeBlankLines: boolean;
  deduplicateLines: boolean;
  removeInvisible: boolean;
  normalizeNfc: boolean;
}
export const defaultCleanupOptions: CleanupOptions = {
  trimEdges: true,
  trimLines: true,
  collapseSpaces: true,
  removeBlankLines: false,
  deduplicateLines: false,
  removeInvisible: false,
  normalizeNfc: false,
};
export function cleanText(text: string, options: CleanupOptions): string {
  if (validateText(text)) throw new RangeError('Text input exceeds the supported limit');
  let output = text;
  if (options.normalizeNfc) output = output.normalize('NFC');
  if (options.removeInvisible) output = output.replace(/[\u200B\uFEFF\u2060\u00AD]/gu, '');
  const endings = output.match(/\r\n|[\r\n\u2028\u2029]/gu) ?? [];
  let lines = output
    .split(/\r\n|[\r\n\u2028\u2029]/u)
    .map((line, index) => ({ line, ending: endings[index] ?? '' }));
  if (options.collapseSpaces)
    lines = lines.map((item) => ({
      ...item,
      line: item.line.replace(/[^\S\r\n\u2028\u2029]+/gu, ' '),
    }));
  if (options.trimLines) lines = lines.map((item) => ({ ...item, line: item.line.trim() }));
  if (options.removeBlankLines) lines = lines.filter((item) => item.line.trim().length > 0);
  if (options.deduplicateLines) {
    const seen = new Set<string>();
    lines = lines.filter((item) => {
      if (seen.has(item.line)) return false;
      seen.add(item.line);
      return true;
    });
  }
  // Preserve each surviving separator, but do not create a final newline by deleting a last line.
  output = lines
    .map((item, index) => item.line + (index < lines.length - 1 ? item.ending : ''))
    .join('');
  return options.trimEdges ? output.trim() : output;
}
