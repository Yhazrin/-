import test from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../dist/core/EventBus.js';

test('EventBus emits and unsubscribes', () => {
  const bus = new EventBus();
  let count = 0;
  const off = bus.on('tick:completed', () => { count += 1; });

  bus.emit({ type: 'tick:completed', tick: 1, payload: {} });
  off();
  bus.emit({ type: 'tick:completed', tick: 2, payload: {} });

  assert.equal(count, 1);
});
