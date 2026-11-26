import {
  Activity,
  AudioLines,
  CaseSensitive,
  Fingerprint,
  Joystick,
  LetterText,
  Link2,
  Repeat2,
  Route,
  Ruler,
  Scaling,
  ShieldCheck,
  ArrowLeftRight,
  BetweenHorizontalStart,
  Braces,
  CalendarDays,
  Camera,
  CircleDot,
  Columns2,
  Crosshair,
  Database,
  Film,
  Focus,
  Gamepad2,
  Gauge,
  Grid2X2,
  Hand,
  Hourglass,
  Image,
  Keyboard,
  ListFilter,
  Pilcrow,
  Maximize,
  Mic,
  Monitor,
  Mouse,
  MousePointer2,
  MoveUpRight,
  Palette,
  PanelsTopLeft,
  Percent,
  QrCode,
  Ratio,
  ScanLine,
  Scan,
  Square,
  TextCursorInput,
  Timer,
  Trash2,
  Volume2,
  Waves,
  Zap,
  Cpu,
} from 'lucide-react';
import { CategoryIcon } from './category-icon';
import type { Category } from '@/lib/tools/types';
import styles from './tool-card.module.css';

type ToolVisual = readonly [typeof Monitor, string, string?];

export const toolVisuals: Readonly<Record<string, ToolVisual>> = {
  A01: [Scaling, 'W × H'],
  A02: [PanelsTopLeft, 'CSS px'],
  A03: [Ratio, '16 : 9'],
  A04: [Grid2X2, 'PPI'],
  A05: [Activity, 'Hz'],
  A06: [CircleDot, '●'],
  A07: [Palette, 'R · G · B'],
  A08: [Square, '◩'],
  A09: [ScanLine, 'RGB'],
  A10: [MoveUpRight, '◌ ◯ ●'],
  A11: [Fingerprint, '＋ ＋'],
  B01: [Keyboard, 'A · S · D'],
  B02: [BetweenHorizontalStart, 'W + A + D'],
  B03: [Repeat2, 'D · D'],
  B04: [Hourglass, '↓ ⋯ ↑'],
  B05: [Braces, 'KeyD'],
  B06: [Pilcrow, 'd · đ'],
  C01: [Mouse, 'L · M · R'],
  C02: [MousePointer2, '● ●'],
  C03: [Timer, 'CPS'],
  C04: [ListFilter, '↑ ↓'],
  C05: [Gauge, 'Hz'],
  C06: [Route, 'x · y'],
  C07: [Crosshair, '⊙'],
  C08: [Zap, 'ms'],
  D01: [Volume2, '♪'],
  D02: [Columns2, 'L · R'],
  D03: [Mic, '▂ ▅ ▇'],
  D04: [Waves, 'Hz'],
  D05: [AudioLines, '▂ ▆ ▃ ▇'],
  E01: [Camera, '▣'],
  E02: [Scan, 'W × H'],
  E03: [Film, 'FPS'],
  F01: [Gamepad2, 'A · B · X'],
  F02: [Joystick, 'x · y'],
  F03: [Focus, '±'],
  G01: [Monitor, 'OS · DPR'],
  G02: [ShieldCheck, 'API'],
  G03: [Cpu, 'WebGL'],
  G04: [Hand, '○ · ↗'],
  G05: [Database, '▤'],
  G06: [Maximize, '⛶'],
  U01: [LetterText, '10'],
  U02: [Percent, '20% × 50', '10'],
  U03: [TextCursorInput, 'a b c', '3'],
  U04: [CaseSensitive, 'abc', 'ABC'],
  U05: [Link2, 'Café', 'cafe'],
  U06: [Trash2, 'a   b', 'a b'],
  U07: [Ruler, '2 m', '200 cm'],
  U08: [CalendarDays, '01/06', '03/06'],
  U09: [QrCode, 'QR · PNG'],
  U10: [Image, '1600 px', '800 px'],
};

export function ToolIcon({
  id,
  category,
  size = 20,
}: {
  id: string;
  category: Category;
  size?: number;
}) {
  const Icon = toolVisuals[id]?.[0];
  return Icon ? (
    <Icon size={size} aria-hidden="true" />
  ) : (
    <CategoryIcon category={category} size={size} />
  );
}

export function ToolArtwork({
  id,
  category,
  wordExample,
}: {
  id: string;
  category: Category;
  wordExample?: string;
}) {
  const visual = toolVisuals[id];
  const example = visual?.[1];
  const result = id === 'U01' ? wordExample : visual?.[2];
  return (
    <div className={styles.artwork} data-tool-art={id} data-category={category} aria-hidden="true">
      <div className={styles.artFrame}>
        {result ? (
          <div className={styles.exampleFlow}>
            <span>{example}</span>
            <ArrowLeftRight size={14} />
            <span>{result}</span>
          </div>
        ) : (
          <>
            <ToolIcon id={id} category={category} size={39} />
            {example && <span className={styles.sample}>{example}</span>}
          </>
        )}
      </div>
    </div>
  );
}
