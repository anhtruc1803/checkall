import type { ToolPermission } from './capability-types';

export type PermissionState =
  | 'unknown'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'insecure-context'
  | 'policy-blocked';
export interface PermissionSnapshot {
  permission: ToolPermission;
  state: PermissionState;
  source: 'environment' | 'permissions-api' | 'unknown';
}
type PolicyDocument = Document & {
  permissionsPolicy?: { allowsFeature(feature: string): boolean };
  featurePolicy?: { allowsFeature(feature: string): boolean };
};

export function inspectPermissionEnvironment(permission: ToolPermission): PermissionSnapshot {
  const snapshot: PermissionSnapshot = { permission, state: 'unknown', source: 'unknown' };
  if (
    typeof window === 'undefined' ||
    typeof navigator === 'undefined' ||
    typeof document === 'undefined'
  )
    return snapshot;
  if (window.isSecureContext === false)
    return { ...snapshot, state: 'insecure-context', source: 'environment' };
  try {
    const policy =
      (document as PolicyDocument).permissionsPolicy ?? (document as PolicyDocument).featurePolicy;
    if (policy && !policy.allowsFeature(permission))
      return { ...snapshot, state: 'policy-blocked', source: 'environment' };
    if (typeof navigator.mediaDevices?.getUserMedia !== 'function')
      return { ...snapshot, state: 'unsupported', source: 'environment' };
  } catch {
    return snapshot;
  }
  return snapshot;
}

// Passive observation only. A failed query means unknown, never denied/unsupported capture.
export function observePermission(
  permission: ToolPermission,
  onChange: (snapshot: PermissionSnapshot) => void,
): () => void {
  let disposed = false;
  let status: PermissionStatus | undefined;
  const initial = inspectPermissionEnvironment(permission);
  onChange(initial);
  const changed = () => {
    if (!disposed && status)
      onChange({ permission, state: status.state, source: 'permissions-api' });
  };
  if (initial.state === 'unknown' && typeof navigator !== 'undefined') {
    void (async () => {
      try {
        if (typeof navigator.permissions?.query !== 'function') return;
        const current = await navigator.permissions.query({ name: permission });
        if (disposed) return;
        status = current;
        status.addEventListener('change', changed);
        changed();
      } catch {
        // Safari/Firefox may not support querying this descriptor. Capture can still work.
      }
    })();
  }
  return () => {
    disposed = true;
    status?.removeEventListener('change', changed);
  };
}

export type MediaFailure =
  | 'unsupported'
  | 'insecure-context'
  | 'policy-blocked'
  | 'permission-denied'
  | 'device-not-found'
  | 'device-busy'
  | 'constraints-unavailable'
  | 'aborted'
  | 'unknown';
export function classifyMediaFailure(error: unknown): MediaFailure {
  const name = error && typeof error === 'object' && 'name' in error ? error.name : '';
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'permission-denied';
    case 'SecurityError':
      return 'permission-denied';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'device-not-found';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'device-busy';
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'constraints-unavailable';
    case 'AbortError':
      return 'aborted';
    case 'NotSupportedError':
      return 'unsupported';
    default:
      return 'unknown';
  }
}
