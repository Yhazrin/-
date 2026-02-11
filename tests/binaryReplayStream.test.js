import test from 'node:test';
import assert from 'node:assert/strict';
import { BinaryReplayStream } from '../dist/core/replay/BinaryReplayStream.js';

test('BinaryReplayStream chunk encodes and decodes', () => {
  const stream = new BinaryReplayStream();
  const frames = Array.from({ length: 7 }, (_, i) => ({
    t: i,
    tick: i + 1,
    counts: { total: 1, predators: 0, plants: 1, neutrals: 0 },
    season: 'spring',
    entities: [{ id: `e${i}`, type: 'plant', x: i, y: 0, z: i, e: 90, h: 100 }],
  }));

  const chunks = stream.encodeChunks(frames, 3);
  assert.equal(chunks.length, 3);

  const restored = stream.decodeChunks(chunks);
  assert.equal(restored.length, 7);
  assert.equal(restored[0].tick, 1);
  assert.equal(restored[6].tick, 7);
});
