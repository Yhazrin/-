import test from 'node:test';
import assert from 'node:assert/strict';
import { QLearningAgent } from '../dist/ai/qLearningAgent.js';

test('QLearning agent updates table', () => {
  const a = new QLearningAgent(0.5, 0.9, 0, 0, 1);
  const s1 = { x: 0, z: 0, health: 100, energy: 100, nearestPreyDistanceBucket: 4 };
  const s2 = { x: 1, z: 0, health: 95, energy: 80, nearestPreyDistanceBucket: 2 };

  const action = a.chooseAction(s1, ['hunt', 'rest'], () => 0.99);
  a.update(s1, action, 2, s2, ['hunt', 'rest']);
  a.decayExploration();

  const stats = a.stats();
  assert.ok(stats.states >= 1);
  assert.ok(stats.qValues >= 1);
});
