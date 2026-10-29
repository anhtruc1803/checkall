export class PointerSampler {
  timestamps: number[] = [];
  rejected = 0;
  coalesced = false;
  add(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return;
    let batch: PointerEvent[] = [];
    try {
      batch = event.getCoalescedEvents?.() ?? [];
    } catch {
      /* Browser may restrict coalesced events; ordinary event is still available. */
    }
    if (batch.length) this.coalesced = true;
    for (const sample of batch.length ? batch : [event]) {
      const value = sample.timeStamp;
      const previous = this.timestamps.at(-1);
      if (!Number.isFinite(value) || value < 0 || (previous !== undefined && value <= previous)) {
        this.rejected++;
        continue;
      }
      this.timestamps.push(value);
    }
    if (this.timestamps.length > 100000) this.timestamps.splice(0, this.timestamps.length - 100000);
  }
  reset() {
    this.timestamps = [];
    this.rejected = 0;
    this.coalesced = false;
  }
}
