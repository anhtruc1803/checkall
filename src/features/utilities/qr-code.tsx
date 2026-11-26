'use client';
import { useEffect, useRef, useState } from 'react';
import { QrCode as QrIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EngineSurface } from '@/components/tools/engine-surface';
import { DownloadImage, encodeCanvas, LocalImagePreview, useLocalImage } from './local-image';
import { UtilityInput } from './shared';
import styles from './media-tools.module.css';

const byteLimit = 1000;

export default function QrCode() {
  const t = useTranslations('mediaTools');
  const [text, setText] = useState('');
  const [working, setWorking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [image, setImage] = useLocalImage();
  const revision = useRef(0);
  const bytes = new TextEncoder().encode(text).length;
  const tooLong = bytes > byteLimit;

  useEffect(
    () => () => {
      revision.current++;
    },
    [],
  );

  async function generate() {
    if (!text.trim() || tooLong || working) return;
    const request = ++revision.current;
    setWorking(true);
    setFailed(false);
    setImage(null);
    try {
      const { default: encodeQR } = await import('qr');
      if (request !== revision.current) return;
      const matrix = encodeQR(text, 'raw', { border: 4 });
      const scale = Math.floor(512 / matrix.length);
      const size = matrix.length * scale;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, size, size);
      context.fillStyle = '#000';
      matrix.forEach((row, y) =>
        row.forEach((dark, x) => {
          if (dark) context.fillRect(x * scale, y * scale, scale, scale);
        }),
      );
      const blob = await encodeCanvas(canvas);
      if (request === revision.current)
        setImage({ blob, width: size, height: size, filename: 'device-lab-qr.png' });
    } catch {
      if (request === revision.current) setFailed(true);
    } finally {
      if (request === revision.current) setWorking(false);
    }
  }

  return (
    <EngineSurface>
      <div className={`utility-tool utility-split ${styles.tool}`}>
        <UtilityInput>
          <label className="field" htmlFor="qr-content">
            {t('qr.input')}
          </label>
          <textarea
            id="qr-content"
            className={styles.textarea}
            rows={5}
            maxLength={4000}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="none"
            value={text}
            placeholder={t('qr.placeholder')}
            aria-invalid={tooLong}
            aria-describedby="qr-size qr-error"
            onChange={({ target }) => {
              revision.current++;
              setWorking(false);
              setFailed(false);
              setImage(null);
              setText(target.value);
            }}
          />
          <p className="small" id="qr-size">
            {t('qr.bytes', { count: bytes, max: byteLimit })}
          </p>
          <p className="utility-error" role="status" id="qr-error">
            {tooLong ? t('qr.tooLong', { max: byteLimit }) : failed ? t('qr.error') : ''}
          </p>
          <Button disabled={!text.trim() || tooLong || working} onClick={() => void generate()}>
            <QrIcon size={18} aria-hidden="true" />
            {t(working ? 'qr.creating' : 'qr.create')}
          </Button>
        </UtilityInput>
        <section className="utility-result" aria-labelledby="qr-preview-label">
          <h2 id="qr-preview-label">{t('preview')}</h2>
          {image ? (
            <>
              <LocalImagePreview image={image} alt={t('qr.alt')} />
              <DownloadImage image={image} label={t('qr.download')} />
            </>
          ) : (
            <p role="status">{t(working ? 'qr.creating' : 'qr.empty')}</p>
          )}
        </section>
      </div>
    </EngineSurface>
  );
}
