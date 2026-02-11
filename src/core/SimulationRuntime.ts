import { EcosystemManager, type EcosystemInit, type EcosystemStats } from './EcosystemManager.js';
import { FixedStepRunner } from './FixedStepRunner.js';
import { RuntimeMetrics, type RuntimeMetricsSnapshot } from './Metrics.js';
import { RenderBridge } from './RenderBridge.js';
import { validateRuntimeConfig, type RuntimeTuningConfig } from './config.js';
import type { TickReport, TimelinePoint } from './types.js';

export interface RuntimeOptions {
  delta?: number;
  maxSteps?: number;
  stopWhenExtinct?: boolean;
}

export interface RuntimeCheckpoint {
  report: TickReport;
  stats: EcosystemStats;
  timelineTail: TimelinePoint[];
  metrics: RuntimeMetricsSnapshot;
}

export class SimulationRuntime {
  readonly ecosystem: EcosystemManager;
  private running = false;
  private history: TickReport[] = [];
  private readonly renderBridge: RenderBridge;
  private readonly config: RuntimeTuningConfig;
  private readonly fixedStepRunner: FixedStepRunner;
  private readonly metrics = new RuntimeMetrics();

  constructor(ecosystem?: EcosystemManager, config?: Partial<RuntimeTuningConfig>) {
    this.ecosystem = ecosystem ?? new EcosystemManager();
    this.config = validateRuntimeConfig(config);
    this.renderBridge = new RenderBridge(this.ecosystem, { strictAdapterIsolation: this.config.strictAdapterIsolation });
    this.fixedStepRunner = new FixedStepRunner(this.config.fixedDelta, this.config.maxCatchUpSteps);
  }

  bootstrap(init?: EcosystemInit): void {
    this.ecosystem.initialize(init);
    this.history = [];
    this.fixedStepRunner.reset();
  }

  run(options: RuntimeOptions = {}): TickReport[] {
    const delta = options.delta ?? this.config.fixedDelta;
    const maxSteps = Math.min(options.maxSteps ?? this.config.maxStepsPerRun, this.config.maxStepsPerRun);
    this.running = true;

    for (let i = 0; i < maxSteps && this.running; i += 1) {
      this.step(delta);
      if (options.stopWhenExtinct && this.history[this.history.length - 1]?.total === 0) {
        this.running = false;
      }
    }

    return this.history;
  }

  ingestRealTime(elapsedSeconds: number): TickReport[] {
    const reports: TickReport[] = [];
    const outcome = this.fixedStepRunner.ingest(elapsedSeconds, (delta) => {
      reports.push(this.step(delta));
    });
    this.metrics.recordDroppedSeconds(outcome.droppedTime);
    return reports;
  }

  step(delta = this.config.fixedDelta): TickReport {
    const start = performance.now();
    const report = this.ecosystem.update(delta);
    this.history.push(report);
    if (this.history.length > this.config.maxHistorySize) {
      this.history.splice(0, this.history.length - this.config.maxHistorySize);
    }

    this.renderBridge.flush();
    const duration = performance.now() - start;
    this.metrics.recordStepDuration(duration);
    return report;
  }

  pause(): void { this.running = false; }
  resume(): void { this.running = true; }
  stop(): void { this.running = false; }

  getHistory(): TickReport[] { return [...this.history]; }

  getMetrics(): RuntimeMetricsSnapshot { return this.metrics.snapshot(); }

  checkpoint(timelineTail = 120): RuntimeCheckpoint {
    const report = this.history[this.history.length - 1] ?? this.ecosystem.update(0);
    return {
      report,
      stats: this.ecosystem.getStats(),
      timelineTail: this.ecosystem.getTimeline(timelineTail),
      metrics: this.metrics.snapshot(),
    };
  }

  getConfig(): RuntimeTuningConfig { return { ...this.config }; }
  getRenderBridge(): RenderBridge { return this.renderBridge; }

  exportCheckpointJSON(timelineTail = 120): string {
    return JSON.stringify(
      {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        config: this.getConfig(),
        checkpoint: this.checkpoint(timelineTail),
      },
      null,
      2,
    );
  }
}
