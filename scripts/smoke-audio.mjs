import { chromium, firefox, webkit } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// CI virtual output only. Uses native APIs, no microphone and no audible signal.
await mkdir('artifacts/audio-smoke', { recursive: true });
const results = [];
try {
  for (const [name, type] of Object.entries({ chromium, firefox, webkit })) {
    const browser = await type.launch(name === 'chromium' ? { channel: 'chromium' } : {});
    try {
      const page = await browser.newPage();
      await page.setContent('<button id="start">Start audio backend probe</button>');
      await page.evaluate(() => {
        window.audioProbe = { state: 'idle' };
        document.getElementById('start').addEventListener('click', async () => {
          let context;
          try {
            context = new AudioContext();
            window.audioProbe = {
              state: 'preparing',
              contextState: context.state,
              sampleRate: context.sampleRate,
            };
            await context.resume();
            if (context.state !== 'running') throw new Error(`Context remained ${context.state}`);
            const oscillator = context.createOscillator(),
              gain = context.createGain();
            gain.gain.value = 0;
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.05);
            oscillator.disconnect();
            gain.disconnect();
            await context.close();
            window.audioProbe = {
              state: 'passed',
              sampleRate: context.sampleRate,
              contextState: context.state,
            };
          } catch (error) {
            window.audioProbe = { state: 'failed', reason: String(error) };
            await context?.close().catch(() => {});
          }
        });
      });
      await page.getByRole('button').click();
      try {
        await page.waitForFunction(
          () => ['passed', 'failed'].includes(window.audioProbe.state),
          undefined,
          { timeout: 10000 },
        );
      } catch {
        // Preserve an actual suspended/pending state as evidence, then fail the gate.
      }
      const result = { browser: name, ...(await page.evaluate(() => window.audioProbe)) };
      results.push(result);
      console.log(JSON.stringify(result));
      assert.equal(result.state, 'passed', `${name}: native audio backend unavailable`);
    } finally {
      await browser.close();
    }
  }
} finally {
  await writeFile(
    'artifacts/audio-smoke/results.json',
    JSON.stringify({ physicalHardwareVerified: false, results }, null, 2) + '\n',
  );
}
