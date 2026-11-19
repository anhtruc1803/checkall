import type { Locale } from '@/lib/i18n/routing';
import type { Decimal } from './decimal';

export interface WordOptions {
  language: Locale;
  money: boolean;
  filler: 'linh' | 'lẻ';
  thousand: 'nghìn' | 'ngàn';
  capitalize: boolean;
  exactSuffix: boolean;
}
export const defaultWordOptions: WordOptions = {
  language: 'vi',
  money: false,
  filler: 'linh',
  thousand: 'nghìn',
  capitalize: true,
  exactSuffix: true,
};
const viDigits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const enSmall = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
const enTens = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];
const enScales = [
  '',
  'thousand',
  'million',
  'billion',
  'trillion',
  'quadrillion',
  'quintillion',
  'sextillion',
];

function tripletVi(n: number, padded: boolean, filler: WordOptions['filler']): string {
  const hundred = Math.floor(n / 100),
    ten = Math.floor(n / 10) % 10,
    unit = n % 10;
  const parts: string[] = [];
  if (hundred || padded) parts.push(viDigits[hundred], 'trăm');
  if (ten > 1) parts.push(viDigits[ten], 'mươi');
  else if (ten === 1) parts.push('mười');
  else if ((hundred || padded) && unit) parts.push(filler);
  if (unit)
    parts.push(unit === 1 && ten > 1 ? 'mốt' : unit === 5 && ten > 0 ? 'lăm' : viDigits[unit]);
  return parts.join(' ');
}
function tripletEn(n: number): string {
  const remainder = n % 100;
  const parts: string[] = [];
  if (n >= 100) parts.push(`${enSmall[Math.floor(n / 100)]} hundred`);
  if (remainder)
    parts.push(
      remainder < 20
        ? enSmall[remainder]
        : `${enTens[Math.floor(remainder / 10)]}${remainder % 10 ? `-${enSmall[remainder % 10]}` : ''}`,
    );
  return parts.join(' ');
}
function integerWords(integer: string, options: WordOptions): string {
  if (integer === '0') return options.language === 'vi' ? 'không' : 'zero';
  const groups = integer.match(/\d{1,3}(?=(?:\d{3})*$)/g)!;
  const result: string[] = [];
  groups.forEach((group, index) => {
    const value = Number(group); // Only a bounded three-digit group enters Number.
    if (!value) return;
    const power = groups.length - index - 1;
    if (options.language === 'en')
      result.push([tripletEn(value), enScales[power]].filter(Boolean).join(' '));
    else {
      const scale = [
        power % 3 === 1 ? options.thousand : power % 3 === 2 ? 'triệu' : '',
        ...Array<string>(Math.floor(power / 3)).fill('tỷ'),
      ]
        .filter(Boolean)
        .join(' ');
      result.push(
        [tripletVi(value, index > 0 && value < 100, options.filler), scale]
          .filter(Boolean)
          .join(' '),
      );
    }
  });
  return result.join(' ');
}

export function numberToWords(
  value: Decimal,
  options: WordOptions,
): { ok: true; text: string } | { ok: false; error: 'vndFraction' } {
  if (options.money && /[1-9]/.test(value.fraction)) return { ok: false, error: 'vndFraction' };
  const vi = options.language === 'vi';
  let text = `${value.coefficient < 0n ? (vi ? 'âm ' : 'minus ') : ''}${integerWords(value.integer, options)}`;
  if (options.money)
    text += vi
      ? ` đồng${options.exactSuffix ? ' chẵn' : ''}`
      : ` Vietnamese dong${options.exactSuffix ? ' only' : ''}`;
  else if (value.fraction)
    text += ` ${vi ? 'phẩy' : 'point'} ${[...value.fraction].map((digit) => (vi ? viDigits : enSmall)[Number(digit)]).join(' ')}`;
  return {
    ok: true,
    text: options.capitalize ? text[0].toLocaleUpperCase(options.language) + text.slice(1) : text,
  };
}
