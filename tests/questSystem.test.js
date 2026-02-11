import test from 'node:test';
import assert from 'node:assert/strict';
import { QuestSystem } from '../dist/gameplay/QuestSystem.js';

test('QuestSystem evaluates quest completion', () => {
  const q = new QuestSystem();
  const quests = q.evaluate(
    { tick: 10, executedTasks: [], born: 1, died: 0, total: 120, season: 'summer', avgEnergy: 70, climateEvent: 'none' },
    [
      { tick: 1, total: 70, predators: 5, plants: 35, neutrals: 30, avgEnergy: 70, avgHealth: 80, season: 'spring' },
      { tick: 20, total: 90, predators: 7, plants: 45, neutrals: 38, avgEnergy: 75, avgHealth: 82, season: 'summer' },
    ],
  );

  assert.ok(quests.length >= 3);
  assert.equal(quests[0].completed, true);
});
