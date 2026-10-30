'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EngineSurface } from '@/components/tools/engine-surface';
import { Metric, Status } from '@/components/tools/measurement-ui';
import { MovementMeasurement } from '@/lib/measurements/pointer-tasks';
import { useTimedTask } from '@/hooks/use-timed-task';
const factory = () => new MovementMeasurement();
const snapshot = (model: ReturnType<typeof factory>) => ({
  count: model.count,
  distance: model.distance,
  displacement: model.displacement,
  last: model.last,
  width: model.width,
  height: model.height,
  trail: model.trail.map((point) => ({ ...point })),
});
export default function MouseMovement() {
  const t = useTranslations('deviceTools'),
    global = useTranslations(),
    task = useTimedTask(factory, snapshot);
  return (
    <EngineSurface>
      <div className="controls">
        <Button onClick={task.start} disabled={task.running}>
          {global('start')}
        </Button>
        <Button variant="outline" onClick={() => task.stop()} disabled={!task.running}>
          {global('stop')}
        </Button>
        <Button variant="outline" onClick={task.reset}>
          {global('reset')}
        </Button>
        <Status state={task.state} />
      </div>
      <p className="notice">{t('movementLimit')}</p>
      <div
        className="pointer-task-region"
        data-testid="movement-area"
        aria-label={t('movementArea')}
        onPointerMove={(event) => {
          if (!task.active.current || event.pointerType !== 'mouse') return;
          const rect = event.currentTarget.getBoundingClientRect();
          task.model.current.setBounds(rect.width, rect.height);
          task.model.current.add({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            time: performance.now(),
          });
        }}
        onPointerLeave={() => task.model.current.breakPath()}
      >
        <svg
          viewBox={`0 0 ${task.data.width || 1} ${task.data.height || 1}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-trail"
        >
          <polyline
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            points={task.data.trail.map((point) => `${point.x},${point.y}`).join(' ')}
          />
        </svg>
        <p>{t(task.running ? 'movementActive' : 'pointerIdle')}</p>
      </div>
      <dl className="results-grid">
        <Metric label={t('events')} value={task.data.count} />
        <Metric
          label={t('pathLength')}
          value={task.data.count ? task.data.distance.toFixed(1) : '—'}
          unit="CSS px"
        />
        <Metric
          label={t('displacement')}
          value={task.data.displacement?.toFixed(1) ?? '—'}
          unit="CSS px"
        />
        <Metric
          label={t('position')}
          value={
            task.data.last ? `${task.data.last.x.toFixed(1)}, ${task.data.last.y.toFixed(1)}` : '—'
          }
          unit="CSS px"
        />
        <Metric label={t('elapsed')} value={(task.elapsed / 1000).toFixed(2)} unit="s" />
        <Metric
          label={t('averageSpeed')}
          value={
            task.data.count && task.elapsed > 0
              ? (task.data.distance / (task.elapsed / 1000)).toFixed(1)
              : '—'
          }
          unit="CSS px/s"
        />
      </dl>
      {task.state === 'warning' && <p role="status">{t('taskInterrupted')}</p>}
    </EngineSurface>
  );
}
