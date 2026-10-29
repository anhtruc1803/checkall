'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations();
  return (
    <main id="main" className="center-page">
      <h1>{t('errorTitle')}</h1>
      <p>{t('errorText')}</p>
      <Button onClick={reset}>{t('retry')}</Button>
    </main>
  );
}
