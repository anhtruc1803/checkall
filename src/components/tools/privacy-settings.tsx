'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { clearLocalData, writePreference, type SavedSummary } from '@/lib/storage/preferences';
import { usePreference } from '@/hooks/use-preference';
export function PrivacySettings() {
  const t = useTranslations();
  const enabled = usePreference('save', false),
    summaries = usePreference<SavedSummary[]>('summaries', []);
  const [message, setMessage] = useState('');
  return (
    <section className="tool-workspace">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            if (!writePreference('save', e.target.checked)) setMessage(t('storageError'));
          }}
        />
        {t('saveResults')}
      </label>
      <h2>{t('savedResults')}</h2>
      {summaries.length ? (
        <ul>
          {summaries.map((summary, index) => (
            <li key={index}>
              {summary.toolId} · {summary.value} · {new Date(summary.time).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">{t('noSaved')}</p>
      )}
      <Button
        variant="outline"
        onClick={() => {
          if (clearLocalData()) {
            document.documentElement.dataset.theme = 'dark';
            setMessage(t('dataDeleted'));
          } else setMessage(t('storageError'));
        }}
      >
        {t('deleteData')}
      </Button>
      <p role="status" className="small" style={{ marginTop: 12 }}>
        {message}
      </p>
    </section>
  );
}
