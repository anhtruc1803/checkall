import type { MeasurementResult } from '@/lib/measurements/types';
let refresh: MeasurementResult | null = null;
const listeners = new Set<() => void>();
export const sessionMeasurements = {
  getRefresh: () => refresh,
  subscribe(callback: () => void) {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  },
  setRefresh(result: MeasurementResult | null) {
    refresh = result;
    listeners.forEach((listener) => listener());
  },
};
