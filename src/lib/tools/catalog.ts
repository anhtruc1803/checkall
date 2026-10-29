import { categoryOrder, implementedEngines, type Category, type Engine, type Tool } from './types';

export function getPublishedTools(registry: readonly Tool[]): Tool[] {
  return registry.filter((tool) => tool.status === 'published');
}
export function getPublishedCategories(
  registry: readonly Pick<Tool, 'category' | 'status'>[],
): Category[] {
  return categoryOrder.filter((category) =>
    registry.some((tool) => tool.category === category && tool.status === 'published'),
  );
}
export function validateToolRegistry(
  registry: readonly Tool[],
  engines: readonly Engine[] = implementedEngines,
): void {
  const ids = new Set<string>(),
    routes = new Set<string>();
  for (const tool of registry) {
    const route = `${tool.category}/${tool.slug}`;
    if (ids.has(tool.id) || routes.has(route))
      throw new Error(`Duplicate tool: ${tool.id} / ${route}`);
    ids.add(tool.id);
    routes.add(route);
    if (!categoryOrder.includes(tool.category) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.slug))
      throw new Error(`Invalid tool route: ${route}`);
    if (tool.status === 'draft' && tool.seo.index)
      throw new Error(`Draft tool cannot be indexed: ${tool.id}`);
    if (tool.status === 'published' && !engines.includes(tool.engine))
      throw new Error(`Published tool has no implemented engine: ${tool.id}`);
    for (const locale of ['vi', 'en'] as const)
      if (Object.values(tool.copy[locale]).some((value) => !value.trim()))
        throw new Error(`Missing ${locale} copy: ${tool.id}`);
  }
  for (const tool of registry)
    for (const id of tool.relatedTools)
      if (
        !registry.some(
          (related) =>
            related.id === id &&
            related.id !== tool.id &&
            (tool.status !== 'published' || related.status === 'published'),
        )
      )
        throw new Error(`Invalid related tool: ${tool.id} / ${id}`);
}
