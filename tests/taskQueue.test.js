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
