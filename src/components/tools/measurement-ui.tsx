'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { IntervalSummary, MeasurementState } from '@/lib/measurements/types';
import { saveSummary, writePreference } from '@/lib/storage/preferences';
import { usePreference } from '@/hooks/use-preference';
export function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
}) {
  return (
    <div className="metric">
      <dt>{label}</dt>
      <dd>
        {value}
        {unit && <small>{unit}</small>}
      </dd>
    </div>
  );
}
export function Status({ state }: { state: MeasurementState }) {
  const t = useTranslations();
  return (
    <span className="status" role="status" data-state={state}>
      <span className="status-dot" />
      {t(state === 'reset' ? 'idle' : state)}
    </span>
  );
}
export function IntervalResults({
  stats,
  intervals,
}: {
  stats: IntervalSummary | null;
  intervals: number[];
}) {
  const t = useTranslations();
  return (
    <>
      <dl className="results-grid">
        <Metric label={t('samples')} value={stats?.count ?? '—'} />
        <Metric label={t('median')} value={stats ? stats.median.toFixed(2) : '—'} unit="ms" />
        <Metric
          label={t('variation')}
          value={stats ? stats.standardDeviation.toFixed(2) : '—'}
          unit="ms"
        />
        <Metric label={t('minimum')} value={stats ? stats.min.toFixed(2) : '—'} unit="ms" />
        <Metric label={t('maximum')} value={stats ? stats.max.toFixed(2) : '—'} unit="ms" />
        <Metric label={t('rejected')} value={stats?.rejected ?? 0} />
      </dl>
      <Timeline intervals={intervals} />
    </>
  );
}
export function Timeline({ intervals }: { intervals: number[] }) {
  const t = useTranslations();
  const recent = intervals.slice(-120),
    max = Math.max(...recent, 1);
  return (
    <figure style={{ margin: '16px 0' }}>
      <figcaption className="small">{t('timeline')}</figcaption>
      <svg
        className="sparkline"
        viewBox="0 0 600 100"
        preserveAspectRatio="none"
        role="img"
        aria-label={t('timeline')}
      >
        <line x1="0" x2="600" y1="98" y2="98" stroke="var(--color-rule)" />
        {recent.length > 1 && (
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={recent
              .map((value, i) => `${(i * 600) / (recent.length - 1)},${95 - (value / max) * 85}`)
              .join(' ')}
          />
        )}
      </svg>
    </figure>
  );
}
export function SaveResult({ toolId, value }: { toolId: string; value: string | null }) {
  const t = useTranslations(),
    enabled = usePreference('save', false);
  const [message, setMessage] = useState('');
  return (
    <div style={{ marginTop: 18 }}>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            if (!writePreference('save', e.target.checked)) setMessage(t('storageError'));
          }}
        />
        {t('saveResults')}
      </label>
      <Button
        variant="outline"
        size="sm"
        disabled={!enabled || !value}
        onClick={() => {
          if (value)
            setMessage(
              t(
                saveSummary({ toolId, time: new Date().toISOString(), value })
                  ? 'saved'
                  : 'storageError',
              ),
            );
        }}
      >
        {t('save')}
      </Button>
      <span className="small" role="status" style={{ marginLeft: 12 }}>
        {message}
      </span>
    </div>
  );
}
export function CopyButton({ value }: { value: string }) {
  const t = useTranslations(),
    [message, setMessage] = useState('');
  return (
    <>
      <Button
        variant="outline"
        onClick={async () => {
          try {
            if (!navigator.clipboard) throw Error();
            await navigator.clipboard.writeText(value);
            setMessage(t('copied'));
          } catch {
            setMessage(t('copyError'));
          }
        }}
      >
        {t('copy')}
      </Button>
      <span role="status" className="small">
        {message}
      </span>
    </>
  );
}
