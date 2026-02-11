import test from 'node:test';
import assert from 'node:assert/strict';
import { FixedStepRunner } from '../dist/core/FixedStepRunner.js';

test('FixedStepRunner executes catch-up steps with drop accounting', () => {
  const runner = new FixedStepRunner(0.1, 3);
  let steps = 0;
  const result = runner.ingest(0.55, () => { steps += 1; });

  assert.equal(steps, 3);
  assert.ok(result.droppedTime > 0);
  assert.ok(result.remainingAccumulator < 0.1);
});
