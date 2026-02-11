import test from 'node:test';
import assert from 'node:assert/strict';
import { SimulationRuntime } from '../dist/core/SimulationRuntime.js';

test('SimulationRuntime can run long batches and checkpoint', () => {
  const runtime = new SimulationRuntime();
  runtime.bootstrap({ plants: 8, predators: 4, neutrals: 6, seed: 7 });
  const history = runtime.run({ delta: 1 / 30, maxSteps: 600 });

  assert.equal(history.length, 600);
  assert.ok(history[0].executedTasks.length >= 7);
  assert.ok(history.at(-1).total > 0);

  const checkpoint = runtime.checkpoint(20);
  assert.equal(checkpoint.timelineTail.length <= 20, true);
  assert.equal(checkpoint.report.tick, history.at(-1).tick);

  const exported = runtime.exportCheckpointJSON(10);
  assert.ok(exported.includes('checkpoint'));
});

test('SimulationRuntime step and pause control', () => {
  const runtime = new SimulationRuntime();
  runtime.bootstrap({ plants: 2, predators: 1, neutrals: 1, seed: 3 });

  const r1 = runtime.step(1 / 20);
  runtime.pause();
  const r2 = runtime.step(1 / 20);

  assert.equal(runtime.getHistory().length, 2);
  assert.ok(r2.tick > r1.tick);
});
