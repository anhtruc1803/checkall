'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import {
  AlignLeft,
  ArrowRight,
  Check,
  Flame,
  Gauge,
  Keyboard,
  NotebookPen,
  RotateCcw,
  Save,
  Sprout,
  Timer,
} from 'lucide-react';
import { Metric } from '@/components/tools/measurement-ui';
import { Button } from '@/components/ui/button';
import { useHydrated } from '@/hooks/use-hydrated';
import { usePreference } from '@/hooks/use-preference';
import { saveSummary, writePreference } from '@/lib/storage/preferences';
import { typingDifficulties, type TypingDifficulty } from '@/lib/typing/difficulty';
import {
  practiceLessons,
  timedPassages,
  typingDurationMs,
  typingLessons,
  type TypingLesson,
} from '@/lib/typing/lessons';
import { scoreTyping, typingCharacters, typingErrorTypes } from '@/lib/typing/score';
import { TypingGuide } from './typing-guide';
import { TypingHistory } from './typing-history';
import styles from './typing.module.css';

type Mode = 'timed' | 'practice';
type CharacterState = 'correct' | 'different' | 'next' | 'pending';

const levelIcons = { easy: Sprout, medium: Gauge, hard: Flame };

function newSession() {
  return { start: null as number | null, committed: '', composing: false, finishedAt: '' };
}

function promptRuns(expected: string[], entered: string[], finished: boolean) {
  const runs: { text: string; state: CharacterState; index: number }[] = [];
  expected.forEach((character, index) => {
    const state =
      index < entered.length
        ? character === entered[index]
          ? 'correct'
          : 'different'
        : index === entered.length && !finished
          ? 'next'
          : 'pending';
    const last = runs.at(-1);
    if (last?.state === state) last.text += character;
    else runs.push({ text: character, state, index });
  });
  return runs;
}

