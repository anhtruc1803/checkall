'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Status } from './measurement-ui';
import type { MeasurementState } from '@/lib/measurements/types';
export function InspectionControls({
  state,
  read,
  reset,
}: {
  state: MeasurementState;
  read: () => void;
  reset: () => void;
}) {
  const t = useTranslations();
  return (
    <div className="controls">
      <Button onClick={read} disabled={state === 'preparing'}>
        {t('deviceTools.read')}
      </Button>
      <Button variant="outline" onClick={reset}>
        {t('reset')}
      </Button>
      <Status state={state} />
    </div>
  );
}
