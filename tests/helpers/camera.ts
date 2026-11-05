import { vi } from 'vitest';
import { fakeStream } from './media';
export function fakeCamera() {
  const { stream, track: baseTrack } = fakeStream();
  const track = Object.assign(baseTrack, {
    kind: 'video',
    muted: false,
    getSettings: vi.fn(() => ({
      width: 640,
      height: 480,
      frameRate: 30,
      deviceId: 'never-retain',
    })),
  });
  Object.assign(stream, { getVideoTracks: () => [track], getAudioTracks: () => [] });
  const video = document.createElement('video');
  const play = vi.spyOn(video, 'play').mockResolvedValue();
  const pause = vi.spyOn(video, 'pause').mockImplementation(() => {});
  const load = vi.spyOn(video, 'load').mockImplementation(() => {});
  Object.defineProperties(video, {
    videoWidth: { configurable: true, value: 640 },
    videoHeight: { configurable: true, value: 480 },
  });
  const frames = new Map<number, VideoFrameRequestCallback>();
  let id = 0;
  video.requestVideoFrameCallback = vi.fn((callback) => {
    frames.set(++id, callback);
    return id;
  });
  video.cancelVideoFrameCallback = vi.fn((key) => {
    frames.delete(key);
  });
  const frame = (now: number, presentedFrames: number) => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) =>
      callback(now, { presentedFrames } as VideoFrameCallbackMetadata),
    );
  };
  const capture = vi.fn().mockResolvedValue(stream);
  return { stream, track, video, play, pause, load, frames, frame, capture };
}
