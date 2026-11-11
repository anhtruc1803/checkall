'use client';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/tools/measurement-ui';
import type { KeyLog } from './use-keyboard';

export function KeyboardEventLog({
  logs,
  totalEvents,
  clear,
  expanded,
}: {
  logs: KeyLog[];
  totalEvents: number;
  clear: () => void;
  expanded: boolean;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(expanded),
    [query, setQuery] = useState(''),
    [type, setType] = useState('all');
  const filtered = useMemo(() => {
    if (!open) return [];
    const search = query.trim().toLocaleLowerCase();
    return logs.filter(
      (log) =>
        (type === 'all' || type === log.type) &&
        (!search ||
          log.code.toLocaleLowerCase().includes(search) ||
          log.key.toLocaleLowerCase().includes(search)),
    );
  }, [logs, open, query, type]);
  return (
    <section className="keyboard-log">
      <h2>{t('eventLog')}</h2>
      <p className="small">
        {t('keyboardTools.logWindow', { retained: logs.length, total: totalEvents })}
      </p>
      <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary>{t('keyboardTools.showEvents')}</summary>
        {open && (
          <>
            <div className="controls keyboard-log-controls">
              <label className="field field-flex">
                {t('keyboardTools.filterEvents')}
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <label className="field">
                {t('keyboardTools.eventType')}
                <select value={type} onChange={(event) => setType(event.target.value)}>
                  <option value="all">{t('all')}</option>
                  <option>keydown</option>
                  <option>keyup</option>
                </select>
              </label>
              <Button variant="outline" onClick={clear}>
                {t('keyboardTools.clearLog')}
              </Button>
              <CopyButton value={JSON.stringify(filtered, null, 2)} />
            </div>
            <p className="small" role="status">
              {t('keyboardTools.filteredEvents', { count: filtered.length })}
            </p>
            {!filtered.length ? (
              <p className="empty">{t('noEvents')}</p>
            ) : (
              <div
                className="table-scroll keyboard-event-table"
                role="region"
                aria-label={t('eventLog')}
                tabIndex={0}
              >
                <table>
                  <thead>
                    <tr>
                      {[
                        'type',
                        'key',
                        'code',
                        'location',
                        'repeat',
                        'modifiers',
                        'isComposing',
                        'isTrusted',
                        'timestamp',
                      ].map((name) => (
                        <th key={name}>{name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...filtered].reverse().map((log) => (
                      <tr key={log.sequence}>
                        <td>{log.type}</td>
                        <td>{log.key === '' ? '""' : log.key}</td>
                        <td>{log.code === '' ? '""' : log.code}</td>
                        <td>{log.location}</td>
                        <td>{String(log.repeat)}</td>
                        <td>{log.modifiers}</td>
                        <td>{String(log.isComposing)}</td>
                        <td>{String(log.isTrusted)}</td>
                        <td>{log.timestamp.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </details>
    </section>
  );
}
