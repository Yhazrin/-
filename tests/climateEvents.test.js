import test from 'node:test';
import assert from 'node:assert/strict';
import { ClimateEventEngine } from '../dist/core/ClimateEvents.js';

test('ClimateEventEngine emits periodic events', () => {
  const engine = new ClimateEventEngine();
  let last = { type: 'none', intensity: 0 };
  for (let i = 0; i < 180; i += 1) {
    last = engine.next({ tick: i, totalEntities: 10, predatorCount: 3, plantCount: 3, neutralCount: 4, avgGeneration: 0, avgHealth: 80, avgEnergy: 75, season: 'spring', queueDepth: 0 });
  }
  assert.notEqual(last.type, 'none');
});
