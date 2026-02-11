import test from 'node:test';
import assert from 'node:assert/strict';
import { EcosystemManager } from '../dist/core/EcosystemManager.js';
import { RenderBridge } from '../dist/core/RenderBridge.js';

test('RenderBridge flush pushes frame to adapters', () => {
  const eco = new EcosystemManager();
  eco.initialize({ plants: 2, predators: 1, neutrals: 1, seed: 11 });
  eco.update(1 / 30);

  const bridge = new RenderBridge(eco);
  let received = null;
  const off = bridge.register({ onFrame: (frame) => { received = frame; } });

  const frame = bridge.flush();
  assert.equal(frame.tick, 1);
  assert.ok(frame.entities.length > 0);
  assert.ok(received);
  assert.equal(received.tick, frame.tick);
  assert.equal(bridge.stats().totalFlushes, 1);

  off();
  bridge.clear();
});

test('RenderBridge isolates adapter errors by default', () => {
  const eco = new EcosystemManager();
  eco.initialize({ plants: 1, predators: 1, neutrals: 1, seed: 1 });
  eco.update(1 / 30);

  let called = false;
  const bridge = new RenderBridge(eco);
  bridge.register({ onFrame: () => { throw new Error('boom'); } });
  bridge.register({ onFrame: () => { called = true; } });

  bridge.flush();
  assert.equal(called, true);
  assert.equal(bridge.stats().totalAdapterErrors, 1);
});
