'use client';
import { EngineSurface } from '@/components/tools/engine-surface';
import { useTranslations } from 'next-intl';
import { useDevice } from '@/hooks/use-device';
import { Metric } from '@/components/tools/measurement-ui';
export default function ScreenInfo() {
  const t = useTranslations(),
    d = useDevice();
  return (
    <EngineSurface>
      <dl className="results-grid">
        <Metric
          label={t('screenSize')}
          value={d ? `${d.screenWidth} × ${d.screenHeight}` : '—'}
          unit="CSS px"
        />
        <Metric
          label={t('availableSize')}
          value={d ? `${d.availableWidth} × ${d.availableHeight}` : '—'}
          unit="CSS px"
        />
        <Metric
          label={t('viewportSize')}
          value={d ? `${d.viewportWidth} × ${d.viewportHeight}` : '—'}
          unit="CSS px"
        />
        <Metric label={t('dpr')} value={d?.dpr ?? '—'} />
        <Metric
          label={t('orientation')}
          value={d ? t(d.orientation.includes('landscape') ? 'landscape' : 'portrait') : '—'}
        />
        <Metric
          label={t('visualViewport')}
          value={
            d?.visualWidth !== undefined
              ? `${d.visualWidth.toFixed(1)} × ${d.visualHeight?.toFixed(1)}`
              : '—'
          }
          unit="CSS px"
        />
        <Metric label={t('scale')} value={d?.visualScale?.toFixed(2) ?? '—'} />
        <Metric
          label={t('physicalEstimate')}
          value={
            d ? `${Math.round(d.screenWidth * d.dpr)} × ${Math.round(d.screenHeight * d.dpr)}` : '—'
          }
        />
      </dl>
      <p className="notice">{t('physicalCaveat')}</p>
      {d && !d.capabilities.visualViewport && (
        <p className="small">VisualViewport: {t('unsupported')}</p>
      )}
      <h3 style={{ marginTop: 24 }}>{t('capabilities')}</h3>
      <dl className="device-list" style={{ marginTop: 16 }}>
        {d &&
          Object.entries(d.capabilities).map(([name, supported]) => (
            <div key={name} className="device-row">
              <dt>{name}</dt>
              <dd>{t(supported ? 'supported' : 'unsupported')}</dd>
            </div>
          ))}
      </dl>
    </EngineSurface>
  );
}
