'use client';
import { useTranslations } from 'next-intl';
import { Monitor } from 'lucide-react';
import { useDevice } from '@/hooks/use-device';
import { useSyncExternalStore } from 'react';
import { sessionMeasurements } from '@/lib/storage/session-measurements';
export function DeviceOverview() {
  const t = useTranslations(),
    device = useDevice();
  const refresh = useSyncExternalStore(
    sessionMeasurements.subscribe,
    sessionMeasurements.getRefresh,
    () => null,
  );
  const rows = [
    ['browser', device?.browser ?? '—'],
    ['os', device?.os ?? '—'],
    ['screenSize', device ? `${device.screenWidth} × ${device.screenHeight}` : '—'],
    ['viewportSize', device ? `${device.viewportWidth} × ${device.viewportHeight}` : '—'],
    ['dpr', device?.dpr ?? '—'],
    [
      'orientation',
      device ? t(device.orientation.includes('landscape') ? 'landscape' : 'portrait') : '—',
    ],
    ['refresh', refresh?.value ? `≈ ${refresh.value.toFixed(1)} Hz` : t('notTested')],
    [
      'capabilities',
      device
        ? [
            ...(device.capabilities.canvas ? ['Canvas'] : []),
            ...(device.capabilities.pointer ? ['PointerEvent'] : []),
            ...(device.capabilities.touch ? ['Touch'] : []),
          ].join(' · ') || '—'
        : '—',
    ],
  ] as const;
  return (
    <aside className="device-panel">
      <div className="panel-head">
        <div>
          <h2 style={{ fontSize: '1rem' }}>{t('overview')}</h2>
          <p className="small">{t('overviewNote')}</p>
        </div>
        <Monitor size={24} />
      </div>
      <dl className="device-list">
        {rows.map(([key, value]) => (
          <div className="device-row" key={key}>
            <dt>{t(key)}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="small" style={{ marginTop: 12 }}>
        <span className="status-dot" />
        {t('localOnly')}
      </p>
    </aside>
  );
}
