import type { RuntimeMetricsSnapshot } from './Metrics.js';
import type { CullingStats } from '../webgl/Culling.js';

export interface ProfilingInput {
  runtime: RuntimeMetricsSnapshot;
  culling?: CullingStats;
  eventRatePerSec?: number;
  replayFrameCount?: number;
}

export interface ProfilingSnapshot {
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  bottlenecks: string[];
  recommendations: string[];
}

export class ProfilingDashboard {
  evaluate(input: ProfilingInput): ProfilingSnapshot {
    let score = 100;
    const bottlenecks: string[] = [];
    const recommendations: string[] = [];

    if (input.runtime.p95StepMs > 16) {
      score -= 20;
      bottlenecks.push('simulation_step_p95_high');
      recommendations.push('move simulation into Worker and reduce per-tick entity updates');
    }

    if (input.runtime.totalDroppedSeconds > 1) {
      score -= 10;
      bottlenecks.push('dropped_time_detected');
      recommendations.push('increase maxCatchUpSteps or reduce render workload');
    }

    if (input.culling && input.culling.cullRatio < 0.1) {
      score -= 8;
      bottlenecks.push('culling_not_effective');
      recommendations.push('tighten frustum/distance culling or apply LOD');
    }

    if ((input.eventRatePerSec ?? 0) > 1000) {
      score -= 10;
      bottlenecks.push('event_rate_too_high');
      recommendations.push('batch events before UI emission');
    }

    if ((input.replayFrameCount ?? 0) > 200000) {
      score -= 12;
      bottlenecks.push('replay_memory_pressure');
      recommendations.push('switch to binary replay chunks with streaming flush');
    }

    score = Math.max(0, score);
    const status = score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'warning' : 'critical';
    return { score, status, bottlenecks, recommendations };
  }
}
