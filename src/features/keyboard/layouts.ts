export const layouts = ['ANSI Full-size', 'TKL', '75%', '65%', '60%', 'ISO'] as const;
export type KeyboardLayout = (typeof layouts)[number];
export interface PhysicalKey {
  code: string;
  label: string;
  size?: number;
}
const key = (code: string, label: string, size?: number): PhysicalKey => ({ code, label, size });
const letters = (line: string) => line.split('').map((char) => key(`Key${char}`, char));
export function keyboardRows(layout: KeyboardLayout): PhysicalKey[][] {
  const compact = layout === '60%';
  const rows: PhysicalKey[][] = [];
  if (!compact && layout !== '65%')
    rows.push([
      key('Escape', 'Esc'),
      ...Array.from({ length: 12 }, (_, i) => key(`F${i + 1}`, `F${i + 1}`)),
      ...(layout === '75%'
        ? [key('Delete', 'Del')]
        : [key('PrintScreen', 'PrtSc'), key('ScrollLock', 'ScrLk'), key('Pause', 'Pause')]),
    ]);
  rows.push([
    ...(compact || layout === '65%' ? [key('Escape', 'Esc')] : []),
    ...(!compact && layout !== '65%' ? [key('Backquote', '`')] : []),
    ...'1234567890'.split('').map((n) => key(`Digit${n}`, n)),
    key('Minus', '−'),
    key('Equal', '='),
    key('Backspace', '⌫', 2),
  ]);
  rows.push([
    key('Tab', 'Tab', 1.5),
    ...letters('QWERTYUIOP'),
    key('BracketLeft', '['),
    key('BracketRight', ']'),
    key('Backslash', '\\', 1.5),
  ]);
  rows.push([
    key('CapsLock', 'Caps', 1.8),
    ...letters('ASDFGHJKL'),
    key('Semicolon', ';'),
    key('Quote', "'"),
    key('Enter', 'Enter', 2.2),
  ]);
  rows.push([
    key('ShiftLeft', 'Shift', 2.2),
    ...(layout === 'ISO' ? [key('IntlBackslash', '<>')] : []),
    ...letters('ZXCVBNM'),
    key('Comma', ','),
    key('Period', '.'),
    key('Slash', '/'),
    key('ShiftRight', 'Shift', 2.5),
  ]);
  rows.push([
    key('ControlLeft', 'Ctrl', 1.3),
    key('MetaLeft', 'Meta', 1.2),
    key('AltLeft', 'Alt', 1.2),
    key('Space', '␣', 6),
    key('AltRight', 'Alt', 1.2),
    key('MetaRight', 'Meta', 1.2),
    key('ContextMenu', 'Menu', 1.2),
    key('ControlRight', 'Ctrl', 1.3),
  ]);
  if (!compact && layout !== '75%' && layout !== '65%')
    rows.push([
      key('Insert', 'Ins'),
      key('Home', 'Home'),
      key('PageUp', 'PgUp'),
      key('Delete', 'Del'),
      key('End', 'End'),
      key('PageDown', 'PgDn'),
      key('ArrowLeft', '←'),
      key('ArrowUp', '↑'),
      key('ArrowDown', '↓'),
      key('ArrowRight', '→'),
    ]);
  if (layout === '75%' || layout === '65%') {
    const offset = layout === '75%' ? 1 : 0;
    rows[offset].push(key('Home', 'Home'));
    rows[offset + 1].push(key('PageUp', 'PgUp'));
    rows[offset + 2].push(key('PageDown', 'PgDn'));
    rows[offset + 3].push(key('ArrowUp', '↑'));
    rows[offset + 4].push(key('ArrowLeft', '←'), key('ArrowDown', '↓'), key('ArrowRight', '→'));
    if (layout === '65%') rows[offset].push(key('Delete', 'Del'));
  }
  if (layout === 'ANSI Full-size' || layout === 'ISO') {
    rows.push([
      key('NumLock', 'Num'),
      key('NumpadDivide', '÷'),
      key('NumpadMultiply', '×'),
      key('NumpadSubtract', '−'),
      ...[7, 8, 9].map((i) => key(`Numpad${i}`, String(i))),
      key('NumpadAdd', '+'),
      ...[4, 5, 6, 1, 2, 3].map((i) => key(`Numpad${i}`, String(i))),
      key('NumpadEnter', '↵'),
      key('Numpad0', '0'),
      key('NumpadDecimal', '.'),
    ]);
  }
  return rows;
}
