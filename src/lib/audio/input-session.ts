import { createMediaSession } from '@/lib/browser/media-session';
import {
  inspectPermissionEnvironment,
  observePermission,
  type MediaFailure,
  type PermissionSnapshot,
} from '@/lib/browser/permissions';
import type { MeasurementState } from '@/lib/measurements/types';
import {
  analyseInput,
  inputFftSize,
  inputSessionDuration,
  type InputReading,
} from './input-analysis';

type CaptureSession = ReturnType<typeof createMediaSession>;
export type InputFailure =
  | MediaFailure
  | 'interaction-required'
  | 'audio-unavailable'
  | 'audio-blocked'
  | 'analysis-failed'
  | 'interrupted'
  | 'input-ended'
  | 'timeout';
export interface InputSnapshot {
  state: MeasurementState;
  failure: InputFailure | null;
  pending: boolean;
  permission: PermissionSnapshot;
  reading: InputReading | null;
  sampleRate: number | null;
  muted: boolean;
  elapsed: number;
}
interface Attempt {
  media: CaptureSession;
  context: AudioContext;
  nodes: AudioNode[];
  cleanup: (() => void)[];
  timers: ReturnType<typeof setTimeout>[];
  cancelResume: () => void;
}
export class InputSession {
  private snapshot: InputSnapshot = {
    state: 'idle',
    failure: null,
    pending: false,
    permission: { permission: 'microphone', state: 'unknown', source: 'unknown' },
    reading: null,
    sampleRate: null,
    muted: false,
    elapsed: 0,
  };
  private listeners = new Set<() => void>();
  private current: Attempt | null = null;
  private pending: Promise<void> | null = null;
  constructor(
    private factory: () => AudioContext = () => new window.AudioContext(),
    private captureFactory: () => CaptureSession = () => createMediaSession('microphone'),
  ) {}
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(patch: Partial<InputSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }
  private release(attempt: Attempt) {
    attempt.cancelResume();
    attempt.context.onstatechange = null;
    attempt.cleanup.forEach((dispose) => dispose());
    attempt.timers.forEach(clearTimeout);
    attempt.media.dispose();
    attempt.nodes.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        /* Already detached. */
      }
    });
    try {
      void attempt.context.close().catch(() => {});
    } catch {
      /* Capture is already released. */
    }
  }
  stop = (state: MeasurementState = 'stopped', failure: InputFailure | null = null) => {
    const attempt = this.current;
    this.current = null;
    if (attempt) this.release(attempt);
    this.publish({ state, failure, reading: null, sampleRate: null, muted: false, elapsed: 0 });
  };
  reset = () => this.stop('idle');
  attach = () => {
    const permission = observePermission('microphone', (value) => {
      this.publish({ permission: value });
      if (value.state === 'denied' && this.current) this.stop('error', 'permission-denied');
    });
    const interrupt = () => {
      if (this.current) this.stop('warning', 'interrupted');
    };
    const visibility = () => {
      if (document.visibilityState === 'hidden') interrupt();
    };
    window.addEventListener('blur', interrupt);
    window.addEventListener('pagehide', interrupt);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      permission();
      window.removeEventListener('blur', interrupt);
      window.removeEventListener('pagehide', interrupt);
      document.removeEventListener('visibilitychange', visibility);
      this.reset();
    };
  };
  start = (): Promise<void> => {
    if (this.pending) return this.pending;
    if (this.current) return Promise.resolve();
    const environment = inspectPermissionEnvironment('microphone');
    this.publish({ permission: environment });
    if (['unsupported', 'insecure-context', 'policy-blocked'].includes(environment.state)) {
      this.stop('error', environment.state as MediaFailure);
      return Promise.resolve();
    }
    if (typeof window === 'undefined' || typeof window.AudioContext !== 'function') {
      this.stop('unsupported', 'audio-unavailable');
      return Promise.resolve();
    }
    if (navigator.userActivation?.isActive === false || document.visibilityState === 'hidden') {
      this.stop('error', 'interaction-required');
      return Promise.resolve();
    }
    let context: AudioContext;
    try {
      context = this.factory();
    } catch {
      this.stop('error', 'audio-unavailable');
      return Promise.resolve();
    }
    const attempt: Attempt = {
      media: this.captureFactory(),
      context,
      nodes: [],
      cleanup: [],
      timers: [],
      cancelResume: () => {},
    };
    this.current = attempt;
    this.publish({
      state: 'preparing',
      failure: null,
      pending: true,
      reading: null,
      sampleRate: null,
      elapsed: 0,
    });
    attempt.cleanup.push(
      attempt.media.subscribe(() => {
        const media = attempt.media.getSnapshot();
        if (
          this.current === attempt &&
          media.status === 'stopped' &&
          this.snapshot.state === 'running'
        )
          this.stop('warning', 'input-ended');
      }),
    );
    attempt.timers.push(
      setTimeout(() => {
        if (this.current === attempt) this.stop('warning', 'timeout');
      }, inputSessionDuration),
    );
    // Resume is invoked in the original click task, before the permission prompt can outlive activation.
    let resume: Promise<boolean>;
    const cancelled = new Promise<boolean>((resolve) => {
      attempt.cancelResume = () => resolve(false);
    });
    try {
      resume = Promise.race([
        context
          .resume()
          .then(() => context.state === 'running')
          .catch(() => false),
        cancelled,
      ]);
    } catch {
      resume = Promise.resolve(false);
    }
    const resumeTimer = setTimeout(() => {
      if (this.current === attempt) this.stop('error', 'audio-blocked');
    }, 10000);
    attempt.timers.push(resumeTimer);
    void resume.then((running) => {
      clearTimeout(resumeTimer);
      if (!running && this.current === attempt) this.stop('error', 'audio-blocked');
    });
    this.pending = this.run(attempt, resume).finally(() => {
      this.pending = null;
      this.publish({ pending: false });
    });
    return this.pending;
  };
  private async run(attempt: Attempt, resume: Promise<boolean>) {
    try {
      const media = await attempt.media.start();
      if (this.current !== attempt) return;
      if (media.status !== 'active' || !media.stream) {
        this.stop('error', media.failure ?? 'unknown');
        return;
      }
      if (!(await resume) || this.current !== attempt) return;
      if (attempt.context.state !== 'running') {
        this.stop('error', 'audio-blocked');
        return;
      }
      const source = attempt.context.createMediaStreamSource(media.stream);
      attempt.nodes.push(source);
      const analyser = attempt.context.createAnalyser();
      attempt.nodes.push(analyser);
      analyser.fftSize = inputFftSize;
      analyser.smoothingTimeConstant = 0.6;
      analyser.minDecibels = -100;
      analyser.maxDecibels = -10;
      source.connect(analyser); // Never connect to destination: no monitoring or feedback.
      const time = new Float32Array(analyser.fftSize),
        frequency = new Float32Array(analyser.frequencyBinCount);
      const tracks = media.stream.getTracks();
      const muted = () => {
        if (this.current === attempt)
          this.publish({ muted: tracks.some((track) => track.muted), reading: null });
      };
      for (const track of tracks) {
        track.addEventListener('mute', muted);
        track.addEventListener('unmute', muted);
        attempt.cleanup.push(() => {
          track.removeEventListener('mute', muted);
          track.removeEventListener('unmute', muted);
        });
      }
      attempt.context.onstatechange = () => {
        if (this.current === attempt && attempt.context.state !== 'running')
          this.stop('warning', 'interrupted');
      };
      const started = performance.now();
      this.publish({
        state: 'running',
        sampleRate: attempt.context.sampleRate,
        muted: tracks.some((track) => track.muted),
      });
      const tick = () => {
        if (this.current !== attempt) return;
        try {
          const elapsed = performance.now() - started;
          if (elapsed >= inputSessionDuration) {
            this.stop('completed');
            return;
          }
          const isMuted = tracks.some((track) => track.muted);
          let reading: InputReading | null = null;
          if (!isMuted) {
            analyser.getFloatTimeDomainData(time);
            analyser.getFloatFrequencyData(frequency);
            reading = analyseInput(time, frequency, attempt.context.sampleRate);
          }
          this.publish({ reading, muted: isMuted, elapsed });
          // Reuse one timer slot; no growing per-frame log or timer list.
          if (this.current === attempt) attempt.timers[2] = setTimeout(tick, 125);
        } catch {
          this.stop('error', 'analysis-failed');
        }
      };
      tick();
    } catch {
      if (this.current === attempt) this.stop('error', 'analysis-failed');
    }
  }
}
