import { expect, it } from 'vitest';
import {
  parseDecimal,
  calculatePercentage,
  formatDecimal,
  formatRational,
  type NumberFormat,
  type PercentageMode,
} from '@/lib/utilities/decimal';

function read(text: string, format: NumberFormat = 'en') {
  const result = parseDecimal(text, format);
  if (!result.ok) throw Error(result.error);
  return result.value;
}
it.each([
  ['1.234,5600', 'vi', '1234.5600'],
  ['1,234.5600', 'en', '1234.5600'],
  ['1,234', 'vi', '1.234'],
  ['1,234', 'en', '1234'],
  ['1.234', 'vi', '1234'],
  ['1.234', 'en', '1.234'],
  [' -0000,000 ', 'vi', '0.000'],
  ['+000025', 'en', '25'],
  ['-0.000001', 'en', '-0.000001'],
  ['999999999999999999999999.123456', 'en', '999999999999999999999999.123456'],
] as const)('parses %s explicitly as %s without precision loss', (text, format, canonical) => {
  expect(read(text, format).canonical).toBe(canonical);
});
it.each([
  '',
  ' ',
  '.',
  ',',
  '-',
  '+',
  'NaN',
  'Infinity',
  '1e6',
  '0x10',
  '1 000',
  '1_000',
  '₫100',
  '1,23,456',
  '1,234.',
  '12,34',
  '1..2',
  '.5',
  '１',
  '<script>1</script>',
  '1\n2',
])('rejects invalid EN input %s', (text) => {
  expect(parseDecimal(text, 'en').ok).toBe(false);
});
it.each(['1.23', '12.34.567', '1.234,', '1,234,5', '1 234,5'])(
  'rejects invalid VI grouping %s',
  (text) => expect(parseDecimal(text, 'vi').ok).toBe(false),
);
it.each(['1'.repeat(25), '0.1234567', '0'.repeat(129)])('bounds input %s', (text) =>
  expect(parseDecimal(text, 'en')).toEqual({ ok: false, error: 'range' }),
);
it('round trips exact large signed decimals in both formats', () => {
  for (const format of ['vi', 'en'] as const) {
    const original = read('-9007199254740993.000010');
    expect(read(formatDecimal(original, format), format)).toEqual(original);
  }
});
it.each([
  ['of', '12.5', '200', '25', false],
  ['of', '0.1', '0.2', '0.0002', false],
  ['ratio', '1', '3', '33.333333', true],
  ['ratio', '2', '3', '66.666667', true],
  ['ratio', '-1', '6', '-16.666667', true],
  ['ratio', '5', '-2', '-250', false],
  ['ratio', '0', '1', '0', false],
  ['change', '100', '80', '-20', false],
  ['change', '0.1', '0.3', '200', false],
  ['change', '10', '0', '-100', false],
  ['change', '10', '-10', '-200', false],
  ['increase', '100', '12.5', '112.5', false],
  ['decrease', '100', '120', '-20', false],
  ['increase', '100', '-20', '80', false],
  ['of', '100', '9007199254740993', '9,007,199,254,740,993', false],
] as const)('%s: %s and %s → %s', (mode, a, b, text, rounded) => {
  expect(calculatePercentage(mode, read(a), read(b), 'en')).toEqual({
    ok: true,
    value: { text, rounded, percent: mode === 'ratio' || mode === 'change' },
  });
});
it.each([
  ['ratio', '1', '0', 'zeroBase'],
  ['change', '0', '2', 'zeroBase'],
  ['change', '-1', '2', 'negativeBase'],
] as const)('rejects undefined %s', (mode, a, b, error) => {
  expect(calculatePercentage(mode, read(a), read(b), 'en')).toEqual({ ok: false, error });
});
it.each([
  [1n, 2000000n, '0.000001'],
  [-1n, 2000000n, '-0.000001'],
  [1n, -2000000n, '-0.000001'],
  [-1n, -2000000n, '0.000001'],
  [1n, 3000000n, '0'],
  [-1n, 3000000n, '0'],
  [19999999n, 2000000n, '10'],
] as const)('rounds %s/%s with ties away from zero', (n, d, text) =>
  expect(formatRational(n, d, 'en')).toEqual({ text, rounded: true }),
);
it('rejects a zero denominator directly', () =>
  expect(() => formatRational(1n, 0n, 'en')).toThrow(RangeError));
it('formats calculated decimals in VI without floating point artifacts', () => {
  expect(calculatePercentage('of', read('12.5'), read('1234567.89'), 'vi')).toEqual({
    ok: true,
    value: { text: '154.320,98625', rounded: false, percent: false },
  });
});
it('keeps exact identities across deterministic signed integer samples', () => {
  for (let n = -100; n <= 100; n += 7) {
    for (const mode of ['of', 'increase', 'decrease'] as PercentageMode[]) {
      const a = mode === 'of' ? read('100') : read(String(n));
      const b = mode === 'of' ? read(String(n)) : read('0');
      expect(calculatePercentage(mode, a, b, 'en')).toEqual({
        ok: true,
        value: { text: String(n), rounded: false, percent: false },
      });
    }
  }
});
