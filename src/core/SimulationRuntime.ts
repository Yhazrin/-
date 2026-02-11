import { EcosystemManager, type EcosystemInit } from './EcosystemManager.js';
import type { TickReport } from './types.js';

export interface RuntimeOptions {
  delta?: number;
  maxSteps?: number;
  stopWhenExtinct?: boolean;
}

export class SimulationRuntime {
  readonly ecosystem: EcosystemManager;
  private running = false;
  private history: TickReport[] = [];

  constructor(ecosystem?: EcosystemManager) {
    this.ecosystem = ecosystem ?? new EcosystemManager();
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
      const report = this.ecosystem.update(delta);
      this.history.push(report);
      if (options.stopWhenExtinct && report.total === 0) {
        this.running = false;
      }
    }

    return this.history;
  }

  stop(): void { this.running = false; }
  getHistory(): TickReport[] { return [...this.history]; }
}
