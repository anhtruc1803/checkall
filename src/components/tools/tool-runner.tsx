'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { inspectCapabilities } from '@/lib/browser/capabilities';
import type { Tool } from '@/lib/tools/registry';
import { isImplementedEngine, type ImplementedEngine } from '@/lib/tools/types';
const ScreenInfo = dynamic(() => import('@/features/screen/screen-info'));
const Calculator = dynamic(() => import('@/features/screen/calculator'));
const Refresh = dynamic(() => import('@/features/screen/refresh'));
const Patterns = dynamic(() => import('@/features/screen/patterns'));
const Motion = dynamic(() => import('@/features/screen/motion'));
const Touch = dynamic(() => import('@/features/screen/touch'));
const KeyboardTool = dynamic(() => import('@/features/keyboard/keyboard'));
const VietnameseTyping = dynamic(() => import('@/features/typing/typing'));
const MouseTool = dynamic(() => import('@/features/mouse/mouse'));
const DeviceInformation = dynamic(() => import('@/features/device/information'));
const BrowserCompatibility = dynamic(() => import('@/features/browser/compatibility'));
const GpuInformation = dynamic(() => import('@/features/device/gpu'));
const PointerCapabilities = dynamic(() => import('@/features/device/pointer'));
const StorageCapabilities = dynamic(() => import('@/features/browser/storage'));
const FullscreenTest = dynamic(() => import('@/features/browser/fullscreen'));
const MouseMovement = dynamic(() => import('@/features/mouse/movement'));
const MouseAccuracy = dynamic(() => import('@/features/mouse/accuracy'));
const MouseReaction = dynamic(() => import('@/features/mouse/reaction'));
const AudioOutput = dynamic(() => import('@/features/audio/output'));
const AudioInput = dynamic(() => import('@/features/audio/input'));
const Camera = dynamic(() => import('@/features/camera/camera'));
const GamepadTool = dynamic(() => import('@/features/gamepad/gamepad'));
const NumberWords = dynamic(() => import('@/features/utilities/number-words'));
const Percentage = dynamic(() => import('@/features/utilities/percentage'));
const TextTool = dynamic(() => import('@/features/utilities/text-tool'));
const UnitConverter = dynamic(() => import('@/features/utilities/unit-converter'));
const DateCalculator = dynamic(() => import('@/features/utilities/date-calculator'));
const QrCode = dynamic(() => import('@/features/utilities/qr-code'));
const ImageResizer = dynamic(() => import('@/features/utilities/image-resizer'));
const engineRenderers: Record<ImplementedEngine, (id: string) => ReactNode> = {
  'unit-converter': () => <UnitConverter />,
  'date-calculator': () => <DateCalculator />,
  'qr-code': () => <QrCode />,
  'image-resizer': () => <ImageResizer />,
  text: (id) => <TextTool toolId={id} />,
  'number-words': () => <NumberWords />,
  percentage: () => <Percentage />,
  'screen-info': () => <ScreenInfo />,
  calculator: (id) => <Calculator toolId={id} />,
  refresh: () => <Refresh />,
  patterns: (id) => <Patterns toolId={id} />,
  motion: () => <Motion />,
  touch: () => <Touch />,
  keyboard: (id) => <KeyboardTool toolId={id} />,
  'vietnamese-typing': () => <VietnameseTyping />,
  mouse: (id) => <MouseTool toolId={id} />,
  'device-info': () => <DeviceInformation />,
  'browser-info': () => <BrowserCompatibility />,
  'gpu-info': () => <GpuInformation />,
  'pointer-info': () => <PointerCapabilities />,
  storage: () => <StorageCapabilities />,
  fullscreen: () => <FullscreenTest />,
  'mouse-movement': () => <MouseMovement />,
  'mouse-accuracy': () => <MouseAccuracy />,
  'mouse-reaction': () => <MouseReaction />,
  'audio-output': (id) => <AudioOutput toolId={id} />,
  microphone: (id) => <AudioInput toolId={id} />,
  'audio-spectrum': (id) => <AudioInput toolId={id} />,
  camera: (id) => <Camera toolId={id} />,
  gamepad: (id) => <GamepadTool toolId={id} />,
};
export function ToolRunner({
  tool,
}: {
  tool: Pick<Tool, 'id' | 'engine' | 'requiredCapabilities'>;
}) {
  const t = useTranslations();
  const [support, setSupport] = useState<boolean | null>(null);
  useEffect(() => {
    const check = () => {
      const capabilities = inspectCapabilities(tool.requiredCapabilities);
      setSupport(
        tool.requiredCapabilities.every((capability) => capabilities[capability] === 'available'),
      );
    };
    check();
  }, [tool]);
  if (support === false)
    return (
      <p className="notice" role="status">
        {t('unsupported')}
      </p>
    );
  return (
    <>
      <p className="sr-only" role="status">
        {support === null ? t('preparing') : ''}
      </p>
      <div inert={support === null}>
        <ToolEngine tool={tool} />
      </div>
    </>
  );
}
function ToolEngine({ tool }: { tool: Pick<Tool, 'id' | 'engine'> }) {
  return isImplementedEngine(tool.engine) ? (
    engineRenderers[tool.engine](tool.id)
  ) : (
    <UnavailableEngine />
  );
}
function UnavailableEngine() {
  const t = useTranslations();
  return (
    <p className="notice" role="status">
      {t('engineUnavailable')}
    </p>
  );
}
