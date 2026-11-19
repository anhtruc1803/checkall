import { expect, it } from 'vitest';
import { parseDecimal } from '@/lib/utilities/decimal';
import { numberToWords, defaultWordOptions, type WordOptions } from '@/lib/utilities/number-words';

function spell(text: string, options: Partial<WordOptions> = {}) {
  const parsed = parseDecimal(text, 'en');
  if (!parsed.ok) throw Error(parsed.error);
  return numberToWords(parsed.value, { ...defaultWordOptions, ...options });
}
it.each([
  ['0', 'Không'],
  ['-0', 'Không'],
  ['5', 'Năm'],
  ['10', 'Mười'],
  ['11', 'Mười một'],
  ['15', 'Mười lăm'],
  ['21', 'Hai mươi mốt'],
  ['24', 'Hai mươi bốn'],
  ['25', 'Hai mươi lăm'],
  ['101', 'Một trăm linh một'],
  ['105', 'Một trăm linh năm'],
  ['115', 'Một trăm mười lăm'],
  ['125', 'Một trăm hai mươi lăm'],
  ['1000', 'Một nghìn'],
  ['1001', 'Một nghìn không trăm linh một'],
  ['1010', 'Một nghìn không trăm mười'],
  ['1100', 'Một nghìn một trăm'],
  ['1000001', 'Một triệu không trăm linh một'],
  ['1000000000', 'Một tỷ'],
  ['1000000000000', 'Một nghìn tỷ'],
  ['1000000000000000', 'Một triệu tỷ'],
  ['1000000000000000000', 'Một tỷ tỷ'],
  ['1000000000000000000000', 'Một nghìn tỷ tỷ'],
  ['-12.0500', 'Âm mười hai phẩy không năm không không'],
  ['0.000001', 'Không phẩy không không không không không một'],
  ['-0.00', 'Không phẩy không không'],
  [
    '9007199254740993',
    'Chín triệu tỷ không trăm linh bảy nghìn tỷ một trăm chín mươi chín tỷ hai trăm năm mươi bốn triệu bảy trăm bốn mươi nghìn chín trăm chín mươi ba',
  ],
] as const)('spells VI %s', (text, expected) =>
  expect(spell(text)).toEqual({ ok: true, text: expected }),
);
it.each([
  ['0', 'Zero'],
  ['19', 'Nineteen'],
  ['20', 'Twenty'],
  ['21', 'Twenty-one'],
  ['40', 'Forty'],
  ['101', 'One hundred one'],
  ['125', 'One hundred twenty-five'],
  ['1001', 'One thousand one'],
  ['1000001', 'One million one'],
  ['1000000000', 'One billion'],
  ['1000000000000', 'One trillion'],
  ['1000000000000000', 'One quadrillion'],
  ['1000000000000000000', 'One quintillion'],
  ['1000000000000000000000', 'One sextillion'],
  ['-0.0500', 'Minus zero point zero five zero zero'],
  [
    '9007199254740993',
    'Nine quadrillion seven trillion one hundred ninety-nine billion two hundred fifty-four million seven hundred forty thousand nine hundred ninety-three',
  ],
] as const)('spells EN %s', (text, expected) =>
  expect(spell(text, { language: 'en' })).toEqual({ ok: true, text: expected }),
);
it('applies Vietnamese regional wording and capitalization independently', () => {
  expect(spell('1005', { filler: 'lẻ', thousand: 'ngàn', capitalize: false })).toEqual({
    ok: true,
    text: 'một ngàn không trăm lẻ năm',
  });
});
it('reads integer VND with optional suffix in both languages', () => {
  expect(spell('1250000', { money: true })).toEqual({
    ok: true,
    text: 'Một triệu hai trăm năm mươi nghìn đồng chẵn',
  });
  expect(spell('-125', { money: true, exactSuffix: false })).toEqual({
    ok: true,
    text: 'Âm một trăm hai mươi lăm đồng',
  });
  expect(spell('125.000', { language: 'en', money: true })).toEqual({
    ok: true,
    text: 'One hundred twenty-five Vietnamese dong only',
  });
  expect(spell('0', { language: 'en', money: true, exactSuffix: false })).toEqual({
    ok: true,
    text: 'Zero Vietnamese dong',
  });
});
it.each(['0.1', '-0.000001', '999999999999999999999999.999999'])(
  'never silently rounds fractional VND %s',
  (text) => {
    for (const language of ['vi', 'en'] as const)
      expect(spell(text, { language, money: true })).toEqual({ ok: false, error: 'vndFraction' });
  },
);
it('handles the documented maximum without undefined words or scientific notation', () => {
  for (const language of ['vi', 'en'] as const) {
    const result = spell('999999999999999999999999.999999', { language });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.text).not.toMatch(/undefined|NaN|\d/);
      expect(result.text.length).toBeLessThan(1500);
    }
  }
});
