'use client';
import { EngineSurface } from '@/components/tools/engine-surface';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Metric, CopyButton } from '@/components/tools/measurement-ui';
import { analyzeChatter } from '@/lib/measurements/calculations';
import { layouts, keyboardRows, type KeyboardLayout } from './layouts';
import { useKeyboard } from './use-keyboard';
export default function KeyboardTool({ toolId }: { toolId: string }) {
  const t = useTranslations();
  const {
    area,
    active,
    held,
    counts,
    repeatCount,
    maximum,
    logs,
    holds,
    now,
    heldStarts,
    interrupt,
    onKey,
    reset,
    activate,
  } = useKeyboard();
  const [layout, setLayout] = useState<KeyboardLayout>('ANSI Full-size'),
    [threshold, setThreshold] = useState(30);
  const rows = keyboardRows(layout),
    stats = analyzeChatter(logs, threshold);
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
        <Button onClick={active ? interrupt : activate}>
          {t(active ? 'deactivate' : 'activate')}
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
              value={threshold}
              onChange={(e) =>
                setThreshold(Math.min(500, Math.max(1, Number(e.target.value) || 1)))
              }
            />
          </label>
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
        onBlur={interrupt}
      >
        <p className="small" role="status">
          {t(active ? 'captureActive' : 'captureHint')}
        </p>
        <div
          className="keyboard-grid"
          aria-label={layout}
          data-full={layout === 'ANSI Full-size' || layout === 'ISO'}
        >
          {rows.map((row, i) => (
            <div className="key-row" key={i} data-numpad={row[0].code === 'NumLock'}>
              {row.map((key) => (
                <div
                  key={key.code}
                  className="keycap"
                  style={{ flex: key.size ?? 1 }}
                  data-code={key.code}
                  data-tested={Boolean(counts[key.code])}
                  data-held={held.includes(key.code)}
                  aria-label={`${key.code}: ${t(held.includes(key.code) ? 'down' : 'up')}, ${counts[key.code] ?? 0}`}
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
      {toolId === 'B03' && (
        <>
          <h3 style={{ marginTop: 28 }}>{t('suspicious')}</h3>
          <p className="small">
            {t('totalEvents')}: {logs.length} / 200
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>code</th>
                  <th>{t('presses')}</th>
                  <th>{t('repeats')}</th>
                  <th>{t('suspicious')}</th>
                  <th>{t('minimum')} (ms)</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.code}>
                    <td>{stat.code}</td>
                    <td>{stat.presses}</td>
                    <td>{stat.repeats}</td>
                    <td>{stat.suspicious}</td>
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
          <h3 style={{ marginTop: 28 }}>{t('holdDuration')}</h3>
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
                    <td>{t(hold.interrupted ? 'interrupted' : 'released')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {(toolId === 'B05' || toolId === 'B03') && (
        <>
          <div className="panel-head" style={{ marginTop: 28 }}>
            <h3>{t('eventLog')}</h3>
            <CopyButton value={JSON.stringify(logs, null, 2)} />
          </div>
          {!logs.length ? (
            <p className="empty">{t('noEvents')}</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {['type', 'key', 'code', 'location', 'repeat', 'modifiers', 'timestamp'].map(
                      (name) => (
                        <th key={name}>{name}</th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {[...logs].reverse().map((log, i) => (
                    <tr key={i}>
                      <td>{log.type}</td>
                      <td>{log.key}</td>
                      <td>{log.code}</td>
                      <td>{log.location}</td>
                      <td>{String(log.repeat)}</td>
                      <td>{log.modifiers}</td>
                      <td>{log.timestamp.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </EngineSurface>
  );
}
