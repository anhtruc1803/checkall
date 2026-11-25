'use client';

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { Check, MousePointer2, RotateCcw, Timer, Zap } from 'lucide-react';
import { EngineSurface } from '@/components/tools/engine-surface';
import { Metric } from '@/components/tools/measurement-ui';
import { median } from '@/lib/measurements/calculations';
import styles from './reaction.module.css';

type Stage = 'ready' | 'waiting' | 'signal' | 'early' | 'interrupted' | 'next' | 'complete';
const roundCount = 5;
const stageIcons = {
  ready: MousePointer2,
  waiting: Timer,
  signal: Zap,
  early: RotateCcw,
  interrupted: RotateCcw,
  next: Check,
  complete: RotateCcw,
};

export default function MouseReaction() {
  const t = useTranslations('mouseReaction');
  const format = useFormatter();
  const [stage, setStage] = useState<Stage>('ready');
  const [samples, setSamples] = useState<number[]>([]);
  const [earlyCount, setEarlyCount] = useState(0);
  const [mouseHint, setMouseHint] = useState(false);
  const signalAt = useRef<number | null>(null);
  const mouseDownStage = useRef<Stage | null>(null);
  const Icon = stageIcons[stage];
  const lastSample = samples.at(-1);

  useEffect(() => {
    if (stage !== 'waiting') return;
    const delay = 1500 + Math.floor(Math.random() * 2501);
    const timeout = window.setTimeout(() => {
      const next = document.hidden ? 'interrupted' : 'signal';
      setStage((current) => (current === 'waiting' ? next : current));
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [stage]);

  useLayoutEffect(() => {
    // This clock starts on the browser commit that exposes the signal.
    signalAt.current = stage === 'signal' ? performance.now() : null;
  }, [stage]);

  useEffect(() => {
    const interrupt = () => {
      signalAt.current = null;
      mouseDownStage.current = null;
      setStage((current) =>
        current === 'waiting' || current === 'signal' ? 'interrupted' : current,
      );
    };
    const onVisibilityChange = () => {
      if (document.hidden) interrupt();
    };
    window.addEventListener('blur', interrupt);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('blur', interrupt);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  function milliseconds(value: number) {
    return format.number(value, { maximumFractionDigits: 0 });
  }

  function activate(event: MouseEvent<HTMLButtonElement>) {
    const pressedDuring = event.detail > 0 ? mouseDownStage.current : null;
    mouseDownStage.current = null;
    if (document.hidden) return;
    const active = stage === 'waiting' || stage === 'signal';
    if (active && !pressedDuring) {
      setMouseHint(true);
      return;
    }
    setMouseHint(false);
    if (stage === 'waiting' || (stage === 'signal' && pressedDuring === 'waiting')) {
      setEarlyCount((count) => count + 1);
      setStage('early');
      return;
    }
    if (stage === 'signal') {
      const started = signalAt.current;
      if (started === null || pressedDuring !== 'signal') return;
      signalAt.current = null;
      const next = [...samples, performance.now() - started];
      setSamples(next);
      setStage(next.length === roundCount ? 'complete' : 'next');
      return;
    }
    if (stage === 'complete') {
      setSamples([]);
      setEarlyCount(0);
    }
    setStage('waiting');
  }

  return (
    <EngineSurface>
      <div className={styles.workspace}>
        <div className={styles.progress}>
          <span data-testid="reaction-progress">
            {t('progress', { valid: samples.length, total: roundCount })}
          </span>
          <span data-testid="reaction-early-count">{t('earlyCount', { count: earlyCount })}</span>
        </div>
        <button
          type="button"
          className={styles.target}
          data-testid="reaction-target"
          data-stage={stage}
          onPointerDown={(event) => {
            mouseDownStage.current =
              event.isPrimary && event.button === 0 && event.pointerType === 'mouse' ? stage : null;
          }}
          onPointerCancel={() => {
            mouseDownStage.current = null;
          }}
          onPointerLeave={() => {
            mouseDownStage.current = null;
          }}
          onKeyDown={(event) => {
            if (event.repeat && (event.key === 'Enter' || event.key === ' '))
              event.preventDefault();
          }}
          onClick={activate}
        >
          <Icon className={styles.icon} aria-hidden="true" />
          <span className={styles.title}>{t(`stages.${stage}`)}</span>
          <span className={styles.detail}>
            {stage === 'next' && lastSample !== undefined
              ? t('lastTime', { time: milliseconds(lastSample) })
              : t(`details.${stage}`)}
          </span>
        </button>
        <p className="sr-only" role="status">
          {t(`stages.${stage}`)}
        </p>
        {mouseHint && (
          <p className="notice" role="status">
            {t('mouseRequired')}
          </p>
        )}
        {stage === 'complete' && (
          <section aria-labelledby="reaction-result-label" className={styles.results}>
            <h2 id="reaction-result-label">{t('results')}</h2>
            <dl className={styles.summary}>
              <Metric label={t('median')} value={milliseconds(median(samples))} unit="ms" />
              <Metric label={t('fastest')} value={milliseconds(Math.min(...samples))} unit="ms" />
              <Metric label={t('earlyMetric')} value={earlyCount} />
            </dl>
            <ol className={styles.samples} role="list" aria-label={t('roundTimes')}>
              {samples.map((time, index) => (
                <li key={index}>
                  <span>{t('round', { index: index + 1 })}</span>
                  <strong data-testid="reaction-sample">{milliseconds(time)} ms</strong>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </EngineSurface>
  );
}
