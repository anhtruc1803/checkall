'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { EngineSurface } from '@/components/tools/engine-surface';
import { parseDecimal, formatDecimal, type NumberFormat } from '@/lib/utilities/decimal';
import { numberToWords, defaultWordOptions, type WordOptions } from '@/lib/utilities/number-words';
import type { Locale } from '@/lib/i18n/routing';
import { CopyResult, InputFormat } from './shared';

export default function NumberWords() {
  const locale = useLocale() as Locale,
    t = useTranslations('utilitiesTool');
  const [input, setInput] = useState('');
  const [format, setFormat] = useState<NumberFormat>(locale);
  const [options, setOptions] = useState<WordOptions>({ ...defaultWordOptions, language: locale });
  const parsed = parseDecimal(input, format);
  const words = parsed.ok ? numberToWords(parsed.value, options) : null;
  const error = !parsed.ok ? parsed.error : words && !words.ok ? words.error : null;
  const showError = input.length > 0 && error;
  const setOption = <K extends keyof WordOptions>(key: K, value: WordOptions[K]) =>
    setOptions((current) => ({ ...current, [key]: value }));
  return (
    <EngineSurface>
      <div className="utility-tool">
        <div className="utility-fields">
          <label className="field">
            {t('mode')}
            <select
              value={options.money ? 'money' : 'number'}
              onChange={(e) => setOption('money', e.target.value === 'money')}
            >
              <option value="number">{t('numberMode')}</option>
              <option value="money">{t('moneyMode')}</option>
            </select>
          </label>
          <InputFormat value={format} onChange={setFormat} />
          <label className="field utility-wide" htmlFor="words-input">
            <span id="words-label">{t('numberInput')}</span>
            <input
              id="words-input"
              aria-labelledby="words-label"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              maxLength={128}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={format === 'vi' ? '1.250.000' : '1,250,000'}
              aria-invalid={Boolean(showError)}
              aria-describedby="words-hint words-error"
            />
            <span id="words-hint" className="small">
              {t('bounds')}
            </span>
          </label>
          <label className="field">
            {t('outputLanguage')}
            <select
              value={options.language}
              onChange={(e) => setOption('language', e.target.value as Locale)}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </label>
          {options.language === 'vi' && (
            <>
              <label className="field">
                {t('filler')}
                <select
                  value={options.filler}
                  onChange={(e) => setOption('filler', e.target.value as WordOptions['filler'])}
                >
                  <option value="linh">linh</option>
                  <option value="lẻ">lẻ</option>
                </select>
              </label>
              <label className="field">
                {t('thousand')}
                <select
                  value={options.thousand}
                  onChange={(e) => setOption('thousand', e.target.value as WordOptions['thousand'])}
                >
                  <option value="nghìn">nghìn</option>
                  <option value="ngàn">ngàn</option>
                </select>
              </label>
            </>
          )}
        </div>
        <div className="utility-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.capitalize}
              onChange={(e) => setOption('capitalize', e.target.checked)}
            />
            {t('capitalize')}
          </label>
          {options.money && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.exactSuffix}
                onChange={(e) => setOption('exactSuffix', e.target.checked)}
              />
              {t('exactSuffix')}
            </label>
          )}
        </div>
        <p id="words-error" className={showError ? 'notice error' : 'sr-only'} role="status">
          {showError ? t(`errors.${error}`) : ''}
        </p>
        {parsed.ok && (
          <p className="utility-preview">
            {t('interpreted')}: <strong>{formatDecimal(parsed.value, format)}</strong>{' '}
            <span className="small">
              ({t('canonical')}: {parsed.value.canonical})
            </span>
          </p>
        )}
        <div className="utility-result" role="region" aria-label={t('result')}>
          <h2>{t('result')}</h2>
          <p
            className="utility-output"
            lang={options.language}
            aria-live="polite"
            aria-atomic="true"
          >
            {words?.ok ? words.text : t('enterNumber')}
          </p>
          {words?.ok && <CopyResult key={words.text} value={words.text} />}
        </div>
        <p className="small">{t('privacy')}</p>
      </div>
    </EngineSurface>
  );
}
