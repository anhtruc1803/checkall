import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PrivacySettings } from '@/components/tools/privacy-settings';
import { pageMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/i18n/routing';
import { publishedTools } from '@/lib/tools/registry';
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata(locale, '/privacy', t('privacyLink'), t('privacyText'));
}
export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <main id="main" className="section privacy-settings">
      <h1>{t('privacyLink')}</h1>
      <p style={{ marginTop: 20 }}>{t('privacyText')}</p>
      {(['preferences', 'measurements', 'media'] as const).map((section) => (
        <section className="info-block" key={section}>
          <h2>{t(`privacySections.${section}.title`)}</h2>
          <p>{t(`privacySections.${section}.body`)}</p>
        </section>
      ))}
      <PrivacySettings
        toolNames={Object.fromEntries(
          publishedTools.map((tool) => [tool.id, tool.copy[locale].name]),
        )}
      />
    </main>
  );
}
