import { getTranslations } from 'next-intl/server';
import { ArrowRight, Mic } from 'lucide-react';
import PolicyLink from '@/components/navigation/policy-link';
import { CategoryIcon } from './category-icon';
import { publishedTools, toolHref } from '@/lib/tools/registry';
import { problemShortcuts } from '@/lib/tools/problem-shortcuts';
import type { Locale } from '@/lib/i18n/routing';
import styles from './problem-chooser.module.css';

/** Server-rendered discovery links; opening a tool never starts its engine. */
export async function ProblemChooser({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'problems' });
  return (
    <section id="by-problem" className={styles.root} aria-labelledby="problem-title">
      <h2 id="problem-title">{t('title')}</h2>
      <div className={styles.grid}>
        {problemShortcuts.map(({ key, toolIds }) => {
          const tools = toolIds.map((id) => {
            const tool = publishedTools.find((entry) => entry.id === id);
            if (!tool) throw new Error(`Problem chooser requires published tool ${id}`);
            return tool;
          });
          return (
            <article
              key={key}
              className={styles.card}
              data-problem={key}
              data-category={tools[0].category}
            >
              <div className={styles.heading}>
                <span className={styles.icon}>
                  {key === 'microphone' ? (
                    <Mic size={18} aria-hidden="true" />
                  ) : (
                    <CategoryIcon category={tools[0].category} size={18} />
                  )}
                </span>
                <h3>{t(`${key}.title`)}</h3>
              </div>
              <ul className={styles.links}>
                {tools.map((tool, position) => (
                  <li key={tool.id}>
                    <PolicyLink
                      href={toolHref(tool, locale)}
                      prefetch={false}
                      tabIndex={0}
                      className={styles.link}
                      data-primary={position === 0}
                    >
                      <span>{tool.copy[locale].name}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </PolicyLink>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
      <p className={styles.note}>{t('note')}</p>
    </section>
  );
}
