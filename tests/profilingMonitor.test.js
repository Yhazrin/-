import test from 'node:test';
import assert from 'node:assert/strict';
import { ProfilingMonitor } from '../dist/core/ProfilingMonitor.js';

test('ProfilingMonitor aggregates trends and chart series', () => {
  const m = new ProfilingMonitor(10);
  m.push({ t: 1, runtime: { totalSteps: 1, totalDroppedSeconds: 0, avgStepMs: 5, p95StepMs: 8, maxStepMs: 8 }, culling: { totalSeen: 10, totalCulled: 2, totalVisible: 8, cullRatio: 0.2 }, eventRatePerSec: 10 });
  m.push({ t: 2, runtime: { totalSteps: 2, totalDroppedSeconds: 0.4, avgStepMs: 6, p95StepMs: 10, maxStepMs: 12 }, culling: { totalSeen: 20, totalCulled: 6, totalVisible: 14, cullRatio: 0.3 }, eventRatePerSec: 12 });

  const trend = m.trend(5);
  assert.ok(trend.avgP95StepMs > 0);
  assert.ok(trend.maxP95StepMs >= trend.avgP95StepMs);
  assert.ok(trend.avgCullRatio > 0);

  const series = m.toChartSeries();
  assert.equal(series.length, 2);
  assert.equal(series[1].p95, 10);
});
