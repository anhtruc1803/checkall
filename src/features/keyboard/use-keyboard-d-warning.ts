import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

// Advisory only: observed releases cannot establish two physical key presses.
export function useKeyboardDWarning(active: boolean) {
  const previousD = useRef(false);
  const [observed, setObserved] = useState(false);

  useEffect(() => {
    if (!active) previousD.current = false;
  }, [active]);

  function breakSequence() {
    previousD.current = false;
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!active) return;
    if (
      event.repeat ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      event.nativeEvent.isComposing ||
      event.nativeEvent.keyCode === 229 ||
      event.nativeEvent.keyCode === 231 ||
      !event.code ||
      event.code === 'Unidentified' ||
      event.key === 'Unidentified' ||
      event.key === 'Process' ||
      event.key === 'Tab' ||
      event.key === 'Escape'
    ) {
      breakSequence();
      return;
    }
    if (event.type === 'keydown' && event.code !== 'KeyD') breakSequence();
    if (event.type !== 'keyup') return;
    if (previousD.current && event.code === 'KeyD') setObserved(true);
    previousD.current = event.code === 'KeyD';
  }

  function reset() {
    breakSequence();
    setObserved(false);
  }

  return { observed, onKey, reset, breakSequence };
}
