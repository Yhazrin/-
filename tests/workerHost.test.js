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
  let resizedWidth = 0;
  const host = new SimulationWorkerHost(worker, {
    onFrame: (f) => { frameTick = f.tick; },
    onCheckpoint: (c) => { checkpointTick = c.report.tick; },
    onResized: (size) => { resizedWidth = size.width; },
  });

  host.init({});
  host.bootstrap({ plants: 1, predators: 1, neutrals: 1, seed: 1 });
  host.resize(640, 360);
  host.step(1 / 30);

  assert.equal(worker.sent.length, 4);

  worker.onmessage({ data: { type: 'frame', payload: { tick: 9, season: 'spring', avgEnergy: 80, avgHealth: 90, counts: { total: 1, predators: 0, plants: 1, neutrals: 0 }, entities: [] } } });
  worker.onmessage({ data: { type: 'checkpoint', payload: { report: { tick: 7 }, stats: {}, timelineTail: [], metrics: {} } } });
  worker.onmessage({ data: { type: 'resized', payload: { width: 640, height: 360 } } });

  assert.equal(frameTick, 9);
  assert.equal(checkpointTick, 7);
  assert.equal(resizedWidth, 640);
});
