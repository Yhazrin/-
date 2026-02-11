import { describe, expect, it } from 'vitest';
import { SimulationRuntime } from '../src/core/SimulationRuntime.js';

describe('SimulationRuntime', () => {
  it('runs bounded steps', () => {
    const runtime = new SimulationRuntime();
    const eco = runtime.bootstrap();
    runtime.runSteps({ maxSteps: 30, targetFPS: 30 });
    const stats = eco.getStats();

    expect(stats.totalEntities).toBeGreaterThan(0);
  });
});
