'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EngineSurface } from '@/components/tools/engine-surface';
import { Metric } from '@/components/tools/measurement-ui';
import { useFullscreen } from '@/hooks/use-fullscreen';
export default function FullscreenTest() {
  const t = useTranslations('deviceTools'),
    global = useTranslations(),
    region = useRef<HTMLDivElement>(null),
    fs = useFullscreen(region);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  useEffect(() => {
    const element = region.current;
    if (!element) return;
    const update = () => {
      const box = element.getBoundingClientRect();
      setDimensions({ width: box.width, height: box.height });
    };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
    observer?.observe(element);
    update();
    window.addEventListener('resize', update);
    document.addEventListener('fullscreenchange', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
      document.removeEventListener('fullscreenchange', update);
    };
  }, []);
  return (
    <EngineSurface>
      <p className="notice">{t('fullscreenLimit')}</p>
      {!fs.supported && <p role="status">{global('fullscreenUnavailable')}</p>}
      {fs.error && <p role="alert">{t('fullscreenError')}</p>}
      <div
        ref={region}
        className="fullscreen-test-stage"
        aria-label={t('fullscreenArea')}
        data-testid="fullscreen-area"
      >
        <div className="controls">
          <Button onClick={() => void fs.toggle()} disabled={!fs.supported}>
            {fs.active ? global('exitFullscreen') : global('fullscreen')}
          </Button>
          <span role="status">{t(fs.active ? 'fullscreenActive' : 'fullscreenInactive')}</span>
        </div>
        <div className="fullscreen-grid" aria-hidden="true">
          <span>+</span>
        </div>
        <dl className="results-grid">
          <Metric
            label={t('renderedWidth')}
            value={dimensions?.width.toFixed(1) ?? '—'}
            unit="CSS px"
          />
          <Metric
            label={t('renderedHeight')}
            value={dimensions?.height.toFixed(1) ?? '—'}
            unit="CSS px"
          />
        </dl>
        <p>{t('exitHint')}</p>
      </div>
    </EngineSurface>
  );
}
