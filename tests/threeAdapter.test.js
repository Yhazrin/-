import test from 'node:test';
import assert from 'node:assert/strict';
import { ThreeAdapter } from '../dist/webgl/ThreeAdapter.js';

const entity = (id, type) => ({
  id,
  type,
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  health: 100,
  energy: 100,
  age: 1,
  generation: 0,
  traits: { speed: 1, efficiency: 1, resilience: 1 },
});

test('ThreeAdapter splits entities by type and finalizes counts', () => {
  const calls = { p: 0, n: 0, pl: 0, stats: 0 };
  const counts = { p: -1, n: -1, pl: -1 };

  const mk = (k) => ({ setInstance: () => { calls[k] += 1; }, finalize: (c) => { counts[k] = c; } });
  const adapter = new ThreeAdapter({
    targets: { predator: mk('p'), neutral: mk('n'), plant: mk('pl') },
    onFrameStats: () => { calls.stats += 1; },
  });

  adapter.onFrame({
    tick: 1,
    season: 'spring',
    avgEnergy: 90,
    avgHealth: 95,
    counts: { total: 4, predators: 1, neutrals: 2, plants: 1 },
    entities: [entity('1', 'predator'), entity('2', 'neutral'), entity('3', 'neutral'), entity('4', 'plant')],
  });

  assert.equal(calls.p, 1);
  assert.equal(calls.n, 2);
  assert.equal(calls.pl, 1);
  assert.equal(counts.p, 1);
  assert.equal(counts.n, 2);
  assert.equal(counts.pl, 1);
  assert.equal(calls.stats, 1);
});
