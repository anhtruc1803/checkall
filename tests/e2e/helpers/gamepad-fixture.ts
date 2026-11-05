import type { Page } from '@playwright/test';
type QaPad = {
  index: number;
  id: string;
  mapping: string;
  connected: boolean;
  timestamp: number;
  axes: number[];
  buttons: { value: number; pressed: boolean; touched: boolean }[];
  vibrationActuator: { playEffect: () => Promise<void> };
};
declare global {
  interface Window {
    __nativePadReads: { count: number; available: boolean };
    __gamepadProbe: {
      calls: number;
      capture: number;
      query: number;
      haptics: number;
      pads: (QaPad | null)[];
      disconnect: (index: number, event?: boolean) => void;
      replace: (index: number) => void;
      hidden: () => void;
    };
  }
}
export async function gamepadFixture(
  page: Page,
  mode:
    | 'active'
    | 'waiting'
    | 'unmapped'
    | 'unsupported'
    | 'insecure'
    | 'policy'
    | 'blocked' = 'active',
) {
  await page.addInitScript(
    ({ mode }) => {
      const probe: Window['__gamepadProbe'] = {
        calls: 0,
        capture: 0,
        query: 0,
        haptics: 0,
        pads: [],
        disconnect: () => {},
        replace: () => {},
        hidden: () => {},
      };
      const makePad = (index: number): QaPad => ({
        index,
        id: `QA simulated controller ${index}`,
        mapping: mode === 'unmapped' ? '' : 'standard',
        connected: true,
        timestamp: 0,
        axes: [0.12, -0.05, 0.25, -0.3],
        buttons: Array.from({ length: 17 }, (_, i) => ({
          value: i === 0 ? 0.65 : 0,
          pressed: i === 0,
          touched: i === 0,
        })),
        vibrationActuator: {
          playEffect: async () => {
            probe.haptics++;
          },
        },
      });
      if (mode !== 'waiting') probe.pads = [makePad(0), null, makePad(2)];
      probe.disconnect = (index, event = true) => {
        const pad = probe.pads[index];
        probe.pads[index] = null;
        if (pad && event) {
          const notification = new Event('gamepaddisconnected');
          Object.defineProperty(notification, 'gamepad', { value: pad });
          window.dispatchEvent(notification);
        }
      };
      probe.replace = (index) => {
        if (probe.pads[index]) probe.pads[index]!.id = 'QA replacement controller';
      };
      probe.hidden = () => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
        document.dispatchEvent(new Event('visibilitychange'));
      };
      window.__gamepadProbe = probe;
      Object.defineProperty(navigator, 'getGamepads', {
        configurable: true,
        value:
          mode === 'unsupported'
            ? undefined
            : () => {
                probe.calls++;
                if (mode === 'blocked') throw new DOMException('fixture', 'SecurityError');
                return probe.pads;
              },
      });
      Object.defineProperty(navigator, 'permissions', {
        configurable: true,
        value: {
          query: async () => {
            probe.query++;
            throw new Error('unexpected permission query');
          },
        },
      });
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {
          getUserMedia: async () => {
            probe.capture++;
            throw new Error('unexpected capture');
          },
        },
      });
      Object.defineProperty(document, 'permissionsPolicy', {
        configurable: true,
        value: { features: () => ['gamepad'], allowsFeature: () => mode !== 'policy' },
      });
      if (mode === 'insecure')
        Object.defineProperty(window, 'isSecureContext', { configurable: true, value: false });
    },
    { mode },
  );
}
