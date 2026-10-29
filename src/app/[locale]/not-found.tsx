import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
export default async function NotFound() {
  const t = await getTranslations(),
    locale = await getLocale();
  return (
    <main id="main" className="center-page">
      <h1>{t('notFound')}</h1>
      <p>{t('notFoundText')}</p>
      <Link className="button button-primary" href={`/${locale}`}>
        {t('home')}
      </Link>
    </main>
  );
}
