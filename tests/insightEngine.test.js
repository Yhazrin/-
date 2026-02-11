import test from 'node:test';
import assert from 'node:assert/strict';
import { InsightEngine } from '../dist/core/InsightEngine.js';

test('InsightEngine returns at least one insight', () => {
  const engine = new InsightEngine();
  const insights = engine.analyze(
    { tick: 10, executedTasks: [], born: 1, died: 0, total: 20, season: 'summer', avgEnergy: 25, climateEvent: 'drought' },
    [
      { tick: 1, total: 40, predators: 3, plants: 20, neutrals: 17, avgEnergy: 80, avgHealth: 90, season: 'spring' },
      { tick: 20, total: 20, predators: 4, plants: 8, neutrals: 8, avgEnergy: 30, avgHealth: 70, season: 'summer' },
    ],
  );

  assert.ok(insights.length > 0);
});
