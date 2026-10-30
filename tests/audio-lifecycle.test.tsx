import { StrictMode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import AudioOutput from '@/features/audio/output';
import messages from '@/messages/en.json';
import { fakeAudio } from './helpers/audio';
import { deferred } from './helpers/media';
const mount = (id = 'D01') =>
  render(
    <StrictMode>
      <NextIntlClientProvider locale="en" messages={messages}>
        <AudioOutput toolId={id} />
      </NextIntlClientProvider>
    </StrictMode>,
  );
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('cleans timers and listeners immediately on unmount during playback', async () => {
  vi.useFakeTimers();
  const audio = fakeAudio();
  vi.stubGlobal('AudioContext', audio.factory);
  const remove = vi.spyOn(window, 'removeEventListener');
  const view = mount();
  await act(async () => {
    fireEvent.click(view.getByRole('button', { name: 'Start' }));
    await Promise.resolve();
  });
  expect(view.container.querySelector('.status')).toHaveAttribute('data-state', 'running');
  view.unmount();
  act(() => vi.advanceTimersByTime(0));
  expect(vi.getTimerCount()).toBe(0);
  expect(audio.context.close).toHaveBeenCalledTimes(1);
  expect(remove).toHaveBeenCalledWith('blur', expect.any(Function));
  expect(remove).toHaveBeenCalledWith('pagehide', expect.any(Function));
});
it.each(['D01', 'D02', 'D04'])(
  'mounts %s without audio or fabricated readings, and resets',
  async (id) => {
    const audio = fakeAudio();
    vi.stubGlobal('AudioContext', audio.factory);
    const view = mount(id);
    expect(audio.factory).not.toHaveBeenCalled();
    expect(view.container.querySelectorAll('.metric dd')[0]).toHaveTextContent('—');
    fireEvent.click(view.getByRole('button', { name: 'Start' }));
    await waitFor(() =>
      expect(view.container.querySelector('.status')).toHaveTextContent('Playing signal'),
    );
    fireEvent.click(view.getByRole('button', { name: 'Reset' }));
    expect(view.container.querySelector('.status')).toHaveTextContent('Ready');
    expect(audio.context.close).toHaveBeenCalledTimes(1);
  },
);
it.each(['blur', 'pagehide', 'hidden'])('releases playback on %s', async (event) => {
  const audio = fakeAudio();
  vi.stubGlobal('AudioContext', audio.factory);
  const view = mount();
  fireEvent.click(view.getByRole('button', { name: 'Start' }));
  await waitFor(() =>
    expect(view.container.querySelector('.status')).toHaveTextContent('Playing signal'),
  );
  if (event === 'hidden') {
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
  } else act(() => window.dispatchEvent(new Event(event)));
  expect(view.container.querySelector('.status')).toHaveTextContent('Warning');
  expect(audio.context.close).toHaveBeenCalledTimes(1);
  view.unmount();
  expect(audio.context.close).toHaveBeenCalledTimes(1);
});
it('cleans a pending resume on unmount and cannot play after its late resolution', async () => {
  const audio = fakeAudio(),
    pending = deferred<void>();
  audio.context.resume.mockReturnValue(pending.promise);
  vi.stubGlobal('AudioContext', audio.factory);
  const view = mount();
  fireEvent.click(view.getByRole('button', { name: 'Start' }));
  expect(view.container.querySelector('.status')).toHaveTextContent('Preparing');
  view.unmount();
  await act(async () => {
    pending.resolve();
    await pending.promise;
  });
  expect(audio.oscillator.start).not.toHaveBeenCalled();
  expect(audio.context.close).toHaveBeenCalledTimes(1);
});
