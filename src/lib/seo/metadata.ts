import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/routing';
export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
): Metadata {
  const url = process.env.SITE_URL ?? 'http://localhost:3000';
  return {
    title,
    description,
    alternates: {
      canonical: `${url}/${locale}${path}`,
      languages: {
        vi: `${url}/vi${path}`,
        en: `${url}/en${path}`,
        'x-default': `${url}/vi${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${url}/${locale}${path}`,
      siteName: 'Device Lab',
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
  };
}
