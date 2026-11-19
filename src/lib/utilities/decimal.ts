export type NumberFormat = 'vi' | 'en';
export type DecimalError = 'empty' | 'format' | 'range';
export interface Decimal {
  coefficient: bigint;
  scale: number;
  integer: string;
  fraction: string;
  canonical: string;
}
export type ParsedDecimal = { ok: true; value: Decimal } | { ok: false; error: DecimalError };

/** Explicit separators, bounded input, no conversion of the whole value to Number. */
export function parseDecimal(input: string, format: NumberFormat): ParsedDecimal {
  const text = input.trim();
  if (!text) return { ok: false, error: 'empty' };
  if (text.length > 128) return { ok: false, error: 'range' };
  const pattern =
    format === 'vi'
      ? /^[+-]?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/
      : /^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;
  if (!pattern.test(text)) return { ok: false, error: 'format' };
  const unsigned = text.replace(/^[+-]/, '').replaceAll(format === 'vi' ? '.' : ',', '');
  const [rawInteger, fraction = ''] = unsigned.split(format === 'vi' ? ',' : '.');
  const integer = rawInteger.replace(/^0+(?=\d)/, '');
  if (integer.length > 24 || fraction.length > 6) return { ok: false, error: 'range' };
  const magnitude = BigInt(integer + fraction);
  const negative = text.startsWith('-') && magnitude !== 0n;
  return {
    ok: true,
    value: {
      coefficient: negative ? -magnitude : magnitude,
      scale: fraction.length,
      integer,
      fraction,
      canonical: `${negative ? '-' : ''}${integer}${fraction ? `.${fraction}` : ''}`,
    },
  };
}

export function formatDecimal(value: Decimal, format: NumberFormat): string {
  const group = format === 'vi' ? '.' : ',';
  const separator = format === 'vi' ? ',' : '.';
  return `${value.coefficient < 0n ? '-' : ''}${value.integer.replace(/\B(?=(\d{3})+(?!\d))/g, group)}${value.fraction ? separator + value.fraction : ''}`;
}

export type PercentageMode = 'of' | 'ratio' | 'change' | 'increase' | 'decrease';
export interface PercentageResult {
  text: string;
  rounded: boolean;
  percent: boolean;
}
export type PercentageCalculation =
  | { ok: true; value: PercentageResult }
  | { ok: false; error: 'zeroBase' | 'negativeBase' };

/** Display up to six decimal places, nearest with ties away from zero. */
export function formatRational(
  numerator: bigint,
  denominator: bigint,
  format: NumberFormat,
): Pick<PercentageResult, 'text' | 'rounded'> {
  if (denominator === 0n) throw new RangeError('Zero denominator');
  const negative = numerator < 0n !== denominator < 0n;
  const magnitude = numerator < 0n ? -numerator : numerator;
  const divisor = denominator < 0n ? -denominator : denominator;
  const scaled = magnitude * 1000000n;
  const remainder = scaled % divisor;
  const rounded = scaled / divisor + (remainder * 2n >= divisor ? 1n : 0n);
  const digits = rounded.toString().padStart(7, '0');
  const integer = digits.slice(0, -6);
  const fraction = digits.slice(-6).replace(/0+$/, '');
  return {
    text: formatDecimal(
      {
        integer,
        fraction,
        coefficient: negative && rounded !== 0n ? -1n : 0n,
        scale: fraction.length,
        canonical: '',
      },
      format,
    ),
    rounded: remainder !== 0n,
  };
}

export function calculatePercentage(
  mode: PercentageMode,
  a: Decimal,
  b: Decimal,
  format: NumberFormat,
): PercentageCalculation {
  const x = a.coefficient,
    y = b.coefficient;
  const sx = 10n ** BigInt(a.scale),
    sy = 10n ** BigInt(b.scale);
  let numerator: bigint, denominator: bigint;
  switch (mode) {
    case 'of':
      numerator = x * y;
      denominator = sx * sy * 100n;
      break;
    case 'ratio':
      if (y === 0n) return { ok: false, error: 'zeroBase' };
      numerator = x * sy * 100n;
      denominator = y * sx;
      break;
    case 'change':
      if (x === 0n) return { ok: false, error: 'zeroBase' };
      if (x < 0n) return { ok: false, error: 'negativeBase' };
      numerator = (y * sx - x * sy) * 100n;
      denominator = x * sy;
      break;
    case 'increase':
      numerator = x * (100n * sy + y);
      denominator = sx * sy * 100n;
      break;
    case 'decrease':
      numerator = x * (100n * sy - y);
      denominator = sx * sy * 100n;
      break;
  }
  return {
    ok: true,
    value: {
      ...formatRational(numerator, denominator, format),
      percent: mode === 'ratio' || mode === 'change',
    },
  };
}
