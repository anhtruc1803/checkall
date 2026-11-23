'use client';

import { useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUpRight, Search, X } from 'lucide-react';
import type { Locale } from '@/lib/i18n/routing';
import { searchToolIndex, toolHref, type ToolSearchEntry } from '@/lib/tools/search';
import PolicyLink from '@/components/navigation/policy-link';
import { Button } from '@/components/ui/button';
import { useHydrated } from '@/hooks/use-hydrated';
import styles from './home-discovery.module.css';

export function HomeToolSearch({ index }: { index: ToolSearchEntry[] }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const hydrated = useHydrated();
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLUListElement>(null);
  const hasQuery = query.trim().length > 0;
  const matches = hasQuery ? searchToolIndex(index, query) : [];

  function clear() {
    setQuery('');
    input.current?.focus();
  }

  return (
    <div className={styles.search} role="search" aria-labelledby="home-search-label">
      <label id="home-search-label" htmlFor="home-tool-search">
        {t('homeDiscovery.searchLabel')}
      </label>
      <div className={styles.searchBox}>
        <Search size={22} aria-hidden="true" />
        <input
          ref={input}
          id="home-tool-search"
          type="search"
          enterKeyHint="search"
          disabled={!hydrated}
          value={query}
          placeholder={t('homeDiscovery.searchExample')}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
            if ((event.key === 'ArrowDown' || event.key === 'Enter') && matches.length) {
              event.preventDefault();
              results.current?.querySelector('a')?.focus();
            }
            if (event.key === 'Escape' && query) {
              event.preventDefault();
              clear();
            }
          }}
        />
        {query && (
          <Button variant="ghost" size="icon" onClick={clear} aria-label={t('homeDiscovery.clear')}>
            <X size={18} aria-hidden="true" />
          </Button>
        )}
      </div>
      <p role="status" className={matches.length || !hasQuery ? 'sr-only' : styles.noResults}>
        {hasQuery &&
          (matches.length
            ? t('toolsCount', { count: matches.length })
            : t('homeDiscovery.noResults'))}
      </p>
      {matches.length > 0 && (
        <ul className={styles.results} ref={results}>
          {matches.map((tool) => (
            <li key={tool.id}>
              <PolicyLink href={toolHref(tool, locale)} prefetch={false} tabIndex={0}>
                <span>{tool.name}</span>
                <small>{t(tool.category)}</small>
                <ArrowUpRight size={16} aria-hidden="true" />
              </PolicyLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
