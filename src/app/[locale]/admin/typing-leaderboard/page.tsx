import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { TypingAdminLogin, TypingAdminPanel } from '@/features/typing/typing-admin';
import styles from '@/features/typing/competition.module.css';
import { typingLeaderboardConfig } from '@/lib/typing/server/leaderboard-http';
import { isTypingAdminSession, typingAdminCookie } from '@/lib/typing/server/typing-admin-session';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('typing.competition.public');
  return { title: t('loginTitle'), robots: { index: false, follow: false } };
}

export default async function TypingAdminPage() {
  const store = await cookies();
  const config = typingLeaderboardConfig();
  if (!config) notFound();
  const allowed = isTypingAdminSession(store.get(typingAdminCookie)?.value, config.key);
  const t = await getTranslations('typing.competition.public');
  return (
    <main id="main" className={`section ${styles.adminPage}`}>
      <h1>{t(allowed ? 'moderation' : 'loginTitle')}</h1>
      {allowed ? <TypingAdminPanel /> : <TypingAdminLogin />}
    </main>
  );
}
