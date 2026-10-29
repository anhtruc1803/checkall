'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { detectCapabilities } from '@/lib/browser/capabilities';
import type { Tool } from '@/lib/tools/registry';
const ScreenInfo = dynamic(() => import('@/features/screen/screen-info'));
const Calculator = dynamic(() => import('@/features/screen/calculator'));
const Refresh = dynamic(() => import('@/features/screen/refresh'));
const Patterns = dynamic(() => import('@/features/screen/patterns'));
const Motion = dynamic(() => import('@/features/screen/motion'));
const Touch = dynamic(() => import('@/features/screen/touch'));
const KeyboardTool = dynamic(() => import('@/features/keyboard/keyboard'));
const MouseTool = dynamic(() => import('@/features/mouse/mouse'));
export function ToolRunner({
  tool,
}: {
  tool: Pick<Tool, 'id' | 'engine' | 'requiredCapabilities'>;
}) {
  const t = useTranslations();
  const [support, setSupport] = useState<boolean | null>(null);
  useEffect(() => {
    const check = () => {
      const capabilities = detectCapabilities();
      setSupport(tool.requiredCapabilities.every((capability) => capabilities[capability]));
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
  switch (tool.engine) {
    case 'screen-info':
      return <ScreenInfo />;
    case 'calculator':
      return <Calculator toolId={tool.id} />;
    case 'refresh':
      return <Refresh />;
    case 'patterns':
      return <Patterns toolId={tool.id} />;
    case 'motion':
      return <Motion />;
    case 'touch':
      return <Touch />;
    case 'keyboard':
      return <KeyboardTool toolId={tool.id} />;
    case 'mouse':
      return <MouseTool toolId={tool.id} />;
  }
}
