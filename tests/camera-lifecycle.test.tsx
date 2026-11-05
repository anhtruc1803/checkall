import { StrictMode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import Camera from '@/features/camera/camera';
import messages from '@/messages/en.json';
import { fakeCamera } from './helpers/camera';
import { deferred } from './helpers/media';
function setup() {
  const camera = fakeCamera();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('navigator', {
    userActivation: { isActive: true },
    mediaDevices: { getUserMedia: camera.capture },
  });
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  const component = (id: string) => (
    <StrictMode>
      <NextIntlClientProvider locale="en" messages={messages}>
        <Camera toolId={id} />
      </NextIntlClientProvider>
    </StrictMode>
  );
  return { ...camera, component, ...render(component('E03')) };
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('does not capture on StrictMode mount and cleans tracks/video on tool changes and unmount', async () => {
  const c = setup();
  expect(c.capture).not.toHaveBeenCalled();
  fireEvent.click(c.getByRole('button', { name: 'Start' }));
  await waitFor(() =>
    expect(c.container.querySelector('.status')).toHaveAttribute('data-state', 'running'),
  );
  expect(c.container.querySelector('video')?.srcObject).toBe(c.stream);
  c.rerender(c.component('E02'));
  expect(c.track.stop).toHaveBeenCalledTimes(1);
  expect(c.container.querySelector('video')?.srcObject).toBeNull();
  expect(c.capture).toHaveBeenCalledTimes(1);
  c.unmount();
  expect(c.track.stop).toHaveBeenCalledTimes(1);
});
it('releases a late camera after unmount without attaching it to video', async () => {
  const c = setup(),
    pending = deferred<MediaStream>();
  c.capture.mockReturnValue(pending.promise);
  fireEvent.click(c.getByRole('button', { name: 'Start' }));
  await act(async () => {
    await Promise.resolve();
  });
  c.unmount();
  await act(async () => {
    pending.resolve(c.stream);
    await pending.promise;
  });
  expect(c.track.stop).toHaveBeenCalledTimes(1);
});
