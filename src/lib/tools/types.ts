import type { Locale } from '@/lib/i18n/routing';
import type { MeasurementClass } from '@/lib/measurements/types';
import type { Capability, ToolPermission } from '@/lib/browser/capability-types';

export const categoryOrder = [
  'screen',
  'keyboard',
  'mouse',
  'audio',
  'camera',
  'gamepad',
  'device',
  'browser',
  'utilities',
] as const;
export type Category = (typeof categoryOrder)[number];
export const implementedEngines = [
  'screen-info',
  'calculator',
  'refresh',
  'patterns',
  'motion',
  'touch',
  'keyboard',
  'mouse',
  'device-info',
  'browser-info',
  'gpu-info',
  'pointer-info',
  'storage',
  'fullscreen',
  'mouse-movement',
  'mouse-accuracy',
  'mouse-reaction',
  'audio-output',
  'microphone',
  'audio-spectrum',
  'camera',
  'gamepad',
  'number-words',
  'percentage',
  'text',
  'unit-converter',
  'date-calculator',
  'vietnamese-typing',
  'qr-code',
  'image-resizer',
] as const;
export type ImplementedEngine = (typeof implementedEngines)[number];
export function isImplementedEngine(engine: Engine): engine is ImplementedEngine {
  return implementedEngines.some((available) => available === engine);
}
export type Engine = ImplementedEngine;
export interface ToolCopy {
  name: string;
  description: string;
  instructions: string;
  limitations: string;
  method: string;
}
export interface Tool {
  id: string;
  slug: string;
  category: Category;
  // Independent tools can be published outside the device testing phases.
  phase: 1 | 2 | 3 | null;
  status: 'published' | 'draft';
  icon: Category;
  engine: Engine;
  requiredCapabilities: Capability[];
  optionalCapabilities: Capability[];
  permissions: readonly ToolPermission[];
  classification: MeasurementClass;
  environments: readonly string[];
  seo: { index: boolean };
  relatedTools: string[];
  copy: Record<Locale, ToolCopy>;
}
