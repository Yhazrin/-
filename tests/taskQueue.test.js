import test from 'node:test';
import assert from 'node:assert/strict';
import { TaskQueue } from '../dist/core/TaskQueue.js';

test('TaskQueue executes by priority', () => {
  const q = new TaskQueue();
  const order = [];
  q.enqueue({ id: 'low', priority: 1, run: () => order.push('low') });
  q.enqueue({ id: 'high', priority: 5, run: () => order.push('high') });
  q.enqueue({ id: 'mid', priority: 3, run: () => order.push('mid') });

  assert.deepEqual(q.drain(), ['high', 'mid', 'low']);
  assert.deepEqual(order, ['high', 'mid', 'low']);
});

test('TaskQueue respects max drain and clear', () => {
  const q = new TaskQueue();
  q.enqueue({ id: 'a', priority: 3, run: () => {} });
  q.enqueue({ id: 'b', priority: 2, run: () => {} });
  q.enqueue({ id: 'c', priority: 1, run: () => {} });

  assert.deepEqual(q.drain(2), ['a', 'b']);
  assert.equal(q.size(), 1);
  q.clear();
  assert.equal(q.size(), 0);
});
