import test from 'node:test';
import assert from 'node:assert/strict';
import { SimulationWorkerHost } from '../dist/core/worker/SimulationWorkerHost.js';

class MockWorker {
  constructor() {
    this.onmessage = null;
    this.sent = [];
  }
  postMessage(message) {
    this.sent.push(message);
  }
}

test('SimulationWorkerHost sends commands and receives frame/checkpoint', () => {
  const worker = new MockWorker();
  let frameTick = 0;
  let checkpointTick = 0;
  const host = new SimulationWorkerHost(worker, {
    onFrame: (f) => { frameTick = f.tick; },
    onCheckpoint: (c) => { checkpointTick = c.report.tick; },
  });

  host.init({});
  host.bootstrap({ plants: 1, predators: 1, neutrals: 1, seed: 1 });
  host.step(1 / 30);

  assert.equal(worker.sent.length, 3);

  worker.onmessage({ data: { type: 'frame', payload: { tick: 9, season: 'spring', avgEnergy: 80, avgHealth: 90, counts: { total: 1, predators: 0, plants: 1, neutrals: 0 }, entities: [] } } });
  worker.onmessage({ data: { type: 'checkpoint', payload: { report: { tick: 7 }, stats: {}, timelineTail: [], metrics: {} } } });

  assert.equal(frameTick, 9);
  assert.equal(checkpointTick, 7);
});
