'use client';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EngineSurface } from '@/components/tools/engine-surface';
import { Metric, Status } from '@/components/tools/measurement-ui';
import { AccuracyMeasurement, accuracyTargets } from '@/lib/measurements/pointer-tasks';
import { useTimedTask } from '@/hooks/use-timed-task';
const factory = () => new AccuracyMeasurement();
const snapshot = (model: AccuracyMeasurement) => ({
  attempts: model.attempts,
  hits: model.hits,
  accuracy: model.accuracy,
  lastError: model.lastError,
  meanError: model.meanError,
});
export default function MouseAccuracy() {
  const t = useTranslations('deviceTools'),
    global = useTranslations(),
    task = useTimedTask(factory, snapshot);
  const target = useRef<HTMLButtonElement>(null),
    [size, setSize] = useState('48'),
    [hint, setHint] = useState(false);
  const position = accuracyTargets[Math.min(task.data.hits, accuracyTargets.length - 1)];
  return (
    <EngineSurface>
      <div className="controls">
        <label className="field">
          <span>{t('targetSize')}</span>
          <select
            value={size}
            disabled={task.running}
            onChange={(event) => {
              setSize(event.target.value);
              task.reset();
            }}
          >
            {[48, 64, 80].map((value) => (
              <option key={value} value={value}>
                {value} CSS px
              </option>
            ))}
          </select>
        </label>
        <Button
          onClick={() => {
            setHint(false);
            task.start();
          }}
          disabled={task.running}
        >
          {global('start')}
        </Button>
        <Button variant="outline" onClick={() => task.stop()} disabled={!task.running}>
          {global('stop')}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            task.reset();
            setHint(false);
          }}
        >
          {global('reset')}
        </Button>
        <Status state={task.state} />
      </div>
      <p className="notice">{t('accuracyLimit')}</p>
      <div
        className="pointer-task-region"
        data-testid="accuracy-area"
        aria-label={t('accuracyArea')}
        onPointerDown={(event) => {
          if (!task.active.current || event.button !== 0) return;
          if (event.pointerType !== 'mouse') {
            setHint(true);
            return;
          }
          const rect = target.current?.getBoundingClientRect();
          if (!rect) return;
          task.model.current.record(
            event.clientX,
            event.clientY,
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width / 2,
          );
          task.publish();
          if (task.model.current.hits >= accuracyTargets.length) task.stop('completed');
          else if (task.model.current.attempts >= 1000) task.stop();
        }}
      >
        {task.running ? (
          <button
            ref={target}
            type="button"
            className="accuracy-target"
            data-testid="accuracy-target"
            aria-label={t('targetNumber', {
              number: task.data.hits + 1,
              total: accuracyTargets.length,
            })}
            style={{
              left: `${position[0] * 100}%`,
              top: `${position[1] * 100}%`,
              width: Number(size),
              height: Number(size),
            }}
            onClick={(event) => {
              if (event.detail === 0) setHint(true);
            }}
          >
            {task.data.hits + 1}
          </button>
        ) : (
          <p>{t(task.state === 'completed' ? 'taskComplete' : 'pointerIdle')}</p>
        )}
      </div>
      {hint && <p role="status">{t('mouseRequired')}</p>}
      <dl className="results-grid">
        <Metric label={t('hits')} value={`${task.data.hits} / ${accuracyTargets.length}`} />
        <Metric label={t('attempts')} value={task.data.attempts} />
        <Metric label={t('misses')} value={task.data.attempts - task.data.hits} />
        <Metric label={t('taskAccuracy')} value={task.data.accuracy?.toFixed(1) ?? '—'} unit="%" />
        <Metric
          label={t('centerError')}
          value={task.data.meanError?.toFixed(1) ?? '—'}
          unit="CSS px"
        />
        <Metric label={t('elapsed')} value={(task.elapsed / 1000).toFixed(2)} unit="s" />
      </dl>
      {task.state === 'warning' && <p role="status">{t('taskInterrupted')}</p>}
    </EngineSurface>
  );
}
