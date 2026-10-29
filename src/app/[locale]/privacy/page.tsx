import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PrivacySettings } from '@/components/tools/privacy-settings';
import { pageMetadata } from '@/lib/seo/metadata';
import type { Locale } from '@/lib/i18n/routing';
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
      <p style={{ marginTop: 16 }}>{t('privacyDetails')}</p>
      <PrivacySettings />
    </main>
  );
}
