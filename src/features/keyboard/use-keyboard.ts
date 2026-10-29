'use client';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { InputRecord } from '@/lib/measurements/calculations';
export interface KeyLog extends InputRecord {
  key: string;
  location: number;
  timestamp: number;
  modifiers: string;
}
export interface KeyHold {
  code: string;
  duration: number;
  interrupted: boolean;
}
export function useKeyboard() {
  const area = useRef<HTMLDivElement>(null),
    heldRef = useRef(new Map<string, number>());
  const [active, setActive] = useState(false),
    [held, setHeld] = useState<string[]>([]),
    [counts, setCounts] = useState<Record<string, number>>({}),
    [repeatCount, setRepeatCount] = useState(0),
    [maximum, setMaximum] = useState(0),
    [logs, setLogs] = useState<KeyLog[]>([]),
    [holds, setHolds] = useState<KeyHold[]>([]),
    [now, setNow] = useState(0),
    [heldStarts, setHeldStarts] = useState<Record<string, number>>({});
  const interrupt = useCallback(() => {
    const time = performance.now();
    const interrupted = [...heldRef.current].map(([code, start]) => ({
      code,
      duration: time - start,
      interrupted: true,
    }));
    if (interrupted.length) setHolds((old) => [...interrupted, ...old].slice(0, 50));
    heldRef.current.clear();
    setHeld([]);
    setActive(false);
  }, []);
  useEffect(() => {
    if (!active) return;
    const hidden = () => {
      if (document.hidden) interrupt();
    };
    window.addEventListener('blur', interrupt);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('blur', interrupt);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, [active, interrupt]);
  useEffect(() => {
    if (!held.length) return;
    const timer = window.setInterval(() => setNow(performance.now()), 50);
    return () => clearInterval(timer);
  }, [held.length]);
  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!active) return;
    const exitsCapture = event.key === 'Tab' || event.key === 'Escape';
    const time = performance.now(),
      code = event.code || 'Unidentified';
    if (!exitsCapture && !event.ctrlKey && !event.metaKey && !event.altKey) event.preventDefault();
    const entry: KeyLog = {
      code,
      key: event.key,
      location: event.location,
      repeat: event.repeat,
      time,
      timestamp: event.timeStamp,
      type: event.type as 'keydown' | 'keyup',
      modifiers:
        [
          event.ctrlKey ? 'Ctrl' : '',
          event.shiftKey ? 'Shift' : '',
          event.altKey ? 'Alt' : '',
          event.metaKey ? 'Meta' : '',
        ]
          .filter(Boolean)
          .join('+') || '—',
    };
    setLogs((old) => [...old, entry].slice(-200));
    if (exitsCapture) {
      if (event.type === 'keydown' && !event.repeat)
        setCounts((old) => ({ ...old, [code]: (old[code] ?? 0) + 1 }));
      interrupt();
      return;
    }
    if (event.type === 'keydown') {
      if (event.repeat) setRepeatCount((previous) => previous + 1);
      if (!event.repeat && !heldRef.current.has(code)) {
        heldRef.current.set(code, time);
        setCounts((old) => ({ ...old, [code]: (old[code] ?? 0) + 1 }));
        setHeld([...heldRef.current.keys()]);
        setHeldStarts(Object.fromEntries(heldRef.current));
        setMaximum((max) => Math.max(max, heldRef.current.size));
        setNow(time);
      }
    } else {
      const start = heldRef.current.get(code);
      if (start !== undefined)
        setHolds((old) =>
          [{ code, duration: time - start, interrupted: false }, ...old].slice(0, 50),
        );
      heldRef.current.delete(code);
      setHeld([...heldRef.current.keys()]);
    }
  }
  function reset() {
    heldRef.current.clear();
    setHeld([]);
    setCounts({});
    setRepeatCount(0);
    setMaximum(0);
    setLogs([]);
    setHolds([]);
    setActive(false);
  }
  function activate() {
    setActive(true);
    area.current?.focus();
  }
  return {
    area,
    active,
    held,
    counts,
    repeatCount,
    maximum,
    logs,
    holds,
    now,
    heldStarts,
    interrupt,
    onKey,
    reset,
    activate,
  };
}
