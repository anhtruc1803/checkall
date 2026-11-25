import { Hand } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { keyboardRows, typingKeyHint } from '@/lib/typing/keyboard-guide';
import styles from './typing.module.css';

export function TypingGuide({ character }: { character: string | undefined }) {
  const t = useTranslations('typing.guide');
  const hint = typingKeyHint(character);
  function keyLabel(key: string) {
    return key === ' ' ? t('space') : key.toUpperCase();
  }

  return (
    <details className={styles.guide}>
      <summary>
        <Hand aria-hidden="true" />
        {t('title')}
      </summary>
      <div className={styles.guideBody}>
        <div className={styles.guideCopy}>
          <p>{t('home')}</p>
          {hint && (
            <p className={styles.keyHint}>
              {t('next', { character: character === ' ' ? t('space') : (character ?? '') })}
              <kbd>{hint.shifted ? `Shift + ${keyLabel(hint.key)}` : keyLabel(hint.key)}</kbd>
              <strong>{t(`fingers.${hint.finger}`)}</strong>
            </p>
          )}
          <p className="small">{t('ime')}</p>
        </div>
        <div className={styles.guideKeys}>
          <div className={styles.keyboard} aria-hidden="true">
            {keyboardRows.map((row, index) => (
              <div className={styles.keyRow} key={index}>
                {row.map(({ key, finger }) => (
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
          <ul className={styles.fingers}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((finger) => (
              <li key={finger} data-finger={finger}>
                {t(`fingers.${finger}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}
