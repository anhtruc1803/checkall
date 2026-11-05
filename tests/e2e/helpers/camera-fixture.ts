import type { Page } from '@playwright/test';
declare global {
  interface Window {
    __cameraProbe: {
      calls: number;
      tracks: MediaStreamTrack[];
      resolve?: () => void;
      revoke?: () => void;
      mute?: (muted: boolean) => void;
    };
  }
}
// Deliberate API/video facade for failure/lifecycle tests, never evidence of native capture/FPS.
export async function cameraFixture(
  page: Page,
  mode: 'active' | 'pending' | 'error' | 'blocked-play',
  errorName = 'NotAllowedError',
) {
  await page.addInitScript(
    ({ mode, errorName }) => {
      const probe: Window['__cameraProbe'] = { calls: 0, tracks: [] };
      window.__cameraProbe = probe;
      const permission = Object.assign(new EventTarget(), { state: 'prompt' });
      Object.defineProperty(navigator, 'permissions', {
        configurable: true,
        value: { query: async () => permission },
      });
      Object.defineProperty(document, 'permissionsPolicy', {
        configurable: true,
        value: { allowsFeature: () => true },
      });
      probe.revoke = () => {
        permission.state = 'denied';
        permission.dispatchEvent(new Event('change'));
      };
      const track = Object.assign(new EventTarget(), {
        kind: 'video',
        readyState: 'live',
        muted: false,
        stop() {
          this.readyState = 'ended';
        },
        getSettings: () => ({ width: 640, height: 480, frameRate: 30 }),
      });
      probe.mute = (value) => {
        track.muted = value;
        track.dispatchEvent(new Event(value ? 'mute' : 'unmute'));
      };
      const stream = {
        getTracks: () => [track],
        getVideoTracks: () => [track],
        getAudioTracks: () => [],
      };
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {
          getUserMedia: async (constraints: MediaStreamConstraints) => {
            probe.calls++;
            if (constraints.video !== true || constraints.audio !== false)
              throw new Error('unexpected capture');
            if (mode === 'error') throw new DOMException('fixture error', errorName);
            if (mode === 'pending')
              await new Promise<void>((resolve) => {
                probe.resolve = resolve;
              });
            probe.tracks.push(track as unknown as MediaStreamTrack);
            return stream;
          },
        },
      });
      const objects = new WeakMap<HTMLMediaElement, unknown>();
      Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', {
        configurable: true,
        get() {
          return objects.get(this) ?? null;
        },
        set(value) {
          objects.set(this, value);
        },
      });
      HTMLMediaElement.prototype.play = () =>
        mode === 'blocked-play'
          ? Promise.reject(new DOMException('blocked', 'NotAllowedError'))
          : Promise.resolve();
      HTMLMediaElement.prototype.pause = () => {};
      HTMLMediaElement.prototype.load = () => {};
      Object.defineProperties(HTMLVideoElement.prototype, {
        videoWidth: {
          configurable: true,
          get() {
            return objects.get(this) ? 640 : 0;
          },
        },
        videoHeight: {
          configurable: true,
          get() {
            return objects.get(this) ? 480 : 0;
          },
        },
        requestVideoFrameCallback: { configurable: true, value: undefined },
      });
    },
    { mode, errorName },
  );
}
