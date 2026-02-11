import test from 'node:test';
import assert from 'node:assert/strict';
import { FrameRecorder } from '../dist/core/FrameRecorder.js';

test('FrameRecorder stores and exports frames', () => {
  const recorder = new FrameRecorder(2);
  const frame = {
    tick: 1,
    season: 'spring',
    avgEnergy: 90,
    avgHealth: 95,
    counts: { total: 1, predators: 0, plants: 1, neutrals: 0 },
    entities: [{ id: 'e1', type: 'plant', position: { x: 1, y: 0, z: 2 }, velocity: { x: 0, y: 0, z: 0 }, health: 100, energy: 100, age: 1, generation: 0, traits: { speed: 1, efficiency: 1, resilience: 1 } }],
  };

  recorder.push(frame, 1);
  recorder.push({ ...frame, tick: 2 }, 2);
  recorder.push({ ...frame, tick: 3 }, 3);

  assert.equal(recorder.list().length, 2);
  assert.ok(recorder.exportJSON().includes('frames'));
});
