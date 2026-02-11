import test from 'node:test';
import assert from 'node:assert/strict';
import { WorkerPoolRunner } from '../dist/core/tuning/WorkerPoolRunner.js';

test('WorkerPoolRunner processes all tasks', async () => {
  const runner = new WorkerPoolRunner(3);
  const out = await runner.run([1, 2, 3, 4], async (n) => n * 2);
  assert.deepEqual(out.sort((a, b) => a - b), [2, 4, 6, 8]);
});
