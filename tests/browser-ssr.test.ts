// @vitest-environment node
import { it, expect } from 'vitest';
import { inspectCapabilities } from '@/lib/browser/capabilities';
import { inspectPermissionEnvironment, observePermission } from '@/lib/browser/permissions';
import { createMediaSession } from '@/lib/browser/media-session';
it('does not infer unsupported hardware or permission denial while rendering on the server', async () => {
  expect(inspectCapabilities(['screen', 'mediaDevices', 'secureContext'])).toEqual({
    screen: 'unknown',
    mediaDevices: 'unknown',
    secureContext: 'unknown',
  });
  expect(inspectPermissionEnvironment('camera').state).toBe('unknown');
  const states: string[] = [];
  const dispose = observePermission('camera', (snapshot) => states.push(snapshot.state));
  expect(states).toEqual(['unknown']);
  dispose();
  const session = createMediaSession('camera');
  expect(session.getSnapshot().status).toBe('idle');
  expect((await session.start()).failure).toBe('unsupported');
  session.dispose();
});
