import type { EnvironmentState } from './Environment.js';
import type { SeededRandom } from './Random.js';
import type { EcosystemManager } from './EcosystemManager.js';

export interface SimulationContext {
  manager: EcosystemManager;
  random: SeededRandom;
  environment: EnvironmentState;
  delta: number;
}

export interface TickReport {
  tick: number;
  executedTasks: string[];
  born: number;
  died: number;
  total: number;
}
