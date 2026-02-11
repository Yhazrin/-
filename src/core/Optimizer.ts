import type { EcosystemStats } from './EcosystemManager.js';

export interface OptimizationHints {
  spawnPlantBoost: number;
  predatorEnergyDecayMultiplier: number;
  neutralCuriosityBoost: number;
}

export class EcosystemOptimizer {
  tune(stats: EcosystemStats): OptimizationHints {
    const predatorPressure = stats.predatorCount === 0 ? 0 : stats.predatorCount / Math.max(stats.plantCount + stats.neutralCount, 1);

    return {
      spawnPlantBoost: predatorPressure > 0.7 ? 2 : 1,
      predatorEnergyDecayMultiplier: predatorPressure > 1 ? 1.25 : 1,
      neutralCuriosityBoost: stats.totalEntities < 12 ? 1.2 : 1,
    };
  }
}
