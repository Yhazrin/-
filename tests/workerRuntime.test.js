import test from 'node:test';
import assert from 'node:assert/strict';
import { SimulationWorkerRuntime } from '../dist/core/worker/SimulationWorkerRuntime.js';

class Port {
  constructor() { this.messages = []; }
  postMessage(message) { this.messages.push(message); }
}

test('SimulationWorkerRuntime handles protocol lifecycle', () => {
  const port = new Port();
  const runtime = new SimulationWorkerRuntime(port);

  runtime.handle({ type: 'init', payload: {} });
  runtime.handle({ type: 'bootstrap', payload: { plants: 1, predators: 1, neutrals: 1, seed: 1 } });
  runtime.handle({ type: 'step', payload: { delta: 1 / 30 } });
  runtime.handle({ type: 'checkpoint', payload: { timelineTail: 5 } });

  assert.ok(port.messages.some((m) => m.type === 'inited'));
  assert.ok(port.messages.some((m) => m.type === 'frame'));
  assert.ok(port.messages.some((m) => m.type === 'checkpoint'));
});
