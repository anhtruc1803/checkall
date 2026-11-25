export const typingErrorTypes = ['tone', 'vowel', 'letterD', 'spacing', 'other'] as const;
type TypingErrorType = (typeof typingErrorTypes)[number];

const toneMarks = /[\u0300\u0301\u0303\u0309\u0323]/gu;
const combiningMarks = /\p{Mark}/gu;

export function typingCharacters(text: string): string[] {
  // NFC composes Vietnamese vowel and tone marks before counting characters.
  return Array.from(text.normalize('NFC'));
}

function classifyError(expected: string, entered: string): TypingErrorType {
  if (/\s/u.test(expected) || /\s/u.test(entered)) return 'spacing';
  if (`${expected}${entered}`.match(/^(?:dđ|đd|DĐ|ĐD)$/u)) return 'letterD';
  if (!expected || !entered) return 'other';
  const target = expected.normalize('NFD');
  const actual = entered.normalize('NFD');
  if (target.replace(toneMarks, '') === actual.replace(toneMarks, '')) return 'tone';
  if (target.replace(combiningMarks, '') === actual.replace(combiningMarks, '')) return 'vowel';
  return 'other';
}

export function scoreTyping(prompt: string, text: string, elapsedMs: number) {
  const expected = typingCharacters(prompt);
  const entered = typingCharacters(text);
  const width = expected.length + 1;
  const distance = new Uint16Array(width * (entered.length + 1));
  for (let j = 0; j < width; j++) distance[j] = j;
  for (let i = 1; i <= entered.length; i++) {
    const row = i * width;
    distance[row] = i;
    for (let j = 1; j < width; j++) {
      const penalty = entered[i - 1] === expected[j - 1] ? 0 : 1;
      distance[row + j] = Math.min(
        distance[row + j - 1] + 1,
        distance[row + j - width] + 1,
        distance[row + j - width - 1] + penalty,
      );
    }
  }

  // Compare against the best prefix so the untouched suffix is never scored as an error.
  const lastRow = entered.length * width;
  let end = 0;
  for (let j = 1; j < width; j++) {
    const candidate = distance[lastRow + j];
    const best = distance[lastRow + end];
    if (
      candidate < best ||
      (candidate === best && Math.abs(j - entered.length) < Math.abs(end - entered.length))
    )
      end = j;
  }

  const errors = { tone: 0, vowel: 0, letterD: 0, spacing: 0, other: 0 };
  let correct = 0;
  let i = entered.length;
  let j = end;
  while (i > 0 || j > 0) {
    const cell = i * width + j;
    const actual = entered[i - 1] ?? '';
    const target = expected[j - 1] ?? '';
    if (
      i > 0 &&
      j > 0 &&
      distance[cell] === distance[cell - width - 1] + Number(actual !== target)
    ) {
      if (actual === target) correct++;
      else errors[classifyError(target, actual)]++;
      i--;
      j--;
    } else if (j > 0 && distance[cell] === distance[cell - 1] + 1) {
      errors[classifyError(target, '')]++;
      j--;
    } else {
      errors[classifyError('', actual)]++;
      i--;
    }
  }
  const errorCount = distance[lastRow + end];
  const minutes = elapsedMs / 60_000;
  return {
    correct,
    entered: entered.length,
    accuracy: correct + errorCount ? (100 * correct) / (correct + errorCount) : 0,
    cpm: minutes > 0 ? correct / minutes : 0,
    wpm: minutes > 0 ? correct / (5 * minutes) : 0,
    errors,
  };
}
