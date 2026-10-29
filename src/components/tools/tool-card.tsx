import Link from 'next/link';
import { ArrowUpRight, Monitor, Keyboard, Mouse } from 'lucide-react';
import type { Tool } from '@/lib/tools/registry';
import { toolHref } from '@/lib/tools/registry';
import type { Locale } from '@/lib/i18n/routing';
const icons = { screen: Monitor, keyboard: Keyboard, mouse: Mouse };
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
  const Icon = icons[tool.icon];
  return (
    <article className="tool-card">
      <div className="card-top">
        <span className="tool-icon">
          <Icon size={22} />
        </span>
        <span className="card-category">{categoryLabel}</span>
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
          <ArrowUpRight size={20} />
        </Link>
      </div>
    </article>
  );
}
