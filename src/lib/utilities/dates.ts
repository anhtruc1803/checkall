export type CalendarError = 'date' | 'days' | 'dateRange';
type CalendarResult<T> = { ok: true; value: T } | { ok: false; error: CalendarError };
const dayMs = 86400000;
const leap = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

/** Strict proleptic Gregorian date. No Date.parse, local timezone or clock dependency. */
export function parseCalendarDate(text: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const [year, month, day] = text.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12) return null;
  const lengths = [31, leap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > lengths[month - 1]) return null;
  // setUTCFullYear avoids Date.UTC's special handling of years 00–99.
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getTime() / dayMs;
}
const minDay = parseCalendarDate('0001-01-01')!;
const maxDay = parseCalendarDate('9999-12-31')!;
export function daysBetween(start: string, end: string): CalendarResult<number> {
  const a = parseCalendarDate(start),
    b = parseCalendarDate(end);
  return a === null || b === null ? { ok: false, error: 'date' } : { ok: true, value: b - a };
}
export function addCalendarDays(start: string, days: string): CalendarResult<string> {
  const a = parseCalendarDate(start);
  if (a === null) return { ok: false, error: 'date' };
  // Bound before Number conversion, reject fractional/scientific/grouped input.
  if (!/^[+-]?\d{1,7}$/.test(days)) return { ok: false, error: 'days' };
  const target = a + Number(days);
  if (target < minDay || target > maxDay) return { ok: false, error: 'dateRange' };
  return { ok: true, value: new Date(target * dayMs).toISOString().slice(0, 10) };
}
