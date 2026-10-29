import { z } from 'zod/mini';
export const STORAGE_PREFIX = 'device-lab:';
const summarySchema = z.object({
  toolId: z.string().check(z.maxLength(10)),
  time: z.string().check(z.maxLength(64)),
  value: z.string().check(z.maxLength(500)),
});
const schemas: Record<string, z.ZodMiniType> = {
  theme: z.enum(['dark', 'light']),
  locale: z.enum(['vi', 'en']),
  save: z.boolean(),
  summaries: z.array(summarySchema).check(z.maxLength(30)),
};
export function parsePreference<T>(key: string, raw: string, fallback: T): T {
  try {
    const value: unknown = JSON.parse(raw);
    const schema = schemas[key];
    if (schema) {
      const parsed = schema.safeParse(value);
      return parsed.success ? (parsed.data as T) : fallback;
    }
    return typeof value === typeof fallback ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}
export interface SavedSummary {
  toolId: string;
  time: string;
  value: string;
}
export function readPreference<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(STORAGE_PREFIX + key);
    return value ? parsePreference(key, value, fallback) : fallback;
  } catch {
    return fallback;
  }
}
export function writePreference(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new Event('device-lab-storage'));
    return true;
  } catch {
    return false;
  }
}
export function saveSummary(summary: SavedSummary) {
  if (!summarySchema.safeParse(summary).success) return false;
  if (!readPreference('save', false)) return false;
  return writePreference(
    'summaries',
    [summary, ...readPreference<SavedSummary[]>('summaries', [])].slice(0, 30),
  );
}
export function clearLocalData() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
    document.cookie = 'NEXT_LOCALE=; Max-Age=0; Path=/; SameSite=Lax';
    window.dispatchEvent(new Event('device-lab-storage'));
    return true;
  } catch {
    return false;
  }
}
