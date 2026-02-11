import test from 'node:test';
import assert from 'node:assert/strict';
import { IncrementalReplayStore } from '../dist/core/replay/IncrementalReplayStore.js';

test('IncrementalReplayStore appends and validates chunks', () => {
  const store = new IncrementalReplayStore();
  store.append(new Uint8Array([1, 2, 3]));
  store.append(new Uint8Array([4, 5]));

  assert.equal(store.listMeta().length, 2);
  assert.equal(store.readAllValidated().length, 2);
  store.clear();
  assert.equal(store.listMeta().length, 0);
});
