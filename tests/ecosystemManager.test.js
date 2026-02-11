import test from 'node:test';
import assert from 'node:assert/strict';
import { EcosystemManager } from '../dist/core/EcosystemManager.js';

test('EcosystemManager runs queued lifecycle', () => {
  const manager = new EcosystemManager();
  manager.initialize({ plants: 4, predators: 2, neutrals: 3, seed: 1 });

  const report = manager.update(0.5);
  assert.deepEqual(report.executedTasks, [
    'entities:update',
    'entities:reproduce',
    'entities:cleanup',
    'environment:spawn-energy',
    'system:optimize',
  ]);

  const stats = manager.getStats();
  assert.equal(stats.tick, 1);
  assert.ok(stats.totalEntities > 0);
  assert.equal(stats.queueDepth, 0);
});

test('EcosystemManager add/remove and discovery APIs', () => {
  const manager = new EcosystemManager();
  manager.initialize({ plants: 0, predators: 0, neutrals: 0, seed: 2 });
  manager.addEntityAtPosition({ x: 0, y: 0, z: 0 }, 'plant');
  manager.addEntityAtPosition({ x: 4, y: 0, z: 0 }, 'predator');

  assert.equal(manager.getStats().totalEntities, 2);
  assert.ok(manager.findNearestPrey({ x: 4, y: 0, z: 0 }, 10));

  manager.removeEntityAtPosition({ x: 0, y: 0, z: 0 }, 1);
  assert.equal(manager.getStats().totalEntities, 1);
});
