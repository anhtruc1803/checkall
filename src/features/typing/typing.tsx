'use client';

import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { AlignLeft, Check, Keyboard, NotebookPen, RotateCcw, Timer } from 'lucide-react';
import { Metric } from '@/components/tools/measurement-ui';
import { Button } from '@/components/ui/button';
import { practicePassages, timedPassage, typingDurationMs } from '@/lib/typing/lessons';
import { scoreTyping, typingCharacters, typingErrorTypes } from '@/lib/typing/score';
import styles from './typing.module.css';

type Mode = 'timed' | 'practice';
type Lesson = keyof typeof practicePassages;
type CharacterState = 'correct' | 'different' | 'next' | 'pending';

function newSession() {
  return { start: null as number | null, committed: '', composing: false, finished: false };
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
  const format = useFormatter();
  const [mode, setMode] = useState<Mode>('timed');
  const [lesson, setLesson] = useState<Lesson>('accents');
  const [text, setText] = useState('');
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof scoreTyping> | null>(null);
  const [blocked, setBlocked] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const promptArea = useRef<HTMLDivElement>(null);
  const session = useRef(newSession());
  const prompt = mode === 'timed' ? timedPassage : practicePassages[lesson];
  const entered = typingCharacters(text);
  const expected = typingCharacters(prompt);
  const remaining = typingDurationMs - elapsed;
  const seconds = mode === 'timed' ? Math.ceil(remaining / 1000) : Math.floor(elapsed / 1000);
  const timer = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  const finish = useCallback(
    (now: number) => {
      const current = session.current;
      if (current.start === null || current.finished) return;
      const duration = mode === 'timed' ? typingDurationMs : now - current.start;
      current.finished = true;
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
      if (start === null || session.current.finished) return;
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
    if (current.finished) return;
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
        {mode === 'practice' && (
          <div className={styles.lesson}>
            <label htmlFor="typing-lesson">{t('lesson')}</label>
            <select
              id="typing-lesson"
              value={lesson}
              onChange={(event) => {
                reset();
                setLesson(event.target.value as Lesson);
              }}
            >
              {(Object.keys(practicePassages) as Lesson[]).map((key) => (
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
                {promptRuns(expected, entered, !!result).map((run) => (
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
              readOnly={!!result}
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
        </section>
      )}
    </div>
  );
}
