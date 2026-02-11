import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulationWorker } from '../dist/core/worker/createSimulationWorker.js';

class Scope {
  constructor() { this.onmessage = null; this.sent = []; }
  postMessage(msg) { this.sent.push(msg); }
}

test('createSimulationWorker binds onmessage and routes protocol', () => {
  const scope = new Scope();
  createSimulationWorker(scope);

  assert.equal(typeof scope.onmessage, 'function');
  scope.onmessage({ data: { type: 'init', payload: {} } });
  scope.onmessage({ data: { type: 'bootstrap', payload: { plants: 1, predators: 1, neutrals: 1, seed: 1 } } });
  scope.onmessage({ data: { type: 'step', payload: { delta: 1 / 30 } } });

  assert.ok(scope.sent.some((m) => m.type === 'inited'));
  assert.ok(scope.sent.some((m) => m.type === 'frame'));
});
