import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PolicyLink from '@/components/navigation/policy-link';
import { toolHref } from '@/lib/tools/search';
import type { Tool } from '@/lib/tools/types';
import type { Locale } from '@/lib/i18n/routing';
import { ToolArtwork, ToolIcon } from './tool-visual';
import styles from './tool-card.module.css';

export function ToolCard({
  tool,
  name,
  locale,
  description,
  featured = false,
}: {
  tool: Pick<Tool, 'id' | 'category' | 'slug'>;
  name: string;
  locale: Locale;
  description: string;
  featured?: boolean;
}) {
  const t = useTranslations('toolPreviews');
  const summary = t.has(tool.id) ? t(tool.id) : description;

  return (
    <PolicyLink
      href={toolHref(tool, locale)}
      prefetch={false}
      tabIndex={0}
      className={`${styles.card} ${featured ? '' : 'catalog-item'}`}
      data-category={tool.category}
      data-tool-id={tool.id}
    >
      <ToolArtwork id={tool.id} category={tool.category} wordExample={t('exampleTen')} />
      <div className={styles.cardBody}>
        <span className={styles.icon} data-tool-icon={tool.id}>
          <ToolIcon id={tool.id} category={tool.category} />
        </span>
        <div className={styles.copy}>
          <h3>{name}</h3>
          <p>{summary}</p>
        </div>
        <ArrowRight className={styles.arrow} size={17} aria-hidden="true" />
      </div>
    </PolicyLink>
  );
}
