'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { EngineSurface } from '@/components/tools/engine-surface';
import {
  calculatePercentage,
  formatDecimal,
  parseDecimal,
  type NumberFormat,
  type PercentageMode,
} from '@/lib/utilities/decimal';
import { UtilityInput, CopyResult, InputFormat } from './shared';

const modes: PercentageMode[] = ['of', 'ratio', 'change', 'increase', 'decrease'];
const formulas: Record<PercentageMode, string> = {
  of: 'A × B ÷ 100',
  ratio: 'A ÷ B × 100%',
  change: '(B − A) ÷ A × 100%',
  increase: 'A × (1 + B ÷ 100)',
  decrease: 'A × (1 − B ÷ 100)',
};
export default function Percentage() {
  const locale = useLocale() as NumberFormat,
    t = useTranslations('utilitiesTool');
  const [format, setFormat] = useState<NumberFormat>(locale),
    [mode, setMode] = useState<PercentageMode>('of');
  const [inputs, setInputs] = useState(['', '']);
  const parsed = inputs.map((input) => parseDecimal(input, format));
  const [a, b] = parsed;
  const result = a.ok && b.ok ? calculatePercentage(mode, a.value, b.value, format) : null;
  const output = result?.ok ? `${result.value.text}${result.value.percent ? '%' : ''}` : '';
  return (
    <EngineSurface>
      <div className="utility-tool utility-split">
        <UtilityInput>
          <div className="utility-fields">
            <label className="field">
              {t('calculation')}
              <select value={mode} onChange={(e) => setMode(e.target.value as PercentageMode)}>
                {modes.map((value) => (
                  <option key={value} value={value}>
                    {t(`modes.${value}`)}
                  </option>
                ))}
              </select>
            </label>
            <InputFormat value={format} onChange={setFormat} />
            {parsed.map((value, index) => (
              <label className="field" key={index} htmlFor={`percent-${index}`}>
                <span id={`percent-label-${index}`}>{t(`labels.${mode}${index}`)}</span>
                <input
                  id={`percent-${index}`}
                  aria-labelledby={`percent-label-${index}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={128}
                  value={inputs[index]}
                  onChange={(e) =>
                    setInputs((current) =>
                      current.map((item, position) => (index === position ? e.target.value : item)),
                    )
                  }
                  aria-invalid={
                    (inputs[index] !== '' && !value.ok) ||
                    Boolean(result && !result.ok && index === (mode === 'ratio' ? 1 : 0))
                  }
                  aria-describedby={`percent-error-${index} percent-hint percent-calculation-error`}
                />
                <span id={`percent-error-${index}`} className="utility-error" role="status">
                  {inputs[index] !== '' && !value.ok ? t(`errors.${value.error}`) : ''}
                </span>
              </label>
            ))}
          </div>
          <p id="percent-hint" className="small">
            {t('bounds')}
          </p>
          <p className="utility-formula">
            {t('formula')}: <strong>{formulas[mode]}</strong>
          </p>
          {a.ok && b.ok && (
            <p className="utility-preview">
              {t('interpreted')}: A = {formatDecimal(a.value, format)}; B ={' '}
              {formatDecimal(b.value, format)}
            </p>
          )}
          <p
            id="percent-calculation-error"
            className={result && !result.ok ? 'notice error' : 'sr-only'}
            role="status"
          >
            {result && !result.ok ? t(`errors.${result.error}`) : ''}
          </p>
        </UtilityInput>
        <div
          className="utility-result"
          data-has-result={Boolean(output)}
          role="region"
          aria-label={t('result')}
        >
          <h2>{t('result')}</h2>
          <p className="utility-output" aria-live="polite" aria-atomic="true">
            {output || t('enterValues')}
          </p>
          {result?.ok && (
            <>
              <p className="small">{t(result.value.rounded ? 'rounded' : 'exact')}</p>
              <CopyResult key={`${mode}:${output}`} value={output} />
            </>
          )}
        </div>
        <p className="small">{t('roundingRule')}</p>
        <p className="small">{t('privacy')}</p>
      </div>
    </EngineSurface>
  );
}
