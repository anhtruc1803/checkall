'use client';
import { useTranslations } from 'next-intl';
import { EngineSurface } from '@/components/tools/engine-surface';
import { InspectionControls } from '@/components/tools/inspection-controls';
import { Metric } from '@/components/tools/measurement-ui';
import { useInspection } from '@/hooks/use-inspection';
import { readDeviceDetails } from '@/lib/browser/device-details';
export default function DeviceInformation() {
  const t = useTranslations('deviceTools'),
    inspection = useInspection(readDeviceDetails),
    d = inspection.result;
  return (
    <EngineSurface>
      <InspectionControls {...inspection} />
      <dl className="results-grid">
        <Metric label={t('browser')} value={d?.browser ?? '—'} />
        <Metric label={t('osEstimate')} value={d?.os ?? '—'} />
        <Metric label={t('language')} value={d?.language ?? '—'} />
        <Metric label={t('logicalProcessors')} value={d?.logicalProcessors ?? '—'} />
        <Metric label={t('memoryEstimate')} value={d?.memoryGiB ?? '—'} unit="GiB" />
        <Metric label={t('maxTouchPoints')} value={d?.maxTouchPoints ?? '—'} />
        <Metric label={t('screen')} value={d?.screen ?? '—'} unit="CSS px" />
        <Metric label={t('viewport')} value={d?.viewport ?? '—'} unit="CSS px" />
        <Metric label={t('dpr')} value={d?.dpr ?? '—'} />
      </dl>
      <p className="notice">{t('deviceLimit')}</p>
      {d && (
        <dl className="device-list inspection-list">
          <div className="device-row">
            <dt>{t('languages')}</dt>
            <dd>{d.languages.join(', ') || '—'}</dd>
          </div>
          <div className="device-row">
            <dt>User-Agent</dt>
            <dd>{d.userAgent || '—'}</dd>
          </div>
        </dl>
      )}
    </EngineSurface>
  );
}
