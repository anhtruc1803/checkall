'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EngineSurface } from '@/components/tools/engine-surface';
import { Metric, Status } from '@/components/tools/measurement-ui';
import { InputSession } from '@/lib/audio/input-session';

export default function AudioInput({ toolId }: { toolId: string }) {
  const t = useTranslations('inputAudio'),
    common = useTranslations();
  const [session] = useState(() => new InputSession());
  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  useEffect(() => session.attach(), [session, toolId]);
  const spectrum = toolId === 'D05',
    reading = snapshot.reading;
  const active = snapshot.state === 'preparing' || snapshot.state === 'running';
  const fixed = (value: number | null | undefined, digits = 3) =>
    value == null ? '—' : value.toFixed(digits);
  const failure = snapshot.failure;
  const special = [
    'audio-unavailable',
    'audio-blocked',
    'analysis-failed',
    'interrupted',
    'input-ended',
    'timeout',
  ];
  return (
    <EngineSurface>
      <div className="controls">
        <Button disabled={active || snapshot.pending} onClick={() => void session.start()}>
          {common('start')}
        </Button>
        <Button variant="outline" disabled={!active} onClick={() => session.stop()}>
          {common('stop')}
        </Button>
        <Button variant="ghost" onClick={session.reset}>
          {common('reset')}
        </Button>
        <Status
          state={snapshot.state}
          label={
            snapshot.state === 'running'
              ? t('analysing')
              : snapshot.state === 'preparing'
                ? t('requesting')
                : undefined
          }
        />
      </div>
      <p className="notice">{t('consent')}</p>
      <p className="input-permission" role="status">
        {common(`permissionState.${snapshot.permission.state}`)}
      </p>
      {snapshot.pending && !active && (
        <p className="notice" role="status">
          {t('latePrompt')}
        </p>
      )}
      {failure && (
        <p className="notice" role="alert">
          {special.includes(failure)
            ? t(failure as 'audio-unavailable')
            : common(`mediaFailure.${failure as 'unknown'}`)}
        </p>
      )}
      {snapshot.muted && (
        <p className="notice" role="status">
          {t('muted')}
        </p>
      )}
      <dl className="results-grid">
        <Metric label={t('rms')} value={fixed(reading?.rms, 4)} />
        <Metric
          label={t('dbfs')}
          value={reading ? (reading.dbfs === -Infinity ? '−∞' : fixed(reading.dbfs, 1)) : '—'}
          unit="dBFS"
        />
        <Metric label={t('peak')} value={fixed(reading?.peak, 4)} />
        <Metric
          label={t('nearFullScale')}
          value={reading ? (reading.nearFullScale * 100).toFixed(1) : '—'}
          unit="%"
        />
        <Metric label={t('sampleRate')} value={snapshot.sampleRate ?? '—'} unit="Hz" />
        <Metric label={t('elapsed')} value={Math.floor(snapshot.elapsed / 1000)} unit="s" />
        {spectrum && (
          <>
            <Metric label={t('strongestBin')} value={fixed(reading?.strongestBin, 1)} unit="Hz" />
            <Metric label={t('binWidth')} value={fixed(reading?.binWidth, 2)} unit="Hz" />
          </>
        )}
      </dl>
      <figure className="input-figure">
        <figcaption>{t(spectrum ? 'spectrum' : 'waveform')}</figcaption>
        <svg
          className="input-chart"
          viewBox="0 0 640 200"
          role="img"
          aria-label={t(spectrum ? 'spectrumDescription' : 'waveformDescription')}
        >
          <title>{t(spectrum ? 'spectrum' : 'waveform')}</title>
          {reading ? (
            spectrum ? (
              reading.spectrum.map((value, index) => (
                <rect
                  aria-hidden="true"
                  className="input-bar"
                  key={index}
                  x={index * 10 + 1}
                  y={200 - value * 192}
                  width="8"
                  height={value * 192}
                />
              ))
            ) : (
              <polyline
                aria-hidden="true"
                className="input-wave"
                points={reading.waveform
                  .map(
                    (value, index) =>
                      `${(index * 640) / 63},${100 - Math.max(-1, Math.min(1, value)) * 96}`,
                  )
                  .join(' ')}
              />
            )
          ) : null}
        </svg>
        <p className="input-chart-note">
          {!reading
            ? t('noData')
            : spectrum
              ? t('frequencyAxis', { max: Math.round(reading.upperFrequency) })
              : t('waveformNote')}
        </p>
      </figure>
      <p className="notice">{t('interpretation')}</p>
    </EngineSurface>
  );
}
