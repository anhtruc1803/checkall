import { describe, expect, it } from 'vitest';
import { convertUnit, unitGroups, unitGroupIds, type UnitGroup } from '@/lib/utilities/units';
import { parseDecimal } from '@/lib/utilities/decimal';
import { addCalendarDays, daysBetween, parseCalendarDate } from '@/lib/utilities/dates';

function convert(
  group: UnitGroup,
  from: string,
  to: string,
  input: string,
  format: 'vi' | 'en' = 'en',
) {
  const parsed = parseDecimal(input, format);
  if (!parsed.ok) throw Error('Invalid test input');
  return convertUnit(parsed.value, group, from, to, format);
}
describe('defined unit conversions', () => {
  it.each([
    ['length', 'in', 'cm', '1', '2.54'],
    ['length', 'mi', 'm', '1', '1,609.344'],
    ['length', 'ft', 'm', '1', '0.3048'],
    ['length', 'yd', 'ft', '1', '3'],
    ['mass', 'lb', 'kg', '1', '0.453592'],
    ['mass', 'oz', 'lb', '16', '1'],
    ['mass', 'tonne', 'kg', '1', '1,000'],
    ['area', 'acre', 'm2', '1', '4,046.856422'],
    ['area', 'ft2', 'm2', '1', '0.092903'],
    ['area', 'ha', 'm2', '1', '10,000'],
    ['volume', 'us_gal', 'l', '1', '3.785412'],
    ['volume', 'uk_gal', 'l', '1', '4.54609'],
    ['volume', 'm3', 'ml', '1', '1,000,000'],
    ['temperature', 'c', 'f', '0', '32'],
    ['temperature', 'f', 'c', '212', '100'],
    ['temperature', 'c', 'f', '-40', '-40'],
    ['temperature', 'k', 'c', '0', '-273.15'],
    ['temperature', 'f', 'k', '-459.67', '0'],
    ['speed', 'mph', 'kph', '1', '1.609344'],
    ['speed', 'knot', 'kph', '1', '1.852'],
    ['speed', 'kph', 'mps', '1', '0.277778'],
    ['duration', 'week', 'h', '1', '168'],
    ['data', 'bit', 'byte', '8', '1'],
    ['data', 'mib', 'byte', '1', '1,048,576'],
    ['data', 'mb', 'byte', '1', '1,000,000'],
    ['data', 'gb', 'gib', '1', '0.931323'],
  ] as const)('%s %s → %s has independent expected value', (group, from, to, input, text) => {
    expect(convert(group, from, to, input)).toMatchObject({ ok: true, text });
  });
  it('preserves large integers, zero and explicit Vietnamese separators without floating-point loss', () => {
    expect(convert('data', 'byte', 'byte', '9007199254740993')).toEqual({
      ok: true,
      text: '9,007,199,254,740,993',
      rounded: false,
    });
    expect(convert('length', 'm', 'cm', '1.234,56', 'vi')).toEqual({
      ok: true,
      text: '123.456',
      rounded: false,
    });
    expect(convert('temperature', 'c', 'k', '-273,15', 'vi')).toEqual({
      ok: true,
      text: '0',
      rounded: false,
    });
    for (const group of unitGroupIds)
      for (const unit of unitGroups[group])
        expect(convert(group, unit.id, unit.id, '0')).toEqual({
          ok: true,
          text: '0',
          rounded: false,
        });
  });
  it('marks rounding accurately, rounds ties away from zero and rejects cross-dimension IDs', () => {
    expect(convert('mass', 'lb', 'kg', '1')).toMatchObject({ rounded: true });
    expect(convert('length', 'm', 'km', '0.0005')).toEqual({
      ok: true,
      text: '0.000001',
      rounded: true,
    });
    expect(convert('temperature', 'c', 'c', '-0.000001')).toMatchObject({
      text: '-0.000001',
      rounded: false,
    });
    expect(convert('length', 'm', 'kg', '1')).toEqual({ ok: false, error: 'unit' });
    expect(convert('length', 'missing', 'm', '1')).toEqual({ ok: false, error: 'unit' });
  });
  it.each([
    ['c', '-273.150001'],
    ['f', '-459.670001'],
    ['k', '-0.000001'],
  ] as const)('rejects %s below absolute zero', (from, value) => {
    expect(convert('temperature', from, 'k', value)).toEqual({ ok: false, error: 'absoluteZero' });
  });
  it('rejects negative physical quantities outside temperature', () => {
    for (const group of unitGroupIds.filter((id) => id !== 'temperature')) {
      const [from, to] = unitGroups[group];
      expect(convert(group, from.id, to.id, '-1')).toEqual({ ok: false, error: 'negative' });
    }
  });
});
describe('timezone-free Gregorian calendar days', () => {
  it.each([
    '',
    '2024-2-29',
    '2024-02-30',
    '2023-02-29',
    '1900-02-29',
    '0000-01-01',
    '10000-01-01',
    '2024-00-01',
    '2024-13-01',
    '2024-01-00',
    '2024-01-32',
    '2024-01-01T00:00:00Z',
    ' 2024-01-01',
  ])('rejects invalid date %j without rollover', (value) => {
    expect(parseCalendarDate(value)).toBeNull();
    expect(daysBetween(value, '2024-01-01')).toEqual({ ok: false, error: 'date' });
  });
  it.each([
    ['2024-02-28', '2024-03-01', 2],
    ['1900-02-28', '1900-03-01', 1],
    ['2000-02-28', '2000-03-01', 2],
    ['0001-01-01', '0001-01-01', 0],
    ['0099-12-31', '0100-01-01', 1],
    ['2026-03-07', '2026-03-09', 2],
    ['2026-10-31', '2026-11-02', 2],
    ['2026-01-01', '2025-12-31', -1],
    ['0001-01-01', '9999-12-31', 3652058],
  ])('counts %s to %s as %i calendar days', (start, end, expected) => {
    expect(daysBetween(start, end)).toEqual({ ok: true, value: expected });
    expect(daysBetween(end, start)).toEqual({ ok: true, value: expected === 0 ? 0 : -expected });
  });
  it.each([
    ['2024-02-28', '1', '2024-02-29'],
    ['2024-03-01', '-1', '2024-02-29'],
    ['1900-02-28', '+1', '1900-03-01'],
    ['0099-12-31', '1', '0100-01-01'],
    ['0001-01-01', '0', '0001-01-01'],
    ['0001-01-01', '3652058', '9999-12-31'],
    ['9999-12-31', '-3652058', '0001-01-01'],
  ])('adds %s + %s = %s', (start, days, expected) => {
    expect(addCalendarDays(start, days)).toEqual({ ok: true, value: expected });
  });
  it.each(['', '1.5', '1e2', '1,000', '--1', ' 1', '1 ', '−1', '10000000', 'NaN'])(
    'rejects ambiguous or excessive day count %j',
    (value) => {
      expect(addCalendarDays('2024-01-01', value)).toEqual({ ok: false, error: 'days' });
    },
  );
  it('rejects out-of-range output and malformed starting dates', () => {
    expect(addCalendarDays('0001-01-01', '-1')).toEqual({ ok: false, error: 'dateRange' });
    expect(addCalendarDays('9999-12-31', '1')).toEqual({ ok: false, error: 'dateRange' });
    expect(addCalendarDays('2023-02-29', '1')).toEqual({ ok: false, error: 'date' });
  });
});
