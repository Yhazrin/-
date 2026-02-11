import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FileReplayStorageAdapter,
  RemoteReplayStorageAdapter,
  ReplayPersistenceService,
} from '../dist/core/replay/ReplayPersistence.js';
import { IncrementalReplayStore } from '../dist/core/replay/IncrementalReplayStore.js';

test('ReplayPersistenceService flushes and restores via adapters', async () => {
  const mem = new Map();
  const fileAdapter = new FileReplayStorageAdapter({
    write: async (path, data) => { mem.set(path, data); },
    read: async (path) => mem.get(path),
  }, 'unit');

  const store = new IncrementalReplayStore();
  const a = new Uint8Array([1, 2, 3]);
  const b = new Uint8Array([4, 5]);
  store.append(a);
  store.append(b);

  const svc = new ReplayPersistenceService(store, fileAdapter);
  const meta = await svc.flushAll();
  const restored = await svc.restore(meta);
  assert.equal(restored.length, 2);
  assert.deepEqual(Array.from(restored[0]), [1, 2, 3]);

  const remoteMem = new Map();
  const remote = new RemoteReplayStorageAdapter({
    put: async (url, body) => { remoteMem.set(url, body); },
    get: async (url) => remoteMem.get(url),
  }, 'https://replay.test/base');
  await remote.writeChunk(meta[0], a);
  assert.deepEqual(Array.from(await remote.readChunk(meta[0])), [1, 2, 3]);
});
