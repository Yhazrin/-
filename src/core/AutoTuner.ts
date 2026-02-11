import { SimulationRuntime } from './SimulationRuntime.js';
import { WorkerPoolRunner } from './tuning/WorkerPoolRunner.js';
import { ExperimentTracker } from './tuning/ExperimentTracker.js';
import type { ThreadedWorkerPoolRunner } from './tuning/ThreadedWorkerPoolRunner.js';
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
  threadedPoolFactory?: (candidate: TuningCandidate, config: TuningRunConfig) => ThreadedWorkerPoolRunner<number, SeedOutcome>;
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
  private readonly tracker = new ExperimentTracker();

  async rank(candidates: TuningCandidate[], config: TuningRunConfig): Promise<TuningResult[]> {
    const results: TuningResult[] = [];

    for (const candidate of candidates) {
      const threadedRunner = config.threadedPoolFactory?.(candidate, config);
      const outcomes = threadedRunner
        ? await threadedRunner.run(config.seeds)
        : await new WorkerPoolRunner(config.concurrency ?? 4).run(config.seeds, async (seed) =>
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

      const result: TuningResult = {
        candidate,
        score: total.score / n,
        avgEntities: total.avgEntities / n,
        stability: total.stability / n,
        perfPenalty: total.perfPenalty / n,
      };
      results.push(result);
    }

    const sorted = results.sort((a, b) => b.score - a.score);
    sorted.forEach((res, idx) => {
      this.tracker.add({
        id: `run_${Date.now()}_${idx}`,
        createdAt: Date.now(),
        candidateName: res.candidate.name,
        seed: -1,
        score: res.score,
        details: { avgEntities: res.avgEntities, stability: res.stability, perfPenalty: res.perfPenalty },
      });
    });

    return sorted;
  }

  experiments() {
    return this.tracker.list();
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

  private volatility(series: number[]): number {
    if (series.length < 2) return 0;
    let sum = 0;
    for (let i = 1; i < series.length; i += 1) {
      sum += Math.abs(series[i]! - series[i - 1]!);
    }
    return Math.min(100, sum / (series.length - 1));
  }
}
