import { getTranslations } from 'next-intl/server';
import { ArrowRight, Mic } from 'lucide-react';
import PolicyLink from '@/components/navigation/policy-link';
import { CategoryIcon } from './category-icon';
import { publishedTools, toolHref } from '@/lib/tools/registry';
import type { Locale } from '@/lib/i18n/routing';
import styles from './problem-chooser.module.css';

const problems = [
  { key: 'screen', toolIds: ['A05', 'A10'] },
  { key: 'keyboard', toolIds: ['B03', 'B01'] },
  { key: 'microphone', toolIds: ['D03', 'D05'] },
] as const;

/** Server-rendered discovery links; opening a tool never starts its engine. */
export async function ProblemChooser({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'problems' });
  return (
    <section
      id="by-problem"
      className={`section problem-chooser ${styles.root}`}
      aria-labelledby="problem-title"
    >
      <div className="section-head">
        <div>
          <p className="eyebrow">01 / {t('eyebrow')}</p>
          <h2 id="problem-title">{t('title')}</h2>
          <p>{t('description')}</p>
        </div>
      </div>
      <div className={styles.grid}>
        {problems.map(({ key, toolIds }, index) => {
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
                    <Mic size={25} aria-hidden="true" />
                  ) : (
                    <CategoryIcon category={tools[0].category} size={25} />
                  )}
                </span>
                <span className={styles.number} aria-hidden="true">
                  0{index + 1}
                </span>
              </div>
              <h3>{t(`${key}.title`)}</h3>
              <p className={styles.description}>{t(`${key}.description`)}</p>
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
                      <span>
                        <small>{t(position === 0 ? 'startWith' : 'alsoTry')}</small>
                        <span>{tool.copy[locale].name}</span>
                      </span>
                      <ArrowRight size={18} aria-hidden="true" />
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
