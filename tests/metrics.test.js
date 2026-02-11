import test from 'node:test';
import assert from 'node:assert/strict';
import { RuntimeMetrics } from '../dist/core/Metrics.js';

test('RuntimeMetrics records and computes aggregates', () => {
  const metrics = new RuntimeMetrics(10);
  metrics.recordStepDuration(4);
  metrics.recordStepDuration(6);
  metrics.recordStepDuration(10);
  metrics.recordDroppedSeconds(0.2);

  const snap = metrics.snapshot();
  assert.equal(snap.totalSteps, 3);
  assert.equal(snap.totalDroppedSeconds, 0.2);
  assert.ok(snap.avgStepMs > 0);
  assert.ok(snap.p95StepMs >= snap.avgStepMs);
});
