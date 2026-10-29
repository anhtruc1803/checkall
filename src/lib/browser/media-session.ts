import type { ToolPermission } from './capability-types';
import {
  classifyMediaFailure,
  inspectPermissionEnvironment,
  type MediaFailure,
} from './permissions';

export interface MediaSessionSnapshot {
  status: 'idle' | 'requesting' | 'active' | 'error' | 'stopped';
  stream: MediaStream | null;
  failure: MediaFailure | 'interaction-required' | null;
}

// Call start only from an explicit user action. Construction/subscription never captures.
export function createMediaSession(permission: ToolPermission) {
  let snapshot: MediaSessionSnapshot = { status: 'idle', stream: null, failure: null };
  let generation = 0,
    disposed = false;
  let pending: Promise<MediaSessionSnapshot> | null = null;
  const subscribers = new Set<() => void>();
  let trackDisposers: (() => void)[] = [];
  const publish = (next: MediaSessionSnapshot) => {
    snapshot = next;
    for (const subscriber of subscribers) subscriber();
  };
  const release = (stream: MediaStream | null) => {
    for (const track of stream?.getTracks() ?? []) track.stop();
  };
  const stop = () => {
    generation++;
    for (const dispose of trackDisposers) dispose();
    trackDisposers = [];
    release(snapshot.stream);
    if (typeof document !== 'undefined')
      document.removeEventListener('visibilitychange', visibility);
    if (typeof window !== 'undefined') window.removeEventListener('pagehide', stop);
    publish({ status: 'stopped', stream: null, failure: null });
  };
  const visibility = () => {
    if (document.visibilityState === 'hidden') stop();
  };
  const start = (): Promise<MediaSessionSnapshot> => {
    if (disposed || snapshot.status === 'active') return Promise.resolve(snapshot);
    if (pending) return pending;
    const environment = inspectPermissionEnvironment(permission);
    if (
      environment.state === 'unsupported' ||
      environment.state === 'insecure-context' ||
      environment.state === 'policy-blocked'
    ) {
      publish({ status: 'error', stream: null, failure: environment.state });
      return Promise.resolve(snapshot);
    }
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      publish({ status: 'error', stream: null, failure: 'unsupported' });
      return Promise.resolve(snapshot);
    }
    if (navigator.userActivation?.isActive === false || document.visibilityState === 'hidden') {
      publish({ status: 'error', stream: null, failure: 'interaction-required' });
      return Promise.resolve(snapshot);
    }
    const current = ++generation;
    publish({ status: 'requesting', stream: null, failure: null });
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', stop);
    pending = (async () => {
      try {
        await Promise.resolve();
        if (disposed || current !== generation) return snapshot;
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: permission === 'microphone',
          video: permission === 'camera',
        });
        if (disposed || current !== generation) {
          release(stream);
          return snapshot;
        }
        const tracks = stream.getTracks();
        if (!tracks.length || tracks.some((track) => track.readyState === 'ended')) {
          release(stream);
          stop();
          publish({ status: 'error', stream: null, failure: 'device-not-found' });
          return snapshot;
        }
        for (const track of tracks) {
          track.addEventListener('ended', stop);
          trackDisposers.push(() => track.removeEventListener('ended', stop));
        }
        publish({ status: 'active', stream, failure: null });
      } catch (error) {
        if (!disposed && current === generation) {
          stop();
          publish({ status: 'error', stream: null, failure: classifyMediaFailure(error) });
        }
      } finally {
        pending = null;
      }
      return snapshot;
    })();
    return pending;
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      subscribers.add(listener);
      return () => {
        subscribers.delete(listener);
      };
    },
    start,
    stop,
    dispose() {
      disposed = true;
      stop();
      subscribers.clear();
    },
  };
}
