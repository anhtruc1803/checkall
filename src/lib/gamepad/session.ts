import type { MeasurementState } from '@/lib/measurements/types';
import { inspectGamepadEnvironment, type GamepadCapability } from './environment';
import {
  DriftAccumulator,
  padLimits,
  readPad,
  type DriftResult,
  type PadReading,
} from './analysis';
export type GamepadFailure =
  | 'interaction-required'
  | 'blocked'
  | 'read-failed'
  | 'disconnected'
  | 'device-changed'
  | 'interrupted'
  | 'timeout';
export interface GamepadSnapshot {
  state: MeasurementState;
  capability: GamepadCapability;
  failure: GamepadFailure | null;
  devices: { index: number; id: string }[];
  pad: PadReading | null;
  axes: [number, number] | null;
  threshold: number;
  path: [number, number][];
  drift: {
    phase: 'idle' | 'settling' | 'sampling' | 'completed' | 'invalid';
    progress: number;
    result: DriftResult | null;
  };
  elapsed: number;
  truncated: boolean;
}
const idleDrift = () => ({ phase: 'idle' as const, progress: 0, result: null });
interface Attempt {
  frame: number | null;
  timeout: ReturnType<typeof setTimeout> | null;
  cleanup: (() => void)[];
  started: number;
  lastFrame: number | null;
  lastPublish: number;
  identity: { index: number; id: string; mapping: string; axes: number; buttons: number } | null;
  path: [number, number][];
  drift: { started: number; accumulator: DriftAccumulator } | null;
}
export class GamepadSession {
  private snapshot: GamepadSnapshot = {
    state: 'idle',
    capability: 'unknown',
    failure: null,
    devices: [],
    pad: null,
    axes: null,
    threshold: 0.1,
    path: [],
    drift: idleDrift(),
    elapsed: 0,
    truncated: false,
  };
  private listeners = new Set<() => void>();
  private current: Attempt | null = null;
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(patch: Partial<GamepadSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }
  stop = (state: MeasurementState = 'stopped', failure: GamepadFailure | null = null) => {
    const attempt = this.current;
    this.current = null;
    if (attempt) {
      if (attempt.frame !== null) cancelAnimationFrame(attempt.frame);
      if (attempt.timeout !== null) clearTimeout(attempt.timeout);
      attempt.cleanup.forEach((dispose) => dispose());
      attempt.path = [];
      attempt.drift = null;
      attempt.identity = null;
    }
    this.publish({
      state,
      failure,
      devices: [],
      pad: null,
      axes: null,
      path: [],
      drift: idleDrift(),
      elapsed: 0,
      truncated: false,
    });
  };
  reset = () => {
    this.stop('idle');
    this.publish({ threshold: 0.1 });
  };
  attach = () => {
    this.publish({ capability: inspectGamepadEnvironment() });
    const interrupt = () => {
      if (this.current) this.stop('warning', 'interrupted');
    };
    const hidden = () => {
      if (document.visibilityState === 'hidden') interrupt();
    };
    window.addEventListener('blur', interrupt);
    window.addEventListener('pagehide', interrupt);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('blur', interrupt);
      window.removeEventListener('pagehide', interrupt);
      document.removeEventListener('visibilitychange', hidden);
      this.reset();
    };
  };
  start = () => {
    if (this.current) return;
    const capability = inspectGamepadEnvironment();
    this.publish({ capability });
    if (capability !== 'available') {
      this.stop('unsupported');
      return;
    }
    if (
      navigator.userActivation?.isActive === false ||
      document.visibilityState === 'hidden' ||
      !document.hasFocus()
    ) {
      this.stop('warning', 'interaction-required');
      return;
    }
    const attempt: Attempt = {
      frame: null,
      timeout: null,
      cleanup: [],
      started: performance.now(),
      lastFrame: null,
      lastPublish: -Infinity,
      identity: null,
      path: [],
      drift: null,
    };
    this.current = attempt;
    this.publish({
      state: 'running',
      failure: null,
      pad: null,
      devices: [],
      axes: null,
      path: [],
      drift: idleDrift(),
      elapsed: 0,
    });
    if (this.current !== attempt) return;
    const disconnected = (event: GamepadEvent) => {
      if (this.current === attempt && attempt.identity?.index === event.gamepad.index)
        this.stop('warning', 'disconnected');
    };
    window.addEventListener('gamepaddisconnected', disconnected);
    attempt.cleanup.push(() => window.removeEventListener('gamepaddisconnected', disconnected));
    attempt.timeout = setTimeout(() => {
      if (this.current === attempt) this.stop('completed', 'timeout');
    }, 120000);
    this.poll(attempt, performance.now());
  };
  selectDevice = (index: number) => {
    const attempt = this.current;
    if (!attempt || !this.snapshot.devices.some((device) => device.index === index)) return;
    attempt.identity = null;
    attempt.path = [];
    attempt.drift = null;
    // Resolve this exact slot on the next poll. Never silently switch on disconnect.
    this.publish({ pad: null, axes: null, path: [], drift: idleDrift() });
    this.pollNow(attempt, index);
  };
  private pollNow(attempt: Attempt, index: number) {
    if (attempt.frame !== null) {
      cancelAnimationFrame(attempt.frame);
      attempt.frame = null;
    }
    this.poll(attempt, performance.now(), index);
  }
  setAxes = (x: number, y: number) => {
    const pad = this.snapshot.pad,
      attempt = this.current;
    if (
      !attempt ||
      !pad ||
      !Number.isInteger(x) ||
      !Number.isInteger(y) ||
      x === y ||
      x < 0 ||
      y < 0 ||
      x >= pad.axes.length ||
      y >= pad.axes.length
    )
      return;
    attempt.path = [];
    attempt.drift = null;
    this.publish({ axes: [x, y], path: [], drift: idleDrift() });
  };
  setThreshold = (value: number) => {
    if (!Number.isFinite(value) || value < 0 || value > 0.5) return;
    if (this.current) this.current.drift = null;
    this.publish({ threshold: value, drift: idleDrift() });
  };
  measure = () => {
    const attempt = this.current,
      axes = this.snapshot.axes,
      pad = this.snapshot.pad;
    if (
      !attempt ||
      !pad ||
      !axes ||
      pad.axes[axes[0]] == null ||
      pad.axes[axes[1]] == null ||
      attempt.drift
    )
      return;
    attempt.drift = {
      started: performance.now(),
      accumulator: new DriftAccumulator(this.snapshot.threshold),
    };
    this.publish({ drift: { phase: 'settling', progress: 0, result: null } });
  };
  private poll(attempt: Attempt, now: number, requestedIndex?: number) {
    if (this.current !== attempt) return;
    attempt.frame = null;
    try {
      if (document.visibilityState === 'hidden' || !document.hasFocus()) {
        this.stop('warning', 'interrupted');
        return;
      }
      if (now - attempt.started >= 120000) {
        this.stop('completed', 'timeout');
        return;
      }
      const raw = navigator.getGamepads();
      const pads = Array.from(
        { length: Math.min(raw.length, padLimits.devices) },
        (_, index) => raw[index],
      ).filter((pad): pad is Gamepad =>
        Boolean(pad?.connected && Number.isInteger(pad.index) && pad.index >= 0),
      );
      let pad: Gamepad | undefined;
      const identity = attempt.identity;
      if (identity) {
        pad = pads.find((pad) => pad.index === identity.index);
        if (!pad) {
          this.stop('warning', 'disconnected');
          return;
        }
        if (
          pad.id !== identity.id ||
          pad.mapping !== identity.mapping ||
          pad.axes.length !== identity.axes ||
          pad.buttons.length !== identity.buttons
        ) {
          this.stop('warning', 'device-changed');
          return;
        }
      } else {
        pad =
          requestedIndex === undefined ? pads[0] : pads.find((pad) => pad.index === requestedIndex);
        if (requestedIndex !== undefined && !pad) {
          this.stop('warning', 'disconnected');
          return;
        }
        if (pad) {
          attempt.identity = {
            index: pad.index,
            id: pad.id,
            mapping: pad.mapping,
            axes: pad.axes.length,
            buttons: pad.buttons.length,
          };
          this.publish({
            axes: pad.mapping === 'standard' && pad.axes.length >= 2 ? [0, 1] : null,
            path: [],
            drift: idleDrift(),
          });
        }
      }
      const reading = pad ? readPad(pad) : null,
        axes = this.snapshot.axes;
      if (this.current !== attempt) return;
      let driftSnapshot = this.snapshot.drift;
      const x = axes && reading ? reading.axes[axes[0]] : null,
        y = axes && reading ? reading.axes[axes[1]] : null;
      const gap =
        attempt.lastFrame !== null && (now <= attempt.lastFrame || now - attempt.lastFrame > 250);
      attempt.lastFrame = now;
      if (gap) {
        attempt.path = [];
        if (attempt.drift) {
          attempt.drift = null;
          driftSnapshot = { phase: 'invalid', progress: 0, result: null };
        }
      }
      if (x != null && y != null) {
        attempt.path.push([x, y]);
        if (attempt.path.length > padLimits.path) attempt.path.shift();
      } else attempt.path = [];
      if (attempt.drift) {
        const drift = attempt.drift,
          elapsed = now - drift.started;
        if (x == null || y == null) {
          attempt.drift = null;
          driftSnapshot = { phase: 'invalid', progress: 0, result: null };
        } else if (elapsed >= 6000) {
          const result = drift.accumulator.result();
          attempt.drift = null;
          driftSnapshot = { phase: result ? 'completed' : 'invalid', progress: 1, result };
        } else if (elapsed >= 1000) {
          if (!drift.accumulator.add(x, y, now)) {
            attempt.drift = null;
            driftSnapshot = { phase: 'invalid', progress: 0, result: null };
          } else
            driftSnapshot = { phase: 'sampling', progress: (elapsed - 1000) / 5000, result: null };
        }
      }
      if (
        now - attempt.lastPublish >= 125 ||
        (!this.snapshot.pad && reading) ||
        driftSnapshot.phase !== this.snapshot.drift.phase
      ) {
        attempt.lastPublish = now;
        this.publish({
          pad: reading,
          devices: pads.map((pad) => ({ index: pad.index, id: pad.id.slice(0, 256) })),
          path: [...attempt.path],
          drift: driftSnapshot,
          elapsed: now - attempt.started,
          truncated: raw.length > padLimits.devices || Boolean(reading?.truncated),
        });
      }
      if (this.current === attempt)
        attempt.frame = requestAnimationFrame((time) => this.poll(attempt, time));
    } catch (error) {
      if (this.current === attempt)
        this.stop(
          'error',
          error instanceof DOMException && error.name === 'SecurityError'
            ? 'blocked'
            : 'read-failed',
        );
    }
  }
}
