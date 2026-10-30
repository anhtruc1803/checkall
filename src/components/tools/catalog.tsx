'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowUpRight, Monitor, Keyboard, Mouse, Search, Cpu, Globe } from 'lucide-react';
import {
  getSearchCategories,
  searchToolIndex,
  toolHref,
  type ToolSearchEntry,
} from '@/lib/tools/search';
import type { Category } from '@/lib/tools/registry';
import { useHydrated } from '@/hooks/use-hydrated';
import type { Locale } from '@/lib/i18n/routing';
const icons: Partial<Record<Category, typeof Monitor>> = {
  screen: Monitor,
  keyboard: Keyboard,
  mouse: Mouse,
  device: Cpu,
  browser: Globe,
};
export function Catalog({
  initialCategory,
  heroSearch = false,
  index,
}: {
  initialCategory?: Category;
  heroSearch?: boolean;
  index: ToolSearchEntry[];
}) {
  const t = useTranslations(),
    locale = useLocale() as Locale;
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState<Category | undefined>(initialCategory);
  const hydrated = useHydrated();
  const categories = getSearchCategories(index);
  const found = searchToolIndex(index, query, category);
  return (
    <>
      <div className="searchbox" style={{ marginTop: heroSearch ? 0 : 20, marginBottom: 24 }}>
        <Search size={20} />
        <input
          aria-label={t('searchLabel')}
          placeholder={t('search')}
          value={query}
          disabled={!hydrated}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="filters" aria-label={t('allTools')}>
        {[undefined, ...categories].map((cat) => (
          <button
            key={cat ?? 'all'}
            className="filter"
            aria-pressed={cat === category}
            disabled={!hydrated}
            onClick={() => setCategory(cat)}
          >
            {t(cat ?? 'all')}{' '}
            <span className="small">{searchToolIndex(index, '', cat).length}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        {t('toolsCount', { count: found.length })}
      </p>
      <div className="catalog-grid">
        {found.map((tool) => {
          const Icon = icons[tool.icon] ?? Monitor;
          return (
            <Link
              href={toolHref(tool, locale)}
              key={tool.id}
              className="catalog-item"
              prefetch={false}
              style={{ whiteSpace: 'normal' }}
            >
              <Icon size={20} />
              <div>
                <h3>{tool.name}</h3>
                <p>{t(tool.classification)}</p>
              </div>
              <ArrowUpRight className="arrow" />
            </Link>
          );
        })}
      </div>
      {!found.length && <p className="empty">{t('noResults')}</p>}
    </>
  );
}
