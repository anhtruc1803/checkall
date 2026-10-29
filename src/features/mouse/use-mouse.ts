'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { PointerSampler } from '@/lib/measurements/pointer-sampler';
import { cps } from '@/lib/measurements/calculations';
import type { MeasurementState } from '@/lib/measurements/types';
interface WheelSample {
  x: number;
  y: number;
  mode: number;
  count: number;
}
export function useMouse(toolId: string) {
  const area = useRef<HTMLDivElement>(null),
    sampler = useRef(new PointerSampler()),
    startTime = useRef(0),
    active = useRef(false),
    clickCount = useRef(0),
    wheelBuffer = useRef<WheelSample>({ x: 0, y: 0, mode: 0, count: 0 });
  const [duration, setDuration] = useState(5),
    [state, setState] = useState<MeasurementState>('idle'),
    [elapsed, setElapsed] = useState(0),
    [held, setHeld] = useState<number[]>([]),
    [counts, setCounts] = useState<Record<number, number>>({}),
    [clicks, setClicks] = useState(0),
    [clickTimes, setClickTimes] = useState<number[]>([]),
    [best, setBest] = useState(0),
    [timestamps, setTimestamps] = useState<number[]>([]),
    [coalesced, setCoalesced] = useState(false),
    [rejected, setRejected] = useState(0),
    [hidden, setHidden] = useState(false),
    [wheel, setWheel] = useState<WheelSample>({ x: 0, y: 0, mode: 0, count: 0 }),
    [history, setHistory] = useState<{ value: number; samples: number }[]>([]);
  const running = state === 'running';
  const finish = useCallback(
    (interrupted = false, completed = false) => {
      if (!active.current) return;
      active.current = false;
      const measured = Math.min(performance.now() - startTime.current, duration * 1000);
      setElapsed(measured);
      setState(interrupted ? 'warning' : completed ? 'completed' : 'stopped');
      setTimestamps([...sampler.current.timestamps]);
      setCoalesced(sampler.current.coalesced);
      setRejected(sampler.current.rejected);
      if (!interrupted && toolId === 'C03')
        setBest((previous) => Math.max(previous, cps(clickCount.current, measured)));
      if (!interrupted && toolId === 'C05') {
        const samples = sampler.current.timestamps;
        const span = (samples.at(-1) ?? 0) - (samples[0] ?? 0);
        if (samples.length >= 20 && span >= 500)
          setHistory((old) =>
            [
              { value: ((samples.length - 1) * 1000) / span, samples: samples.length },
              ...old,
            ].slice(0, 10),
          );
      }
      if (interrupted) setHidden(true);
    },
    [duration, toolId],
  );
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(
      () => {
        const time = performance.now() - startTime.current;
        setElapsed(Math.min(time, duration * 1000));
        if (toolId === 'C05') {
          setTimestamps([...sampler.current.timestamps]);
          setCoalesced(sampler.current.coalesced);
          setRejected(sampler.current.rejected);
        }
        if (time >= duration * 1000) finish(false, true);
      },
      toolId === 'C05' ? 250 : 100,
    );
    return () => clearInterval(timer);
  }, [running, duration, finish, toolId]);
  useEffect(() => {
    const blur = () => {
      setHeld([]);
      finish(true);
    };
    const visibility = () => {
      if (document.hidden) blur();
    };
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', visibility);
      active.current = false;
    };
  }, [finish]);
  useEffect(() => {
    if (toolId !== 'C04') return;
    const element = area.current;
    if (!element) return;
    const listener = (event: WheelEvent) => {
      event.preventDefault();
      wheelBuffer.current = {
        x: event.deltaX,
        y: event.deltaY,
        mode: event.deltaMode,
        count: wheelBuffer.current.count + 1,
      };
    };
    const timer = window.setInterval(() => {
      if (wheelBuffer.current.count) setWheel(wheelBuffer.current);
    }, 100);
    element.addEventListener('wheel', listener, { passive: false });
    return () => {
      clearInterval(timer);
      element.removeEventListener('wheel', listener);
    };
  }, [toolId]);
  function start() {
    sampler.current.reset();
    clickCount.current = 0;
    setClicks(0);
    setClickTimes([]);
    setTimestamps([]);
    setRejected(0);
    setCoalesced(false);
    setElapsed(0);
    setHidden(false);
    startTime.current = performance.now();
    active.current = true;
    setState('running');
  }
  function reset() {
    active.current = false;
    sampler.current.reset();
    setState('reset');
    setElapsed(0);
    setHeld([]);
    setCounts({});
    setClicks(0);
    clickCount.current = 0;
    setClickTimes([]);
    setTimestamps([]);
    setHidden(false);
    setCoalesced(false);
    setRejected(0);
    setBest(0);
    setHistory([]);
    wheelBuffer.current = { x: 0, y: 0, mode: 0, count: 0 };
    setWheel(wheelBuffer.current);
  }
  function down(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeld((old) => [...new Set([...old, event.button])]);
    setCounts((old) => ({ ...old, [event.button]: (old[event.button] ?? 0) + 1 }));
    if (event.button !== 0) return;
    if (
      toolId === 'C03' &&
      (!active.current || performance.now() - startTime.current >= duration * 1000)
    )
      return;
    clickCount.current++;
    setClicks(clickCount.current);
    setClickTimes((old) => [...old, event.timeStamp].slice(-200));
  }
  function up(event: ReactPointerEvent<HTMLDivElement>) {
    setHeld((old) => old.filter((button) => button !== event.button));
  }
  function move(event: ReactPointerEvent<HTMLDivElement>) {
    if (active.current && toolId === 'C05') sampler.current.add(event.nativeEvent);
  }
  return {
    area,
    duration,
    setDuration,
    state,
    running,
    elapsed,
    held,
    counts,
    clicks,
    clickTimes,
    best,
    timestamps,
    coalesced,
    rejected,
    hidden,
    wheel,
    history,
    start,
    finish,
    reset,
    down,
    up,
    move,
    clearHeld: () => setHeld([]),
  };
}
