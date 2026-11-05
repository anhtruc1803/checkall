'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EngineSurface } from '@/components/tools/engine-surface';
import { Metric, Status } from '@/components/tools/measurement-ui';
import { GamepadSession } from '@/lib/gamepad/session';

export default function GamepadTool({ toolId }: { toolId: string }) {
  const t = useTranslations('gamepadTools'),
    common = useTranslations();
  const [session] = useState(() => new GamepadSession());
  const [draftAxes, setDraftAxes] = useState<[string, string]>(['', '']);
  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  useEffect(() => session.attach(), [session, toolId]);
  const pad = snapshot.pad,
    active = snapshot.state === 'running',
    axes = snapshot.axes;
  const x = axes && pad ? pad.axes[axes[0]] : null,
    y = axes && pad ? pad.axes[axes[1]] : null;
  const result = snapshot.drift.result;
  const fixed = (value: number | null | undefined) => (value == null ? '—' : value.toFixed(3));
  const axisOptions = pad?.axes.map((_, index) => (
    <option key={index} value={index}>
      {t('axisNumber', { index })}
    </option>
  ));
  const chooseAxis = (axis: 0 | 1, value: string) => {
    const draft: [string, string] = snapshot.axes
      ? [String(snapshot.axes[0]), String(snapshot.axes[1])]
      : [...draftAxes];
    draft[axis] = value;
    setDraftAxes(draft);
    if (draft[0] !== '' && draft[1] !== '' && draft[0] !== draft[1])
      session.setAxes(Number(draft[0]), Number(draft[1]));
  };
  return (
    <EngineSurface>
      <div className="controls">
        <Button
          disabled={active}
          onClick={() => {
            setDraftAxes(['', '']);
            session.start();
          }}
        >
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
          label={active ? t(pad ? 'reading' : 'waiting') : undefined}
        />
      </div>
      <p className="notice">{t('consent')}</p>
      <p role="status">{t(`capability.${snapshot.capability}`)}</p>
      {snapshot.failure && (
        <p className="notice" role="alert">
          {t(`failure.${snapshot.failure}`)}
        </p>
      )}
      {active && !pad && <p className="notice">{t('connect')}</p>}
      {snapshot.truncated && <p className="notice">{t('truncated')}</p>}
      <div className="controls gamepad-controls">
        <label className="field">
          {t('device')}
          <select
            aria-label={t('device')}
            disabled={!active || !snapshot.devices.length}
            value={pad?.index ?? ''}
            onChange={(event) => {
              setDraftAxes(['', '']);
              session.selectDevice(Number(event.target.value));
            }}
          >
            {!pad && <option value="">{t('noDevice')}</option>}
            {snapshot.devices.map((device) => (
              <option key={device.index} value={device.index}>
                {device.index} — {device.id}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          {t('xAxis')}
          <select
            aria-label={t('xAxis')}
            disabled={!pad || pad.axes.length < 2}
            value={pad ? (axes?.[0] ?? draftAxes[0]) : ''}
            onChange={(event) => chooseAxis(0, event.target.value)}
          >
            {!axes && <option value="">{t('chooseAxes')}</option>}
            {axisOptions}
          </select>
        </label>
        <label className="field">
          {t('yAxis')}
          <select
            aria-label={t('yAxis')}
            disabled={!pad || pad.axes.length < 2}
            value={pad ? (axes?.[1] ?? draftAxes[1]) : ''}
            onChange={(event) => chooseAxis(1, event.target.value)}
          >
            {!axes && <option value="">{t('chooseAxes')}</option>}
            {axisOptions}
          </select>
        </label>
        <label className="field">
          {t('threshold')}
          <input
            aria-label={t('threshold')}
            type="number"
            min="0"
            max="0.5"
            step="0.01"
            value={snapshot.threshold}
            onChange={(event) => {
              if (event.target.value !== '') session.setThreshold(Number(event.target.value));
            }}
          />
        </label>
      </div>
      <p className="notice">{t(pad?.mapping === 'standard' ? 'standard' : 'unmapped')}</p>
      <dl className="results-grid">
        <Metric label={t('mapping')} value={pad ? pad.mapping || t('noMapping') : '—'} />
        <Metric label={t('axisCount')} value={pad?.axes.length ?? '—'} />
        <Metric label={t('buttonCount')} value={pad?.buttons.length ?? '—'} />
        <Metric label={t('rawX')} value={fixed(x)} />
        <Metric label={t('rawY')} value={fixed(y)} />
        <Metric
          label={t('radius')}
          value={x != null && y != null ? Math.hypot(x, y).toFixed(3) : '—'}
        />
      </dl>
      {toolId !== 'F01' && (
        <figure className="gamepad-plot">
          <figcaption>{t('plot')}</figcaption>
          <svg viewBox="0 0 240 240" role="img" aria-label={t('plotDescription')}>
            <title>{t('plot')}</title>
            <path className="gamepad-guide" d="M20 120H220 M120 20V220" />
            <circle className="gamepad-guide" cx="120" cy="120" r="100" />
            <circle className="gamepad-deadzone" cx="120" cy="120" r={snapshot.threshold * 100} />
            {snapshot.path.length > 1 && (
              <polyline
                className="gamepad-trail"
                points={snapshot.path
                  .map(([x, y]) => `${120 + x * 100},${120 + y * 100}`)
                  .join(' ')}
              />
            )}
            {x != null && y != null && (
              <circle className="gamepad-point" cx={120 + x * 100} cy={120 + y * 100} r="4" />
            )}
          </svg>
          <p>{t('plotNote')}</p>
        </figure>
      )}
      {toolId === 'F03' && (
        <section aria-label={t('driftTitle')} className="gamepad-drift">
          <h2>{t('driftTitle')}</h2>
          <p className="notice">{t('neutral')}</p>
          <Button
            variant="outline"
            disabled={
              !active ||
              x == null ||
              y == null ||
              ['settling', 'sampling'].includes(snapshot.drift.phase)
            }
            onClick={session.measure}
          >
            {t('measure')}
          </Button>
          <p role="status">{t(`driftPhase.${snapshot.drift.phase}`)}</p>
          {['settling', 'sampling'].includes(snapshot.drift.phase) && (
            <progress max="1" value={snapshot.drift.progress} aria-label={t('progress')} />
          )}
          <dl className="results-grid">
            <Metric label={t('meanX')} value={fixed(result?.meanX)} />
            <Metric label={t('meanY')} value={fixed(result?.meanY)} />
            <Metric label={t('meanRadius')} value={fixed(result?.meanRadius)} />
            <Metric label={t('rmsRadius')} value={fixed(result?.rmsRadius)} />
            <Metric label={t('maxRadius')} value={fixed(result?.maxRadius)} />
            <Metric
              label={t('outside')}
              value={result ? (result.outsideFraction * 100).toFixed(1) : '—'}
              unit="%"
            />
            <Metric label={t('observations')} value={result?.count ?? '—'} />
            <Metric
              label={t('duration')}
              value={result ? (result.duration / 1000).toFixed(2) : '—'}
              unit="s"
            />
          </dl>
          <p className="notice">{t('driftLimits')}</p>
        </section>
      )}
      {pad && (
        <>
          <h2 className="gamepad-heading">{t('allAxes')}</h2>
          <dl className="results-grid">
            {pad.axes.map((axis, index) => (
              <Metric key={index} label={t('axisNumber', { index })} value={fixed(axis)} />
            ))}
          </dl>
          {toolId === 'F01' && (
            <>
              <h2 className="gamepad-heading">{t('buttons')}</h2>
              <dl className="results-grid gamepad-buttons">
                {pad.buttons.map((button, index) => (
                  <div className={`metric${button.pressed ? ' gamepad-pressed' : ''}`} key={index}>
                    <dt>{t('buttonNumber', { index })}</dt>
                    <dd>
                      {fixed(button.value)}
                      <small>
                        {t(
                          button.pressed === null
                            ? 'unknown'
                            : button.pressed
                              ? 'pressed'
                              : 'released',
                        )}{' '}
                        ·{' '}
                        {t(
                          button.touched === null
                            ? 'unknown'
                            : button.touched
                              ? 'touched'
                              : 'untouched',
                        )}
                      </small>
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </>
      )}
      <p className="notice">{t('interpretation')}</p>
    </EngineSurface>
  );
}
