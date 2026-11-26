import { ChevronDown, Hand } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { keyboardRows, typingKeyHint, type PracticeKeyRow } from '@/lib/typing/keyboard-guide';
import styles from './typing.module.css';

const handFingers = { left: [1, 2, 3, 4, 5], right: [9, 8, 7, 6, 5] } as const;
const fingerPositions = ['pinky', 'ring', 'middle', 'index', 'thumb'] as const;

export function TypingGuide({
  character,
  row,
}: {
  character: string | undefined;
  row: PracticeKeyRow | undefined;
}) {
  const t = useTranslations('typing.guide');
  const hint = typingKeyHint(character);
  const shiftFinger = hint?.shifted ? (hint.finger < 5 ? 9 : 1) : undefined;
  function keyLabel(key: string) {
    return key === ' ' ? t('space') : key.toUpperCase();
  }

  return (
    <details className={styles.guide} open>
      <summary>
        <span className={styles.guideIcon}>
          <Hand aria-hidden="true" />
        </span>
        <span className={styles.guideTitle}>{t('title')}</span>
        <ChevronDown className={styles.guideChevron} aria-hidden="true" />
      </summary>
      <div className={styles.guideBody}>
        <div className={styles.guideCopy}>
          <p>{t('home')}</p>
          {row && (
            <p className={styles.rowHint}>
              <strong>{t(`rows.${row}`)}</strong>
              <span className="small">{t('rowTip')}</span>
            </p>
          )}
          {hint && (
            <p className={styles.keyHint}>
              {t('next', { character: character === ' ' ? t('space') : (character ?? '') })}
              <kbd>{hint.shifted ? `Shift + ${keyLabel(hint.key)}` : keyLabel(hint.key)}</kbd>
              <strong>{t(`fingers.${hint.finger}`)}</strong>
              {shiftFinger && (
                <span className={styles.shiftHint}>
                  {t('shiftHint', { finger: t(`fingers.${shiftFinger}`) })}
                </span>
              )}
            </p>
          )}
          {!row && <p className="small">{t('ime')}</p>}
        </div>
        <div className={styles.guideKeys}>
          <div className={styles.keyboard} aria-hidden="true">
            {keyboardRows.map(({ id, keys }) => (
              <div
                className={styles.keyRow}
                key={id}
                data-key-row={id}
                data-practice-row={row === id || (row === 'mixed' && id !== 'space')}
              >
                {keys.map(({ key, finger }) => (
                  <span
                    className={styles.key}
                    key={key}
                    data-key={key}
                    data-finger={finger}
                    data-home={key === 'f' || key === 'j'}
                    data-next-key={key === hint?.key}
                  >
                    {keyLabel(key)}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.hands} aria-hidden="true">
            {(['left', 'right'] as const).map((hand) => (
              <div className={styles.hand} key={hand} data-hand={hand}>
                <div className={styles.handShape}>
                  <span className={styles.palm} />
                  {handFingers[hand].map((finger, index) => (
                    <span
                      key={finger}
                      className={styles.handFinger}
                      data-finger={finger}
                      data-digit={fingerPositions[index]}
                      data-highlight={
                        finger === hint?.finger
                          ? 'key'
                          : finger === shiftFinger
                            ? 'shift'
                            : undefined
                      }
                      title={t(`fingers.${finger}`)}
                    />
                  ))}
                </div>
                <span>{t(`hands.${hand}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}
