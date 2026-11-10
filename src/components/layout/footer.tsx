import Link from '@/components/navigation/policy-link';
import { getTranslations, getLocale } from 'next-intl/server';
import { Activity } from 'lucide-react';
export async function Footer() {
  const t = await getTranslations(),
    locale = await getLocale();
  return (
    <footer className="site-footer">
      <div className="footer-identity">
        <span className="footer-brand">
          <Activity size={19} aria-hidden="true" />
          Device Lab
        </span>
        <span>
          © 2026 <span aria-hidden="true">·</span> {t('footer')}
        </span>
      </div>
      <Link className="text-link" href={`/${locale}/privacy`}>
        {t('privacyLink')}
      </Link>
    </footer>
  );
}
