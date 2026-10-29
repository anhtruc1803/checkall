'use client';
import { useTranslations } from 'next-intl';
import { useHydrated } from '@/hooks/use-hydrated';
export function EngineSurface({ children }: { children: React.ReactNode }) {
  const t = useTranslations(),
    ready = useHydrated();
  return (
    <fieldset
      className="engine-surface"
      disabled={!ready}
      inert={!ready}
      aria-busy={!ready}
      aria-label={t('testControls')}
      data-engine-ready={ready}
    >
      {children}
    </fieldset>
  );
}
