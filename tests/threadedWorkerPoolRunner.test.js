import test from 'node:test';
import assert from 'node:assert/strict';
import { ThreadedWorkerPoolRunner } from '../dist/core/tuning/ThreadedWorkerPoolRunner.js';

test('ThreadedWorkerPoolRunner uses worker factory and terminates workers', async () => {
  const terminated = [];
  const runner = new ThreadedWorkerPoolRunner({
    create: async (workerId) => ({
      run: async (value) => value + workerId,
      terminate: async () => { terminated.push(workerId); },
    }),
  }, 2);

  const out = await runner.run([10, 20, 30]);
  assert.equal(out.length, 3);
  assert.equal(terminated.length, 2);
});
