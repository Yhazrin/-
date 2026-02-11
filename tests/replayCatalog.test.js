import test from 'node:test';
import assert from 'node:assert/strict';
import { ReplayCatalog } from '../dist/core/replay/ReplayCatalog.js';

test('ReplayCatalog add/list/filter/remove', () => {
  const c = new ReplayCatalog();
  c.add({ id: 'a', createdAt: 1, sizeBytes: 100, frameCount: 10, tags: ['seed:1', 'baseline'] });
  c.add({ id: 'b', createdAt: 2, sizeBytes: 120, frameCount: 12, tags: ['seed:2', 'tuned'] });

  assert.equal(c.list().length, 2);
  assert.equal(c.list()[0].id, 'b');
  assert.equal(c.findByTag('tuned').length, 1);
  assert.equal(c.remove('a'), true);
  assert.equal(c.remove('x'), false);
});
