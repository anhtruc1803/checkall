'use client';

import { useRef, useState, type FormEvent } from 'react';
import { EyeOff, LockKeyhole, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { typingChallengeIds, type TypingChallengeId } from '@/lib/typing/competition';
import type { LeaderboardError, PublicTypingEntry } from '@/lib/typing/leaderboard';
import { postTypingModeration, useTypingLeaderboard } from './leaderboard-client';
import { TypingPublicRanking } from './typing-public-ranking';
import styles from './competition.module.css';

export function TypingAdminLogin() {
  const t = useTranslations('typing.competition.public');
  const code = useRef<HTMLInputElement>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<LeaderboardError>();

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = code.current?.value.trim();
    if (working || !key) return;
    setWorking(true);
    setError(undefined);
    const result = await postTypingModeration({ action: 'signIn' }, key);
    if (!result.error) {
      window.location.reload();
      return;
    }
    setWorking(false);
    setError(result.error);
    code.current?.focus();
  }

  return (
    <form
      method="post"
      className={`${styles.panel} ${styles.adminLogin}`}
      aria-describedby="typing-admin-help"
      onSubmit={(event) => void signIn(event)}
    >
      <p id="typing-admin-help">{t('loginHelp')}</p>
      <label className={styles.field}>
        {t('adminKey')}
        <input
          ref={code}
          type="password"
          autoComplete="current-password"
          maxLength={180}
          required
          aria-invalid={error === 'unauthorized' || undefined}
        />
      </label>
      <Button type="submit" disabled={working}>
        <LockKeyhole aria-hidden="true" />
        {t('signIn')}
      </Button>
      <p role="status" className={error || working ? 'small' : 'sr-only'}>
        {working ? t('working') : error ? t(`errors.${error}`) : ''}
      </p>
    </form>
  );
}

export function TypingAdminPanel() {
  const t = useTranslations('typing.competition');
  const [challenge, setChallenge] = useState<TypingChallengeId>(typingChallengeIds[0]);
  const leaderboard = useTypingLeaderboard(challenge, true);
  const refreshButton = useRef<HTMLButtonElement>(null);
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState<LeaderboardError | 'hidden'>();

  async function hide(entry: PublicTypingEntry) {
    if (working || !window.confirm(t('public.confirmHide', { name: entry.nickname }))) return;
    setWorking(true);
    setStatus(undefined);
    const result = await postTypingModeration({ action: 'hide', challenge, id: entry.id });
    if (result.error === 'unauthorized') {
      window.location.reload();
      return;
    }
    setWorking(false);
    setStatus(result.error ?? 'hidden');
    if (!result.error) {
      leaderboard.refresh();
      refreshButton.current?.focus();
    }
  }

  async function signOut() {
    setWorking(true);
    setStatus(undefined);
    const result = await postTypingModeration({ action: 'signOut' });
    if (!result.error) {
      window.location.reload();
      return;
    }
    setWorking(false);
    setStatus(result.error);
  }

  return (
    <>
      <div className={`${styles.buttons} ${styles.adminControls}`}>
        <div className={styles.field}>
          <label htmlFor="typing-admin-challenge">{t('challenge')}</label>
          <select
            id="typing-admin-challenge"
            value={challenge}
            disabled={working}
            onChange={(event) => {
              setChallenge(event.target.value as TypingChallengeId);
              setStatus(undefined);
            }}
          >
            {typingChallengeIds.map((id) => (
              <option key={id} value={id}>
                {t(`challenges.${id}`)}
              </option>
            ))}
          </select>
        </div>
        <Button variant="outline" disabled={working} onClick={() => void signOut()}>
          <LogOut aria-hidden="true" />
          {t('public.signOut')}
        </Button>
      </div>
      <p role="status" className={status || working ? 'small' : 'sr-only'}>
        {working
          ? t('public.working')
          : status === 'hidden'
            ? t('public.hidden')
            : status
              ? t(`public.errors.${status}`)
              : ''}
      </p>
      <TypingPublicRanking
        challenge={challenge}
        leaderboard={leaderboard}
        refreshButtonRef={refreshButton}
        renderAction={(entry) => (
          <Button
            variant="outline"
            disabled={working}
            aria-label={t('public.hideNamed', { name: entry.nickname })}
            onClick={() => void hide(entry)}
          >
            <EyeOff aria-hidden="true" />
            {t('public.hide')}
          </Button>
        )}
      />
    </>
  );
}
