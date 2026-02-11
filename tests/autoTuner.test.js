import test from 'node:test';
import assert from 'node:assert/strict';
import { AutoTuner } from '../dist/core/AutoTuner.js';

test('AutoTuner ranks candidates', async () => {
  const tuner = new AutoTuner();
  const results = await tuner.rank([
    { name: 'safe', runtimeConfig: { fixedDelta: 1 / 30, maxCatchUpSteps: 6 } },
    { name: 'aggressive', runtimeConfig: { fixedDelta: 1 / 20, maxCatchUpSteps: 2 } },
  ], {
    seeds: [1, 2],
    steps: 100,
    delta: 1 / 30,
    concurrency: 2,
  });

  assert.equal(results.length, 2);
  assert.ok(results[0].score >= results[1].score);
  assert.ok(tuner.experiments().length >= 2);
});
