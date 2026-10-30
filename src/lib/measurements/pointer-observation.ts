export interface PointerObservation {
  type: string;
  x: number;
  y: number;
  pressure: number;
  width: number;
  height: number;
  buttons: number;
}
export class PointerObservationModel {
  last: PointerObservation | null = null;
  count = 0;
  readonly pressed = new Set<number>();
  record(observation: PointerObservation) {
    if (
      ![
        observation.x,
        observation.y,
        observation.pressure,
        observation.width,
        observation.height,
      ].every(Number.isFinite)
    )
      return;
    this.last = observation;
    this.count++;
  }
  press(id: number) {
    if (this.pressed.size < 32) this.pressed.add(id);
  }
  release(id: number) {
    this.pressed.delete(id);
  }
}
