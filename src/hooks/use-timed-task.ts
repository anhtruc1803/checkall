'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MeasurementState } from '@/lib/measurements/types';
export function useTimedTask<T, S>(factory: () => T, snapshot: (model: T) => S, limit = 60000) {
  const model = useRef(factory()),
    started = useRef(0),
    active = useRef(false);
  const [data, setData] = useState(() => snapshot(factory()));
  const [running, setRunning] = useState(false),
    [state, setState] = useState<MeasurementState>('idle'),
    [elapsed, setElapsed] = useState(0);
  const publish = useCallback(() => {
    setData(snapshot(model.current));
  }, [snapshot]);
  const stop = useCallback(
    (next: MeasurementState = 'stopped') => {
      if (!active.current) return;
      active.current = false;
      setElapsed(Math.max(0, performance.now() - started.current));
      setRunning(false);
      setState(next);
      publish();
    },
    [publish],
  );
  useEffect(() => {
    if (!running) return;
    const hidden = () => {
      if (document.visibilityState === 'hidden') stop('warning');
    };
    const interrupted = () => stop('warning');
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - started.current;
      if (elapsed >= limit) stop('stopped');
      else {
        setElapsed(elapsed);
        publish();
      }
    }, 250);
    window.addEventListener('blur', interrupted);
    window.addEventListener('resize', interrupted);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      clearInterval(timer);
      window.removeEventListener('blur', interrupted);
      window.removeEventListener('resize', interrupted);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, [running, limit, stop, publish]);
  useEffect(
    () => () => {
      active.current = false;
    },
    [],
  );
  function start() {
    model.current = factory();
    started.current = performance.now();
    active.current = true;
    setElapsed(0);
    setRunning(true);
    setState('running');
    publish();
  }
  function reset() {
    active.current = false;
    model.current = factory();
    setElapsed(0);
    setRunning(false);
    setState('idle');
    publish();
  }
  return { model, data, running, state, elapsed, active, start, stop, reset, publish };
}
