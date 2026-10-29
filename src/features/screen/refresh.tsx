'use client';
import { EngineSurface } from '@/components/tools/engine-surface';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Status, IntervalResults, SaveResult } from '@/components/tools/measurement-ui';
import { summarizeIntervals } from '@/lib/measurements/calculations';
import { startFrameSampler } from '@/lib/measurements/frame-sampler';
import type { MeasurementState } from '@/lib/measurements/types';
import { sessionMeasurements } from '@/lib/storage/session-measurements';
export default function Refresh() {
  const t = useTranslations();
  const [duration, setDuration] = useState(5),
    [state, setState] = useState<MeasurementState>('idle'),
    [intervals, setIntervals] = useState<number[]>([]),
    [elapsed, setElapsed] = useState(0),
    [hidden, setHidden] = useState(false);
  const running = state === 'running' || state === 'preparing';
  useEffect(() => {
    if (!running) return;
    const stop = startFrameSampler(duration * 1000, (sample) => {
      setState(sample.finished ? 'completed' : 'running');
      setIntervals(sample.intervals);
      setElapsed(sample.elapsed);
      if (sample.finished) {
        const result = summarizeIntervals(sample.intervals);
        if (result.count >= 30 && sample.elapsed >= 1000) {
          sessionMeasurements.setRefresh({
            value: result.frequency,
            unit: 'Hz',
            timestamp: new Date().toISOString(),
            sampleCount: result.count,
            durationMs: sample.elapsed,
            method: 'requestAnimationFrame / median interval',
            quality: {
              valid: true,
              conditions: ['visible-tab', 'warm-up-500ms', 'samples>=30', 'duration>=1000ms'],
            },
            compatibility: ['requestAnimationFrame'],
            warnings: result.standardDeviation > result.median * 0.2 ? ['interval-variation'] : [],
          });
        }
      }
    });
    const interrupt = () => {
      if (document.hidden) {
        setHidden(true);
        setState('warning');
      }
    };
    const blur = () => {
      setHidden(true);
      setState('warning');
    };
    document.addEventListener('visibilitychange', interrupt);
    window.addEventListener('blur', blur);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', interrupt);
      window.removeEventListener('blur', blur);
    };
  }, [running, duration]);
  const stats = intervals.length ? summarizeIntervals(intervals) : null;
  const valid = Boolean(stats && stats.count >= 30 && elapsed >= 1000 && !hidden);
  const unstable = Boolean(stats && stats.standardDeviation > stats.median * 0.2);
  function start() {
    sessionMeasurements.setRefresh(null);
    setIntervals([]);
    setElapsed(0);
    setHidden(false);
    setState('preparing');
  }
  return (
    <EngineSurface>
      <div className="controls">
        <label className="field">
          {t('duration')}
          <select
            aria-label={t('duration')}
            value={duration}
            disabled={running}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            {[5, 10, 20].map((v) => (
              <option key={v} value={v}>
                {v} {t('seconds')}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={start} disabled={running}>
          {state === 'idle' ? t('start') : t('retest')}
        </Button>
        <Button variant="outline" onClick={() => setState('stopped')} disabled={!running}>
          {t('stop')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            sessionMeasurements.setRefresh(null);
            setState('reset');
            setIntervals([]);
            setElapsed(0);
            setHidden(false);
          }}
        >
          {t('reset')}
        </Button>
        <Status state={state} />
      </div>
      <div className="big-result" aria-label={t('estimateValue')}>
        {valid ? stats?.frequency.toFixed(1) : '—'} <small>Hz</small>
      </div>
      <p className="small">
        {valid ? t('estimate') : t('notTested')} · {t('duration')}: {(elapsed / 1000).toFixed(1)} s
        / {duration} s
      </p>
      {hidden && (
        <p className="notice" role="alert">
          {t('hiddenWarning')}
        </p>
      )}
      {!running && intervals.length > 0 && !valid && !hidden && (
        <p className="notice">{t('insufficient')}</p>
      )}
      {unstable && <p className="notice">{t('unstable')}</p>}
      <IntervalResults stats={stats} intervals={intervals} />
      <SaveResult
        toolId="A05"
        value={valid && !running ? `${stats?.frequency.toFixed(1)} Hz · ${t('estimate')}` : null}
      />
    </EngineSurface>
  );
}
