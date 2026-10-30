import type { MeasurementState } from '@/lib/measurements/types';

export type AudioChannel = 'both' | 'left' | 'right';
export type AudioWave = 'sine' | 'triangle' | 'square' | 'sawtooth';
export interface OutputSettings {
  frequency: number;
  volume: number;
  channel: AudioChannel;
  wave: AudioWave;
}
export const defaultOutput: OutputSettings = {
  frequency: 440,
  volume: 0.03,
  channel: 'both',
  wave: 'sine',
};
export const outputDuration = 10_000;
export type OutputReason = 'blocked' | 'failed' | 'interrupted' | 'invalid' | null;
export interface OutputSnapshot {
  state: MeasurementState;
  reason: OutputReason;
  sampleRate: number | null;
  frequency: number | null;
}
export function validOutput(settings: OutputSettings, sampleRate?: number): boolean {
  return (
    Number.isFinite(settings.frequency) &&
    settings.frequency >= 20 &&
    settings.frequency <= Math.min(20_000, sampleRate ? sampleRate / 2 - 1 : 20_000) &&
    Number.isFinite(settings.volume) &&
    settings.volume >= 0 &&
    settings.volume <= 0.2 &&
    ['both', 'left', 'right'].includes(settings.channel) &&
    ['sine', 'triangle', 'square', 'sawtooth'].includes(settings.wave)
  );
}
interface Session {
  context: AudioContext;
  nodes: AudioNode[];
  oscillator?: OscillatorNode;
  master?: GainNode;
  left?: GainNode;
  right?: GainNode;
  timer?: ReturnType<typeof setTimeout>;
}
/** No context, permission request or browser access until explicit start(). */
export class OutputSession {
  private current: Session | null = null;
  private retiring = new Map<Session, ReturnType<typeof setTimeout>>();
  private listeners = new Set<() => void>();
  private snapshot: OutputSnapshot = {
    state: 'idle',
    reason: null,
    sampleRate: null,
    frequency: null,
  };
  constructor(private factory: () => AudioContext = () => new window.AudioContext()) {}
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(value: OutputSnapshot) {
    this.snapshot = value;
    this.listeners.forEach((listener) => listener());
  }
  private close(session: Session) {
    session.context.onstatechange = null;
    if (session.timer) clearTimeout(session.timer);
    try {
      session.oscillator?.stop();
    } catch {
      /* Already stopped or not started. */
    }
    for (const node of session.nodes) {
      try {
        node.disconnect();
      } catch {
        /* Detached. */
      }
    }
    try {
      void session.context.close().catch(() => {});
    } catch {
      /* Nodes are already silent. */
    }
  }
  private flush() {
    for (const [session, timer] of this.retiring) {
      clearTimeout(timer);
      this.close(session);
    }
    this.retiring.clear();
  }
  stop = (state: MeasurementState = 'stopped', reason: OutputReason = null) => {
    const session = this.current;
    this.current = null; // Invalidate pending resume before releasing resources.
    if (session) {
      session.context.onstatechange = null;
      if (session.timer) clearTimeout(session.timer);
      if (session.master && session.context.state === 'running') {
        const now = session.context.currentTime;
        try {
          session.master.gain.cancelScheduledValues(now);
          session.master.gain.setTargetAtTime(0, now, 0.003);
          session.oscillator?.stop(now + 0.025);
          const timer = setTimeout(() => {
            this.retiring.delete(session);
            this.close(session);
          }, 35);
          this.retiring.set(session, timer);
        } catch {
          this.close(session);
        }
      } else this.close(session);
    }
    this.publish({
      ...this.snapshot,
      state,
      reason,
      ...(state === 'idle' ? { sampleRate: null, frequency: null } : {}),
    });
  };
  dispose = () => {
    this.stop('idle');
    this.flush();
  };
  interrupt = () => {
    this.stop('warning', 'interrupted');
    this.flush(); // Do not rely on a background-tab timer to close the context.
  };
  async start(settings: OutputSettings) {
    if (this.current) return;
    this.flush();
    if (!validOutput(settings)) {
      this.stop('error', 'invalid');
      return;
    }
    let session: Session | null = null;
    try {
      const context = this.factory();
      session = { context, nodes: [] };
      this.current = session;
      this.publish({
        state: 'preparing',
        reason: null,
        sampleRate: context.sampleRate,
        frequency: null,
      });
      if (!validOutput(settings, context.sampleRate)) {
        this.stop('error', 'invalid');
        return;
      }
      const pending = session;
      session.timer = setTimeout(() => {
        if (this.current === pending) this.stop('error', 'blocked');
      }, 10_000);
      await context.resume();
      if (this.current !== session) return;
      if (context.state !== 'running') {
        this.stop('error', 'blocked');
        return;
      }
      const oscillator = context.createOscillator();
      session.nodes.push(oscillator);
      session.oscillator = oscillator;
      const left = context.createGain();
      session.nodes.push(left);
      session.left = left;
      const right = context.createGain();
      session.nodes.push(right);
      session.right = right;
      const merger = context.createChannelMerger(2);
      session.nodes.push(merger);
      const master = context.createGain();
      session.nodes.push(master);
      session.master = master;
      master.gain.value = 0;
      left.gain.value = settings.channel === 'right' ? 0 : 1;
      right.gain.value = settings.channel === 'left' ? 0 : 1;
      oscillator.connect(left);
      oscillator.connect(right);
      left.connect(merger, 0, 0);
      right.connect(merger, 0, 1);
      merger.connect(master);
      master.connect(context.destination);
      oscillator.frequency.value = settings.frequency;
      oscillator.type = settings.wave;
      oscillator.start();
      master.gain.setTargetAtTime(settings.volume, context.currentTime, 0.01);
      context.onstatechange = () => {
        if (this.current === pending && context.state !== 'running') this.interrupt();
      };
      clearTimeout(session.timer);
      session.timer = setTimeout(() => {
        if (this.current === pending) this.stop('completed');
      }, outputDuration);
      this.publish({
        state: 'running',
        reason: null,
        sampleRate: context.sampleRate,
        frequency: settings.frequency,
      });
    } catch (error) {
      if (session && this.current !== session) return;
      this.stop(
        'error',
        error instanceof DOMException && error.name === 'NotAllowedError' ? 'blocked' : 'failed',
      );
    }
  }
  update(settings: OutputSettings) {
    const session = this.current;
    if (!session?.oscillator || !session.master || !session.left || !session.right) return;
    if (!validOutput(settings, session.context.sampleRate)) {
      this.stop('error', 'invalid');
      return;
    }
    try {
      const now = session.context.currentTime;
      const ramp = (param: AudioParam, value: number) => {
        param.cancelScheduledValues(now);
        param.setTargetAtTime(value, now, 0.01);
      };
      ramp(session.oscillator.frequency, settings.frequency);
      ramp(session.master.gain, settings.volume);
      ramp(session.left.gain, settings.channel === 'right' ? 0 : 1);
      ramp(session.right.gain, settings.channel === 'left' ? 0 : 1);
      session.oscillator.type = settings.wave;
      this.publish({ ...this.snapshot, frequency: settings.frequency });
    } catch {
      this.stop('error', 'failed');
    }
  }
}
