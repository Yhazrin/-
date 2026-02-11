import { EcosystemManager, type EcosystemInit, type EcosystemStats } from './EcosystemManager.js';
import { RenderBridge } from './RenderBridge.js';
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
}

export class SimulationRuntime {
  readonly ecosystem: EcosystemManager;
  private running = false;
  private history: TickReport[] = [];
  private readonly renderBridge: RenderBridge;

  constructor(ecosystem?: EcosystemManager) {
    this.ecosystem = ecosystem ?? new EcosystemManager();
    this.renderBridge = new RenderBridge(this.ecosystem);
  }

  bootstrap(init?: EcosystemInit): void {
    this.ecosystem.initialize(init);
    this.history = [];
  }

  run(options: RuntimeOptions = {}): TickReport[] {
    const delta = options.delta ?? 1 / 30;
    const maxSteps = options.maxSteps ?? 10_000;
    this.running = true;

    for (let i = 0; i < maxSteps && this.running; i += 1) {
      this.step(delta);
      if (options.stopWhenExtinct && this.history[this.history.length - 1]?.total === 0) {
        this.running = false;
      }
    }

    return this.history;
  }

  step(delta = 1 / 30): TickReport {
    const report = this.ecosystem.update(delta);
    this.history.push(report);
    this.renderBridge.flush();
    return report;
  }

  pause(): void { this.running = false; }
  resume(): void { this.running = true; }
  stop(): void { this.running = false; }

  getHistory(): TickReport[] { return [...this.history]; }

  checkpoint(timelineTail = 120): RuntimeCheckpoint {
    const report = this.history[this.history.length - 1] ?? this.ecosystem.update(0);
    return {
      report,
      stats: this.ecosystem.getStats(),
      timelineTail: this.ecosystem.getTimeline(timelineTail),
    };
  }


  getRenderBridge(): RenderBridge { return this.renderBridge; }

  exportCheckpointJSON(timelineTail = 120): string {
    return JSON.stringify(
      {
        version: '0.3.0',
        createdAt: new Date().toISOString(),
        checkpoint: this.checkpoint(timelineTail),
      },
      null,
      2,
    );
  }
}
