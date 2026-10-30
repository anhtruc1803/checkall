'use client';
import { useEffect, useRef, useState } from 'react';
import type { MeasurementState } from '@/lib/measurements/types';
export function useInspection<T>(reader: () => T | Promise<T>) {
  const [result, setResult] = useState<T | null>(null),
    [state, setState] = useState<MeasurementState>('idle');
  const lifetime = useRef({ alive: true, generation: 0 });
  useEffect(() => {
    const current = lifetime.current;
    current.alive = true;
    return () => {
      current.alive = false;
      current.generation++;
    };
  }, []);
  async function read() {
    if (!lifetime.current.alive) return;
    const current = ++lifetime.current.generation;
    setResult(null);
    setState('preparing');
    try {
      const next = await reader();
      if (lifetime.current.alive && current === lifetime.current.generation) {
        setResult(next);
        setState('completed');
      }
    } catch {
      if (lifetime.current.alive && current === lifetime.current.generation) setState('error');
    }
  }
  function reset() {
    lifetime.current.generation++;
    setResult(null);
    setState('idle');
  }
  return { result, state, read, reset };
}
