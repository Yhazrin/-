export interface FixedStepResult {
  executedSteps: number;
  droppedTime: number;
  remainingAccumulator: number;
}

export class FixedStepRunner {
  private accumulator = 0;

  constructor(private readonly fixedDelta: number, private readonly maxCatchUpSteps: number) {}

  ingest(elapsedSeconds: number, step: (delta: number) => void): FixedStepResult {
    this.accumulator += elapsedSeconds;
    let executed = 0;

    while (this.accumulator >= this.fixedDelta && executed < this.maxCatchUpSteps) {
      step(this.fixedDelta);
      this.accumulator -= this.fixedDelta;
      executed += 1;
    }

    let droppedTime = 0;
    if (this.accumulator >= this.fixedDelta) {
      droppedTime = this.accumulator - (this.accumulator % this.fixedDelta);
      this.accumulator = this.accumulator % this.fixedDelta;
    }

    return { executedSteps: executed, droppedTime, remainingAccumulator: this.accumulator };
  }

  reset(): void {
    this.accumulator = 0;
  }
}
