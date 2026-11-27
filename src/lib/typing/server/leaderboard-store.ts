import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { TypingChallengeId } from '../competition';
import { leaderboardPageSize, type PublicTypingEntry } from '../leaderboard';

type Submission = Omit<PublicTypingEntry, 'rank' | 'time'> & {
  challenge: TypingChallengeId;
  time: number;
};

export function openTypingLeaderboard(file: string) {
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(file);
  try {
    db.exec(`
      PRAGMA busy_timeout = 3000;
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS typing_results (
        id TEXT PRIMARY KEY,
        challenge TEXT NOT NULL,
        nickname TEXT NOT NULL,
        correct INTEGER NOT NULL,
        accuracy REAL NOT NULL,
        time INTEGER NOT NULL,
        hidden INTEGER NOT NULL DEFAULT 0
      ) STRICT;
      CREATE INDEX IF NOT EXISTS typing_results_rank
        ON typing_results (challenge, correct DESC, accuracy DESC, time, id) WHERE hidden = 0;
      CREATE INDEX IF NOT EXISTS typing_results_time ON typing_results (time);
    `);
  } catch (error) {
    db.close();
    throw error;
  }
  return db;
}

export function listTypingResults(db: DatabaseSync, challenge: TypingChallengeId, page: number) {
  const rows = db
    .prepare(
      `
      SELECT id, nickname, correct, accuracy, time,
        RANK() OVER (ORDER BY correct DESC, accuracy DESC) AS rank
      FROM typing_results WHERE challenge = ? AND hidden = 0
      ORDER BY correct DESC, accuracy DESC, time, id LIMIT ? OFFSET ?
    `,
    )
    .all(challenge, leaderboardPageSize + 1, (page - 1) * leaderboardPageSize) as (Omit<
    PublicTypingEntry,
    'time'
  > & { time: number })[];
  return {
    entries: rows.slice(0, leaderboardPageSize).map((row) => ({
      ...row,
      time: new Date(row.time).toISOString(),
    })),
    more: rows.length > leaderboardPageSize,
  };
}

export function submitTypingResult(db: DatabaseSync, result: Submission) {
  db.exec('BEGIN IMMEDIATE');
  try {
    if (db.prepare('SELECT 1 FROM typing_results WHERE id = ?').get(result.id)) {
      return 'alreadySubmitted';
    }
    const recent = db
      .prepare('SELECT COUNT(*) AS total FROM typing_results WHERE time > ?')
      .get(result.time - 60_000);
    if (Number(recent?.total) >= 120) return 'rateLimited';
    db.prepare(
      `
      INSERT INTO typing_results (id, challenge, nickname, correct, accuracy, time)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run(
      result.id,
      result.challenge,
      result.nickname,
      result.correct,
      result.accuracy,
      result.time,
    );
    db.exec('COMMIT');
    return 'saved';
  } finally {
    if (db.isTransaction) db.exec('ROLLBACK');
  }
}

export function hideTypingResult(db: DatabaseSync, challenge: TypingChallengeId, id: string) {
  return (
    db
      .prepare('UPDATE typing_results SET hidden = 1 WHERE challenge = ? AND id = ?')
      .run(challenge, id).changes === 1
  );
}
