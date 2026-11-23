'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { NumberFormat } from '@/lib/utilities/decimal';
import { SlidersHorizontal, Copy } from 'lucide-react';
import './utilities.css';

export function UtilityInput({ children }: { children: React.ReactNode }) {
  const t = useTranslations('workbench');
  return (
    <section className="utility-input-panel" aria-label={t('input')}>
      <h2 className="utility-panel-title">
        <SlidersHorizontal size={17} aria-hidden="true" />
        {t('input')}
      </h2>
      {children}
    </section>
  );
}

export function InputFormat({
  value,
  onChange,
}: {
  value: NumberFormat;
  onChange: (value: NumberFormat) => void;
}) {
  const t = useTranslations('utilitiesTool');
  return (
    <label className="field">
      <span id="utility-format-label">{t('inputFormat')}</span>
      <select
        aria-labelledby="utility-format-label"
        value={value}
        onChange={(e) => onChange(e.target.value as NumberFormat)}
      >
        <option value="vi">{t('formatVi')}</option>
        <option value="en">{t('formatEn')}</option>
      </select>
      <span className="small">{t('formatHint')}</span>
    </label>
  );
}
export function CopyResult({ value }: { value: string }) {
  const t = useTranslations('utilitiesTool');
  const [state, setState] = useState<'idle' | 'copied' | 'copyError'>('idle');
  return (
    <div className="controls utility-copy">
      <Button
        variant="outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setState('copied');
          } catch {
            setState('copyError');
          }
        }}
      >
        <Copy size={16} aria-hidden="true" />
        {t('copy')}
      </Button>
      <span role="status">{state === 'idle' ? '' : t(state)}</span>
    </div>
  );
}
