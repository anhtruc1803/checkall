import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { categories, publishedTools, getToolSearchIndex, type Category } from '@/lib/tools/registry';
import { Catalog } from '@/components/tools/catalog';
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
  return (
    <main id="main" className="section">
      <h1>{t(category)}</h1>
      <p style={{ marginTop: 12 }}>{t('catalogDescription')}</p>
      <Catalog initialCategory={category as Category} index={getToolSearchIndex(locale)} />
    </main>
  );
}
