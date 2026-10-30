'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { EngineSurface } from '@/components/tools/engine-surface';
import { Metric, Status } from '@/components/tools/measurement-ui';
import { Button } from '@/components/ui/button';
import {
  OutputSession,
  defaultOutput,
  validOutput,
  type OutputSettings,
  type AudioChannel,
  type AudioWave,
} from '@/lib/audio/output-session';

export default function AudioOutput({ toolId }: { toolId: string }) {
  const t = useTranslations('audioTools'),
    common = useTranslations();
  const [session] = useState(() => new OutputSession());
  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  const [settings, setSettings] = useState(defaultOutput);
  const active = snapshot.state === 'running' || snapshot.state === 'preparing';
  const generator = toolId === 'D04',
    stereo = toolId === 'D02';
  const valid = validOutput(settings, snapshot.sampleRate ?? undefined);
  useEffect(() => {
    const stop = () => {
      if (['running', 'preparing'].includes(session.getSnapshot().state)) session.interrupt();
    };
    const hidden = () => {
      if (document.hidden) stop();
    };
    window.addEventListener('blur', stop);
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('blur', stop);
      window.removeEventListener('pagehide', stop);
      document.removeEventListener('visibilitychange', hidden);
      session.dispose();
    };
  }, [session]);
  const change = (patch: Partial<OutputSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    session.update(next);
  };
  const reset = () => {
    session.dispose();
    setSettings(defaultOutput);
  };
  return (
    <EngineSurface>
      <div className="controls">
        <Button onClick={() => void session.start(settings)} disabled={active || !valid}>
          {common('start')}
        </Button>
        <Button variant="outline" onClick={() => session.stop()} disabled={!active}>
          {common('stop')}
        </Button>
        <Button variant="ghost" onClick={reset}>
          {common('reset')}
        </Button>
        <Status
          state={snapshot.state}
          label={snapshot.state === 'running' ? t('playing') : undefined}
        />
      </div>
      <p className="notice">{t('consent')}</p>
      <div className="controls audio-controls">
        <label className="field">
          {t('volume', { value: Math.round(settings.volume * 100) })}
          <input
            disabled={snapshot.state === 'preparing'}
            type="range"
            min="0"
            max="20"
            step="1"
            value={Math.round(settings.volume * 100)}
            onChange={(event) => change({ volume: Number(event.target.value) / 100 })}
          />
        </label>
        {stereo && (
          <label className="field">
            {t('channel')}
            <select
              disabled={snapshot.state === 'preparing'}
              value={settings.channel}
              onChange={(event) => change({ channel: event.target.value as AudioChannel })}
            >
              {(['both', 'left', 'right'] as const).map((channel) => (
                <option key={channel} value={channel}>
                  {t(channel)}
                </option>
              ))}
            </select>
          </label>
        )}
        {generator && (
          <>
            <label className="field">
              {t('frequency')}
              <input
                disabled={snapshot.state === 'preparing'}
                type="number"
                min="20"
                max={Math.min(20000, snapshot.sampleRate ? snapshot.sampleRate / 2 - 1 : 20000)}
                step="1"
                value={Number.isNaN(settings.frequency) ? '' : settings.frequency}
                aria-invalid={!valid}
                aria-describedby={
                  !valid ? 'audio-frequency-help audio-frequency-error' : 'audio-frequency-help'
                }
                onChange={(event) => change({ frequency: event.target.valueAsNumber })}
              />
            </label>
            <label className="field">
              {t('wave')}
              <select
                disabled={snapshot.state === 'preparing'}
                value={settings.wave}
                onChange={(event) => change({ wave: event.target.value as AudioWave })}
              >
                {(['sine', 'triangle', 'square', 'sawtooth'] as const).map((wave) => (
                  <option key={wave} value={wave}>
                    {t(wave)}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>
      {generator && (
        <p id="audio-frequency-help" className="audio-help">
          {t('range')}
        </p>
      )}
      {!valid && (
        <p id="audio-frequency-error" className="notice" role="alert">
          {t('invalid')}
        </p>
      )}
      {snapshot.reason && !(snapshot.reason === 'invalid' && !valid) && (
        <p className="notice" role="alert">
          {t(snapshot.reason)}
        </p>
      )}
      <dl className="results-grid">
        <Metric label={t('configuredFrequency')} value={snapshot.frequency ?? '—'} unit="Hz" />
        <Metric label={t('sampleRate')} value={snapshot.sampleRate ?? '—'} unit="Hz" />
      </dl>
      <p className="notice">{t('interpretation')}</p>
    </EngineSurface>
  );
}
