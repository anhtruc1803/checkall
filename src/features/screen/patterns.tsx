'use client';
import { EngineSurface } from '@/components/tools/engine-surface';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useFullscreen } from '@/hooks/use-fullscreen';
const solidPatterns = [
  'black',
  'white',
  'red',
  'green',
  'blue',
  'cyan',
  'magenta',
  'yellow',
] as const;
const gradientPatterns = [
  'rgbGradient',
  'grayscale',
  'banding',
  'colorBars',
  ...solidPatterns,
] as const;
export default function Patterns({ toolId }: { toolId: string }) {
  const t = useTranslations(),
    stage = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const [index, setIndex] = useState(0);
  const patterns =
    toolId === 'A08' ? (['black'] as const) : toolId === 'A09' ? gradientPatterns : solidPatterns;
  const current = patterns[index % patterns.length];
  const fullscreen = useFullscreen(stage);
  function next(delta: number) {
    setIndex((i) => (i + delta + patterns.length) % patterns.length);
  }
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const draw = () => {
      const ctx = element.getContext('2d');
      if (!ctx) return;
      const rect = element.getBoundingClientRect(),
        dpr = window.devicePixelRatio || 1;
      element.width = Math.round(rect.width * dpr);
      element.height = Math.round(rect.height * dpr);
      const w = element.width,
        h = element.height;
      const styles = getComputedStyle(document.documentElement);
      const color = (name: string) => styles.getPropertyValue(`--color-${name}`).trim();
      if ((solidPatterns as readonly string[]).includes(current)) {
        ctx.fillStyle = color(current);
        ctx.fillRect(0, 0, w, h);
      } else if (current === 'rgbGradient') {
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'red'].forEach((name, i) =>
          gradient.addColorStop(i / 6, color(name)),
        );
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      } else if (current === 'grayscale') {
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, color('black'));
        gradient.addColorStop(1, color('white'));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      } else if (current === 'banding') {
        for (let i = 0; i < 16; i++) {
          const level = i * 17;
          ctx.fillStyle = `rgb(${level},${level},${level})`;
          ctx.fillRect((i * w) / 16, 0, w / 16 + 1, h);
        }
      } else {
        ['white', 'yellow', 'cyan', 'green', 'magenta', 'red', 'blue', 'black'].forEach(
          (name, i) => {
            ctx.fillStyle = color(name);
            ctx.fillRect((i * w) / 8, 0, w / 8 + 1, h);
          },
        );
      }
    };
    const observer = new ResizeObserver(draw);
    observer.observe(element);
    draw();
    return () => observer.disconnect();
  }, [current]);
  return (
    <EngineSurface>
      <div className="controls">
        <label className="field field-flex">
          {t('pattern')}
          <select value={index} onChange={(e) => setIndex(Number(e.target.value))}>
            {patterns.map((pattern, i) => (
              <option key={pattern} value={i}>
                {t(pattern)}
              </option>
            ))}
          </select>
        </label>
        <Button variant="outline" onClick={() => next(-1)} disabled={patterns.length === 1}>
          {t('previousPattern')}
        </Button>
        <Button variant="outline" onClick={() => next(1)} disabled={patterns.length === 1}>
          {t('nextPattern')}
        </Button>
        <Button onClick={fullscreen.toggle} disabled={!fullscreen.supported}>
          {t(fullscreen.active ? 'exitFullscreen' : 'fullscreen')}
        </Button>
      </div>
      <p className="notice">{t('consentVisual')}</p>
      {(!fullscreen.supported || fullscreen.error) && (
        <p className="notice" role="status">
          {t(fullscreen.error ? 'fullscreenError' : 'fullscreenUnavailable')}
        </p>
      )}
      <div
        ref={stage}
        className="pattern-stage"
        role="group"
        aria-label={t('pattern')}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            next(event.key === 'ArrowRight' ? 1 : -1);
          }
          if (event.key === 'Escape' && document.fullscreenElement)
            void document.exitFullscreen().catch(() => {});
        }}
      >
        <canvas
          ref={canvas}
          className="test-canvas pattern-canvas"
          aria-label={t(current)}
          onClick={() => next(1)}
        />
        {fullscreen.active && (
          <button className="button button-sm pattern-exit" onClick={fullscreen.toggle}>
            {t('exitFullscreen')} · Esc
          </button>
        )}
      </div>
      <p className="pattern-caption">
        {t('patternHint')} · {t(current)}
      </p>
      <p className="small" style={{ marginTop: 14 }}>
        {t('manualInspection')}
      </p>
    </EngineSurface>
  );
}
