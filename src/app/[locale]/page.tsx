import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Check, Layers3 } from 'lucide-react';
import PolicyLink from '@/components/navigation/policy-link';
import { CategoryIcon } from '@/components/tools/category-icon';
import { DeviceOverview } from '@/components/tools/device-overview';
import { ToolCard } from '@/components/tools/tool-card';
import { Catalog } from '@/components/tools/catalog';
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
  return (
    <main id="main" className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            {t('interface.eyebrow')}
          </p>
          <h1>
            {t('heroTitle')
              .split('\n')
              .map((line, index) => (
                <span key={line} className={index ? 'hero-accent' : undefined}>
                  {line}
                </span>
              ))}
          </h1>
          <p className="hero-description">{t('heroDescription', { count: tools.length })}</p>
          <div className="hero-actions">
            <a href="#catalog" className="button button-primary">
              {t('browse')}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <PolicyLink href={`/${locale}/screen/refresh-rate`} className="button button-outline">
              {t('interface.quickTest')}
              <ArrowRight size={16} aria-hidden="true" />
            </PolicyLink>
          </div>
          <div className="hero-trust">
            <span>
              <ShieldCheck size={15} aria-hidden="true" />
              {t('privacyShort')}
            </span>
            <span>
              <Check size={15} aria-hidden="true" />
              {t('noAccount')}
            </span>
          </div>
          <dl className="lab-stats">
            <div>
              <dt>{t('interface.tools')}</dt>
              <dd>{String(tools.length).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>{t('interface.categories')}</dt>
              <dd>{String(categories.length).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>{t('interface.languages')}</dt>
              <dd>
                VI<span> / </span>EN
              </dd>
            </div>
          </dl>
        </div>
        <DeviceOverview />
      </section>
      <nav className="category-rail" aria-label={t('interface.chooseDevice')}>
        {categories.map((category) => (
          <PolicyLink
            key={category}
            href={`/${locale}/${category}`}
            className="category-shortcut"
            data-category={category}
          >
            <span className="category-icon">
              <CategoryIcon category={category} />
            </span>
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
            <p className="eyebrow">01 / {t('interface.quickStart')}</p>
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
                categoryLabel={t(tool.category)}
                classLabel={t(tool.classification)}
              />
            );
          })}
        </div>
      </section>
      <section id="catalog" className="section catalog-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">02 / {t('interface.explore')}</p>
            <h2>{t('catalogTitle')}</h2>
            <p>{t('catalogDescription')}</p>
          </div>
          <span className="catalog-total">
            <Layers3 size={16} aria-hidden="true" />
            {t('toolsCount', { count: tools.length })}
          </span>
        </div>
        <Catalog heroSearch index={getToolSearchIndex(locale)} />
      </section>
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
