import test from 'node:test';
import assert from 'node:assert/strict';
import { DistanceCuller } from '../dist/webgl/Culling.js';

test('DistanceCuller filters far entities and reports stats', () => {
  const culler = new DistanceCuller({ x: 0, y: 0, z: 0 }, 5);
  const input = [
    { id: 'a', type: 'plant', position: { x: 1, y: 0, z: 1 }, velocity: { x: 0, y: 0, z: 0 }, health: 100, energy: 100, age: 1, generation: 0, traits: { speed: 1, efficiency: 1, resilience: 1 } },
    { id: 'b', type: 'neutral', position: { x: 10, y: 0, z: 10 }, velocity: { x: 0, y: 0, z: 0 }, health: 100, energy: 100, age: 1, generation: 0, traits: { speed: 1, efficiency: 1, resilience: 1 } },
  ];

  const visible = culler.filter(input);
  assert.equal(visible.length, 1);
  assert.ok(culler.stats().cullRatio > 0);
});
