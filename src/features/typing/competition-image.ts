export const imageSizes = {
  landscape: [1200, 630],
  square: [1080, 1080],
} as const;

export type ImageLayout = keyof typeof imageSizes;

type Card = {
  title: string;
  challenge: string;
  nickname: string;
  date: string;
  metrics: { label: string; value: string }[];
};

export async function downloadCompetitionImage(card: Card, layout: ImageLayout, filename: string) {
  const [width, height] = imageSizes[layout];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');

  const margin = layout === 'square' ? 64 : 56;
  const fullWidth = width - margin * 2;
  const square = layout === 'square';
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0b1728');
  gradient.addColorStop(1, '#172e50');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = '#345275';
  context.lineWidth = 2;
  context.strokeRect(26, 26, width - 52, height - 52);
  context.fillStyle = '#89b7ff';
  context.fillRect(margin, margin, 96, 6);

  const line = (
    text: string,
    x: number,
    y: number,
    size: number,
    weight: number,
    color: string,
    max = fullWidth,
  ) => {
    context.font = `${weight} ${size}px Arial, sans-serif`;
    context.fillStyle = color;
    context.fillText(text, x, y, max);
  };
  line('Device Lab', margin, margin + 51, 30, 700, '#a9cfff');
  line(card.title, margin, square ? 228 : 182, square ? 72 : 58, 700, '#fff');
  line(card.challenge, margin, square ? 305 : 241, 36, 500, '#c6d9f0');
  line(card.nickname, margin, square ? 412 : 309, square ? 58 : 46, 700, '#fff');

  const gap = 16;
  const cellWidth = (fullWidth - gap * 2) / 3;
  const cellTop = square ? 524 : 365;
  card.metrics.forEach(({ label, value }, index) => {
    const x = margin + index * (cellWidth + gap);
    context.fillStyle = index === 0 ? '#a9cfff' : '#203a5a';
    context.fillRect(x, cellTop, cellWidth, square ? 200 : 152);
    line(
      value,
      x + 22,
      cellTop + (square ? 92 : 70),
      square ? 62 : 54,
      700,
      index === 0 ? '#0c2039' : '#fff',
      cellWidth - 44,
    );
    line(
      label,
      x + 22,
      cellTop + (square ? 152 : 118),
      28,
      600,
      index === 0 ? '#193458' : '#c6d9f0',
      cellWidth - 44,
    );
  });
  line(card.date, margin, height - margin, 28, 500, '#c6d9f0');

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (image) => (image ? resolve(image) : reject(new Error('PNG unavailable'))),
      'image/png',
    );
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
