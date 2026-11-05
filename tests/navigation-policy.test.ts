import { expect, it } from 'vitest';
import { requiresDocumentNavigation } from '@/lib/browser/navigation-policy';
it.each([
  ['/en', '/en/audio/microphone', true],
  ['/vi/audio/spectrum', '/en/audio/spectrum', true],
  ['/en/audio/microphone', '/en/screen/ppi', true],
  ['/en/audio/microphone?x=1', '/en/audio/microphone#main', true],
  ['/en/audio/microphone-extra', '/en/audio/speaker', false],
  ['/vi', '/vi/keyboard/tester', false],
  ['/vi/audio', '/en/audio/frequency-generator', false],
])('applies document policy navigation from %s to %s', (from, to, expected) => {
  expect(requiresDocumentNavigation(from, to)).toBe(expected);
});
