import test from 'node:test';
import assert from 'node:assert/strict';
import { ExperimentTracker } from '../dist/core/tuning/ExperimentTracker.js';

test('ExperimentTracker stores and ranks records', () => {
  const t = new ExperimentTracker();
  t.add({ id: 'a', createdAt: 1, candidateName: 'safe', seed: 1, score: 10 });
  t.add({ id: 'b', createdAt: 2, candidateName: 'safe', seed: 2, score: 30 });
  t.add({ id: 'c', createdAt: 3, candidateName: 'aggr', seed: 3, score: 20 });

  assert.equal(t.list()[0].id, 'c');
  assert.equal(t.top(1)[0].id, 'b');
  assert.equal(t.byCandidate('safe').length, 2);
});
