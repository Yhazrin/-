import test from 'node:test';
import assert from 'node:assert/strict';
import { ThreeInstancedTarget } from '../dist/webgl/ThreeInstancedTarget.js';

test('ThreeInstancedTarget writes matrix/color and marks updates', () => {
  const matrices = [];
  const colors = [];
  const mesh = {
    count: 0,
    setMatrixAt: (i, m) => { matrices[i] = m; },
    setColorAt: (i, c) => { colors[i] = c; },
    instanceMatrix: { needsUpdate: false },
    instanceColor: { needsUpdate: false },
  };

  const target = new ThreeInstancedTarget({
    mesh,
    matrixFor: () => [1, 0, 0, 0],
    colorFor: () => ({ r: 1, g: 0, b: 0 }),
  });

  target.setInstance(0, {
    id: 'e1',
    type: 'plant',
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    health: 100,
    energy: 100,
    age: 0,
    generation: 0,
    traits: { speed: 1, efficiency: 1, resilience: 1 },
  });
  target.finalize(1);

  assert.deepEqual(matrices[0], [1, 0, 0, 0]);
  assert.deepEqual(colors[0], { r: 1, g: 0, b: 0 });
  assert.equal(mesh.count, 1);
  assert.equal(mesh.instanceMatrix.needsUpdate, true);
  assert.equal(mesh.instanceColor.needsUpdate, true);
});
