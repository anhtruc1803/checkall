export const accentTopics = [
  'toneQuestionTilde',
  'toneRisingHeavy',
  'toneLevelFalling',
  'vowelA',
  'vowelE',
  'vowelO',
  'vowelU',
] as const;

export type AccentTopic = (typeof accentTopics)[number];
export type AccentCounts = Partial<Record<AccentTopic, number>>;

const toneTopics: Record<string, AccentTopic> = {
  '\u0303': 'toneQuestionTilde',
  '\u0309': 'toneQuestionTilde',
  '\u0301': 'toneRisingHeavy',
  '\u0323': 'toneRisingHeavy',
};

const vowelTopics: Record<string, AccentTopic> = {
  a: 'vowelA',
  e: 'vowelE',
  o: 'vowelO',
  u: 'vowelU',
};

export const toneMarks = /[\u0300\u0301\u0303\u0309\u0323]/gu;

export function accentTopic(character: string, kind: 'tone' | 'vowel'): AccentTopic | undefined {
  const decomposed = character.normalize('NFD').toLowerCase();
  if (kind === 'vowel') return vowelTopics[decomposed[0]];
  const mark = decomposed.match(toneMarks)?.[0] ?? '';
  return toneTopics[mark] ?? 'toneLevelFalling';
}

export function mostFrequentAccent(counts: AccentCounts) {
  let topic: AccentTopic | undefined;
  let count = 0;
  for (const candidate of accentTopics) {
    const errors = counts[candidate] ?? 0;
    if (errors <= count) continue;
    topic = candidate;
    count = errors;
  }
  return topic ? { topic, count } : null;
}
