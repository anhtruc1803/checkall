import { useTranslations } from 'next-intl';
import type { KeyLog } from './use-keyboard';

export function displayEventValue(value: string | number | boolean | null) {
  if (typeof value === 'string' && value.trim() === '') return JSON.stringify(value);
  return String(value ?? '—');
}

const detailFields = [
  'location',
  'repeat',
  'modifiers',
  'isComposing',
  'compositionActive',
  'isTrusted',
  'keyCode',
  'capsLock',
  'numLock',
  'altGraph',
] as const;

export function KeyboardEventDetails({ event }: { event: KeyLog }) {
  return (
    <dl className="keyboard-event-details">
      {detailFields.map((field) => (
        <div key={field}>
          <dt>{field}</dt>
          <dd>{displayEventValue(event[field])}</dd>
        </div>
      ))}
    </dl>
  );
}

export function KeyboardEventType({ type }: { type: KeyLog['type'] }) {
  return (
    <code className="keyboard-event-type" data-type={type}>
      {type}
    </code>
  );
}

export function KeyboardLatestEvent({ event }: { event: KeyLog | null }) {
  const t = useTranslations('keyboardTools');
  const hasImeSignal =
    event && (event.isComposing || event.keyCode === 229 || event.key === 'Process');
  return (
    <section
      className="keyboard-latest keyboard-event-readout"
      aria-labelledby="keyboard-latest-heading"
    >
      <h2 id="keyboard-latest-heading">{t('latestEvent')}</h2>
      {event ? (
        <>
          <div className="keyboard-readout-type">
            <KeyboardEventType type={event.type} />
            <span className="small">
              #{event.sequence} · {event.timestamp.toFixed(2)} ms
            </span>
          </div>
          <dl className="keyboard-readout-values">
            <div>
              <dt>key</dt>
              <dd>{displayEventValue(event.key)}</dd>
            </div>
            <div>
              <dt>code</dt>
              <dd>{displayEventValue(event.code)}</dd>
            </div>
          </dl>
          {(event.repeat || hasImeSignal || !event.code) && (
            <p className="keyboard-readout-flags">
              {event.repeat && <code>repeat</code>}
              {hasImeSignal && <span>{t('inspector.imeSignal')}</span>}
              {!event.code && <span>{t('inspector.missingCode')}</span>}
            </p>
          )}
          <details className="keyboard-readout-details">
            <summary>{t('inspector.details')}</summary>
            <KeyboardEventDetails event={event} />
            <p className="small">{t('flagsNote')}</p>
          </details>
        </>
      ) : (
        <p className="small">{t('inspector.empty')}</p>
      )}
    </section>
  );
}
