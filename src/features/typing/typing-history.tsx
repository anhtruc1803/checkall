import { memo, useState } from 'react';
import { ChartNoAxesCombined } from 'lucide-react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { usePreference } from '@/hooks/use-preference';
import type { SavedSummary } from '@/lib/storage/preferences';
import { typingDifficulties, type TypingDifficulty } from '@/lib/typing/difficulty';
import styles from './typing.module.css';

type Measure = 'wpm' | 'accuracy';
type SavedTyping = SavedSummary & { typing: NonNullable<SavedSummary['typing']> };

export const TypingHistory = memo(function TypingHistory({ level }: { level: TypingDifficulty }) {
  const t = useTranslations('typing');
  const format = useFormatter();
  const locale = useLocale();
  const summaries = usePreference<SavedSummary[]>('summaries', []);
  const [filter, setFilter] = useState<TypingDifficulty | null>(null);
  const [measure, setMeasure] = useState<Measure>('wpm');
  const [selected, setSelected] = useState<string | null>(null);
  const difficulty = filter ?? level;
  const attempts = summaries
    .filter(
      (entry): entry is SavedTyping =>
        entry.toolId === 'B06' &&
        entry.typing?.difficulty === difficulty &&
        Number.isFinite(Date.parse(entry.time)),
    )
    .reverse();
  const current = attempts.findLast((entry) => entry.time === selected) ?? attempts.at(-1);
  const activeIndex = current ? attempts.indexOf(current) : -1;
  const previous = attempts[activeIndex - 1];
  const max =
    measure === 'accuracy'
      ? 100
      : Math.max(
          10,
          Math.ceil(Math.max(0, ...attempts.map((entry) => entry.typing.wpm)) / 10) * 10,
        );
  const points = attempts.map((entry, index) => ({
    x: attempts.length === 1 ? 50 : 2 + (96 * index) / (attempts.length - 1),
    y: 94 - (entry.typing[measure] / max) * 88,
  }));
  const axisUnit = measure === 'accuracy' ? '%' : ' WPM';
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' });

  function number(value: number) {
    return format.number(value, { maximumFractionDigits: 1 });
  }

  return (
    <section className={styles.history} aria-labelledby="typing-history-label">
      <div className={styles.historyHeader}>
        <h2 id="typing-history-label" className={styles.label}>
          <ChartNoAxesCombined aria-hidden="true" />
          {t('history.title')}
        </h2>
        <div className={styles.lesson}>
          <label htmlFor="typing-history-level">{t('history.level')}</label>
          <select
            id="typing-history-level"
            value={difficulty}
            onChange={(event) => {
              setFilter(event.target.value as TypingDifficulty);
              setSelected(null);
            }}
          >
            {typingDifficulties.map((option) => (
              <option key={option} value={option}>
                {t(`levels.${option}.name`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {current ? (
        <>
          <div className={styles.historyTools}>
            <div className={styles.modes} role="group" aria-label={t('history.metric')}>
              {(['wpm', 'accuracy'] as const).map((option) => (
                <Button
                  key={option}
                  variant="outline"
                  aria-pressed={measure === option}
                  onClick={() => setMeasure(option)}
                >
                  {option === 'wpm' ? 'WPM' : t('accuracy')}
                </Button>
              ))}
            </div>
            <div className={styles.chartStat}>
              <strong>
                {number(current.typing[measure])}
                {axisUnit}
              </strong>
              {previous && (
                <span className="small">
                  {t('history.change', {
                    delta: format.number(current.typing[measure] - previous.typing[measure], {
                      maximumFractionDigits: 1,
                      signDisplay: 'exceptZero',
                    }),
                    unit: measure === 'accuracy' ? t('history.points') : 'WPM',
                  })}
                </span>
              )}
            </div>
          </div>
          <figure className={styles.chart} data-metric={measure} aria-hidden="true">
            <div className={styles.chartAxis}>
              <span>
                {number(max)}
                {axisUnit}
              </span>
              <span>0{axisUnit}</span>
            </div>
            <div className={styles.chartPlot}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
                />
              </svg>
              {points.map(({ x, y }, index) => (
                <span
                  key={index}
                  className={styles.chartPoint}
                  data-selected={index === activeIndex}
                  style={{ left: `${x}%`, top: `${y}%` }}
                />
              ))}
            </div>
            <div className={styles.chartAttempts}>
              <span>{t('history.attempt', { index: 1 })}</span>
              {attempts.length > 1 && (
                <span>{t('history.attempt', { index: attempts.length })}</span>
              )}
            </div>
          </figure>
          <ol className={styles.attempts} role="list" reversed>
            {attempts.toReversed().map((entry, index) => (
              <li key={`${entry.time}-${index}`}>
                <Button
                  variant="outline"
                  aria-pressed={entry === current}
                  onClick={() => setSelected(entry.time)}
                >
                  <strong>{t('history.attempt', { index: attempts.length - index })}</strong>
                  <time dateTime={entry.time}>{date.format(new Date(entry.time))}</time>
                  <span>{number(entry.typing.wpm)} WPM</span>
                  <span>{number(entry.typing.accuracy)}%</span>
                </Button>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className={styles.historyEmpty}>{t('history.empty')}</p>
      )}
    </section>
  );
});
