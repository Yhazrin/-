import test from 'node:test';
import assert from 'node:assert/strict';
import { Canvas2DAdapter } from '../dist/webgl/Canvas2DAdapter.js';

class MockCtx {
  constructor() {
    this.canvas = { width: 400, height: 300 };
    this.calls = [];
  }
  clearRect(...args) { this.calls.push(['clearRect', ...args]); }
  fillRect(...args) { this.calls.push(['fillRect', ...args]); }
  beginPath() { this.calls.push(['beginPath']); }
  arc(...args) { this.calls.push(['arc', ...args]); }
  fill() { this.calls.push(['fill']); }
  fillText(...args) { this.calls.push(['fillText', ...args]); }
  set fillStyle(v) { this.calls.push(['fillStyle', v]); }
  set font(v) { this.calls.push(['font', v]); }
}

test('Canvas2DAdapter draws entities and HUD text', () => {
  const ctx = new MockCtx();
  const adapter = new Canvas2DAdapter({ ctx });
  adapter.onFrame({
    tick: 7,
    season: 'spring',
    avgEnergy: 65,
    avgHealth: 80,
    counts: { total: 2, predators: 1, neutrals: 0, plants: 1 },
    entities: [
      { id: 'a', type: 'predator', position: { x: 10, y: 0, z: 10 }, energy: 10, health: 10, age: 1, traits: { speed: 1, efficiency: 1, resilience: 1 } },
      { id: 'b', type: 'plant', position: { x: -10, y: 0, z: -10 }, energy: 10, health: 10, age: 1, traits: { speed: 1, efficiency: 1, resilience: 1 } },
    ],
  });

  assert.ok(ctx.calls.some((c) => c[0] === 'arc'));
  assert.ok(ctx.calls.some((c) => c[0] === 'fillText'));
});
