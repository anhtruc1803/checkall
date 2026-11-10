'use client';
import { useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from '@/components/navigation/policy-link';
import { ArrowUpRight, Search, X, SlidersHorizontal } from 'lucide-react';
import { CategoryIcon } from './category-icon';
import {
  getSearchCategories,
  searchToolIndex,
  toolHref,
  type ToolSearchEntry,
} from '@/lib/tools/search';
import type { Category } from '@/lib/tools/registry';
import { useHydrated } from '@/hooks/use-hydrated';
import type { Locale } from '@/lib/i18n/routing';
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
  const searchInput = useRef<HTMLInputElement>(null);
  const categories = getSearchCategories(index);
  const found = searchToolIndex(index, query, category);
  return (
    <>
      <div className="catalog-toolbar" data-home={heroSearch}>
        <div className="searchbox">
          <Search size={20} aria-hidden="true" />
          <label htmlFor="catalog-search" className="sr-only">
            {t('searchLabel')}
          </label>
          <input
            ref={searchInput}
            id="catalog-search"
            aria-label={t('searchLabel')}
            placeholder={t('search')}
            value={query}
            disabled={!hydrated}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              aria-label={t('interface.clearSearch')}
              onClick={() => {
                setQuery('');
                searchInput.current?.focus();
              }}
            >
              <X size={17} aria-hidden="true" />
            </button>
          )}
        </div>
        <span className="catalog-hint">
          <SlidersHorizontal size={15} aria-hidden="true" />
          {t('interface.filterHint')}
        </span>
      </div>
      <div className="filters" role="group" aria-label={t('allTools')}>
        {[undefined, ...categories].map((cat) => (
          <button
            key={cat ?? 'all'}
            className="filter"
            aria-pressed={cat === category}
            disabled={!hydrated}
            onClick={() => setCategory(cat)}
          >
            {cat && <CategoryIcon category={cat} size={16} />}
            {t(cat ?? 'all')}{' '}
            <span className="filter-count">{searchToolIndex(index, '', cat).length}</span>
          </button>
        ))}
      </div>
      <p className="catalog-result-count" role="status" aria-atomic="true">
        {t('toolsCount', { count: found.length })}
      </p>
      <div className="catalog-grid">
        {found.map((tool) => {
          return (
            <Link
              href={toolHref(tool, locale)}
              key={tool.id}
              className="catalog-item"
              data-category={tool.category}
              prefetch={false}
              style={{ whiteSpace: 'normal' }}
            >
              <span className="catalog-icon">
                <CategoryIcon category={tool.category} size={21} />
              </span>
              <div>
                <h3>{tool.name}</h3>
                <p>{t(tool.classification)}</p>
              </div>
              <ArrowUpRight className="arrow" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
      {!found.length && <p className="empty">{t('noResults')}</p>}
    </>
  );
}
