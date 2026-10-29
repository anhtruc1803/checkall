export const phase1Capabilities = [
  'screen',
  'animationFrame',
  'canvas',
  'pointer',
  'touch',
  'keyboard',
  'fullscreen',
  'visualViewport',
] as const;
export type Phase1Capability = (typeof phase1Capabilities)[number];
export type Capability =
  | Phase1Capability
  | 'secureContext'
  | 'mediaDevices'
  | 'audioContext'
  | 'gamepad'
  | 'webgl'
  | 'storage'
  | 'permissions';
export type CapabilityState = 'available' | 'unavailable' | 'unknown';
export type ToolPermission = 'camera' | 'microphone';