export default function VietnameseTyping() {
  const t = useTranslations('typing');
  const common = useTranslations();
  const format = useFormatter();
  const ready = useHydrated();
  const saveEnabled = usePreference('save', false);
  const [mode, setMode] = useState<Mode>('timed');
  const [lesson, setLesson] = useState<TypingLesson>('homeRow');
  const [timedLevel, setTimedLevel] = useState<TypingDifficulty>('medium');
  const [text, setText] = useState('');
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof scoreTyping> | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<'saved' | 'storageError' | ''>('');
  const input = useRef<HTMLTextAreaElement>(null);
  const promptArea = useRef<HTMLDivElement>(null);
  const session = useRef(newSession());
  const difficulty = mode === 'timed' ? timedLevel : practiceLessons[lesson].difficulty;
  const prompt = mode === 'timed' ? timedPassages[timedLevel] : practiceLessons[lesson].passage;
  const entered = useMemo(() => typingCharacters(text), [text]);
  const expected = useMemo(() => typingCharacters(prompt), [prompt]);
  const runs = useMemo(() => promptRuns(expected, entered, !!result), [expected, entered, result]);
  const nextLesson = typingLessons[typingLessons.indexOf(lesson) + 1];
  const remaining = typingDurationMs - elapsed;
  const seconds = mode === 'timed' ? Math.ceil(remaining / 1000) : Math.floor(elapsed / 1000);
  const timer = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  const finish = useCallback(
    (now: number) => {
      const current = session.current;
      if (current.start === null || current.finishedAt) return;
      const duration = mode === 'timed' ? typingDurationMs : now - current.start;
      current.finishedAt = new Date().toISOString();
      if (input.current) input.current.value = current.committed;
      setElapsed(duration);
      setResult(scoreTyping(prompt, current.committed, duration));
    },
    [mode, prompt],
  );

  useEffect(() => {
    if (!started || result) return;
    const interval = window.setInterval(() => {
      const start = session.current.start;
      if (start === null || session.current.finishedAt) return;
      const now = performance.now();
      const duration = now - start;
      if (mode === 'timed' && duration >= typingDurationMs) finish(now);
      else setElapsed(duration);
    }, 125);
    return () => window.clearInterval(interval);
  }, [mode, started, result, finish]);

  useEffect(() => {
    const area = promptArea.current;
    const next = area?.querySelector('[data-character="next"]');
    if (!area || !next) return;
    const bounds = area.getBoundingClientRect();
    const marker = next.getBoundingClientRect();
    if (marker.bottom > bounds.bottom) area.scrollTop += marker.bottom - bounds.bottom + 12;
    else if (marker.top < bounds.top) area.scrollTop -= bounds.top - marker.top + 12;
  }, [text, prompt]);

  function commit(value: string) {
    const current = session.current;
    if (current.finishedAt) return;
    const now = performance.now();
    if (current.start === null) {
      if (!value) return;
      current.start = now;
      setStarted(true);
    }
    if (mode === 'timed' && now - current.start >= typingDurationMs) {
      finish(now);
      return;
    }
    current.committed = value;
    setText(value);
    setBlocked(false);
  }

  function reset() {
    session.current = newSession();
    if (input.current) input.current.value = '';
    if (promptArea.current) promptArea.current.scrollTop = 0;
    setText('');
    setElapsed(0);
    setStarted(false);
    setBlocked(false);
    setResult(null);
    setSaved(false);
    setSaveMessage('');
  }

  function chooseDifficulty(next: TypingDifficulty) {
    if (next === difficulty) return;
    reset();
    if (mode === 'timed') setTimedLevel(next);
    else {
      const first = typingLessons.find((key) => practiceLessons[key].difficulty === next);
      if (first) setLesson(first);
    }
  }

  function saveAttempt() {
    const time = session.current.finishedAt;
    if (!result || !time || saved || mode !== 'timed') return;
    const success = saveSummary({
      toolId: 'B06',
      time,
      value: `${result.wpm.toFixed(1)} WPM · ${result.accuracy.toFixed(1)}%`,
      typing: { difficulty: timedLevel, wpm: result.wpm, accuracy: result.accuracy },
    });
    setSaved(success);
    setSaveMessage(success ? 'saved' : 'storageError');
  }

  function guardPaste(event: SyntheticEvent) {
    if (mode === 'timed') {
      event.preventDefault();
      setBlocked(true);
    }
  }

  function number(value: number) {
    return format.number(value, { maximumFractionDigits: 1 });
  }

  return (
    <div
      className={styles.workspace}
      data-typing-state={result ? 'finished' : started ? 'active' : 'ready'}
    >
      <div className={styles.toolbar}>
        <div className={styles.modes} role="group" aria-label={t('mode')}>
          {(['timed', 'practice'] as const).map((option) => (
            <Button
              key={option}
              variant="outline"
              aria-pressed={mode === option}
              onClick={() => {
                if (option === mode) return;
                reset();
                setMode(option);
              }}
            >
              {option === 'timed' ? (
                <Timer aria-hidden="true" />
              ) : (
                <NotebookPen aria-hidden="true" />
              )}
              {t(option)}
            </Button>
          ))}
        </div>
        <div className={styles.levels} role="group" aria-label={t('difficulty')}>
          {typingDifficulties.map((level) => {
            const Icon = levelIcons[level];
            return (
              <Button
                key={level}
                variant="outline"
                data-level={level}
                aria-pressed={level === difficulty}
                onClick={() => chooseDifficulty(level)}
              >
                <Icon aria-hidden="true" />
                <span>
                  <strong>{t(`levels.${level}.name`)}</strong>
                  <span className={styles.levelNote}>{t(`levels.${level}.note`)}</span>
                </span>
              </Button>
            );
          })}
        </div>
        {mode === 'practice' && (
          <div className={styles.lesson}>
            <label htmlFor="typing-lesson">{t('lesson')}</label>
            <select
              id="typing-lesson"
              value={lesson}
              onChange={(event) => {
                reset();
                setLesson(event.target.value as TypingLesson);
              }}
            >
              {typingLessons
                .filter((key) => practiceLessons[key].difficulty === difficulty)
                .map((key) => (
                  <option key={key} value={key}>
                    {t(`lessons.${key}`)}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
      <div className={styles.desk}>
        <div className={styles.timer}>
          <span className={styles.timerLabel}>
            <Timer aria-hidden="true" />
            {t(mode === 'timed' ? 'remaining' : 'elapsed')}
          </span>
          <span className={styles.time} data-testid="typing-timer">
            {timer}
          </span>
          {mode === 'timed' && (
            <progress
              className={styles.progress}
              aria-hidden="true"
              data-testid="typing-time-progress"
              max={typingDurationMs}
              value={remaining}
            />
          )}
        </div>
        <section className={styles.exercise} aria-labelledby="typing-prompt-label">
          <h2 id="typing-prompt-label" className={styles.label}>
            <AlignLeft aria-hidden="true" />
            {t('prompt')}
          </h2>
          <div className={styles.promptFrame}>
            <div
              ref={promptArea}
              className={styles.prompt}
              lang="vi"
              tabIndex={0}
              role="region"
              aria-labelledby="typing-prompt-label"
            >
              <span className="sr-only">{prompt}</span>
              <span aria-hidden="true">
                {runs.map((run) => (
                  <span key={run.index} data-character={run.state}>
                    {run.text}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <label className={styles.inputField}>
            <span className={styles.label}>
              <Keyboard aria-hidden="true" />
              {t('input')}
            </span>
            <textarea
              ref={input}
              aria-describedby="typing-input-help"
              lang="vi"
              rows={3}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={prompt.length * 2}
              readOnly={!ready || !!result}
              onCompositionStart={() => {
                session.current.composing = true;
              }}
              onCompositionEnd={(event) => {
                session.current.composing = false;
                commit(event.currentTarget.value);
              }}
              onInput={(event) => {
                if (!session.current.composing && !(event.nativeEvent as InputEvent).isComposing)
                  commit(event.currentTarget.value);
              }}
              onPaste={guardPaste}
              onDrop={guardPaste}
            />
          </label>
          <p className="small" id="typing-input-help">
            {t(mode === 'timed' ? 'timedHelp' : 'practiceHelp')}
          </p>
          {blocked && (
            <p className="notice" role="status">
              {t('pasteBlocked')}
            </p>
          )}
        </section>
        <div className={styles.actions}>
          {mode === 'practice' && (
            <Button disabled={!started || !!result} onClick={() => finish(performance.now())}>
              <Check aria-hidden="true" />
              {t('finish')}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              reset();
              input.current?.focus();
            }}
          >
            <RotateCcw aria-hidden="true" />
            {t('reset')}
          </Button>
        </div>
      </div>
      <TypingGuide character={result ? undefined : expected[entered.length]} />
      <p className="sr-only" role="status">
        {result ? t('done') : ''}
      </p>
      {result && (
        <section className={styles.results} aria-labelledby="typing-result-label">
          <h2 id="typing-result-label">{t('result')}</h2>
          <dl className={styles.metrics}>
            {mode === 'timed' && (
              <>
                <Metric label={t('cpm')} value={number(result.cpm)} />
                <Metric label={t('wpm')} value={number(result.wpm)} />
              </>
            )}
            <Metric label={t('accuracy')} value={number(result.accuracy)} unit="%" />
            <Metric label={t('correct')} value={result.correct} />
            <Metric label={t('entered')} value={result.entered} />
          </dl>
          <h3>{t('errorAnalysis')}</h3>
          <dl className={styles.errors}>
            {typingErrorTypes.map((kind) => (
              <div key={kind} data-error-present={result.errors[kind] > 0}>
                <dt>{t(`errors.${kind}`)}</dt>
                <dd data-typing-error={kind}>{result.errors[kind]}</dd>
              </div>
            ))}
          </dl>
          <p className="small">{t('scoreNote')}</p>
          {mode === 'timed' && (
            <div className={styles.saveBar}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={saveEnabled}
                  onChange={(event) => {
                    setSaveMessage(
                      writePreference('save', event.target.checked) ? '' : 'storageError',
                    );
                  }}
                />
                {t('history.allow')}
              </label>
              <Button variant="outline" disabled={!saveEnabled || saved} onClick={saveAttempt}>
                {saved ? <Check aria-hidden="true" /> : <Save aria-hidden="true" />}
                {saved ? t('history.saved') : t('history.save')}
              </Button>
              <span role="status" className={saveMessage === 'storageError' ? 'small' : 'sr-only'}>
                {saveMessage ? common(saveMessage) : ''}
              </span>
            </div>
          )}
          {mode === 'practice' && nextLesson && (
            <div className={styles.nextLesson}>
              <Button
                variant="outline"
                onClick={() => {
                  reset();
                  setLesson(nextLesson);
                  input.current?.focus();
                }}
              >
                {t('nextLesson')}
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          )}
        </section>
      )}
      <TypingHistory level={timedLevel} />
    </div>
  );
}
