'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EngineSurface } from '@/components/tools/engine-surface';
import { Metric, Status } from '@/components/tools/measurement-ui';
import { CameraSession } from '@/lib/camera/camera-session';

export default function Camera({ toolId }: { toolId: string }) {
  const t = useTranslations('cameraTools'),
    common = useTranslations();
  const video = useRef<HTMLVideoElement>(null);
  const [session] = useState(() => new CameraSession());
  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  useEffect(() => session.attach(), [session, toolId]);
  const active = snapshot.state === 'preparing' || snapshot.state === 'running';
  const special = ['playback-blocked', 'camera-ended', 'interrupted', 'timeout', 'preview-failed'];
  const size = (width: number | null, height: number | null) =>
    width && height ? `${width} × ${height}` : '—';
  return (
    <EngineSurface>
      <div className="controls">
        <Button
          disabled={active || snapshot.pending}
          onClick={() => {
            if (video.current) void session.start(video.current);
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
          label={
            snapshot.state === 'running'
              ? t('previewing')
              : snapshot.state === 'preparing'
                ? t('requesting')
                : undefined
          }
        />
      </div>
      <p className="notice">{t('consent')}</p>
      <p role="status">{common(`permissionState.${snapshot.permission.state}`)}</p>
      {snapshot.pending && !active && (
        <p className="notice" role="status">
          {t('latePrompt')}
        </p>
      )}
      {snapshot.failure && (
        <p className="notice" role="alert">
          {special.includes(snapshot.failure)
            ? t(snapshot.failure as 'timeout')
            : common(`mediaFailure.${snapshot.failure as 'unknown'}`)}
        </p>
      )}
      {snapshot.muted && (
        <p className="notice" role="status">
          {t('muted')}
        </p>
      )}
      <figure className="camera-preview">
        <figcaption>{t('preview')}</figcaption>
        <video ref={video} muted playsInline aria-label={t('preview')} />
        {!active && <p className="notice">{t('noData')}</p>}
      </figure>
      <dl className="results-grid">
        <Metric label={t('videoSize')} value={size(snapshot.width, snapshot.height)} unit="px" />
        <Metric
          label={t('trackSize')}
          value={size(snapshot.trackWidth, snapshot.trackHeight)}
          unit="px"
        />
        <Metric
          label={t('reportedFps')}
          value={snapshot.reportedFps?.toFixed(1) ?? '—'}
          unit="FPS"
        />
        {toolId === 'E03' && (
          <>
            <Metric
              label={t('observedFps')}
              value={snapshot.reading?.fps.toFixed(1) ?? '—'}
              unit="FPS"
            />
            <Metric label={t('frames')} value={snapshot.reading?.frames ?? '—'} />
            <Metric
              label={t('window')}
              value={snapshot.reading ? (snapshot.reading.duration / 1000).toFixed(2) : '—'}
              unit="s"
            />
          </>
        )}
        <Metric label={t('elapsed')} value={Math.floor(snapshot.elapsed / 1000)} unit="s" />
      </dl>
      {toolId === 'E03' && (
        <p className="notice">
          {t(snapshot.frameCallbacks === false ? 'fpsUnavailable' : 'fpsMethod')}
        </p>
      )}
      <p className="notice">{t('interpretation')}</p>
    </EngineSurface>
  );
}
