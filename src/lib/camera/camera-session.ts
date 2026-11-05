import { createMediaSession } from '@/lib/browser/media-session';
import {
  inspectPermissionEnvironment,
  observePermission,
  type MediaFailure,
  type PermissionSnapshot,
} from '@/lib/browser/permissions';
import type { MeasurementState } from '@/lib/measurements/types';
import { FrameWindow, positive, type FrameReading } from './frame-analysis';

type CaptureSession = ReturnType<typeof createMediaSession>;
export type CameraFailure =
  | MediaFailure
  | 'interaction-required'
  | 'playback-blocked'
  | 'camera-ended'
  | 'interrupted'
  | 'timeout'
  | 'preview-failed';
export interface CameraSnapshot {
  state: MeasurementState;
  permission: PermissionSnapshot;
  pending: boolean;
  failure: CameraFailure | null;
  muted: boolean;
  frameCallbacks: boolean | null;
  reading: FrameReading | null;
  width: number | null;
  height: number | null;
  trackWidth: number | null;
  trackHeight: number | null;
  reportedFps: number | null;
  elapsed: number;
}
interface Attempt {
  media: CaptureSession;
  video: HTMLVideoElement;
  cleanup: (() => void)[];
  timers: ReturnType<typeof setTimeout>[];
  frameId: number | null;
  cancelPlay: () => void;
  frames: FrameWindow;
}
const empty = {
  reading: null,
  width: null,
  height: null,
  trackWidth: null,
  trackHeight: null,
  reportedFps: null,
  elapsed: 0,
  muted: false,
};
export class CameraSession {
  private snapshot: CameraSnapshot = {
    state: 'idle',
    permission: { permission: 'camera', state: 'unknown', source: 'unknown' },
    pending: false,
    failure: null,
    frameCallbacks: null,
    ...empty,
  };
  private listeners = new Set<() => void>();
  private current: Attempt | null = null;
  private pending: Promise<void> | null = null;
  constructor(private captureFactory: () => CaptureSession = () => createMediaSession('camera')) {}
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(patch: Partial<CameraSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }
  stop = (state: MeasurementState = 'stopped', failure: CameraFailure | null = null) => {
    const attempt = this.current;
    this.current = null;
    if (attempt) {
      attempt.cancelPlay();
      attempt.cleanup.forEach((dispose) => dispose());
      attempt.timers.forEach(clearTimeout);
      if (attempt.frameId !== null) attempt.video.cancelVideoFrameCallback(attempt.frameId);
      attempt.media.dispose();
      attempt.video.pause();
      attempt.video.srcObject = null;
      attempt.video.removeAttribute('src');
      // load() clears the last decoded image, including after a failed/pending play().
      attempt.video.load();
      attempt.frames.reset();
    }
    this.publish({ state, failure, frameCallbacks: null, ...empty });
  };
  reset = () => this.stop('idle');
  attach = () => {
    const permission = observePermission('camera', (value) => {
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
  start = (video: HTMLVideoElement): Promise<void> => {
    if (this.pending) return this.pending;
    if (this.current) return Promise.resolve();
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      this.stop('unsupported', 'unsupported');
      return Promise.resolve();
    }
    const permission = inspectPermissionEnvironment('camera');
    this.publish({ permission });
    if (['unsupported', 'insecure-context', 'policy-blocked'].includes(permission.state)) {
      this.stop('error', permission.state as MediaFailure);
      return Promise.resolve();
    }
    if (navigator.userActivation?.isActive === false || document.visibilityState === 'hidden') {
      this.stop('error', 'interaction-required');
      return Promise.resolve();
    }
    const attempt: Attempt = {
      media: this.captureFactory(),
      video,
      cleanup: [],
      timers: [],
      frameId: null,
      cancelPlay: () => {},
      frames: new FrameWindow(),
    };
    this.current = attempt;
    this.publish({
      state: 'preparing',
      failure: null,
      pending: true,
      frameCallbacks: null,
      ...empty,
    });
    attempt.cleanup.push(
      attempt.media.subscribe(() => {
        if (
          this.current === attempt &&
          attempt.media.getSnapshot().status === 'stopped' &&
          (this.snapshot.state === 'running' || Boolean(attempt.video.srcObject))
        )
          this.stop('warning', 'camera-ended');
      }),
    );
    attempt.timers[0] = setTimeout(() => {
      if (this.current === attempt) this.stop('warning', 'timeout');
    }, 60000);
    this.pending = this.run(attempt).finally(() => {
      this.pending = null;
      this.publish({ pending: false });
    });
    return this.pending;
  };
  private async run(attempt: Attempt) {
    try {
      const media = await attempt.media.start();
      if (this.current !== attempt) return;
      if (media.status !== 'active' || !media.stream) {
        this.stop('error', media.failure ?? 'unknown');
        return;
      }
      const track = media.stream.getVideoTracks()[0];
      if (!track || media.stream.getAudioTracks().length) {
        this.stop('error', 'device-not-found');
        return;
      }
      const video = attempt.video;
      video.muted = true;
      video.playsInline = true;
      video.srcObject = media.stream;
      // A native track.stop() need not emit ended, including while play() is pending.
      const watchTrack = () => {
        if (this.current !== attempt) return;
        if (track.readyState === 'ended') this.stop('warning', 'camera-ended');
        else attempt.timers[3] = setTimeout(watchTrack, 250);
      };
      watchTrack();
      if (this.current !== attempt) return;
      const cancelled = new Promise<boolean>((resolve) => {
        attempt.cancelPlay = () => resolve(false);
      });
      attempt.timers[1] = setTimeout(() => {
        if (this.current === attempt) this.stop('error', 'playback-blocked');
      }, 10000);
      const playing = await Promise.race([
        video.play().then(
          () => true,
          () => false,
        ),
        cancelled,
      ]);
      if (this.current !== attempt) return;
      clearTimeout(attempt.timers[1]);
      clearTimeout(attempt.timers[3]);
      if (!playing) {
        this.stop('error', 'playback-blocked');
        return;
      }
      const framesAvailable =
        typeof video.requestVideoFrameCallback === 'function' &&
        typeof video.cancelVideoFrameCallback === 'function';
      this.publish({ state: 'running', frameCallbacks: framesAvailable });
      const resetFrames = () => {
        attempt.frames.reset();
        if (this.current === attempt) this.publish({ reading: null, muted: track.muted });
      };
      const failed = () => {
        if (this.current === attempt) this.stop('error', 'preview-failed');
      };
      const paused = () => {
        if (this.current === attempt) this.stop('warning', 'interrupted');
      };
      track.addEventListener('mute', resetFrames);
      track.addEventListener('unmute', resetFrames);
      video.addEventListener('error', failed);
      video.addEventListener('pause', paused);
      attempt.cleanup.push(() => {
        track.removeEventListener('mute', resetFrames);
        track.removeEventListener('unmute', resetFrames);
        video.removeEventListener('error', failed);
        video.removeEventListener('pause', paused);
      });
      if (framesAvailable) {
        const frame: VideoFrameRequestCallback = (now, metadata) => {
          if (this.current !== attempt) return;
          try {
            if (!track.muted) attempt.frames.add(now, metadata.presentedFrames);
            attempt.frameId = video.requestVideoFrameCallback(frame);
          } catch {
            failed();
          }
        };
        attempt.frameId = video.requestVideoFrameCallback(frame);
      }
      const started = performance.now();
      const tick = () => {
        if (this.current !== attempt) return;
        try {
          if (track.readyState === 'ended') {
            this.stop('warning', 'camera-ended');
            return;
          }
          // Read a whitelist only. Never retain deviceId/groupId/labels or pixel data.
          const settings = track.getSettings();
          this.publish({
            width: positive(video.videoWidth),
            height: positive(video.videoHeight),
            trackWidth: positive(settings.width),
            trackHeight: positive(settings.height),
            reportedFps: positive(settings.frameRate),
            muted: track.muted,
            reading: track.muted ? null : attempt.frames.get(performance.now()),
            elapsed: performance.now() - started,
          });
          if (this.current === attempt) attempt.timers[2] = setTimeout(tick, 250);
        } catch {
          failed();
        }
      };
      tick();
    } catch {
      if (this.current === attempt) this.stop('error', 'preview-failed');
    }
  }
}
