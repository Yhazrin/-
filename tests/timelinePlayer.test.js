import test from 'node:test';
import assert from 'node:assert/strict';
import { TimelinePlayer } from '../dist/core/TimelinePlayer.js';

test('TimelinePlayer supports seek/play/tick', () => {
  const timeline = [
    { tick: 1, total: 10, predators: 1, plants: 5, neutrals: 4, avgEnergy: 80, avgHealth: 90, season: 'spring' },
    { tick: 2, total: 12, predators: 1, plants: 6, neutrals: 5, avgEnergy: 81, avgHealth: 91, season: 'spring' },
    { tick: 3, total: 13, predators: 2, plants: 6, neutrals: 5, avgEnergy: 79, avgHealth: 89, season: 'summer' },
  ];

  const p = new TimelinePlayer(timeline);
  p.seek(1);
  p.play(2);
  const current = p.tick();

  assert.equal(current.tick, 3);
  assert.equal(p.state().playing, true);
  p.pause();
  assert.equal(p.state().playing, false);
});
