'use client';
import { EngineSurface } from '@/components/tools/engine-surface';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { aspectRatio, ppi, dimensionsSchema, ppiSchema } from '@/lib/measurements/calculations';
import { Metric, CopyButton, SaveResult } from '@/components/tools/measurement-ui';
export default function Calculator({ toolId }: { toolId: string }) {
  const t = useTranslations();
  const [width, setWidth] = useState('1920'),
    [height, setHeight] = useState('1080'),
    [diagonal, setDiagonal] = useState('24');
  const isPpi = toolId === 'A04';
  const values = { width: Number(width), height: Number(height), diagonal: Number(diagonal) };
  const valid = (isPpi ? ppiSchema : dimensionsSchema).safeParse(values).success;
  const ratio = valid ? aspectRatio(values.width, values.height) : null;
  const density = valid && isPpi ? ppi(values.width, values.height, values.diagonal) : null;
  const value = valid
    ? isPpi
      ? `${density?.toFixed(1)} PPI`
      : `${ratio?.ratio} (${ratio?.decimal.toFixed(4)})`
    : null;
  return (
    <EngineSurface>
      <div className="controls">
        <label className="field field-flex">
          {t('width')}
          <input
            type="number"
            min="1"
            max="100000"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            aria-invalid={!valid}
          />
        </label>
        <label className="field field-flex">
          {t('height')}
          <input
            type="number"
            min="1"
            max="100000"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            aria-invalid={!valid}
          />
        </label>
        {isPpi && (
          <label className="field field-flex">
            {t('diagonal')}
            <input
              type="number"
              min="0.1"
              max="1000"
              step="0.1"
              value={diagonal}
              onChange={(e) => setDiagonal(e.target.value)}
              aria-invalid={!valid}
            />
          </label>
        )}
      </div>
      {!valid ? (
        <p className="notice error" role="alert">
          {t('invalidInput')}
        </p>
      ) : (
        <>
          <dl className="results-grid">
            {isPpi ? (
              <Metric label="PPI" value={density?.toFixed(1)} unit="PPI" />
            ) : (
              <>
                <Metric label={t('ratio')} value={ratio?.ratio} />
                <Metric label={t('decimal')} value={ratio?.decimal.toFixed(4)} />
                <Metric label={t('common')} value={ratio?.common ?? '—'} />
              </>
            )}
          </dl>
          <div className="controls">
            <CopyButton value={value ?? ''} />
          </div>
        </>
      )}
      <SaveResult toolId={toolId} value={value} />
    </EngineSurface>
  );
}
