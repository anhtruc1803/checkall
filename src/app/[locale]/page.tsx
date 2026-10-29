import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { DeviceOverview } from '@/components/tools/device-overview';
import { ToolCard } from '@/components/tools/tool-card';
import { Catalog } from '@/components/tools/catalog';
import { publishedTools as tools, getToolSearchIndex } from '@/lib/tools/registry';
import type { Locale } from '@/lib/i18n/routing';
import { pageMetadata } from '@/lib/seo/metadata';
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata(locale, '', t('tagline'), t('heroDescription'));
}
export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <main id="main">
      <section className="hero">
        <div>
          <h1>{t('heroTitle')}</h1>
          <p>{t('heroDescription')}</p>
          <div className="hero-trust">
            <span>
              <ShieldCheck size={15} />
              {t('privacyShort')}
            </span>
            <span>
              <Check size={15} />
              {t('noAccount')}
            </span>
          </div>
          <a href="#catalog" className="button button-primary" style={{ marginTop: 24 }}>
            {t('browse')}
            <ArrowRight size={16} />
          </a>
        </div>
        <DeviceOverview />
      </section>
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
                categoryLabel={t(tool.category)}
                classLabel={t(tool.classification)}
              />
            );
          })}
        </div>
      </section>
      <section id="catalog" className="section">
        <div className="section-head">
          <div>
            <h2>{t('catalogTitle')}</h2>
            <p>{t('catalogDescription')}</p>
          </div>
          <span className="small">{t('toolsCount', { count: tools.length })}</span>
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
