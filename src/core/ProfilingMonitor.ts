import type { RuntimeMetricsSnapshot } from './Metrics.js';
import type { CullingStats } from '../webgl/Culling.js';

export interface ProfilingSample {
  t: number;
  runtime: RuntimeMetricsSnapshot;
  culling?: CullingStats;
  eventRatePerSec?: number;
  replayFrameCount?: number;
}

export interface ProfilingTrend {
  avgP95StepMs: number;
  maxP95StepMs: number;
  avgCullRatio: number;
  avgEventRate: number;
  totalDroppedSeconds: number;
}

export class ProfilingMonitor {
  private readonly samples: ProfilingSample[] = [];

  constructor(private readonly maxSamples = 1200) {}

  push(sample: ProfilingSample): void {
    this.samples.push(sample);
    if (this.samples.length > this.maxSamples) {
      this.samples.splice(0, this.samples.length - this.maxSamples);
    }
  }

  list(): ProfilingSample[] {
    return [...this.samples];
  }

  trend(windowSize = 120): ProfilingTrend {
    const segment = this.samples.slice(-windowSize);
    if (segment.length === 0) {
      return { avgP95StepMs: 0, maxP95StepMs: 0, avgCullRatio: 0, avgEventRate: 0, totalDroppedSeconds: 0 };
    }

    const avg = (arr: number[]) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0);

    const p95s = segment.map((s) => s.runtime.p95StepMs);
    const culls = segment.map((s) => s.culling?.cullRatio ?? 0);
    const events = segment.map((s) => s.eventRatePerSec ?? 0);

    return {
      avgP95StepMs: avg(p95s),
      maxP95StepMs: Math.max(...p95s),
      avgCullRatio: avg(culls),
      avgEventRate: avg(events),
      totalDroppedSeconds: segment[segment.length - 1]!.runtime.totalDroppedSeconds - segment[0]!.runtime.totalDroppedSeconds,
    };
  }

  toChartSeries(windowSize = 240): { t: number; p95: number; cullRatio: number; eventRate: number }[] {
    return this.samples.slice(-windowSize).map((s) => ({
      t: s.t,
      p95: s.runtime.p95StepMs,
      cullRatio: s.culling?.cullRatio ?? 0,
      eventRate: s.eventRatePerSec ?? 0,
    }));
  }
}
