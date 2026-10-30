'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { EngineSurface } from '@/components/tools/engine-surface';
import { InspectionControls } from '@/components/tools/inspection-controls';
import { Metric } from '@/components/tools/measurement-ui';
import { useInspection } from '@/hooks/use-inspection';
import { readGpuDetails } from '@/lib/browser/gpu-details';
export default function GpuInformation() {
  const t = useTranslations('deviceTools'),
    [detailed, setDetailed] = useState(false);
  const inspection = useInspection(() => {
    const result = readGpuDetails(detailed);
    if (!result) throw Error('unavailable');
    return result;
  });
  const d = inspection.result;
  return (
    <EngineSurface>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={detailed}
          onChange={(event) => {
            setDetailed(event.target.checked);
            inspection.reset();
          }}
        />
        {t('detailedRenderer')}
      </label>
      <InspectionControls {...inspection} />
      {inspection.state === 'error' && (
        <p className="notice" role="status">
          {t('gpuUnavailable')}
        </p>
      )}
      <dl className="results-grid">
        <Metric label={t('graphicsApi')} value={d?.api ?? '—'} />
        <Metric label={t('maxTexture')} value={d?.maxTextureSize ?? '—'} unit="px" />
      </dl>
      <dl className="device-list inspection-list">
        {(['version', 'shading', 'vendor', 'renderer'] as const).map((key) => (
          <div className="device-row" key={key}>
            <dt>{t(key)}</dt>
            <dd>{d?.[key] ?? '—'}</dd>
          </div>
        ))}
        {detailed &&
          (['detailedVendor', 'detailedRenderer'] as const).map((key) => (
            <div className="device-row" key={key}>
              <dt>{t(key)}</dt>
              <dd>{d?.[key] ?? (d ? t('notExposed') : '—')}</dd>
            </div>
          ))}
      </dl>
      <p className="notice">{t('gpuLimit')}</p>
    </EngineSurface>
  );
}
