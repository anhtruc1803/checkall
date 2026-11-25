const rows = [
  ['1234567890-=', [1, 2, 3, 4, 4, 6, 6, 7, 8, 9, 9, 9]],
  ['qwertyuiop[]', [1, 2, 3, 4, 4, 6, 6, 7, 8, 9, 9, 9]],
  ["asdfghjkl;'", [1, 2, 3, 4, 4, 6, 6, 7, 8, 9, 9]],
  ['zxcvbnm,./', [1, 2, 3, 4, 4, 6, 6, 7, 8, 9]],
  [' ', [5]],
] as const;

export const keyboardRows = rows.map(([keys, fingers]) =>
  Array.from(keys, (key, index) => ({ key, finger: fingers[index] })),
);

const shiftedSymbols: Record<string, string> = {
  '!': '1',
  '@': '2',
  '#': '3',
  $: '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  _: '-',
  '+': '=',
  '{': '[',
  '}': ']',
  ':': ';',
  '"': "'",
  '<': ',',
  '>': '.',
  '?': '/',
};

export function typingKeyHint(character: string | undefined) {
  if (!character) return null;
  const base = character
    .normalize('NFD')
    .replace(/\p{Mark}/gu, '')
    .replace(/[đĐ]/u, (letter) => (letter === 'đ' ? 'd' : 'D'));
  const lower = base.toLowerCase();
  const key = keyboardRows.flat().find((item) => item.key === (shiftedSymbols[base] ?? lower));
  return key ? { ...key, shifted: base !== lower || Object.hasOwn(shiftedSymbols, base) } : null;
}
