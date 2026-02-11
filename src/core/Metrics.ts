export interface RuntimeMetricsSnapshot {
  totalSteps: number;
  totalDroppedSeconds: number;
  avgStepMs: number;
  p95StepMs: number;
  maxStepMs: number;
}

export class RuntimeMetrics {
  private totalSteps = 0;
  private totalDroppedSeconds = 0;
  private readonly stepDurationsMs: number[] = [];
  private readonly maxSamples: number;

  constructor(maxSamples = 2000) {
    this.maxSamples = maxSamples;
  }

  recordStepDuration(ms: number): void {
    this.totalSteps += 1;
    this.stepDurationsMs.push(ms);
    if (this.stepDurationsMs.length > this.maxSamples) {
      this.stepDurationsMs.splice(0, this.stepDurationsMs.length - this.maxSamples);
    }
  }

  recordDroppedSeconds(seconds: number): void {
    this.totalDroppedSeconds += Math.max(0, seconds);
  }

  snapshot(): RuntimeMetricsSnapshot {
    const sorted = [...this.stepDurationsMs].sort((a, b) => a - b);
    const avg = sorted.length ? sorted.reduce((s, x) => s + x, 0) / sorted.length : 0;
    const p95 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))]! : 0;
    const max = sorted.length ? sorted[sorted.length - 1]! : 0;

    return {
      totalSteps: this.totalSteps,
      totalDroppedSeconds: this.totalDroppedSeconds,
      avgStepMs: avg,
      p95StepMs: p95,
      maxStepMs: max,
    };
  }
}
