import { useEffect, useState } from 'react';
import type { TypingChallengeId } from '@/lib/typing/competition';
import { leaderboardPath, type LeaderboardError, type TypingBoard } from '@/lib/typing/leaderboard';

async function postLeaderboard<T>(
  path: string,
  body: object,
  { adminKey, signal }: { adminKey?: string; signal?: AbortSignal } = {},
): Promise<{ data: T; error?: never } | { data?: never; error: LeaderboardError }> {
  try {
    const timeout = AbortSignal.timeout(12_000);
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminKey ? { Authorization: `Bearer ${adminKey}` } : {}),
      },
      body: JSON.stringify(body),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    const data = await response.json();
    return response.ok ? { data } : { error: data.error ?? 'unavailable' };
  } catch {
    return { error: 'unavailable' };
  }
}

export function postTypingLeaderboard<T>(body: object, { signal }: { signal?: AbortSignal } = {}) {
  return postLeaderboard<T>(leaderboardPath, body, { signal });
}

export function postTypingModeration(body: object, adminKey?: string) {
  return postLeaderboard<{ ok: true }>(`${leaderboardPath}/admin`, body, { adminKey });
}

export function useTypingLeaderboard(challenge: TypingChallengeId, active: boolean) {
  const [pageState, setPageState] = useState({ challenge, page: 1 });
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{
    challenge: TypingChallengeId;
    page: number;
    version: number;
    board: TypingBoard | null;
  }>();
  const page = pageState.challenge === challenge ? pageState.page : 1;
  const current = result?.challenge === challenge && result.page === page ? result : undefined;

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    async function load() {
      let board: TypingBoard | null = null;
      try {
        const response = await fetch(`${leaderboardPath}?challenge=${challenge}&page=${page}`, {
          cache: 'no-store',
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12_000)]),
        });
        if (response.ok) board = await response.json();
      } catch {
        // A failed load leaves the local competition available.
      }
      if (!controller.signal.aborted) setResult({ challenge, page, version, board });
    }
    void load();
    return () => controller.abort();
  }, [active, challenge, page, version]);

  return {
    board: current?.board,
    pending: current?.version !== version,
    page,
    changePage: (next: number) => setPageState({ challenge, page: next }),
    refresh: () => setVersion((value) => value + 1),
  };
}
