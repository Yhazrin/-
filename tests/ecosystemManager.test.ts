import { describe, expect, it } from 'vitest';
import { EcosystemManager } from '../src/core/EcosystemManager.js';

describe('EcosystemManager', () => {
  it('initializes entities and updates lifecycle', () => {
    const ecosystem = new EcosystemManager();
    ecosystem.initialize({ plants: 3, predators: 2, neutrals: 1 });

    const before = ecosystem.getStats();
    expect(before.totalEntities).toBe(6);

    for (let i = 0; i < 100; i += 1) ecosystem.update(0.16);

    const after = ecosystem.getStats();
    expect(after.totalEntities).toBeGreaterThan(0);
    expect(after.queueDepth).toBe(0);
    expect(after.avgHealth).toBeGreaterThan(0);
  });

  it('supports add/remove operations', () => {
    const ecosystem = new EcosystemManager();
    ecosystem.initialize({ plants: 0, predators: 0, neutrals: 0 });

    ecosystem.addEntityAtPosition({ x: 0, y: 0, z: 0 }, 'plant');
    ecosystem.addEntityAtPosition({ x: 10, y: 0, z: 10 }, 'predator');
    expect(ecosystem.getStats().totalEntities).toBe(2);

    ecosystem.removeEntityAtPosition({ x: 0, y: 0, z: 0 }, 2);
    expect(ecosystem.getStats().totalEntities).toBe(1);
  });

  it('returns optimization hints for tuning', () => {
    const ecosystem = new EcosystemManager();
    ecosystem.initialize({ plants: 1, predators: 10, neutrals: 0 });
    ecosystem.update(0.16);

    const hints = ecosystem.getOptimizationHints();
    expect(hints.spawnPlantBoost).toBeGreaterThanOrEqual(1);
    expect(hints.predatorEnergyDecayMultiplier).toBeGreaterThanOrEqual(1);
  });
});
