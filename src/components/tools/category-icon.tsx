import { Camera, Cpu, Gamepad2, Globe, Keyboard, Monitor, Mouse, Volume2 } from 'lucide-react';
import type { Category } from '@/lib/tools/registry';

const icons = {
  screen: Monitor,
  keyboard: Keyboard,
  mouse: Mouse,
  audio: Volume2,
  camera: Camera,
  gamepad: Gamepad2,
  device: Cpu,
  browser: Globe,
} satisfies Record<Category, typeof Monitor>;

export function CategoryIcon({ category, size = 22 }: { category: Category; size?: number }) {
  const Icon = icons[category];
  return <Icon size={size} aria-hidden="true" strokeWidth={1.7} />;
}
