import test from 'node:test';
import assert from 'node:assert/strict';
import { SpatialGrid } from '../dist/core/SpatialGrid.js';

const fake = (id, x, z) => ({ id, position: { x, y: 0, z } });

test('SpatialGrid returns nearby buckets', () => {
  const grid = new SpatialGrid(5);
  const entities = [fake('a', 0, 0), fake('b', 3, 3), fake('c', 20, 20)];
  grid.rebuild(entities);

  const nearby = grid.nearby({ x: 0, y: 0, z: 0 }, 6);
  assert.equal(nearby.some((x) => x.id === 'a'), true);
  assert.equal(nearby.some((x) => x.id === 'b'), true);
  assert.equal(nearby.some((x) => x.id === 'c'), false);
});
