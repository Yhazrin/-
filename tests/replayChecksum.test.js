import test from 'node:test';
import assert from 'node:assert/strict';
import { crc32, validateChunk } from '../dist/core/replay/ReplayChecksum.js';

test('ReplayChecksum computes and validates CRC32', () => {
  const data = new Uint8Array([1, 2, 3, 4]);
  const checksum = crc32(data);
  assert.equal(validateChunk({ data, checksum }), true);
  assert.equal(validateChunk({ data, checksum: checksum + 1 }), false);
});
