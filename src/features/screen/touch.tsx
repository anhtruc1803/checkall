'use client';
import { EngineSurface } from '@/components/tools/engine-surface';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Metric } from '@/components/tools/measurement-ui';
export default function Touch() {
  const t = useTranslations(),
    canvas = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const points = useRef(new Map<number, { x: number; y: number }>());
  const [count, setCount] = useState(0),
    [maximum, setMaximum] = useState(0);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const resize = () => {
      const rect = element.getBoundingClientRect();
      element.width = rect.width * devicePixelRatio;
      element.height = rect.height * devicePixelRatio;
      if (overlay.current) {
        overlay.current.width = element.width;
        overlay.current.height = element.height;
      }
      points.current.clear();
      setCount(0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const clear = () => {
      points.current.clear();
      setCount(0);
    };
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', clear);
    return () => {
      observer.disconnect();
      window.removeEventListener('blur', clear);
      document.removeEventListener('visibilitychange', clear);
    };
  }, []);
  useEffect(() => {
    const element = overlay.current;
    if (!element) return;
    const ctx = element.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, element.width, element.height);
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue(
        '--color-success',
      );
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = 3 * devicePixelRatio;
      ctx.font = `${14 * devicePixelRatio}px sans-serif`;
      for (const [id, point] of points.current) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 18 * devicePixelRatio, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillText(String(id), point.x + 22 * devicePixelRatio, point.y);
      }
      if (count > 0) frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [count]);
  function point(event: PointerEvent<HTMLCanvasElement>, down = false) {
    if (!['touch', 'pen'].includes(event.pointerType)) return;
    const element = canvas.current,
      ctx = element?.getContext('2d');
    if (!element || !ctx) return;
    const rect = element.getBoundingClientRect(),
      x = (event.clientX - rect.left) * devicePixelRatio,
      y = (event.clientY - rect.top) * devicePixelRatio,
      previous = points.current.get(event.pointerId);
    if (!down && !previous) return;
    if (down) {
      event.currentTarget.setPointerCapture(event.pointerId);
      points.current.set(event.pointerId, { x, y });
      setCount(points.current.size);
      setMaximum((old) => Math.max(old, points.current.size));
    }
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-accent');
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 4 * devicePixelRatio;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (previous) {
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(x, y, 2 * devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
    points.current.set(event.pointerId, { x, y });
  }
  function release(event: PointerEvent<HTMLCanvasElement>) {
    points.current.delete(event.pointerId);
    setCount(points.current.size);
  }
  return (
    <EngineSurface>
      <div className="controls">
        <Button
          variant="outline"
          onClick={() => {
            points.current.clear();
            setCount(0);
            setMaximum(0);
            const c = canvas.current;
            c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
          }}
        >
          {t('reset')}
        </Button>
        <span className="small">{t('touchOnly')}</span>
      </div>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvas}
          className="test-canvas"
          style={{ touchAction: 'none', height: 360 }}
          aria-label={t('touchHint')}
          onPointerDown={(e) => point(e, true)}
          onPointerMove={(e) => point(e)}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
        />
        <canvas
          ref={overlay}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      </div>
      <dl className="results-grid">
        <Metric label={t('activeTouches')} value={count} />
        <Metric label={t('maxTouches')} value={maximum} />
      </dl>
    </EngineSurface>
  );
}
