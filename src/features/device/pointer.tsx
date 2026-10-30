'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EngineSurface } from '@/components/tools/engine-surface';
import { Metric, Status } from '@/components/tools/measurement-ui';
import { readPointerCapabilities } from '@/lib/browser/device-details';
import { useTimedTask } from '@/hooks/use-timed-task';
import { PointerObservationModel } from '@/lib/measurements/pointer-observation';
const factory = () => new PointerObservationModel();
const snapshot = (model: ReturnType<typeof factory>) => ({
  last: model.last,
  count: model.count,
  pressed: model.pressed.size,
});
export default function PointerCapabilities() {
  const t = useTranslations('deviceTools'),
    global = useTranslations(),
    task = useTimedTask(factory, snapshot);
  const [capabilities, setCapabilities] = useState<ReturnType<
    typeof readPointerCapabilities
  > | null>(null);
  const region = useRef<HTMLDivElement>(null),
    captured = useRef(new Set<number>());
  useEffect(() => {
    if (!task.running) return;
    const element = region.current,
      ids = captured.current;
    return () => {
      for (const id of ids)
        try {
          if (element?.hasPointerCapture(id)) element.releasePointerCapture(id);
        } catch {
          /* Pointer may already be released. */
        }
      ids.clear();
    };
  }, [task.running]);
  const record = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!task.active.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    task.model.current.record({
      type: event.pointerType || 'unknown',
      x: event.clientX - box.left,
      y: event.clientY - box.top,
      pressure: event.pressure,
      width: event.width,
      height: event.height,
      buttons: event.buttons,
    });
  };
  const last = task.data.last;
  return (
    <EngineSurface>
      <div className="controls">
        <Button
          onClick={() => {
            const capabilities = readPointerCapabilities();
            setCapabilities(capabilities);
            task.start();
            if (!capabilities.pointerEvents) task.stop('unsupported');
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
            setCapabilities(null);
          }}
        >
          {global('reset')}
        </Button>
        <Status state={task.state} />
      </div>
      <p className="notice">{t('pointerLimit')}</p>
      <div
        ref={region}
        className="pointer-task-region"
        data-testid="pointer-capability-area"
        aria-label={t('pointerArea')}
        style={{ touchAction: task.running ? 'none' : 'auto' }}
        onPointerMove={record}
        onPointerDown={(event) => {
          record(event);
          if (!task.active.current) return;
          task.model.current.press(event.pointerId);
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
            captured.current.add(event.pointerId);
          } catch {
            /* Unsupported pointer capture. */
          }
          task.publish();
        }}
        onPointerUp={(event) => {
          record(event);
          task.model.current.release(event.pointerId);
          captured.current.delete(event.pointerId);
          task.publish();
        }}
        onPointerCancel={(event) => {
          task.model.current.release(event.pointerId);
          captured.current.delete(event.pointerId);
          task.publish();
        }}
        onLostPointerCapture={(event) => {
          task.model.current.release(event.pointerId);
          captured.current.delete(event.pointerId);
        }}
      >
        <p>{t(task.running ? 'pointerActive' : 'pointerIdle')}</p>
      </div>
      <dl className="results-grid">
        <Metric
          label={t('pointerType')}
          value={
            last
              ? t(
                  `pointerTypes.${['mouse', 'touch', 'pen'].includes(last.type) ? last.type : 'unknown'}`,
                )
              : '—'
          }
        />
        <Metric label={t('events')} value={task.data.count} />
        <Metric label={t('activePointers')} value={task.running ? task.data.pressed : 0} />
        <Metric
          label={t('position')}
          value={last ? `${last.x.toFixed(1)}, ${last.y.toFixed(1)}` : '—'}
          unit="CSS px"
        />
        <Metric label={t('pressure')} value={last?.pressure.toFixed(3) ?? '—'} />
        <Metric
          label={t('contact')}
          value={last ? `${last.width} × ${last.height}` : '—'}
          unit="CSS px"
        />
      </dl>
      <dl className="device-list inspection-list">
        {(
          [
            'pointerEvents',
            'maxTouchPoints',
            'primaryFine',
            'primaryCoarse',
            'anyFine',
            'anyCoarse',
            'hover',
          ] as const
        ).map((key) => (
          <div className="device-row" key={key}>
            <dt>{t(key)}</dt>
            <dd>
              {capabilities
                ? typeof capabilities[key] === 'boolean'
                  ? t(capabilities[key] ? 'yes' : 'no')
                  : (capabilities[key] ?? t('unknown'))
                : '—'}
            </dd>
          </div>
        ))}
      </dl>
      {task.state === 'warning' && <p role="status">{t('taskInterrupted')}</p>}
    </EngineSurface>
  );
}
