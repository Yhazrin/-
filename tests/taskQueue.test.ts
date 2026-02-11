import { describe, expect, it } from 'vitest';
import { TaskQueue } from '../src/core/TaskQueue.js';

describe('TaskQueue', () => {
  it('executes tasks by priority', () => {
    const queue = new TaskQueue();
    const events: string[] = [];

    queue.enqueue({ id: 'low', priority: 1, run: () => events.push('low') });
    queue.enqueue({ id: 'high', priority: 10, run: () => events.push('high') });
    queue.enqueue({ id: 'mid', priority: 5, run: () => events.push('mid') });

    const executed = queue.drain();

    expect(executed).toEqual(['high', 'mid', 'low']);
    expect(events).toEqual(['high', 'mid', 'low']);
    expect(queue.size()).toBe(0);
  });
});
