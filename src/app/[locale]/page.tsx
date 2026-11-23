import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Layers3 } from 'lucide-react';
import PolicyLink from '@/components/navigation/policy-link';
import { CategoryArt } from '@/components/tools/category-art';
import { LabScene } from '@/components/tools/lab-scene';
import { ProblemChooser } from '@/components/tools/problem-chooser';
import { DeviceOverview } from '@/components/tools/device-overview';
import { ToolCard } from '@/components/tools/tool-card';
import { Catalog } from '@/components/tools/catalog';
import { HomeToolSearch } from '@/components/tools/home-tool-search';
import styles from '@/components/tools/home-discovery.module.css';
import { categories, publishedTools as tools, getToolSearchIndex } from '@/lib/tools/registry';
import type { Locale } from '@/lib/i18n/routing';
import { pageMetadata } from '@/lib/seo/metadata';
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata(locale, '', t('tagline'), t('heroDescription', { count: tools.length }));
}
export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const index = getToolSearchIndex(locale);
  return (
    <main id="main" className="home-page">
      <div className={styles.discovery}>
        <div className={styles.intro}>
          <h1>{t('homeDiscovery.title')}</h1>
          <p>{t('heroDescription', { count: tools.length })}</p>
          <HomeToolSearch index={index} />
          <a href="#catalog" className={`text-link ${styles.catalogLink}`}>
            {t('homeDiscovery.browseAll', { count: tools.length })}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <ProblemChooser locale={locale} />
      </div>
      <nav className="category-rail" aria-label={t('interface.chooseDevice')}>
        {categories.map((category) => (
          <PolicyLink
            key={category}
            href={`/${locale}/${category}`}
            className="category-shortcut"
            data-category={category}
          >
            <CategoryArt category={category} />
            <span>{t(category)}</span>
            <span className="category-count">
              {tools.filter((tool) => tool.category === category).length}
            </span>
          </PolicyLink>
        ))}
      </nav>
      <section className="section">
        <div className="section-head">
          <div>
            <h2>{t('featured')}</h2>
            <p>{t('featuredDescription')}</p>
          </div>
          <a className="text-link" href="#catalog">
            {t('viewAll')}
            <ArrowRight size={16} />
          </a>
        </div>
        <div className="featured-grid">
          {['A05', 'B01', 'C01'].map((id) => {
            const tool = tools.find((tool) => tool.id === id)!;
            return (
              <ToolCard
                key={id}
                tool={tool}
                locale={locale}
                name={tool.copy[locale].name}
                description={tool.copy[locale].description}
                featured
              />
            );
          })}
        </div>
      </section>
      <section id="catalog" className="section catalog-section">
        <div className="section-head">
          <div>
            <h2>{t('catalogTitle')}</h2>
            <p>{t('catalogDescription')}</p>
          </div>
          <span className="catalog-total">
            <Layers3 size={16} aria-hidden="true" />
            {t('toolsCount', { count: tools.length })}
          </span>
        </div>
        <Catalog heroSearch index={index} />
      </section>
      <div className={styles.context}>
        <div className="home-device-summary">
          <DeviceOverview />
        </div>
        <LabScene
          label={t('interface.sceneAction')}
          hint={t('interface.sceneHint')}
          caption={t('interface.sceneCaption')}
        />
      </div>
      <section className="section">
        <h2>{t('howTitle')}</h2>
        <div className="guide">
          {[1, 2, 3].map((step) => (
            <div key={step} className="guide-step">
              <span>{String(step).padStart(2, '0')}</span>
              <h3>{t(`how${step}`)}</h3>
              <p>{t(`how${step}Text`)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="privacy-banner">
        <ShieldCheck size={34} />
        <div>
          <h2>{t('privacyTitle')}</h2>
          <p>{t('privacyText')}</p>
        </div>
        <Link className="text-link" href={`/${locale}/privacy`}>
          {t('privacyLink')}
          <ArrowRight size={16} />
        </Link>
      </section>
      <section className="section">
        <h2>{t('faq')}</h2>
        <div className="faq-list">
          {['Local', 'Accuracy', 'Save'].map((key) => (
            <details key={key}>
              <summary>{t(`faq${key}Q`)}</summary>
              <p>{t(`faq${key}A`)}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
