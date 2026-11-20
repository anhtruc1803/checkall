'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EngineSurface } from '@/components/tools/engine-surface';
import { daysBetween, addCalendarDays, parseCalendarDate } from '@/lib/utilities/dates';
import { CopyResult } from './shared';

export default function DateCalculator() {
  const t = useTranslations('dateTool'),
    u = useTranslations('utilitiesTool');
  const [mode, setMode] = useState<'difference' | 'add'>('difference');
  const [start, setStart] = useState(''),
    [end, setEnd] = useState(''),
    [days, setDays] = useState('');
  const ready = Boolean(start && (mode === 'difference' ? end : days));
  const result = ready
    ? mode === 'difference'
      ? daysBetween(start, end)
      : addCalendarDays(start, days)
    : null;
  const startInvalid = Boolean(start && parseCalendarDate(start) === null);
  const endInvalid = Boolean(end && parseCalendarDate(end) === null);
  const daysInvalid = Boolean(days && !/^[+-]?\d{1,7}$/.test(days));
  const error =
    startInvalid || (mode === 'difference' && endInvalid)
      ? t('errors.date')
      : mode === 'add' && daysInvalid
        ? t('errors.days')
        : result && !result.ok
          ? t(`errors.${result.error}`)
          : '';
  const output = result?.ok
    ? mode === 'difference'
      ? t('dayResult', { count: result.value as number })
      : String(result.value)
    : '';
  const dateField = (id: string, value: string, set: (v: string) => void, invalid: boolean) => (
    <label className="field" htmlFor={id}>
      {t(id === 'date-start' ? 'start' : 'end')}
      <input
        id={id}
        type="date"
        min="0001-01-01"
        max="9999-12-31"
        value={value}
        onChange={(e) => set(e.target.value)}
        aria-invalid={invalid}
        aria-describedby="date-error date-hint"
      />
    </label>
  );
  return (
    <EngineSurface>
      <div className="utility-tool">
        <label className="field">
          <span id="date-mode-label">{t('mode')}</span>
          <select
            aria-labelledby="date-mode-label"
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
          >
            <option value="difference">{t('difference')}</option>
            <option value="add">{t('add')}</option>
          </select>
        </label>
        <div className="utility-fields">
          {dateField(
            'date-start',
            start,
            setStart,
            startInvalid || Boolean(result && !result.ok && result.error === 'dateRange'),
          )}
          {mode === 'difference' ? (
            dateField('date-end', end, setEnd, endInvalid)
          ) : (
            <label className="field" htmlFor="date-days">
              {t('days')}
              <input
                id="date-days"
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                aria-invalid={daysInvalid}
                aria-describedby="date-error date-hint"
              />
            </label>
          )}
        </div>
        <p id="date-error" className="utility-error" role="status">
          {error}
        </p>
        <div className="controls">
          {mode === 'difference' && (
            <Button
              variant="outline"
              onClick={() => {
                setStart(end);
                setEnd(start);
              }}
            >
              {t('swap')}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              setStart('');
              setEnd('');
              setDays('');
            }}
          >
            {t('clear')}
          </Button>
        </div>
        <p id="date-hint" className="small">
          {t(mode === 'difference' ? 'differenceHint' : 'addHint')}
        </p>
        <div className="utility-result" role="region" aria-label={u('result')}>
          <h2>{u('result')}</h2>
          <p className="utility-output" aria-live="polite" aria-atomic="true">
            {output || u('enterValues')}
          </p>
          {result?.ok && <CopyResult key={`${mode}:${output}`} value={output} />}
        </div>
        <p className="small">{t('calendarHint')}</p>
        <p className="small">{u('privacy')}</p>
      </div>
    </EngineSurface>
  );
}
