export type GamepadCapability =
  | 'unknown'
  | 'available'
  | 'unsupported'
  | 'insecure-context'
  | 'policy-blocked';
export function inspectGamepadEnvironment(): GamepadCapability {
  if (
    typeof window === 'undefined' ||
    typeof navigator === 'undefined' ||
    typeof document === 'undefined'
  )
    return 'unknown';
  if (window.isSecureContext !== true) return 'insecure-context';
  try {
    const doc = document as Document & { permissionsPolicy?: Policy; featurePolicy?: Policy };
    const policy = doc.permissionsPolicy ?? doc.featurePolicy;
    // An unknown directive can return false. Only trust denial for an advertised feature.
    if (policy?.features?.().includes('gamepad') && !policy.allowsFeature('gamepad'))
      return 'policy-blocked';
    return typeof navigator.getGamepads === 'function' &&
      typeof window.requestAnimationFrame === 'function' &&
      typeof window.cancelAnimationFrame === 'function'
      ? 'available'
      : 'unsupported';
  } catch {
    return 'unsupported';
  }
}
interface Policy {
  features?: () => string[];
  allowsFeature: (feature: string) => boolean;
}
