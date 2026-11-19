import type { Category, Tool } from './types';

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
