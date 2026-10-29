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
const MouseTool = dynamic(() => import('@/features/mouse/mouse'));
const engineRenderers: Record<ImplementedEngine, (id: string) => ReactNode> = {
  'screen-info': () => <ScreenInfo />,
  calculator: (id) => <Calculator toolId={id} />,
  refresh: () => <Refresh />,
  patterns: (id) => <Patterns toolId={id} />,
  motion: () => <Motion />,
  touch: () => <Touch />,
  keyboard: (id) => <KeyboardTool toolId={id} />,
  mouse: (id) => <MouseTool toolId={id} />,
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
