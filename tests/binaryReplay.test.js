import test from 'node:test';
import assert from 'node:assert/strict';
import { BinaryReplayCodec } from '../dist/core/replay/BinaryReplay.js';

test('BinaryReplayCodec encodes and decodes frames', () => {
  const codec = new BinaryReplayCodec();
  const frames = [{
    t: 1,
    tick: 3,
    counts: { total: 2, predators: 1, plants: 1, neutrals: 0 },
    season: 'summer',
    entities: [
      { id: 'e1', type: 'predator', x: 1, y: 0, z: 2, e: 90, h: 80 },
      { id: 'e2', type: 'plant', x: 2, y: 0, z: 3, e: 95, h: 100 },
    ],
  }];

  const binary = codec.encode(frames);
  const decoded = codec.decode(binary);

  assert.equal(decoded.length, 1);
  assert.equal(decoded[0].tick, 3);
  assert.equal(decoded[0].season, 'summer');
  assert.equal(decoded[0].entities.length, 2);
});
