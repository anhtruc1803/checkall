'use client';
import { EngineSurface } from '@/components/tools/engine-surface';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { IntervalResults, Status } from '@/components/tools/measurement-ui';
import { summarizeIntervals } from '@/lib/measurements/calculations';
import { useFullscreen } from '@/hooks/use-fullscreen';
export default function Motion() {
  const t = useTranslations();
  const canvas = useRef<HTMLCanvasElement>(null),
    stage = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false),
    [speed, setSpeed] = useState(500),
    [direction, setDirection] = useState(1),
    [light, setLight] = useState(false),
    [intervals, setIntervals] = useState<number[]>([]),
    [hidden, setHidden] = useState(false);
  const fullscreen = useFullscreen(stage);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const ctx = element.getContext('2d');
    if (!ctx) return;
    let frame = 0,
      previous = 0,
      start = 0,
      lastUpdate = 0;
    const buffer: number[] = [];
    const draw = (time: number) => {
      const styles = getComputedStyle(document.documentElement),
        rect = element.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio, 2);
      if (
        element.width !== Math.round(rect.width * dpr) ||
        element.height !== Math.round(rect.height * dpr)
      ) {
        element.width = Math.round(rect.width * dpr);
        element.height = Math.round(rect.height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = rect.width,
        h = rect.height;
      ctx.fillStyle = styles.getPropertyValue(light ? '--color-white' : '--color-black');
      ctx.fillRect(0, 0, w, h);
      if (!start) start = time;
      const x = running
        ? ((((((time - start) / 1000) * speed) % (w + 100)) * direction + w + 100) % (w + 100)) - 50
        : w / 2;
      ctx.strokeStyle = styles.getPropertyValue('--color-subtle');
      ctx.lineWidth = 1;
      for (let y = 1; y < 4; y++) {
        ctx.beginPath();
        ctx.moveTo(0, (h * y) / 4);
        ctx.lineTo(w, (h * y) / 4);
        ctx.stroke();
      }
      ctx.fillStyle = styles.getPropertyValue(light ? '--color-black' : '--color-white');
      ctx.fillRect(x - 24, h / 2 - 24, 48, 48);
      ctx.fillStyle = styles.getPropertyValue('--color-accent');
      ctx.fillRect(x - 16, h / 2 - 16, 32, 32);
      if (running && previous) {
        buffer.push(time - previous);
        if (buffer.length > 1200) buffer.shift();
        if (time - lastUpdate > 250) {
          setIntervals([...buffer]);
          lastUpdate = time;
        }
      }
      previous = time;
      if (running) frame = requestAnimationFrame(draw);
    };
    draw(performance.now());
    const observer = new ResizeObserver(() => {
      if (!running) draw(performance.now());
    });
    observer.observe(element);
    const interrupt = () => {
      if (document.hidden) {
        setRunning(false);
        setHidden(true);
      }
    };
    document.addEventListener('visibilitychange', interrupt);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', interrupt);
    };
  }, [running, speed, direction, light]);
  return (
    <EngineSurface>
      <div className="controls">
        <Button
          onClick={() => {
            setHidden(false);
            setRunning(!running);
          }}
        >
          {t(running ? 'stop' : 'start')}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setRunning(false);
            setIntervals([]);
            setHidden(false);
          }}
        >
          {t('reset')}
        </Button>
        <Button variant="outline" disabled={!fullscreen.supported} onClick={fullscreen.toggle}>
          {t('fullscreen')}
        </Button>
        <Status state={running ? 'running' : hidden ? 'warning' : 'idle'} />
      </div>
      <div className="controls">
        <label className="field field-flex">
          {t('speed')}: {speed}
          <input
            type="range"
            min="50"
            max="2000"
            step="50"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
        <label className="field">
          {t('direction')}
          <select value={direction} onChange={(e) => setDirection(Number(e.target.value))}>
            <option value="1">{t('right')}</option>
            <option value="-1">{t('left')}</option>
          </select>
        </label>
        <label className="field">
          {t('contrast')}
          <select value={String(light)} onChange={(e) => setLight(e.target.value === 'true')}>
            <option value="false">{t('dark')}</option>
            <option value="true">{t('light')}</option>
          </select>
        </label>
      </div>
      <div ref={stage} className="pattern-stage">
        <canvas ref={canvas} className="test-canvas" aria-label={t('visual')} />
        {fullscreen.active && (
          <button className="button button-sm pattern-exit" onClick={fullscreen.toggle}>
            {t('exitFullscreen')} · Esc
          </button>
        )}
      </div>
      {hidden && <p className="notice">{t('hiddenWarning')}</p>}
      {fullscreen.error && <p className="notice">{t('fullscreenError')}</p>}
      <IntervalResults
        stats={intervals.length ? summarizeIntervals(intervals) : null}
        intervals={intervals}
      />
    </EngineSurface>
  );
}
