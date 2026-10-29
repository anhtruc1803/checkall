import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
export async function Footer() {
  const t = await getTranslations(),
    locale = await getLocale();
  return (
    <footer className="site-footer">
      <span>
        © 2026 Device Lab <span aria-hidden="true">·</span> {t('footer')}
      </span>
      <Link className="text-link" href={`/${locale}/privacy`}>
        {t('privacyLink')}
      </Link>
    </footer>
  );
}
