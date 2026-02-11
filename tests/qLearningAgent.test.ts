import { describe, expect, it } from 'vitest';
import { QLearningAgent } from '../src/ai/qLearningAgent.js';

describe('QLearningAgent', () => {
  it('updates q-values and reports stats', () => {
    const agent = new QLearningAgent(0.5, 0.9, 0, 0, 1);
    const state = { x: 0, z: 0, health: 100, energy: 100 };
    const next = { x: 1, z: 1, health: 90, energy: 80 };

    const action = agent.chooseAction(state, ['hunt', 'rest']);
    agent.update(state, action, 1, next, ['hunt', 'rest']);
    agent.decayExploration();

    const stats = agent.getStats();
    expect(stats.states).toBeGreaterThan(0);
    expect(stats.actions).toBeGreaterThan(0);
    expect(stats.avgQ).not.toBeNaN();
  });
});
