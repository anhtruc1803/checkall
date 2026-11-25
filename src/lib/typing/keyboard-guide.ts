const rows = [
  ['number', '1234567890-=', [1, 2, 3, 4, 4, 6, 6, 7, 8, 9, 9, 9]],
  ['upper', 'qwertyuiop[]', [1, 2, 3, 4, 4, 6, 6, 7, 8, 9, 9, 9]],
  ['home', "asdfghjkl;'", [1, 2, 3, 4, 4, 6, 6, 7, 8, 9, 9]],
  ['lower', 'zxcvbnm,./', [1, 2, 3, 4, 4, 6, 6, 7, 8, 9]],
  ['space', ' ', [5]],
] as const;

export type PracticeKeyRow = Exclude<(typeof rows)[number][0], 'space'> | 'mixed';

export const keyboardRows = rows.map(([id, keys, fingers]) => ({
  id,
  keys: Array.from(keys, (key, index) => ({ key, finger: fingers[index] })),
}));
const keys = keyboardRows.flatMap((row) => row.keys);

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
  const key = keys.find((item) => item.key === (shiftedSymbols[base] ?? lower));
  return key ? { ...key, shifted: base !== lower || Object.hasOwn(shiftedSymbols, base) } : null;
}
