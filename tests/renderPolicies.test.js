import test from 'node:test';
import assert from 'node:assert/strict';
import { colorPolicy, matrixPolicy, mapEnvironmentToUniforms } from '../dist/webgl/RenderPolicies.js';

const entity = {
  id: 'e', type: 'predator', position: { x: 1, y: 2, z: 3 }, velocity: { x: 0, y: 0, z: 0 },
  health: 80, energy: 70, age: 1, generation: 0, traits: { speed: 1, efficiency: 1, resilience: 1 },
};

test('render policies output expected structures', () => {
  const c = colorPolicy(entity);
  const m = matrixPolicy(entity);
  const u = mapEnvironmentToUniforms({ season: 'winter', lightIntensity: 0.5, plantGrowthMultiplier: 0.8, predatorDrainMultiplier: 1.2 });

  assert.ok(c.r >= 0 && c.r <= 1);
  assert.equal(m.length, 16);
  assert.equal(u.uSeason, 3);
});
