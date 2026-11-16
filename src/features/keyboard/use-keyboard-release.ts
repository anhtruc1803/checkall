'use client';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';

/** Letter positions only: IME-generated Backspace must never become a received key. */
export function isReleaseLetterCode(code: string) {
  return /^Key[A-Z]$/.test(code);
}

/** Recognition only. This hook has no press, hold, repeat, rollover or chatter measurements. */
export function useKeyboardRelease() {
  const area = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const composingRef = useRef(false);
  const receivedRef = useRef(new Set<string>());
  const [active, setActive] = useState(false);
  const [releasedCodes, setReleasedCodes] = useState<string[]>([]);
  const [interference, setInterference] = useState(false);

  const interrupt = useCallback(() => {
    activeRef.current = false;
    composingRef.current = false;
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

  useEffect(
    () => () => {
      activeRef.current = false;
      composingRef.current = false;
      receivedRef.current.clear();
    },
    [],
  );

  function activate() {
    if (activeRef.current || document.hidden) return;
    activeRef.current = true;
    composingRef.current = false;
    setActive(true);
    area.current?.focus();
  }

  function reset() {
    interrupt();
    receivedRef.current.clear();
    setReleasedCodes([]);
    setInterference(false);
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!activeRef.current) return;
    if (event.key === 'Tab' || event.key === 'Escape') {
      interrupt();
      return;
    }
    const ambiguous =
      composingRef.current ||
      event.nativeEvent.isComposing ||
      event.nativeEvent.keyCode === 229 ||
      event.nativeEvent.keyCode === 231 ||
      event.key === 'Process' ||
      event.key === 'Unidentified' ||
      !event.code ||
      event.code === 'Unidentified';
    if (!ambiguous && !event.ctrlKey && !event.metaKey && !event.altKey) event.preventDefault();
    if (ambiguous) {
      // Keep the focused area active: the original letter release may arrive later.
      setInterference(true);
      return;
    }
    if (event.type !== 'keyup' || event.repeat || !isReleaseLetterCode(event.code)) return;
    if (!receivedRef.current.has(event.code)) {
      receivedRef.current.add(event.code);
      setReleasedCodes([...receivedRef.current]);
    }
  }

  function onCompositionStart() {
    if (!activeRef.current) return;
    composingRef.current = true;
    setInterference(true);
  }
  function onCompositionEnd() {
    composingRef.current = false;
  }

  return {
    area,
    active,
    releasedCodes,
    interference,
    activate,
    interrupt,
    reset,
    onKey,
    onCompositionStart,
    onCompositionEnd,
  };
}
