import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './media-tools.module.css';

type ImageFile = { blob: Blob; width: number; height: number; filename: string };
type Preview = ImageFile & { url: string };

export function encodeCanvas(canvas: HTMLCanvasElement, type = 'image/png', quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export returned no file'));
      },
      type,
      quality,
    );
  });
}

export function useLocalImage() {
  const [image, setImage] = useState<Preview | null>(null);
  const url = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (url.current) URL.revokeObjectURL(url.current);
      url.current = null;
    },
    [],
  );

  function replace(next: ImageFile | null) {
    const preview = next && { ...next, url: URL.createObjectURL(next.blob) };
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = preview?.url ?? null;
    setImage(preview);
  }

  return [image, replace] as const;
}

export function LocalImagePreview({ image, alt }: { image: Preview; alt: string }) {
  return (
    <div className={styles.preview}>
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob URLs cannot be processed by the Next.js image server. */}
      <img src={image.url} width={image.width} height={image.height} alt={alt} />
    </div>
  );
}

export function DownloadImage({ image, label }: { image: Preview; label: string }) {
  return (
    <Button asChild>
      <a href={image.url} download={image.filename}>
        <Download size={18} aria-hidden="true" />
        {label}
      </a>
    </Button>
  );
}
