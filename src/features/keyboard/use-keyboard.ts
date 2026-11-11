'use client';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { InputRecord } from '@/lib/measurements/calculations';
import { KEYBOARD_CODE_LIMIT, KeyboardChatter } from '@/lib/measurements/keyboard-chatter';
export interface KeyLog extends InputRecord {
  sequence: number;
  key: string;
  location: number;
  timestamp: number;
  modifiers: string;
  isComposing: boolean;
  compositionActive: boolean;
  isTrusted: boolean;
  capsLock: boolean | null;
  numLock: boolean | null;
  altGraph: boolean | null;
}
export interface KeyHold {
  code: string;
  duration: number;
  interrupted: boolean;
  reason?: 'focus' | 'hidden' | 'exit' | 'composition' | 'unavailable';
}
export function useKeyboard({
  recordEvents = false,
  trackHolds = false,
  trackChatter = false,
} = {}) {
  const area = useRef<HTMLDivElement>(null);
  const heldRef = useRef(new Map<string, number>());
  const knownCodes = useRef(new Set<string>());
  const activeRef = useRef(false),
    composingRef = useRef(false),
    sequence = useRef(0),
    maximumRef = useRef(0);
  const chatter = useRef<KeyboardChatter | null>(null);
  const thresholdRef = useRef(30);
  const [threshold, setThreshold] = useState(30);
  const [chatterStats, setChatterStats] = useState<ReturnType<KeyboardChatter['snapshot']>>([]);
  const [active, setActive] = useState(false),
    [held, setHeld] = useState<string[]>([]),
    [counts, setCounts] = useState<Record<string, number>>({}),
    [repeatCount, setRepeatCount] = useState(0),
    [maximum, setMaximum] = useState(0),
    [maximumCodes, setMaximumCodes] = useState<string[]>([]),
    [logs, setLogs] = useState<KeyLog[]>([]),
    [lastEvent, setLastEvent] = useState<KeyLog | null>(null),
    [totalEvents, setTotalEvents] = useState(0),
    [unidentifiedEvents, setUnidentifiedEvents] = useState(0),
    [composingEvents, setComposingEvents] = useState(0),
    [limitReached, setLimitReached] = useState(false),
    [holds, setHolds] = useState<KeyHold[]>([]),
    [now, setNow] = useState(0),
    [heldStarts, setHeldStarts] = useState<Record<string, number>>({});

  const releaseHeld = useCallback(
    (reason: KeyHold['reason'] = 'focus') => {
      const time = performance.now();
      if (trackHolds && heldRef.current.size) {
        const interrupted = [...heldRef.current].map(([code, start]) => ({
          code,
          duration: Math.max(0, time - start),
          interrupted: true,
          reason,
        }));
        setHolds((old) => [...interrupted, ...old].slice(0, 50));
      }
      heldRef.current.clear();
      chatter.current?.breakSequence();
      setHeld([]);
      setHeldStarts({});
    },
    [trackHolds],
  );
  const stopCapture = useCallback(
    (reason: KeyHold['reason']) => {
      activeRef.current = false;
      composingRef.current = false;
      releaseHeld(reason);
      setActive(false);
    },
    [releaseHeld],
  );
  const interrupt = useCallback(() => stopCapture('focus'), [stopCapture]);
  useEffect(() => {
    if (!active) return;
    const hidden = () => {
      if (document.hidden) stopCapture('hidden');
    };
    window.addEventListener('blur', interrupt);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('blur', interrupt);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, [active, interrupt, stopCapture]);
  useEffect(() => {
    if (!trackHolds || !active || !held.length) return;
    const timer = window.setInterval(() => setNow(performance.now()), 50);
    return () => window.clearInterval(timer);
  }, [active, held.length, trackHolds]);
  useEffect(
    () => () => {
      activeRef.current = false;
      heldRef.current.clear();
      chatter.current?.breakSequence();
    },
    [],
  );

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!activeRef.current) return;
    const exitsCapture = event.key === 'Tab' || event.key === 'Escape';
    const time = performance.now(),
      code = event.code || 'Unidentified';
    const composing = composingRef.current || event.nativeEvent.isComposing;
    if (
      !exitsCapture &&
      !composing &&
      event.key !== 'Process' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    )
      event.preventDefault();
    const modifier = (name: 'CapsLock' | 'NumLock' | 'AltGraph') =>
      typeof event.nativeEvent.getModifierState === 'function'
        ? event.nativeEvent.getModifierState(name)
        : null;
    const entry: KeyLog = {
      sequence: ++sequence.current,
      code: event.code,
      key: event.key,
      location: event.location,
      repeat: event.repeat,
      time,
      timestamp: event.timeStamp,
      type: event.type as 'keydown' | 'keyup',
      isComposing: event.nativeEvent.isComposing,
      compositionActive: composingRef.current,
      isTrusted: event.isTrusted,
      capsLock: modifier('CapsLock'),
      numLock: modifier('NumLock'),
      altGraph: modifier('AltGraph'),
      modifiers:
        [
          event.ctrlKey ? 'Ctrl' : '',
          event.shiftKey ? 'Shift' : '',
          event.altKey ? 'Alt' : '',
          event.metaKey ? 'Meta' : '',
          modifier('AltGraph') ? 'AltGraph' : '',
        ]
          .filter(Boolean)
          .join('+') || '—',
    };
    setLastEvent(entry);
    setTotalEvents(sequence.current);
    if (recordEvents) setLogs((old) => [...old, entry].slice(-200));
    const identified = code !== 'Unidentified';
    if (!identified) setUnidentifiedEvents((old) => old + 1);
    if (composing) setComposingEvents((old) => old + 1);
    if (exitsCapture) {
      if (
        event.type === 'keydown' &&
        !event.repeat &&
        identified &&
        !composing &&
        (knownCodes.current.has(code) || knownCodes.current.size < KEYBOARD_CODE_LIMIT)
      ) {
        knownCodes.current.add(code);
        setCounts((old) => ({ ...old, [code]: (Object.hasOwn(old, code) ? old[code] : 0) + 1 }));
      }
      stopCapture('exit');
      return;
    }
    if (composing || !identified || event.key === 'Process') {
      releaseHeld(composing ? 'composition' : 'unavailable');
      return;
    }
    if (!knownCodes.current.has(code) && knownCodes.current.size >= KEYBOARD_CODE_LIMIT) {
      setLimitReached(true);
      return;
    }
    if (trackChatter) {
      const analyzer = (chatter.current ??= new KeyboardChatter());
      analyzer.record(entry);
      setChatterStats(analyzer.snapshot(thresholdRef.current));
    }
    if (event.type === 'keydown') {
      knownCodes.current.add(code);
      if (event.repeat) setRepeatCount((old) => old + 1);
      if (!event.repeat && !heldRef.current.has(code)) {
        knownCodes.current.add(code);
        heldRef.current.set(code, time);
        setCounts((old) => ({ ...old, [code]: (Object.hasOwn(old, code) ? old[code] : 0) + 1 }));
        const codes = [...heldRef.current.keys()];
        setHeld(codes);
        setHeldStarts(Object.fromEntries(heldRef.current));
        if (codes.length > maximumRef.current) {
          maximumRef.current = codes.length;
          setMaximum(codes.length);
          setMaximumCodes(codes);
        }
        if (trackHolds) setNow(time);
      }
    } else {
      const start = heldRef.current.get(code);
      if (trackHolds && start !== undefined)
        setHolds((old) =>
          [{ code, duration: Math.max(0, time - start), interrupted: false }, ...old].slice(0, 50),
        );
      heldRef.current.delete(code);
      setHeld([...heldRef.current.keys()]);
      setHeldStarts(Object.fromEntries(heldRef.current));
    }
  }
  function reset() {
    interrupt();
    knownCodes.current.clear();
    chatter.current?.reset();
    maximumRef.current = 0;
    sequence.current = 0;
    setCounts({});
    setRepeatCount(0);
    setMaximum(0);
    setMaximumCodes([]);
    setLogs([]);
    setHolds([]);
    setLastEvent(null);
    setTotalEvents(0);
    setUnidentifiedEvents(0);
    setComposingEvents(0);
    setLimitReached(false);
    setNow(0);
    setChatterStats([]);
  }
  function activate() {
    if (document.hidden) return;
    chatter.current?.breakSequence();
    activeRef.current = true;
    composingRef.current = false;
    setActive(true);
    area.current?.focus();
  }
  function onCompositionStart() {
    if (!activeRef.current) return;
    composingRef.current = true;
    releaseHeld('composition');
  }
  function onCompositionEnd() {
    if (!activeRef.current) return;
    composingRef.current = false;
    releaseHeld('composition');
  }
  function updateThreshold(value: number) {
    const next = Math.min(500, Math.max(1, Math.round(value) || 1));
    thresholdRef.current = next;
    setThreshold(next);
    setChatterStats(chatter.current?.snapshot(next) ?? []);
  }
  return {
    area,
    active,
    held,
    counts,
    repeatCount,
    maximum,
    maximumCodes,
    logs,
    lastEvent,
    totalEvents,
    unidentifiedEvents,
    composingEvents,
    limitReached,
    holds,
    now,
    heldStarts,
    interrupt,
    onKey,
    reset,
    activate,
    onCompositionStart,
    onCompositionEnd,
    clearLogs: () => setLogs([]),
    chatterStats,
    threshold,
    updateThreshold,
  };
}
