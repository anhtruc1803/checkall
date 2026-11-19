'use client';
import { useId, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { EngineSurface } from '@/components/tools/engine-surface';
import { Button } from '@/components/ui/button';
import { Metric } from '@/components/tools/measurement-ui';
import type { Locale } from '@/lib/i18n/routing';
import {
  cleanText,
  convertCase,
  countText,
  createSlug,
  defaultCleanupOptions,
  removeLatinAccents,
  textInputLimit,
  validateText,
  type CaseMode,
  type CleanupOptions,
  type TextCounts,
} from '@/lib/utilities/text';
import { CopyResult } from './shared';
import './text-tool.css';

const tools = { U03: 'count', U04: 'case', U05: 'slug', U06: 'clean' } as const;
export default function TextTool({ toolId }: { toolId: string }) {
  const t = useTranslations('textTools'),
    locale = useLocale() as Locale,
    id = useId();
  const kind = tools[toolId as keyof typeof tools];
  const [input, setInput] = useState(''),
    [language, setLanguage] = useState<Locale>(locale);
  const [caseMode, setCaseMode] = useState<CaseMode>('upper');
  const [slugMode, setSlugMode] = useState<'accents' | 'ascii' | 'unicode'>('accents');
  const [separator, setSeparator] = useState<'-' | '_'>('-');
  const [cleanup, setCleanup] = useState<CleanupOptions>({ ...defaultCleanupOptions });
  const [result, setResult] = useState<{ text: string } | { counts: TextCounts } | null>(null);
  const [failed, setFailed] = useState(false),
    [composing, setComposing] = useState(false);
  const limitError = validateText(input);
  const invalidate = () => {
    setResult(null);
    setFailed(false);
  };
  const selectLanguage = (value: Locale) => {
    setLanguage(value);
    invalidate();
  };
  const error = limitError ? t('tooLong', { limit: textInputLimit }) : failed ? t('failed') : '';
  const output = result && 'text' in result ? result.text : null;
  if (!kind) return <p role="status">{t('unavailable')}</p>;
  return (
    <EngineSurface>
      <div className="utility-tool text-tool" data-text-tool={kind}>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (limitError || composing) return;
            try {
              const next =
                kind === 'count'
                  ? { counts: countText(input, language) }
                  : {
                      text:
                        kind === 'case'
                          ? convertCase(input, caseMode, language)
                          : kind === 'slug'
                            ? slugMode === 'accents'
                              ? removeLatinAccents(input)
                              : createSlug(input, slugMode, separator, language)
                            : cleanText(input, cleanup),
                    };
              setResult(next);
              setFailed(false);
            } catch {
              setResult(null);
              setFailed(true);
            }
          }}
        >
          <div className="field text-input-field">
            <label htmlFor={`${id}-input`}>{t('input')}</label>
            <textarea
              id={`${id}-input`}
              rows={8}
              value={input}
              lang={language}
              autoComplete="off"
              spellCheck={false}
              placeholder={t('placeholder')}
              aria-invalid={Boolean(error)}
              aria-describedby={`${id}-limit ${id}-error`}
              onChange={(event) => {
                setInput(event.target.value);
                invalidate();
              }}
              onCompositionStart={() => setComposing(true)}
              onCompositionEnd={() => setComposing(false)}
              onBlur={() => setComposing(false)}
            />
            <p className="small" id={`${id}-limit`}>
              {t('limit', { count: input.length, limit: textInputLimit })}
            </p>
          </div>
          <div className="utility-fields text-options">
            {(kind === 'count' ||
              kind === 'case' ||
              (kind === 'slug' && slugMode !== 'accents')) && (
              <label className="field">
                {t('language')}
                <select
                  value={language}
                  onChange={(event) => selectLanguage(event.target.value as Locale)}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </label>
            )}
            {kind === 'case' && (
              <label className="field">
                {t('caseMode')}
                <select
                  value={caseMode}
                  onChange={(event) => {
                    setCaseMode(event.target.value as CaseMode);
                    invalidate();
                  }}
                >
                  {(['upper', 'lower', 'title', 'sentence'] as const).map((mode) => (
                    <option key={mode} value={mode}>
                      {t(`cases.${mode}`)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {kind === 'slug' && (
              <>
                <label className="field">
                  {t('slugMode')}
                  <select
                    value={slugMode}
                    onChange={(event) => {
                      setSlugMode(event.target.value as typeof slugMode);
                      invalidate();
                    }}
                  >
                    {(['accents', 'ascii', 'unicode'] as const).map((mode) => (
                      <option key={mode} value={mode}>
                        {t(`slugModes.${mode}`)}
                      </option>
                    ))}
                  </select>
                </label>
                {slugMode !== 'accents' && (
                  <label className="field">
                    {t('separator')}
                    <select
                      value={separator}
                      onChange={(event) => {
                        setSeparator(event.target.value as typeof separator);
                        invalidate();
                      }}
                    >
                      <option value="-">{t('hyphen')}</option>
                      <option value="_">{t('underscore')}</option>
                    </select>
                  </label>
                )}
              </>
            )}
          </div>
          {kind === 'clean' && (
            <fieldset className="text-clean-options">
              <legend>{t('cleanupOptions')}</legend>
              {(Object.keys(defaultCleanupOptions) as (keyof CleanupOptions)[]).map((option) => (
                <label className="checkbox-label" key={option}>
                  <input
                    type="checkbox"
                    checked={cleanup[option]}
                    onChange={(event) => {
                      setCleanup((current) => ({ ...current, [option]: event.target.checked }));
                      invalidate();
                    }}
                  />
                  {t(`cleanup.${option}`)}
                </label>
              ))}
            </fieldset>
          )}
          <p className="small text-method-hint">{t(`hints.${kind}`)}</p>
          <p id={`${id}-error`} className={error ? 'notice error' : 'sr-only'} role="status">
            {error}
          </p>
          <div className="controls text-actions">
            <Button type="submit" disabled={Boolean(limitError) || composing}>
              {t(`actions.${kind}`)}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!input && !result}
              onClick={() => {
                setInput('');
                setComposing(false);
                invalidate();
              }}
            >
              {t('clear')}
            </Button>
          </div>
        </form>
        <p role="status" aria-atomic="true" className="small">
          {result ? t('ready') : t('pending')}
        </p>
        {result && 'counts' in result && (
          <section aria-labelledby={`${id}-counts`}>
            <h2 id={`${id}-counts`}>{t('result')}</h2>
            {result.counts.characters === null && (
              <p className="notice" role="status">
                {t('segmenterUnavailable')}
              </p>
            )}
            <dl className="results-grid">
              {(['words', 'characters', 'charactersWithoutWhitespace', 'lines'] as const).map(
                (key) => (
                  <Metric key={key} label={t(`metrics.${key}`)} value={result.counts[key] ?? '—'} />
                ),
              )}
            </dl>
            <details className="text-details">
              <summary>{t('details')}</summary>
              <dl className="results-grid">
                {(['paragraphs', 'codePoints', 'utf16Units', 'utf8Bytes'] as const).map((key) => (
                  <Metric key={key} label={t(`metrics.${key}`)} value={result.counts[key]} />
                ))}
              </dl>
              <p className="small">{t('countDefinitions')}</p>
            </details>
          </section>
        )}
        {output !== null && (
          <section className="utility-result" aria-labelledby={`${id}-output-label`}>
            <h2 id={`${id}-output-label`}>{t('result')}</h2>
            <textarea
              className="text-output"
              aria-labelledby={`${id}-output-label`}
              readOnly
              rows={8}
              value={output}
              lang={language}
              spellCheck={false}
            />
            <p className="small">
              {output === ''
                ? t('emptyResult')
                : output === input
                  ? t('unchanged')
                  : t('originalKept')}
            </p>
            {output !== '' && <CopyResult key={output} value={output} />}
          </section>
        )}
        <p className="small">{t('privacy')}</p>
      </div>
    </EngineSurface>
  );
}
