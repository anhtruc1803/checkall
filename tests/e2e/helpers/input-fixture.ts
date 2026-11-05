import type { Page } from '@playwright/test';
declare global {
  interface Window {
    __inputProbe: {
      calls: number;
      stops: number;
      graphs: number;
      contexts: AudioContext[];
      tracks: MediaStreamTrack[];
      resolve?: () => void;
      revoke?: () => void;
      end?: () => void;
      mute?: (value: boolean) => void;
    };
  }
}
export async function inputFixture(
  page: Page,
  mode: 'tone' | 'pending' | 'error' | 'missing-audio',
  errorName = 'NotAllowedError',
  queryUnknown = false,
) {
  await page.addInitScript(
    ({ mode, errorName, queryUnknown }) => {
      const probe: Window['__inputProbe'] = {
        calls: 0,
        stops: 0,
        graphs: 0,
        contexts: [],
        tracks: [],
      };
      window.__inputProbe = probe;
      const Native = window.AudioContext;
      class PassiveContext {
        state = 'running';
        sampleRate = 48000;
        onstatechange = null;
        constructor() {
          probe.contexts.push(this as unknown as AudioContext);
        }
        resume() {
          return Promise.resolve();
        }
        close() {
          this.state = 'closed';
          return Promise.resolve();
        }
        createMediaStreamSource() {
          probe.graphs++;
          throw new Error('unexpected late graph');
        }
      }
      if (mode === 'tone')
        window.AudioContext = class extends Native {
          constructor(options?: AudioContextOptions) {
            super(options);
            probe.contexts.push(this);
          }
          createMediaStreamSource(stream: MediaStream) {
            probe.graphs++;
            return super.createMediaStreamSource(stream);
          }
        };
      else
        Object.defineProperty(window, 'AudioContext', {
          configurable: true,
          value: mode === 'missing-audio' ? undefined : PassiveContext,
        });
      const status = Object.assign(new EventTarget(), { state: 'prompt' });
      if (navigator.permissions)
        Object.defineProperty(navigator.permissions, 'query', {
          configurable: true,
          value: () =>
            queryUnknown
              ? Promise.reject(new TypeError('descriptor unsupported'))
              : Promise.resolve(status),
        });
      probe.revoke = () => {
        status.state = 'denied';
        status.dispatchEvent(new Event('change'));
      };
      const capture = () => {
        probe.calls++;
        if (mode === 'error')
          return Promise.reject(new DOMException('private microphone identifier', errorName));
        if (mode === 'pending')
          return new Promise<MediaStream>((resolve) => {
            probe.resolve = () => {
              const track = Object.assign(new EventTarget(), {
                kind: 'audio',
                readyState: 'live',
                stop() {
                  probe.stops++;
                  this.readyState = 'ended';
                },
              });
              resolve({
                getTracks: () => [track as unknown as MediaStreamTrack],
              } as unknown as MediaStream);
            };
          });
        // Deliberate synthetic input for analysis QA, never physical microphone capture.
        const context = new Native(),
          oscillator = context.createOscillator(),
          gain = context.createGain(),
          output = context.createMediaStreamDestination();
        oscillator.frequency.value = 1000;
        gain.gain.value = 0.25;
        oscillator.connect(gain);
        gain.connect(output);
        oscillator.start();
        void context.resume();
        const stream = output.stream,
          track = stream.getAudioTracks()[0],
          nativeStop = track.stop.bind(track);
        let stopped = false,
          muted = false;
        Object.defineProperty(track, 'muted', { configurable: true, get: () => muted });
        Object.defineProperty(track, 'stop', {
          configurable: true,
          value: () => {
            if (stopped) return;
            stopped = true;
            probe.stops++;
            nativeStop();
            oscillator.stop();
            oscillator.disconnect();
            gain.disconnect();
            output.disconnect();
            void context.close();
          },
        });
        probe.tracks.push(track);
        probe.mute = (value) => {
          muted = value;
          track.dispatchEvent(new Event(value ? 'mute' : 'unmute'));
        };
        probe.end = () => {
          track.stop();
          track.dispatchEvent(new Event('ended'));
        };
        return Promise.resolve(stream);
      };
      if (navigator.mediaDevices)
        Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
          configurable: true,
          value: capture,
        });
    },
    { mode, errorName, queryUnknown },
  );
}
