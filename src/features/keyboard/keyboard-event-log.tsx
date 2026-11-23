'use client';
import { Fragment, useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/tools/measurement-ui';
import type { KeyLog } from './use-keyboard';
import {
  displayEventValue,
  KeyboardEventDetails,
  KeyboardEventType,
} from './keyboard-event-details';

const rawColumns = [
  'type',
  'key',
  'code',
  'location',
  'repeat',
  'modifiers',
  'isComposing',
  'isTrusted',
  'keyCode',
  'timestamp',
] as const;

export function KeyboardEventLog({
  logs,
  totalEvents,
  clear,
  inspector = false,
}: {
  logs: KeyLog[];
  totalEvents: number;
  clear: () => void;
  inspector?: boolean;
}) {
  const t = useTranslations();
  const detailId = useId();
  const [selected, setSelected] = useState<KeyLog | null>(null);
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(''),
    [type, setType] = useState('all');
  const visible = inspector || open;
  const filtered = useMemo(() => {
    if (!visible) return [];
    const search = query.trim().toLocaleLowerCase();
    return logs.filter(
      (log) =>
        (type === 'all' || type === log.type) &&
        (!search ||
          log.code.toLocaleLowerCase().includes(search) ||
          log.key.toLocaleLowerCase().includes(search)),
    );
  }, [logs, visible, query, type]);
  const content = visible && (
    <>
      <div className="controls keyboard-log-controls">
        <label className="field field-flex">
          {t('keyboardTools.filterEvents')}
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="field">
          <span id={`${detailId}-type`}>{t('keyboardTools.eventType')}</span>
          <select
            aria-labelledby={`${detailId}-type`}
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="all">{t('all')}</option>
            <option>keydown</option>
            <option>keyup</option>
          </select>
        </label>
        <Button
          variant="outline"
          onClick={() => {
            setSelected(null);
            clear();
          }}
        >
          {t('keyboardTools.clearLog')}
        </Button>
        <CopyButton value={JSON.stringify(filtered, null, 2)} />
      </div>
      <p className="small" role={!inspector || query || type !== 'all' ? 'status' : undefined}>
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
                {inspector ? (
                  <>
                    <th scope="col">{t('keyboardTools.eventType')}</th>
                    <th scope="col">key</th>
                    <th scope="col">code</th>
                    <th scope="col">{t('keyboardTools.inspector.timestamp')}</th>
                    <th scope="col">
                      <span className="sr-only">{t('keyboardTools.inspector.details')}</span>
                    </th>
                  </>
                ) : (
                  rawColumns.map((name) => (
                    <th scope="col" key={name}>
                      {name}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {[...filtered].reverse().map((log) =>
                inspector ? (
                  <Fragment key={log.sequence}>
                    <tr className="keyboard-event-row" data-event-type={log.type}>
                      <td>
                        <KeyboardEventType type={log.type} />
                      </td>
                      <td>
                        <code>{displayEventValue(log.key)}</code>
                      </td>
                      <td>
                        <code>{displayEventValue(log.code)}</code>
                      </td>
                      <td className="keyboard-event-time">{log.timestamp.toFixed(2)}</td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-expanded={selected === log}
                          aria-controls={selected === log ? detailId : undefined}
                          aria-label={t('keyboardTools.inspector.eventDetails', {
                            sequence: log.sequence,
                          })}
                          onClick={() => setSelected(selected === log ? null : log)}
                        >
                          {t('keyboardTools.inspector.details')}
                        </Button>
                      </td>
                    </tr>
                    {selected === log && (
                      <tr className="keyboard-event-expanded" id={detailId}>
                        <td colSpan={5}>
                          <KeyboardEventDetails event={log} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ) : (
                  <tr key={log.sequence}>
                    <td>{log.type}</td>
                    <td>{log.key === '' ? '""' : log.key}</td>
                    <td>{log.code === '' ? '""' : log.code}</td>
                    <td>{log.location}</td>
                    <td>{String(log.repeat)}</td>
                    <td>{log.modifiers}</td>
                    <td>{String(log.isComposing)}</td>
                    <td>{String(log.isTrusted)}</td>
                    <td>{log.keyCode}</td>
                    <td>{log.timestamp.toFixed(2)}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
  return (
    <section className={inspector ? 'keyboard-log keyboard-inspector-log' : 'keyboard-log'}>
      <h2>{t('eventLog')}</h2>
      <p className="small">
        {t('keyboardTools.logWindow', { retained: logs.length, total: totalEvents })}
      </p>
      {inspector ? (
        content
      ) : (
        <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
          <summary>{t('keyboardTools.showEvents')}</summary>
          {content}
        </details>
      )}
    </section>
  );
}
