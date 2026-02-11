import test from 'node:test';
import assert from 'node:assert/strict';
import { SimulationRuntime } from '../dist/core/SimulationRuntime.js';

test('SimulationRuntime can run long batches deterministically', () => {
  const runtime = new SimulationRuntime();
  runtime.bootstrap({ plants: 8, predators: 4, neutrals: 6, seed: 7 });
  const history = runtime.run({ delta: 1 / 30, maxSteps: 600 });

  assert.equal(history.length, 600);
  assert.ok(history[0].executedTasks.length >= 5);
  assert.ok(history.at(-1).total > 0);
});
