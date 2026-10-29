import type { Category, Tool } from './types';
import type { Locale } from '@/lib/i18n/routing';
import { categoryOrder } from './types';
export function getSearchCategories(index: readonly ToolSearchEntry[]): Category[] {
  return categoryOrder.filter((category) => index.some((tool) => tool.category === category));
}
export type ToolSearchEntry = Pick<Tool, 'id' | 'slug' | 'category' | 'icon' | 'classification'> & {
  name: string;
  searchText: string;
};
export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
}
export function searchToolIndex(index: ToolSearchEntry[], query: string, category?: Category) {
  const normalized = normalizeSearch(query.trim());
  return index.filter(
    (tool) => (!category || tool.category === category) && tool.searchText.includes(normalized),
  );
}
export function toolHref(tool: Pick<Tool, 'category' | 'slug'>, locale: Locale) {
  return `/${locale}/${tool.category}/${tool.slug}`;
}
