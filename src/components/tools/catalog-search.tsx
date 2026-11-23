'use client';

import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useHydrated } from '@/hooks/use-hydrated';

export function CatalogSearch({
  query,
  onChange,
  placeholder,
  visibleLabel = false,
}: {
  query: string;
  onChange: (query: string) => void;
  placeholder?: string;
  visibleLabel?: boolean;
}) {
  const t = useTranslations();
  const hydrated = useHydrated();
  const input = useRef<HTMLInputElement>(null);

  return (
    <>
      <label htmlFor="catalog-search" className={visibleLabel ? undefined : 'sr-only'}>
        {t('searchLabel')}
      </label>
      <div className="searchbox">
        <Search size={20} aria-hidden="true" />
        <input
          ref={input}
          id="catalog-search"
          placeholder={placeholder ?? t('search')}
          value={query}
          disabled={!hydrated}
          onChange={(event) => onChange(event.target.value)}
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            aria-label={t('interface.clearSearch')}
            onClick={() => {
              onChange('');
              input.current?.focus();
            }}
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </div>
    </>
  );
}
