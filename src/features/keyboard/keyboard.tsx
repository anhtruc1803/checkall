'use client';
import { EngineSurface } from '@/components/tools/engine-surface';
import { memo, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Metric } from '@/components/tools/measurement-ui';
import { layouts, keyboardRows, type KeyboardLayout, type PhysicalKey } from './layouts';
import { useKeyboard } from './use-keyboard';
import { KeyboardEventLog } from './keyboard-event-log';
import './keyboard.css';
export default function KeyboardTool({ toolId }: { toolId: string }) {
  const t = useTranslations();
  const {
    area,
    active,
    held,
    counts,
    repeatCount,
    maximum,
    maximumCodes,
    logs,
    lastEvent,
    totalEvents,
    unidentifiedEvents,
    composingEvents,
    limitReached,
    holds,
    now,
    heldStarts,
    interrupt,
    onKey,
    reset,
    activate,
    onCompositionStart,
    onCompositionEnd,
    clearLogs,
    chatterStats: stats,
    threshold,
    updateThreshold,
  } = useKeyboard({
    recordEvents: toolId === 'B03' || toolId === 'B05',
    trackHolds: toolId === 'B04',
    trackChatter: toolId === 'B03',
  });
  const [layout, setLayout] = useState<KeyboardLayout>('ANSI Full-size');
  const [missingOpen, setMissingOpen] = useState(false);
  const rows = useMemo(() => keyboardRows(layout), [layout]);
  const layoutKeys = useMemo(() => rows.flat(), [rows]);
  const missing = layoutKeys.filter((key) => !counts[key.code]);
  const outside = Object.keys(counts).filter(
    (code) => !layoutKeys.some((key) => key.code === code),
  );
  const pressed = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return (
    <EngineSurface>
      <div className="controls">
        <label className="field field-flex">
          {t('layout')}
          <select
            aria-label={t('layout')}
            value={layout}
            onChange={(e) => {
              interrupt();
              setLayout(e.target.value as KeyboardLayout);
            }}
          >
            {layouts.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <Button onClick={activate} disabled={active}>
          {t('activate')}
        </Button>
        <Button variant="outline" onClick={interrupt} disabled={!active}>
          {t('deactivate')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('reset')}
        </Button>
        {toolId === 'B03' && (
          <label className="field">
            {t('threshold')}
            <input
              type="number"
              min="1"
              max="500"
              step="1"
              value={threshold}
              onChange={(e) => updateThreshold(Number(e.target.value))}
            />
          </label>
        )}
      </div>
      <div className="keyboard-progress">
        <label htmlFor="keyboard-layout-progress">
          {t('keyboardTools.layoutProgress', {
            tested: layoutKeys.length - missing.length,
            total: layoutKeys.length,
          })}
        </label>
        <progress
          id="keyboard-layout-progress"
          value={layoutKeys.length - missing.length}
          max={layoutKeys.length}
          data-layout-tested={layoutKeys.length - missing.length}
        />
        <p className="small">{t('keyboardTools.layoutNote')}</p>
        <details open={missingOpen} onToggle={(event) => setMissingOpen(event.currentTarget.open)}>
          <summary>{t('keyboardTools.remaining', { count: missing.length })}</summary>
          {missingOpen && (
            <div className="key-list">
              {missing.map((key) => (
                <span className="key-tag" key={key.code}>
                  {key.code}
                </span>
              ))}
            </div>
          )}
        </details>
        {outside.length > 0 && (
          <p className="small">
            {t('keyboardTools.outsideLayout')}: {outside.join(' · ')}
          </p>
        )}
      </div>
      <div
        ref={area}
        className="keyboard-capture"
        data-active={active}
        tabIndex={0}
        role="group"
        aria-label={t('activate')}
        onClick={() => {
          if (!active) activate();
        }}
        onKeyDown={onKey}
        onKeyUp={onKey}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) interrupt();
        }}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
      >
        <p className="small" role="status">
          {t(active ? 'captureActive' : 'captureHint')}
        </p>
        <KeyboardVisual
          rows={rows}
          layout={layout}
          counts={counts}
          held={held}
          down={t('down')}
          up={t('up')}
          diagramLabel={t('keyboardTools.diagram', { layout })}
        />
      </div>
      <p className="small" id="keyboard-diagram-hint">
        {t('keyboardTools.diagramHint')}
      </p>
      <p className="small keyboard-local-note">{t('keyboardTools.localNote')}</p>
      {unidentifiedEvents > 0 && (
        <p className="keyboard-notice">
          {t('keyboardTools.unidentified', { count: unidentifiedEvents })}
        </p>
      )}
      {composingEvents > 0 && (
        <p className="keyboard-notice">
          {t('keyboardTools.composing', { count: composingEvents })}
        </p>
      )}
      {limitReached && <p className="keyboard-notice">{t('keyboardTools.codeLimit')}</p>}
      <dl className="results-grid">
        <Metric label={t('held')} value={held.length} />
        <Metric label={t('tested')} value={Object.keys(counts).length} />
        <Metric label={t('presses')} value={pressed} />
        <Metric label={t('maxHeld')} value={maximum} />
        <Metric label={t('repeats')} value={repeatCount} />
      </dl>
      <div className="key-list" aria-label={t('held')}>
        {held.length ? (
          held.map((code) => (
            <span key={code} className="key-tag">
              {code}
            </span>
          ))
        ) : (
          <span className="small">—</span>
        )}
      </div>
      {toolId === 'B02' && (
        <section className="keyboard-best">
          <h2>{t('keyboardTools.bestCombination')}</h2>
          <p className="small">{t('keyboardTools.rolloverNote')}</p>
          <div className="key-list" data-max-combination>
            {maximumCodes.length
              ? maximumCodes.map((code) => (
                  <span className="key-tag" key={code}>
                    {code}
                  </span>
                ))
              : '—'}
          </div>
        </section>
      )}
      {toolId === 'B05' && (
        <section className="keyboard-latest">
          <h2>{t('keyboardTools.latestEvent')}</h2>
          <p className="small">{t('keyboardTools.flagsNote')}</p>
          <dl className="results-grid">
            {(
              [
                'key',
                'code',
                'type',
                'location',
                'repeat',
                'isComposing',
                'isTrusted',
                'capsLock',
                'numLock',
                'altGraph',
              ] as const
            ).map((field) => (
              <Metric
                key={field}
                label={field}
                value={
                  lastEvent
                    ? lastEvent[field] === ''
                      ? '""'
                      : String(lastEvent[field] ?? '—')
                    : '—'
                }
              />
            ))}
          </dl>
        </section>
      )}
      {toolId === 'B03' && (
        <>
          <h2 className="keyboard-section-title" style={{ marginTop: 28 }}>
            {t('suspicious')}
          </h2>
          <p className="small">{t('keyboardTools.chatterNote')}</p>
          <div className="table-scroll">
            <table data-chatter>
              <thead>
                <tr>
                  <th>code</th>
                  <th>{t('presses')}</th>
                  <th>{t('repeats')}</th>
                  <th>{t('suspicious')}</th>
                  <th>{t('keyboardTools.validPairs')}</th>
                  <th>{t('minimum')} (ms)</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.code} data-code={stat.code} data-notable={stat.suspicious > 0}>
                    <td>{stat.code}</td>
                    <td>{stat.presses}</td>
                    <td>{stat.repeats}</td>
                    <td>{stat.suspicious}</td>
                    <td>{stat.pairs}</td>
                    <td>{stat.shortestGap?.toFixed(1) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {toolId === 'B04' && (
        <>
          <h2 className="keyboard-section-title" style={{ marginTop: 28 }}>
            {t('holdDuration')}
          </h2>
          <div className="key-list">
            {held.map((code) => (
              <span className="key-tag" key={code}>
                {code}: {Math.max(0, now - (heldStarts[code] ?? now)).toFixed(0)} ms
              </span>
            ))}
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>code</th>
                  <th>{t('holdDuration')}</th>
                  <th>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {holds.map((hold, i) => (
                  <tr key={i}>
                    <td>{hold.code}</td>
                    <td>{hold.duration.toFixed(1)}</td>
                    <td>
                      {hold.interrupted
                        ? hold.reason && hold.reason !== 'focus'
                          ? t(`keyboardTools.stopReason.${hold.reason}`)
                          : t('interrupted')
                        : t('released')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {(toolId === 'B05' || toolId === 'B03') && (
        <KeyboardEventLog
          logs={logs}
          totalEvents={totalEvents}
          clear={clearLogs}
          expanded={toolId === 'B05'}
        />
      )}
    </EngineSurface>
  );
}

const KeyboardVisual = memo(function KeyboardVisual({
  rows,
  layout,
  counts,
  held,
  down,
  up,
  diagramLabel,
}: {
  rows: PhysicalKey[][];
  layout: KeyboardLayout;
  counts: Record<string, number>;
  held: string[];
  down: string;
  up: string;
  diagramLabel: string;
}) {
  return (
    <div
      className="keyboard-diagram"
      role="region"
      aria-label={diagramLabel}
      aria-describedby="keyboard-diagram-hint"
      tabIndex={0}
    >
      <div
        className="keyboard-grid"
        aria-label={layout}
        data-full={layout === 'ANSI Full-size' || layout === 'ISO'}
      >
        {rows.map((row, index) => (
          <div className="key-row" key={index} data-numpad={row[0].code === 'NumLock'}>
            {row.map((key) => (
              <div
                key={key.code}
                className="keycap"
                style={{ flex: key.size ?? 1 }}
                data-code={key.code}
                data-tested={Boolean(counts[key.code])}
                data-held={held.includes(key.code)}
                aria-label={`${key.code}: ${held.includes(key.code) ? down : up}, ${counts[key.code] ?? 0}`}
              >
                <span>{key.label}</span>
                {Boolean(counts[key.code]) && (
                  <span className="key-count">✓ {counts[key.code]}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
