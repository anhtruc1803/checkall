'use client';
import { EngineSurface } from '@/components/tools/engine-surface';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Metric, Status, IntervalResults, SaveResult } from '@/components/tools/measurement-ui';
import {
  clickAnalysis,
  cps,
  pointerStatistics,
  intervalsFromTimestamps,
} from '@/lib/measurements/calculations';
import { useMouse } from './use-mouse';
export default function MouseTool({ toolId }: { toolId: string }) {
  const t = useTranslations();
  const {
    area,
    duration,
    setDuration,
    state,
    running,
    elapsed,
    held,
    counts,
    clicks,
    clickTimes,
    best,
    timestamps,
    coalesced,
    rejected,
    hidden,
    wheel,
    history,
    start,
    finish,
    reset,
    down,
    up,
    move,
    clearHeld,
  } = useMouse(toolId);
  const [threshold, setThreshold] = useState(80);
  const isCps = toolId === 'C03',
    isPolling = toolId === 'C05',
    isScroll = toolId === 'C04',
    timed = isCps || isPolling;
  const clickStats = clickAnalysis(clickTimes, threshold),
    pointer = pointerStatistics(timestamps);
  const pointerValid = pointer.count >= 19 && pointer.duration >= 500 && !hidden;
  const score = cps(clicks, elapsed);
  const scrollDirection =
    wheel.y !== 0
      ? wheel.y < 0
        ? 'scrollUp'
        : 'scrollDown'
      : wheel.x !== 0
        ? wheel.x < 0
          ? 'scrollLeft'
          : 'scrollRight'
        : null;
  return (
    <EngineSurface>
      <div className="controls">
        {timed && (
          <>
            <label className="field">
              {t('duration')}
              <select
                aria-label={t('duration')}
                value={duration}
                disabled={running}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                {[5, 10, 20].map((value) => (
                  <option key={value} value={value}>
                    {value} {t('seconds')}
                  </option>
                ))}
              </select>
            </label>
            <Button onClick={start} disabled={running}>
              {t(state === 'idle' ? 'start' : 'retest')}
            </Button>
            <Button variant="outline" disabled={!running} onClick={() => finish()}>
              {t('stop')}
            </Button>
          </>
        )}
        <Button variant="outline" onClick={reset}>
          {t('reset')}
        </Button>
        {toolId === 'C02' && (
          <label className="field">
            {t('threshold')}
            <input
              type="number"
              min="1"
              max="1000"
              value={threshold}
              onChange={(e) =>
                setThreshold(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))
              }
            />
          </label>
        )}
        <Status state={state} />
      </div>
      {toolId === 'C01' && (
        <div className="mouse-visual" aria-label={t('mouse')}>
          <div className={`mouse-half ${held.includes(0) ? 'active' : ''}`}>L {counts[0] ?? 0}</div>
          <div className={`mouse-half ${held.includes(2) ? 'active' : ''}`}>R {counts[2] ?? 0}</div>
          <div className={`mouse-wheel ${held.includes(1) ? 'active' : ''}`} />
        </div>
      )}
      <div
        ref={area}
        className={`pointer-area ${isScroll ? 'scroll-area' : ''}`}
        data-testid="mouse-area"
        role="group"
        aria-label={t('buttonTestHint')}
        tabIndex={0}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={down}
        onPointerUp={up}
        onPointerMove={move}
        onPointerCancel={clearHeld}
        onLostPointerCapture={clearHeld}
        onBlur={clearHeld}
      >
        <div>
          {isCps ? (
            <div style={{ textAlign: 'center' }}>
              <div className="big-result">{clicks}</div>
              <p>
                {t('remaining')}: {Math.max(0, duration - elapsed / 1000).toFixed(1)} s
              </p>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center' }}>
                <MousePointer2 size={30} />
              </div>
              <p>{t(isPolling ? 'pollingHint' : 'buttonTestHint')}</p>
            </>
          )}
        </div>
      </div>
      {hidden && (
        <p className="notice" role="alert">
          {t('hiddenWarning')}
        </p>
      )}
      {toolId === 'C01' && (
        <dl className="results-grid">
          {[
            0,
            1,
            2,
            3,
            4,
            ...Object.keys(counts)
              .map(Number)
              .filter((v) => v > 4),
          ].map((button) => (
            <Metric
              key={button}
              label={
                button < 5
                  ? t(
                      ['mouseLeft', 'mouseMiddle', 'mouseRight', 'mouseBack', 'mouseForward'][
                        button
                      ],
                    )
                  : `${t('button')} ${button}`
              }
              value={`${counts[button] ?? 0} · ${t(held.includes(button) ? 'down' : 'up')}`}
            />
          ))}
        </dl>
      )}
      {toolId === 'C02' && (
        <>
          <dl className="results-grid">
            <Metric label={t('clicks')} value={clicks} />
            <Metric
              label={t('clickInterval')}
              value={clickStats.intervals.at(-1)?.toFixed(1) ?? '—'}
              unit="ms"
            />
            <Metric label={t('suspicious')} value={clickStats.suspicious} />
            <Metric
              label={t('mean')}
              value={clickStats.count ? clickStats.mean.toFixed(1) : '—'}
              unit="ms"
            />
          </dl>
          <IntervalResults
            stats={clickStats.count ? clickStats : null}
            intervals={clickStats.intervals}
          />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('clickInterval')} (ms)</th>
                  <th>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {clickStats.intervals.slice(-50).map((value, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{value.toFixed(1)}</td>
                    <td>{value <= threshold ? t('suspicious') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {isCps && (
        <>
          <dl className="results-grid">
            <Metric label="CPS" value={elapsed ? score.toFixed(2) : '—'} />
            <Metric label={t('clicks')} value={clicks} />
            <Metric label={t('duration')} value={(elapsed / 1000).toFixed(2)} unit="s" />
            <Metric label={t('best')} value={best.toFixed(2)} />
          </dl>
          <SaveResult
            toolId={toolId}
            value={!running && elapsed && !hidden ? `${score.toFixed(2)} CPS · ${clicks}` : null}
          />
        </>
      )}
      {isScroll && (
        <dl className="results-grid">
          <Metric label={t('scrollDirection')} value={scrollDirection ? t(scrollDirection) : '—'} />
          <Metric label="deltaX" value={wheel.x} />
          <Metric label="deltaY" value={wheel.y} />
          <Metric
            label="deltaMode"
            value={`${wheel.mode} · ${t(['pixels', 'lines', 'pages'][wheel.mode] ?? 'notApplicable')}`}
          />
          <Metric label={t('eventCount')} value={wheel.count} />
        </dl>
      )}
      {isPolling && (
        <>
          <div className="big-result">
            {pointerValid ? pointer.frequency.toFixed(1) : '—'} <small>Hz</small>
          </div>
          <p className="small">
            {t('duration')}: {(elapsed / 1000).toFixed(1)} s ·{' '}
            {t(coalesced ? 'coalescedUsed' : 'coalescedFallback')}
          </p>
          <p className="notice">{t('pollingWarning')}</p>
          {!running && timestamps.length > 0 && !pointerValid && !hidden && (
            <p className="notice">{t('insufficient')}</p>
          )}
          {pointer.count > 0 && pointer.standardDeviation > pointer.median * 0.5 && (
            <p className="notice">{t('unstable')}</p>
          )}
          <IntervalResults
            stats={timestamps.length ? { ...pointer, rejected: pointer.rejected + rejected } : null}
            intervals={intervalsFromTimestamps(timestamps)}
          />
          <SaveResult
            toolId={toolId}
            value={
              !running && pointerValid
                ? `${pointer.frequency.toFixed(1)} Hz · ${t('estimate')}`
                : null
            }
          />
          {history.length > 0 && (
            <>
              <h3 style={{ marginTop: 24 }}>{t('history')}</h3>
              <ul className="small">
                {history.map((run, i) => (
                  <li key={i}>
                    {run.value.toFixed(1)} Hz · {run.samples} {t('samples')}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </EngineSurface>
  );
}
