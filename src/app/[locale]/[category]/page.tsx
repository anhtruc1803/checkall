import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  categories,
  publishedTools,
  getToolSearchIndex,
  type Category,
} from '@/lib/tools/registry';
import { Catalog } from '@/components/tools/catalog';
import { UtilityCatalog } from '@/components/tools/utility-catalog';
import styles from '@/components/tools/utility-catalog.module.css';
import { getUtilitySection } from '@/lib/tools/groups';
import type { Locale } from '@/lib/i18n/routing';
import { pageMetadata } from '@/lib/seo/metadata';
export function generateStaticParams() {
  return categories.map((category) => ({ category }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; category: string }>;
}) {
  const { locale, category } = await params;
  if (!categories.includes(category as Category)) return {};
  const t = await getTranslations({ locale });
  return pageMetadata(
    locale,
    `/${category}`,
    t(category),
    `${t(category)} — ${t('heroDescription', { count: publishedTools.length })}`,
  );
}
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: Locale; category: string }>;
}) {
  const { locale, category } = await params;
  if (!categories.includes(category as Category)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();
  const index = getToolSearchIndex(locale);
  if (category === 'utilities') {
    const utilities = new Map(
      publishedTools.filter((tool) => tool.category === category).map((tool) => [tool.id, tool]),
    );
    const utilityIndex = index.flatMap((entry) => {
      const tool = utilities.get(entry.id);
      return tool
        ? [
            {
              ...entry,
              section: getUtilitySection(tool.engine),
              description: tool.copy[locale].description,
            },
          ]
        : [];
    });
    return (
      <main id="main" className={`section ${styles.page}`}>
        <header className={styles.head}>
          <h1>{t('utilities')}</h1>
          <p>{t('utilityCatalog.intro')}</p>
        </header>
        <UtilityCatalog index={utilityIndex} />
      </main>
    );
  }
  return (
    <main id="main" className="section category-page">
      <h1>{t(category)}</h1>
      <p style={{ marginTop: 12 }}>{t('catalogDescription')}</p>
      <Catalog initialCategory={category as Category} index={index} />
    </main>
  );
}
