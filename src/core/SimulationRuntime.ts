import { EcosystemManager } from './EcosystemManager.js';

export interface RuntimeOptions {
  targetFPS?: number;
  maxSteps?: number;
}

export class SimulationRuntime {
  private readonly ecosystem: EcosystemManager;
  private running = false;

  constructor(ecosystem?: EcosystemManager) {
    this.ecosystem = ecosystem ?? new EcosystemManager();
  }

  bootstrap(): EcosystemManager {
    this.ecosystem.initialize();
    return this.ecosystem;
  }

  runSteps(options: RuntimeOptions = {}): void {
    const targetFPS = options.targetFPS ?? 60;
    const maxSteps = options.maxSteps ?? 600;
    const delta = 1 / targetFPS;

    this.running = true;
    for (let i = 0; i < maxSteps && this.running; i += 1) {
      this.ecosystem.update(delta);
    }
  }

  stop(): void {
    this.running = false;
  }
}
