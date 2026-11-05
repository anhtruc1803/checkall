import { StrictMode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import AudioInput from '@/features/audio/input';
import messages from '@/messages/en.json';
import { fakeInput } from './helpers/input-audio';
import { deferred, fakePermission } from './helpers/media';
function setup(id = 'D03') {
  const audio = fakeInput(),
    permission = fakePermission('prompt'),
    query = vi.fn().mockResolvedValue(permission);
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('AudioContext', audio.factory);
  vi.stubGlobal('navigator', {
    userActivation: { isActive: true },
    mediaDevices: { getUserMedia: audio.capture },
    permissions: { query },
  });
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  const view = render(
    <StrictMode>
      <NextIntlClientProvider locale="en" messages={messages}>
        <AudioInput toolId={id} />
      </NextIntlClientProvider>
    </StrictMode>,
  );
  return { ...audio, ...view, permission, query };
}
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it.each(['D03', 'D05'])(
  'keeps %s idle until Start and removes stream/context and samples on Reset',
  async (id) => {
    const view = setup(id);
    expect(view.capture).not.toHaveBeenCalled();
    expect(view.factory).not.toHaveBeenCalled();
    fireEvent.click(view.getByRole('button', { name: 'Start' }));
    await waitFor(() =>
      expect(view.container.querySelector('.status')).toHaveAttribute('data-state', 'running'),
    );
    expect(view.container.querySelector('.metric dd')).toHaveTextContent('0.2500');
    fireEvent.click(view.getByRole('button', { name: 'Reset' }));
    expect(view.track.stop).toHaveBeenCalledTimes(1);
    expect(view.context.close).toHaveBeenCalledTimes(1);
    expect(view.container.querySelector('.metric dd')).toHaveTextContent('—');
  },
);
it('releases a late stream after unmount and does not publish a graph', async () => {
  const view = setup(),
    pending = deferred<MediaStream>();
  view.capture.mockReturnValue(pending.promise);
  fireEvent.click(view.getByRole('button', { name: 'Start' }));
  await act(async () => {
    await Promise.resolve();
  });
  view.unmount();
  await act(async () => {
    pending.resolve(view.stream);
    await pending.promise;
  });
  expect(view.track.stop).toHaveBeenCalledTimes(1);
  expect(view.context.close).toHaveBeenCalledTimes(1);
  expect(view.context.createMediaStreamSource).not.toHaveBeenCalled();
});
it('ends capture when the same component changes tools, without requesting again', async () => {
  const view = setup();
  fireEvent.click(view.getByRole('button', { name: 'Start' }));
  await waitFor(() =>
    expect(view.container.querySelector('.status')).toHaveAttribute('data-state', 'running'),
  );
  view.rerender(
    <StrictMode>
      <NextIntlClientProvider locale="en" messages={messages}>
        <AudioInput toolId="D05" />
      </NextIntlClientProvider>
    </StrictMode>,
  );
  expect(view.track.stop).toHaveBeenCalledTimes(1);
  expect(view.context.close).toHaveBeenCalledTimes(1);
  expect(view.capture).toHaveBeenCalledTimes(1);
  expect(view.container.querySelector('.metric dd')).toHaveTextContent('—');
});
it('keeps duplicate requests blocked after Stop until the browser prompt settles', async () => {
  const view = setup(),
    pending = deferred<MediaStream>();
  view.capture.mockReturnValue(pending.promise);
  fireEvent.click(view.getByRole('button', { name: 'Start' }));
  await act(async () => {
    await Promise.resolve();
  });
  fireEvent.click(view.getByRole('button', { name: 'Stop' }));
  expect(view.getByRole('button', { name: 'Start' })).toBeDisabled();
  expect(view.getByText(/browser permission request is still pending/)).toBeVisible();
  await act(async () => {
    pending.resolve(view.stream);
    await pending.promise;
  });
  await waitFor(() => expect(view.getByRole('button', { name: 'Start' })).toBeEnabled());
  expect(view.capture).toHaveBeenCalledTimes(1);
  expect(view.track.stop).toHaveBeenCalledTimes(1);
});
it('unmount cleans all timers and permission/lifecycle listeners during analysis', async () => {
  vi.useFakeTimers();
  const view = setup(),
    remove = vi.spyOn(window, 'removeEventListener');
  await act(async () => {
    fireEvent.click(view.getByRole('button', { name: 'Start' }));
    await Promise.resolve();
  });
  expect(view.container.querySelector('.status')).toHaveAttribute('data-state', 'running');
  view.unmount();
  act(() => vi.advanceTimersByTime(0));
  expect(vi.getTimerCount()).toBe(0);
  expect(view.track.stop).toHaveBeenCalledTimes(1);
  expect(remove).toHaveBeenCalledWith('blur', expect.any(Function));
});
