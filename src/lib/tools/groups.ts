import type { Category, Engine, Tool } from './types';

export const toolGroupOrder = ['device-tests', 'utilities'] as const;
export type ToolGroup = (typeof toolGroupOrder)[number];
export function getToolGroup(category: Category): ToolGroup {
  return category === 'utilities' ? 'utilities' : 'device-tests';
}
export function getPublishedGroups(
  registry: readonly Pick<Tool, 'category' | 'status'>[],
): ToolGroup[] {
  return toolGroupOrder.filter((group) =>
    registry.some((tool) => tool.status === 'published' && getToolGroup(tool.category) === group),
  );
}

export const utilitySectionOrder = ['numbers', 'text', 'conversion', 'other'] as const;
export type UtilitySection = (typeof utilitySectionOrder)[number];

const utilityEngineSections: Partial<Record<Engine, UtilitySection>> = {
  'number-words': 'numbers',
  percentage: 'numbers',
  text: 'text',
  'unit-converter': 'conversion',
  'date-calculator': 'conversion',
};

export function getUtilitySection(engine: Engine): UtilitySection {
  return utilityEngineSections[engine] ?? 'other';
}
