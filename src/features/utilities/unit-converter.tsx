'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EngineSurface } from '@/components/tools/engine-surface';
import { formatDecimal, parseDecimal, type NumberFormat } from '@/lib/utilities/decimal';
import { convertUnit, unitGroups, unitGroupIds, type UnitGroup } from '@/lib/utilities/units';
import { CopyResult, InputFormat } from './shared';

export default function UnitConverter() {
  const locale = useLocale() as NumberFormat,
    t = useTranslations('unitTool'),
    u = useTranslations('utilitiesTool');
  const [group, setGroup] = useState<UnitGroup>('length');
  const [from, setFrom] = useState('m'),
    [to, setTo] = useState('cm');
  const [format, setFormat] = useState<NumberFormat>(locale),
    [input, setInput] = useState('');
  const parsed = parseDecimal(input, format);
  const result = parsed.ok ? convertUnit(parsed.value, group, from, to, format) : null;
  const error =
    input !== '' && !parsed.ok
      ? u(`errors.${parsed.error}`)
      : result && !result.ok
        ? t(`errors.${result.error}`)
        : '';
  const output = result?.ok ? `${result.text} ${t(`units.${to}`)}` : '';
  return (
    <EngineSurface>
      <div className="utility-tool">
        <div className="utility-fields">
          <label className="field">
            <span id="unit-group-label">{t('group')}</span>
            <select
              aria-labelledby="unit-group-label"
              value={group}
              onChange={(e) => {
                const next = e.target.value as UnitGroup;
                setGroup(next);
                setFrom(unitGroups[next][0].id);
                setTo(unitGroups[next][1].id);
              }}
            >
              {unitGroupIds.map((id) => (
                <option key={id} value={id}>
                  {t(`groups.${id}`)}
                </option>
              ))}
            </select>
          </label>
          <InputFormat value={format} onChange={setFormat} />
          <label className="field">
            <span id="unit-from-label">{t('from')}</span>
            <select
              aria-labelledby="unit-from-label"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            >
              {unitGroups[group].map(({ id }) => (
                <option key={id} value={id}>
                  {t(`units.${id}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span id="unit-to-label">{t('to')}</span>
            <select
              aria-labelledby="unit-to-label"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            >
              {unitGroups[group].map(({ id }) => (
                <option key={id} value={id}>
                  {t(`units.${id}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field utility-wide" htmlFor="unit-value">
            {t('value')}
            <input
              id="unit-value"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby="unit-error unit-bounds"
            />
          </label>
        </div>
        <p id="unit-error" className="utility-error" role="status">
          {error}
        </p>
        <div className="controls">
          <Button
            variant="outline"
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
          >
            {t('swap')}
          </Button>
          <Button variant="ghost" onClick={() => setInput('')}>
            {t('clear')}
          </Button>
        </div>
        <p id="unit-bounds" className="small">
          {t('bounds')}
        </p>
        <p className="small">{t(`hints.${group}`)}</p>
        {parsed.ok && (
          <p className="utility-preview">
            {u('interpreted')}: {formatDecimal(parsed.value, format)} {t(`units.${from}`)}
          </p>
        )}
        <div className="utility-result" role="region" aria-label={u('result')}>
          <h2>{u('result')}</h2>
          <p className="utility-output" aria-live="polite" aria-atomic="true">
            {output || t('empty')}
          </p>
          {result?.ok && (
            <>
              <p className="small">{u(result.rounded ? 'rounded' : 'exact')}</p>
              <CopyResult key={output} value={output} />
            </>
          )}
        </div>
        <p className="small">{u('roundingRule')}</p>
        <p className="small">{u('privacy')}</p>
      </div>
    </EngineSurface>
  );
}
