export const KEYBOARD_CODE_LIMIT = 256;
export const CHATTER_MAX_THRESHOLD = 500;

export interface ChatterEvent {
  code: string;
  type: 'keydown' | 'keyup';
  time: number;
  repeat: boolean;
}

interface KeyStatistics {
  presses: number;
  repeats: number;
  pairs: number;
  shortestGap: number | null;
  gaps: Map<number, number>;
}

/** Bounded aggregate, not an event history. Integer thresholds retain exact comparisons. */
export class KeyboardChatter {
  private keys = new Map<string, KeyStatistics>();
  private down = new Set<string>();
  private releases = new Map<string, number>();

  record(event: ChatterEvent) {
    if (!event.code || event.code === 'Unidentified' || !Number.isFinite(event.time)) return;
    if (event.type === 'keyup') {
      if (this.down.delete(event.code)) this.releases.set(event.code, event.time);
      return;
    }
    let data = this.keys.get(event.code);
    if (!data) {
      if (this.keys.size >= KEYBOARD_CODE_LIMIT) return;
      data = { presses: 0, repeats: 0, pairs: 0, shortestGap: null, gaps: new Map() };
      this.keys.set(event.code, data);
    }
    if (event.repeat) {
      data.repeats++;
      return;
    }
    if (this.down.has(event.code)) return;
    data.presses++;
    this.down.add(event.code);
    const previous = this.releases.get(event.code);
    this.releases.delete(event.code);
    if (previous === undefined) return;
    const gap = event.time - previous;
    if (gap < 0) return;
    data.pairs++;
    data.shortestGap = data.shortestGap === null ? gap : Math.min(data.shortestGap, gap);
    if (gap <= CHATTER_MAX_THRESHOLD) {
      const bucket = Math.ceil(gap);
      data.gaps.set(bucket, (data.gaps.get(bucket) ?? 0) + 1);
    }
  }

  /** Focus loss/IME/layout changes invalidate pending pairs, but keep observed totals. */
  breakSequence() {
    this.down.clear();
    this.releases.clear();
  }

  /** Independent aggregate checkpoint; no raw keyboard events are retained. */
  clone() {
    const copy = new KeyboardChatter();
    copy.keys = new Map(
      [...this.keys].map(([code, data]) => [code, { ...data, gaps: new Map(data.gaps) }]),
    );
    copy.down = new Set(this.down);
    copy.releases = new Map(this.releases);
    return copy;
  }

  snapshot(threshold: number) {
    const limit = Math.min(CHATTER_MAX_THRESHOLD, Math.max(1, Math.round(threshold) || 1));
    return [...this.keys].map(([code, data]) => ({
      code,
      presses: data.presses,
      repeats: data.repeats,
      pairs: data.pairs,
      shortestGap: data.shortestGap,
      suspicious: [...data.gaps].reduce(
        (total, [gap, count]) => total + (gap <= limit ? count : 0),
        0,
      ),
    }));
  }

  reset() {
    this.keys.clear();
    this.breakSequence();
  }
}
