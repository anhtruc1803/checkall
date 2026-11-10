import Link from '@/components/navigation/policy-link';
import { ArrowUpRight } from 'lucide-react';
import { CategoryIcon } from './category-icon';
import type { Tool } from '@/lib/tools/registry';
import { toolHref } from '@/lib/tools/registry';
import type { Locale } from '@/lib/i18n/routing';
export function ToolCard({
  tool,
  locale,
  categoryLabel,
  classLabel,
}: {
  tool: Tool;
  locale: Locale;
  categoryLabel: string;
  classLabel: string;
}) {
  return (
    <article className="tool-card" data-category={tool.category}>
      <div className="card-top">
        <span className="tool-icon">
          <CategoryIcon category={tool.category} size={26} />
        </span>
        <span className="card-category">
          {categoryLabel} <span aria-hidden="true">/ {tool.id}</span>
        </span>
      </div>
      <h3>
        <Link href={toolHref(tool, locale)} prefetch={false}>
          {tool.copy[locale].name}
        </Link>
      </h3>
      <p>{tool.copy[locale].description}</p>
      <div className="card-bottom">
        <span>{classLabel}</span>
        <Link href={toolHref(tool, locale)} prefetch={false} aria-label={tool.copy[locale].name}>
          <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
