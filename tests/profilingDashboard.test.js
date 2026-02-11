import test from 'node:test';
import assert from 'node:assert/strict';
import { ProfilingDashboard } from '../dist/core/ProfilingDashboard.js';

test('ProfilingDashboard evaluates bottlenecks', () => {
  const d = new ProfilingDashboard();
  const result = d.evaluate({
    runtime: { totalSteps: 100, totalDroppedSeconds: 2, avgStepMs: 10, p95StepMs: 22, maxStepMs: 40 },
    culling: { totalSeen: 1000, totalCulled: 20, totalVisible: 980, cullRatio: 0.02 },
    eventRatePerSec: 1200,
    replayFrameCount: 300000,
  });

  assert.ok(result.score < 80);
  assert.ok(result.bottlenecks.length > 0);
});
