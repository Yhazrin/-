import type { EcosystemStats } from './EcosystemManager.js';

export interface OptimizationHints {
  spawnPlantBoost: number;
  predatorEnergyDrain: number;
  neutralSocialBias: number;
}

export class EcosystemOptimizer {
  tune(stats: EcosystemStats): OptimizationHints {
    const prey = Math.max(1, stats.plantCount + stats.neutralCount);
    const pressure = stats.predatorCount / prey;

    return {
      spawnPlantBoost: pressure > 0.6 ? 2 : 1,
      predatorEnergyDrain: pressure > 1.0 ? 0.8 : 1,
      neutralSocialBias: stats.totalEntities < 12 ? 1.2 : 1,
    };
  }
}
