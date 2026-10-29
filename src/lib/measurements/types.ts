export type MeasurementState =
  | 'idle'
  | 'preparing'
  | 'running'
  | 'completed'
  | 'warning'
  | 'error'
  | 'unsupported'
  | 'stopped'
  | 'reset';
export type MeasurementClass = 'observation' | 'estimate' | 'visual' | 'calculator' | 'unsupported';
export type Unit = 'Hz' | 'ms' | 'px' | 'PPI' | 'CPS' | 'ratio' | 'events' | 's';
export interface MeasurementResult {
  value: number | null;
  unit: Unit;
  timestamp: string;
  sampleCount: number;
  durationMs: number;
  method: string;
  quality: { conditions: string[]; valid: boolean };
  compatibility: string[];
  warnings: string[];
  observations?: string[];
}
export interface IntervalSummary {
  count: number;
  median: number;
  mean: number;
  min: number;
  max: number;
  standardDeviation: number;
  frequency: number;
  rejected: number;
}
