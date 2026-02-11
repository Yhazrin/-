import test from 'node:test';
import assert from 'node:assert/strict';
import { ProfilingPanelController } from '../dist/ui/ProfilingPanel.js';

test('ProfilingPanelController builds model and invokes renderer', () => {
  let rendered = null;
  const ctrl = new ProfilingPanelController({
    render: (model) => { rendered = model; },
  });

  const model = ctrl.update({
    score: 42,
    status: 'critical',
    bottlenecks: ['simulation_step_p95_high'],
    recommendations: ['reduce cost'],
  });

  assert.equal(model.status, 'critical');
  assert.ok(model.alerts.length >= 1);
  assert.equal(rendered.scoreLabel, 'Score 42/100');
});
