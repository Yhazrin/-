import { SimulationRuntime } from './SimulationRuntime.js';
import type { RuntimeTuningConfig } from './config.js';

export interface TuningCandidate {
  name: string;
  runtimeConfig: Partial<RuntimeTuningConfig>;
}

export interface TuningRunConfig {
  seeds: number[];
  steps: number;
  delta?: number;
}

export interface TuningResult {
  candidate: TuningCandidate;
  score: number;
  avgEntities: number;
  stability: number;
  perfPenalty: number;
}

export class AutoTuner {
  async rank(candidates: TuningCandidate[], config: TuningRunConfig): Promise<TuningResult[]> {
    const results: TuningResult[] = [];

    for (const candidate of candidates) {
      let totalScore = 0;
      let totalEntities = 0;
      let totalStability = 0;
      let totalPerfPenalty = 0;

      for (const seed of config.seeds) {
        const rt = new SimulationRuntime(undefined, candidate.runtimeConfig);
        rt.bootstrap({ plants: 8, predators: 4, neutrals: 6, seed });
        rt.run({ delta: config.delta, maxSteps: config.steps });

        const history = rt.getHistory();
        const metrics = rt.getMetrics();
        const last = history[history.length - 1]!;
        const avgEntities = history.reduce((s, h) => s + h.total, 0) / history.length;
        const volatility = this.volatility(history.map((h) => h.total));
        const perfPenalty = metrics.p95StepMs * 0.2 + metrics.totalDroppedSeconds * 5;

        const score = avgEntities * 0.5 + (100 - volatility) * 0.3 + (100 - perfPenalty) * 0.2;
        totalScore += score;
        totalEntities += avgEntities;
        totalStability += 100 - volatility;
        totalPerfPenalty += perfPenalty;

        if (last.total <= 0) totalScore -= 30;
      }

      const n = config.seeds.length;
      results.push({
        candidate,
        score: totalScore / n,
        avgEntities: totalEntities / n,
        stability: totalStability / n,
        perfPenalty: totalPerfPenalty / n,
      });
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private volatility(series: number[]): number {
    if (series.length < 2) return 0;
    let sum = 0;
    for (let i = 1; i < series.length; i += 1) {
      sum += Math.abs(series[i]! - series[i - 1]!);
    }
    return Math.min(100, sum / (series.length - 1));
  }
}
