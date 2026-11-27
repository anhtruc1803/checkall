import type { ReactNode, Ref } from 'react';
import { ListOrdered, RefreshCw } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { TypingChallengeId } from '@/lib/typing/competition';
import type { PublicTypingEntry } from '@/lib/typing/leaderboard';
import type { useTypingLeaderboard } from './leaderboard-client';
import styles from './competition.module.css';

export function TypingPublicRanking({
  challenge,
  leaderboard: { board, pending, page, changePage, refresh },
  renderAction,
  refreshButtonRef,
}: {
  challenge: TypingChallengeId;
  leaderboard: ReturnType<typeof useTypingLeaderboard>;
  renderAction?: (entry: PublicTypingEntry) => ReactNode;
  refreshButtonRef?: Ref<HTMLButtonElement>;
}) {
  const t = useTranslations('typing.competition');
  const format = useFormatter();

  if (board?.enabled === false) return null;

  function number(value: number) {
    return format.number(value, { maximumFractionDigits: 1 });
  }

  return (
    <section className={styles.panel} aria-labelledby="typing-public-ranking-label">
      <div className={styles.boardHeader}>
        <div>
          <h2 id="typing-public-ranking-label">
            <ListOrdered aria-hidden="true" />
            {t('public.heading')}
          </h2>
          <p>{t('public.scope', { challenge: t(`challenges.${challenge}`) })}</p>
        </div>
        <Button
          ref={refreshButtonRef}
          variant="outline"
          onClick={() => {
            if (!pending) refresh();
          }}
          aria-disabled={pending}
        >
          <RefreshCw aria-hidden="true" />
          {t('public.refresh')}
        </Button>
      </div>
      <div className={styles.boardBody} aria-busy={pending}>
        {board?.enabled && board.entries.length > 0 && (
          <ol className={styles.ranking} aria-label={t('public.heading')}>
            {board.entries.map((entry) => (
              <li key={entry.id} className={styles.entry}>
                <span className={styles.rank} data-rank={entry.rank}>
                  {t('rank', { rank: entry.rank })}
                </span>
                <div className={styles.identity}>
                  <strong>{entry.nickname}</strong>
                  <time dateTime={entry.time}>
                    {format.dateTime(new Date(entry.time), {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </time>
                </div>
                <div className={styles.entryScore}>
                  <strong>{number(entry.correct / 5)} WPM</strong>
                  <span>{t('accuracyValue', { value: number(entry.accuracy) })}</span>
                </div>
                {renderAction?.(entry)}
              </li>
            ))}
          </ol>
        )}
        <p role="status" className={styles.empty}>
          {pending
            ? t('public.loading')
            : !board
              ? t('public.errors.unavailable')
              : board.entries.length === 0
                ? t('public.empty')
                : ''}
        </p>
        {(page > 1 || (board?.enabled && board.more)) && (
          <nav className={styles.buttons} aria-label={t('public.pages')}>
            <Button
              variant="outline"
              disabled={pending || page < 2}
              onClick={() => changePage(page - 1)}
            >
              {t('public.previous')}
            </Button>
            <span>{t('public.page', { page })}</span>
            <Button
              variant="outline"
              disabled={pending || !board?.enabled || !board.more}
              onClick={() => changePage(page + 1)}
            >
              {t('public.next')}
            </Button>
          </nav>
        )}
      </div>
    </section>
  );
}
