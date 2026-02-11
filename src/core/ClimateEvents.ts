import type { EcosystemStats } from './EcosystemManager.js';

export type ClimateEventType = 'none' | 'drought' | 'storm' | 'bloom';

export interface ClimateEvent {
  type: ClimateEventType;
  intensity: number;
}

export class ClimateEventEngine {
  private tick = 0;

  next(stats: EcosystemStats): ClimateEvent {
    this.tick += 1;
    if (this.tick % 180 !== 0) return { type: 'none', intensity: 0 };

    const pressure = stats.predatorCount / Math.max(1, stats.plantCount + stats.neutralCount);
    if (pressure > 0.8) return { type: 'bloom', intensity: Math.min(2, pressure) };
    if (stats.plantCount > stats.predatorCount * 2) return { type: 'storm', intensity: 1 };
    return { type: 'drought', intensity: 1 };
  }
}
