'use client';
import { useEffect, useRef, useState } from 'react';
import { Scaling } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EngineSurface } from '@/components/tools/engine-surface';
import {
  detectImageFormat,
  imageFormats,
  maxImageBytes,
  maxOutputSide,
  maxOutputWidth,
  maxSourcePixels,
  resizeDimensions,
  type ImageFormat,
} from '@/lib/utilities/image-resize';
import { DownloadImage, encodeCanvas, LocalImagePreview, useLocalImage } from './local-image';
import { UtilityInput } from './shared';
import styles from './media-tools.module.css';

type SourceImage = { name: string; width: number; height: number; bytes: number };
type ErrorKey =
  | 'type'
  | 'size'
  | 'dimensions'
  | 'decode'
  | 'width'
  | 'unsupportedFormat'
  | 'encode';
const formats = ['jpeg', 'png', 'webp'] as const;

export default function ImageResizer() {
  const t = useTranslations('mediaTools');
  const formatter = useFormatter();
  const bitmap = useRef<ImageBitmap | null>(null);
  const revision = useRef(0);
  const [source, setSource] = useState<SourceImage | null>(null);
  const [image, setImage] = useLocalImage();
  const [width, setWidth] = useState('');
  const [format, setFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(80);
  const [working, setWorking] = useState<'reading' | 'processing' | null>(null);
  const [error, setError] = useState<ErrorKey | null>(null);
  const size = source && resizeDimensions(source, width);
  const widthLimit = source ? maxOutputWidth(source) : maxOutputSide;
  const widthInvalid = source !== null && width !== '' && !size;

  useEffect(
    () => () => {
      revision.current++;
      bitmap.current?.close();
      bitmap.current = null;
    },
    [],
  );

  function invalidateOutput() {
    setError(null);
    setImage(null);
  }

  async function loadFile(file: File) {
    const request = ++revision.current;
    bitmap.current?.close();
    bitmap.current = null;
    setSource(null);
    setWidth('');
    invalidateOutput();
    setWorking('reading');
    try {
      if (file.size === 0 || file.size > maxImageBytes) {
        setError('size');
        return;
      }
      const type = detectImageFormat(new Uint8Array(await file.slice(0, 12).arrayBuffer()));
      if (request !== revision.current) return;
      if (!type) {
        setError('type');
        return;
      }
      const input =
        file.type === imageFormats[type] ? file : file.slice(0, file.size, imageFormats[type]);
      const decoded = await createImageBitmap(input, { imageOrientation: 'from-image' });
      if (request !== revision.current) {
        decoded.close();
        return;
      }
      if (decoded.width * decoded.height > maxSourcePixels) {
        decoded.close();
        setError('dimensions');
        return;
      }
      bitmap.current = decoded;
      setSource({
        name: file.name,
        width: decoded.width,
        height: decoded.height,
        bytes: file.size,
      });
      setWidth(String(Math.min(decoded.width, maxOutputWidth(decoded))));
      setFormat(type === 'webp' ? 'png' : type);
      setQuality(80);
    } catch {
      if (request === revision.current) setError('decode');
    } finally {
      if (request === revision.current) setWorking(null);
    }
  }

  async function processImage() {
    const input = bitmap.current;
    if (!input || !source || !size || working) return;
    const request = ++revision.current;
    setWorking('processing');
    invalidateOutput();
    try {
      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      if (format === 'jpeg') {
        context.fillStyle = '#fff';
        context.fillRect(0, 0, size.width, size.height);
      }
      context.imageSmoothingQuality = 'high';
      context.drawImage(input, 0, 0, size.width, size.height);
      const blob = await encodeCanvas(canvas, imageFormats[format], quality / 100);
      if (request !== revision.current) return;
      if (blob.type !== imageFormats[format]) {
        setError('unsupportedFormat');
        return;
      }
      const stem =
        source.name
          .replace(/\.[^./\\]+$/u, '')
          .slice(0, 80)
          .trim() || 'image';
      setImage({
        ...size,
        blob,
        filename: `${stem}-${size.width}w.${format === 'jpeg' ? 'jpg' : format}`,
      });
    } catch {
      if (request === revision.current) setError('encode');
    } finally {
      if (request === revision.current) setWorking(null);
    }
  }

  function fileSize(bytes: number) {
    return bytes < 1024
      ? `${formatter.number(bytes)} B`
      : `${formatter.number(bytes / 1024, { maximumFractionDigits: 1 })} KiB`;
  }

  const delta = source && image ? image.blob.size - source.bytes : 0;
  const percent = source ? Number((Math.abs(delta / source.bytes) * 100).toPrecision(3)) : 0;
  const errorKey = error ?? (widthInvalid ? 'width' : null);

  return (
    <EngineSurface>
      <div className={`utility-tool utility-split ${styles.tool}`}>
        <UtilityInput>
          <label className="field" htmlFor="image-source">
            {t('image.file')}
          </label>
          <input
            id="image-source"
            className={styles.file}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            aria-describedby="image-file-hint image-error"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void loadFile(file);
            }}
          />
          <p className="small" id="image-file-hint">
            {t('image.fileHint')}
          </p>
          {source && (
            <>
              <div className="utility-fields">
                <label className="field" htmlFor="image-width">
                  {t('image.width')}
                  <input
                    id="image-width"
                    value={width}
                    maxLength={4}
                    inputMode="numeric"
                    autoComplete="off"
                    disabled={working !== null}
                    aria-invalid={widthInvalid}
                    aria-describedby="image-width-hint image-error"
                    onChange={(event) => {
                      invalidateOutput();
                      setWidth(event.target.value);
                    }}
                  />
                </label>
                <div className="field">
                  <label htmlFor="image-format">{t('image.format')}</label>
                  <select
                    id="image-format"
                    value={format}
                    disabled={working !== null}
                    onChange={(event) => {
                      invalidateOutput();
                      setFormat(event.target.value as ImageFormat);
                    }}
                  >
                    {formats.map((option) => (
                      <option key={option} value={option}>
                        {option === 'webp' ? 'WebP' : option.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="small" id="image-width-hint">
                {t('image.widthHint', { max: maxOutputSide })}{' '}
                {size && `${size.width} × ${size.height} px`}
              </p>
              {format !== 'png' && (
                <label className="field" htmlFor="image-quality">
                  <span>
                    {t('image.quality')} · {quality}%
                  </span>
                  <input
                    id="image-quality"
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    disabled={working !== null}
                    onChange={(event) => {
                      invalidateOutput();
                      setQuality(Number(event.target.value));
                    }}
                  />
                </label>
              )}
              {format === 'jpeg' && <p className="small">{t('image.jpegHint')}</p>}
            </>
          )}
          <p className="utility-error" role="status" id="image-error">
            {errorKey ? t(`image.errors.${errorKey}`, { max: widthLimit }) : ''}
          </p>
          <Button disabled={!size || working !== null} onClick={() => void processImage()}>
            <Scaling size={18} aria-hidden="true" />
            {t(working ? `image.${working}` : 'image.process')}
          </Button>
        </UtilityInput>
        <section className="utility-result" aria-labelledby="image-preview-label">
          <h2 id="image-preview-label">{t('preview')}</h2>
          {source && (
            <dl className={styles.comparison}>
              <div>
                <dt>{t('image.source')}</dt>
                <dd data-testid="image-source-stats">
                  {source.width} × {source.height} px · {fileSize(source.bytes)}
                </dd>
              </div>
              {image && (
                <div>
                  <dt>{t('image.output')}</dt>
                  <dd data-testid="image-output-stats">
                    {image.width} × {image.height} px · {fileSize(image.blob.size)}
                  </dd>
                </div>
              )}
            </dl>
          )}
          {image ? (
            <>
              <LocalImagePreview image={image} alt={t('image.alt')} />
              <p role="status">
                {delta === 0
                  ? t('image.same')
                  : t(delta < 0 ? 'image.smaller' : 'image.larger', { percent })}
              </p>
              <DownloadImage image={image} label={t('image.download')} />
            </>
          ) : (
            <p role="status">{t(working ? `image.${working}` : 'image.empty')}</p>
          )}
        </section>
      </div>
    </EngineSurface>
  );
}
