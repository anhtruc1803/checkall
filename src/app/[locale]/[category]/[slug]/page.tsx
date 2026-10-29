import { ToolRunner } from '@/components/tools/tool-runner';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChevronRight, ShieldCheck, ArrowRight } from 'lucide-react';
import { tools, findTool, toolHref } from '@/lib/tools/registry';
import type { Locale } from '@/lib/i18n/routing';
import { pageMetadata } from '@/lib/seo/metadata';
type Params = { locale: Locale; category: string; slug: string };
export function generateStaticParams() {
  return tools
    .filter((tool) => tool.status === 'published')
    .map((tool) => ({ category: tool.category, slug: tool.slug }));
}
export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale, category, slug } = await params;
  const tool = findTool(category, slug);
  if (!tool) return {};
  return pageMetadata(
    locale,
    `/${category}/${slug}`,
    tool.copy[locale].name,
    tool.copy[locale].description,
  );
}
export default async function ToolPage({ params }: { params: Promise<Params> }) {
  const { locale, category, slug } = await params;
  const tool = findTool(category, slug);
  if (!tool) notFound();
  setRequestLocale(locale);
  const t = await getTranslations(),
    copy = tool.copy[locale];
  const site = process.env.SITE_URL ?? 'http://localhost:3000';
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('home'), item: `${site}/${locale}` },
      {
        '@type': 'ListItem',
        position: 2,
        name: t(category),
        item: `${site}/${locale}/${category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: copy.name,
        item: `${site}${toolHref(tool, locale)}`,
      },
    ],
  };
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }}
      />
      <nav className="breadcrumb" aria-label={t('home')}>
        <Link href={`/${locale}`}>{t('home')}</Link>
        <ChevronRight />
        <Link href={`/${locale}/${category}`}>{t(category)}</Link>
        <ChevronRight />
        <span>{copy.name}</span>
      </nav>
      <header className="tool-heading">
        <h1>{copy.name}</h1>
        <p>{copy.description}</p>
        <div className="badges">
          <span className="badge">{t(tool.classification)}</span>
          <span className="badge muted">
            <ShieldCheck size={13} />
            {t('localOnly')}
          </span>
          <span className="badge muted">{t('noPermissions')}</span>
        </div>
      </header>
      <section className="tool-workspace" data-engine={tool.engine} aria-label={copy.name}>
        <ToolRunner
          key={tool.id}
          tool={{
            id: tool.id,
            engine: tool.engine,
            requiredCapabilities: tool.requiredCapabilities,
          }}
        />
      </section>
      <div className="info-grid">
        <div>
          <section className="info-block">
            <h2>{t('instructions')}</h2>
            <p>{copy.instructions}</p>
          </section>
          <section className="info-block">
            <h2>{t('method')}</h2>
            <p>{copy.method}</p>
          </section>
          <section className="info-block">
            <h2>{t('faq')}</h2>
            <details>
              <summary>{t('toolFaqQ', { name: copy.name })}</summary>
              <p>{copy.method}</p>
            </details>
            <details>
              <summary>{t('toolLimitQ', { name: copy.name })}</summary>
              <p>{copy.limitations}</p>
            </details>
          </section>
        </div>
        <aside className="info-side">
          <section className="info-block">
            <h2>{t('limitations')}</h2>
            <p>{copy.limitations}</p>
          </section>
          <section className="info-block">
            <h2>{t('related')}</h2>
            {tool.relatedTools.map((id) => {
              const related = tools.find((item) => item.id === id)!;
              return (
                <p key={id} style={{ marginTop: 14 }}>
                  <Link
                    className="text-link"
                    style={{ whiteSpace: 'normal' }}
                    href={toolHref(related, locale)}
                  >
                    {related.copy[locale].name}
                    <ArrowRight size={14} />
                  </Link>
                </p>
              );
            })}
          </section>
        </aside>
      </div>
    </main>
  );
}
