import { memo, useState } from 'react';
import { Check, Download, Save, Send, Trophy } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { usePreference } from '@/hooks/use-preference';
import {
  saveSummary,
  writePreference,
  type SavedSummary,
  type TypingCompetitionScore,
} from '@/lib/storage/preferences';
import { rankTypingAttempts, type TypingChallengeId } from '@/lib/typing/competition';
import type { LeaderboardError } from '@/lib/typing/leaderboard';
import type { ImageLayout } from './competition-image';
import { postTypingLeaderboard } from './leaderboard-client';
import styles from './competition.module.css';

type Attempt = TypingCompetitionScore & { time: string };
type CurrentScore = Pick<Attempt, 'time' | 'correct' | 'accuracy'>;

export const TypingCompetition = memo(function TypingCompetition({
  challenge,
  score,
  ticket,
  publicEnabled,
  onPublished,
}: {
  challenge: TypingChallengeId;
  score: CurrentScore | null;
  ticket?: string;
  publicEnabled: boolean;
  onPublished: () => void;
}) {
  const t = useTranslations('typing');
  const common = useTranslations();
  const format = useFormatter();
  const saveEnabled = usePreference('save', false);
  const summaries = usePreference<SavedSummary[]>('summaries', []);
  const [nickname, setNickname] = useState('');
  const [savedTime, setSavedTime] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [layout, setLayout] = useState<ImageLayout>('landscape');
  const [exportStatus, setExportStatus] = useState<'idle' | 'working' | 'error'>('idle');
  const [publishStatus, setPublishStatus] = useState<
    LeaderboardError | 'working' | 'published' | null
  >(null);
  const current = score && {
    ...score,
    challenge,
    nickname: nickname.trim(),
    accuracy: Math.round(score.accuracy * 10) / 10,
  };
  const saved = current !== null && current.time === savedTime;
  const published = publishStatus === 'published' || publishStatus === 'alreadySubmitted';
  const ranking = rankTypingAttempts(
    summaries.flatMap(({ toolId, competition, time }) =>
      toolId === 'B06' && competition?.challenge === challenge && Number.isFinite(Date.parse(time))
        ? [{ ...competition, time }]
        : [],
    ),
  );

  function number(value: number) {
    return format.number(value, { maximumFractionDigits: 1 });
  }

  function date(time: string) {
    return format.dateTime(new Date(time), { dateStyle: 'medium', timeStyle: 'short' });
  }

  async function download(attempt: Attempt) {
    setExportStatus('working');
    try {
      const { downloadCompetitionImage } = await import('./competition-image');
      await downloadCompetitionImage(
        {
          title: t('competition.mode'),
          challenge: t('competition.cardChallenge', {
            challenge: t(`competition.challenges.${attempt.challenge}`),
          }),
          nickname: attempt.nickname || t('competition.anonymous'),
          date: date(attempt.time),
          metrics: [
            { label: 'WPM', value: number(attempt.correct / 5) },
            { label: t('accuracy'), value: `${number(attempt.accuracy)}%` },
            { label: t('correct'), value: number(attempt.correct) },
          ],
        },
        layout,
        `device-lab-${attempt.challenge}-${layout}.png`,
      );
      setExportStatus('idle');
    } catch {
      setExportStatus('error');
    }
  }

  function saveCurrent() {
    if (!current || saved) return;
    const { time, ...competition } = current;
    const success = saveSummary({
      toolId: 'B06',
      time,
      value: `${(competition.correct / 5).toFixed(1)} WPM · ${competition.accuracy.toFixed(1)}%`,
      competition,
    });
    setSaveError(!success);
    if (success) setSavedTime(time);
  }

  async function publishCurrent() {
    if (!current || !ticket || !current.nickname || published || publishStatus === 'working')
      return;
    setPublishStatus('working');
    const result = await postTypingLeaderboard({
      action: 'submit',
      challenge,
      ticket,
      nickname: current.nickname,
      correct: current.correct,
      accuracy: current.accuracy,
    });
    setPublishStatus(result.error ?? 'published');
    if (!result.error || result.error === 'alreadySubmitted') onPublished();
  }

  return (
    <section className={styles.panel} aria-labelledby="typing-ranking-label">
      <div className={styles.boardHeader}>
        <div>
          <h2 id="typing-ranking-label">
            <Trophy aria-hidden="true" />
            {t('competition.ranking')}
          </h2>
          <p>{t('competition.rankingScope')}</p>
        </div>
        {(current || ranking.length > 0) && (
          <div className={styles.field}>
            <label htmlFor="typing-image-layout">{t('competition.layout')}</label>
            <select
              id="typing-image-layout"
              value={layout}
              onChange={(event) => setLayout(event.target.value as ImageLayout)}
            >
              <option value="landscape">{t('competition.landscape')}</option>
              <option value="square">{t('competition.square')}</option>
            </select>
          </div>
        )}
      </div>
      {current && (
        <div className={styles.actions}>
          <label className={styles.field}>
            {t('competition.nickname')}
            <input
              type="text"
              maxLength={32}
              value={nickname}
              disabled={published || publishStatus === 'working' || (saved && !ticket)}
              placeholder={t('competition.anonymous')}
              autoComplete="off"
              onChange={(event) => setNickname(event.target.value)}
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={saveEnabled}
              onChange={(event) => setSaveError(!writePreference('save', event.target.checked))}
            />
            {t('history.allow')}
          </label>
          <div className={styles.buttons}>
            <Button disabled={!saveEnabled || saved} onClick={saveCurrent}>
              {saved ? <Check aria-hidden="true" /> : <Save aria-hidden="true" />}
              {t(saved ? 'competition.saved' : 'competition.save')}
            </Button>
            <Button
              variant="outline"
              onClick={() => void download(current)}
              disabled={exportStatus === 'working'}
            >
              <Download aria-hidden="true" />
              {t('competition.download')}
            </Button>
          </div>
          {publicEnabled && (
            <div className={styles.publicSubmit}>
              {ticket && current.correct > 0 && (
                <Button
                  disabled={!current.nickname || published || publishStatus === 'working'}
                  onClick={() => void publishCurrent()}
                  aria-describedby="typing-publish-help"
                >
                  {published ? <Check aria-hidden="true" /> : <Send aria-hidden="true" />}
                  {t(published ? 'competition.public.published' : 'competition.public.publish')}
                </Button>
              )}
              <p id="typing-publish-help" className="small">
                {t(
                  !ticket
                    ? 'competition.public.privateAttempt'
                    : current.correct === 0
                      ? 'competition.public.zeroScore'
                      : 'competition.public.publishHelp',
                )}
              </p>
              <p role="status" className={publishStatus ? 'small' : 'sr-only'}>
                {publishStatus === 'working' || publishStatus === 'published'
                  ? t(`competition.public.${publishStatus}`)
                  : publishStatus
                    ? t(`competition.public.errors.${publishStatus}`)
                    : ''}
              </p>
            </div>
          )}
        </div>
      )}
      <p className={saveError || exportStatus === 'error' ? 'small' : 'sr-only'} role="status">
        {saveError
          ? common('storageError')
          : exportStatus === 'error'
            ? t('competition.imageError')
            : saved
              ? t('competition.saved')
              : ''}
      </p>
      {ranking.length ? (
        <ol className={styles.ranking}>
          {ranking.map(({ attempt, rank }, index) => (
            <li key={`${attempt.time}:${index}`} className={styles.entry}>
              <span className={styles.rank} data-rank={rank}>
                {t('competition.rank', { rank })}
              </span>
              <div className={styles.identity}>
                <strong>{attempt.nickname || t('competition.anonymous')}</strong>
                <time dateTime={attempt.time}>{date(attempt.time)}</time>
              </div>
              <div className={styles.entryScore}>
                <strong>{number(attempt.correct / 5)} WPM</strong>
                <span>{t('competition.accuracyValue', { value: number(attempt.accuracy) })}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => void download(attempt)}
                disabled={exportStatus === 'working'}
                aria-label={t('competition.downloadAttempt', {
                  nickname: attempt.nickname || t('competition.anonymous'),
                })}
              >
                <Download aria-hidden="true" />
                {t('competition.png')}
              </Button>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>{t('competition.empty')}</p>
      )}
    </section>
  );
});
