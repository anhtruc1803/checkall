'use client';
import { useTranslations } from 'next-intl';
import { EngineSurface } from '@/components/tools/engine-surface';
import { InspectionControls } from '@/components/tools/inspection-controls';
import { useInspection } from '@/hooks/use-inspection';
import { readCompatibility, compatibilityCapabilities } from '@/lib/browser/device-details';
export default function BrowserCompatibility() {
  const t = useTranslations('deviceTools'),
    global = useTranslations(),
    inspection = useInspection(readCompatibility);
  return (
    <EngineSurface>
      <InspectionControls {...inspection} />
      <p className="notice">{t('compatibilityLimit')}</p>
      <dl className="device-list inspection-list">
        {compatibilityCapabilities.map((capability) => (
          <div className="device-row" key={capability}>
            <dt>{t(`features.${capability}`)}</dt>
            <dd>
              {inspection.result ? t(inspection.result.capabilities[capability] ?? 'unknown') : '—'}
            </dd>
          </div>
        ))}
        {(['camera', 'microphone'] as const).map((permission) => (
          <div className="device-row" key={permission}>
            <dt>{t(permission)}</dt>
            <dd>
              {inspection.result ? global(`permissionState.${inspection.result[permission]}`) : '—'}
            </dd>
          </div>
        ))}
      </dl>
    </EngineSurface>
  );
}
