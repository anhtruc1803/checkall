'use client';
import { useTranslations } from 'next-intl';
import { EngineSurface } from '@/components/tools/engine-surface';
import { InspectionControls } from '@/components/tools/inspection-controls';
import { Metric } from '@/components/tools/measurement-ui';
import { useInspection } from '@/hooks/use-inspection';
import { readStorageDetails } from '@/lib/browser/storage-details';
export default function StorageCapabilities() {
  const t = useTranslations('deviceTools'),
    inspection = useInspection(readStorageDetails),
    d = inspection.result;
  const bytes = (value: number | null | undefined) =>
    value == null ? '—' : (value / 1048576).toFixed(2);
  return (
    <EngineSurface>
      <InspectionControls {...inspection} />
      <p className="notice">{t('storageConsent')}</p>
      <dl className="results-grid">
        <Metric label={t('usage')} value={bytes(d?.usage)} unit="MiB" />
        <Metric label={t('quota')} value={bytes(d?.quota)} unit="MiB" />
      </dl>
      <dl className="device-list inspection-list">
        <div className="device-row">
          <dt>localStorage · {t('roundTrip')}</dt>
          <dd>{d ? t(d.local) : '—'}</dd>
        </div>
        <div className="device-row">
          <dt>sessionStorage · {t('roundTrip')}</dt>
          <dd>{d ? t(d.session) : '—'}</dd>
        </div>
        <div className="device-row">
          <dt>IndexedDB · {t('apiOnly')}</dt>
          <dd>{d ? t(d.indexedDB ? 'available' : 'unavailable') : '—'}</dd>
        </div>
        <div className="device-row">
          <dt>CacheStorage · {t('apiOnly')}</dt>
          <dd>{d ? t(d.cacheStorage ? 'available' : 'unavailable') : '—'}</dd>
        </div>
        <div className="device-row">
          <dt>{t('persisted')}</dt>
          <dd>{d ? t(d.persisted === null ? 'unknown' : d.persisted ? 'yes' : 'no') : '—'}</dd>
        </div>
      </dl>
      <p className="notice">{t('storageLimit')}</p>
      {d && (d.local === 'cleanup-failed' || d.session === 'cleanup-failed') && (
        <p role="alert">{t('cleanupWarning')}</p>
      )}
    </EngineSurface>
  );
}
