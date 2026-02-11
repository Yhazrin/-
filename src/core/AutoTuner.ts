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
  concurrency?: number;
}

export interface TuningResult {
  candidate: TuningCandidate;
  score: number;
  avgEntities: number;
  stability: number;
  perfPenalty: number;
}

interface SeedOutcome {
  score: number;
  avgEntities: number;
  stability: number;
  perfPenalty: number;
}

export class AutoTuner {
  async rank(candidates: TuningCandidate[], config: TuningRunConfig): Promise<TuningResult[]> {
    const results: TuningResult[] = [];

    for (const candidate of candidates) {
      const outcomes = await this.runByConcurrency(config.seeds, config.concurrency ?? 4, async (seed) =>
        this.evaluateCandidateSeed(candidate, seed, config),
      );

      const n = outcomes.length || 1;
      const total = outcomes.reduce(
        (acc, o) => ({
          score: acc.score + o.score,
          avgEntities: acc.avgEntities + o.avgEntities,
          stability: acc.stability + o.stability,
          perfPenalty: acc.perfPenalty + o.perfPenalty,
        }),
        { score: 0, avgEntities: 0, stability: 0, perfPenalty: 0 },
      );

      results.push({
        candidate,
        score: total.score / n,
        avgEntities: total.avgEntities / n,
        stability: total.stability / n,
        perfPenalty: total.perfPenalty / n,
      });
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private async evaluateCandidateSeed(candidate: TuningCandidate, seed: number, config: TuningRunConfig): Promise<SeedOutcome> {
    const rt = new SimulationRuntime(undefined, candidate.runtimeConfig);
    rt.bootstrap({ plants: 8, predators: 4, neutrals: 6, seed });
    rt.run({ delta: config.delta, maxSteps: config.steps });

    const history = rt.getHistory();
    const metrics = rt.getMetrics();
    const last = history[history.length - 1]!;
    const avgEntities = history.reduce((s, h) => s + h.total, 0) / history.length;
    const volatility = this.volatility(history.map((h) => h.total));
    const perfPenalty = metrics.p95StepMs * 0.2 + metrics.totalDroppedSeconds * 5;

    let score = avgEntities * 0.5 + (100 - volatility) * 0.3 + (100 - perfPenalty) * 0.2;
    if (last.total <= 0) score -= 30;

    return { score, avgEntities, stability: 100 - volatility, perfPenalty };
  }

  private async runByConcurrency<T, R>(items: T[], concurrency: number, task: (item: T) => Promise<R>): Promise<R[]> {
    const safeConcurrency = Math.max(1, concurrency);
    const out: R[] = [];
    let cursor = 0;

    const worker = async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        out[index] = await task(items[index]!);
      }
    };

    await Promise.all(Array.from({ length: Math.min(safeConcurrency, items.length) }, () => worker()));
    return out;
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
