'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeftRight, Calculator, Image, LayoutGrid, TextCursorInput } from 'lucide-react';
import type { Locale } from '@/lib/i18n/routing';
import { utilitySectionOrder, type UtilitySection } from '@/lib/tools/groups';
import { searchToolIndex, type ToolSearchEntry } from '@/lib/tools/search';
import { CatalogSearch } from './catalog-search';
import { ToolCard } from './tool-card';
import styles from './utility-catalog.module.css';

export type UtilityCatalogEntry = ToolSearchEntry & {
  section: UtilitySection;
  description: string;
};

const sectionIcons = {
  numbers: Calculator,
  text: TextCursorInput,
  conversion: ArrowLeftRight,
  media: Image,
  other: LayoutGrid,
};

export function UtilityCatalog({ index }: { index: UtilityCatalogEntry[] }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [query, setQuery] = useState('');
  const found = searchToolIndex(index, query);

  return (
    <>
      <div className={styles.toolbar}>
        <div role="search" className={styles.search}>
          <CatalogSearch
            query={query}
            onChange={setQuery}
            placeholder={t('utilityCatalog.searchExample')}
            visibleLabel
          />
        </div>
        <p className={styles.count} role="status" aria-atomic="true">
          {t('toolsCount', { count: found.length })}
        </p>
      </div>
      {!found.length && <p className={styles.empty}>{t('utilityCatalog.noResults')}</p>}
      {utilitySectionOrder.map((section) => {
        const tools = found.filter((tool) => tool.section === section);
        if (!tools.length) return null;
        const Icon = sectionIcons[section];
        const headingId = `utilities-${section}`;
        return (
          <section className={styles.section} aria-labelledby={headingId} key={section}>
            <h2 id={headingId} className={styles.sectionTitle}>
              <Icon size={22} aria-hidden="true" />
              <span>{t(`utilityCatalog.sections.${section}`)}</span>
            </h2>
            <ul className={styles.list}>
              {tools.map((tool) => (
                <li key={tool.id}>
                  <ToolCard
                    tool={tool}
                    name={tool.name}
                    locale={locale}
                    description={tool.description}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
