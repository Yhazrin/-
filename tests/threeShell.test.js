import test from 'node:test';
import assert from 'node:assert/strict';
import { ThreeShell } from '../dist/webgl/ThreeShell.js';

const makeTarget = () => ({
  begin: () => {},
  write: () => {},
  end: () => {},
});

class MockWorker {
  constructor() { this.onmessage = null; this.sent = []; }
  postMessage(message) { this.sent.push(message); }
}

test('ThreeShell worker mode initializes canvas and sends resize/step', () => {
  const worker = new MockWorker();
  const canvas = { width: 100, height: 80 };
  const shell = new ThreeShell({
    useWorker: true,
    worker,
    canvas,
    targets: { predator: makeTarget(), neutral: makeTarget(), plant: makeTarget() },
  });

  shell.bootstrap();
  shell.resize(300, 200);
  shell.step();

  assert.equal(canvas.width, 300);
  assert.equal(canvas.height, 200);
  assert.ok(worker.sent.some((m) => m.type === 'init'));
  assert.ok(worker.sent.some((m) => m.type === 'resize'));
  assert.ok(worker.sent.some((m) => m.type === 'step'));
});
