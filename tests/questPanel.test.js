import test from 'node:test';
import assert from 'node:assert/strict';
import { QuestGuideController } from '../dist/ui/QuestPanel.js';

test('QuestGuideController picks pending quest tip', () => {
  let model = null;
  const controller = new QuestGuideController({ render: (m) => { model = m; } });
  const quests = [
    { id: 'a', title: 'A', description: '', completed: true, knowledgeHint: 'ha' },
    { id: 'b', title: 'B', description: '', completed: false, knowledgeHint: 'hb' },
  ];

  const result = controller.update(quests);
  assert.equal(result.completed, 1);
  assert.equal(result.nextTip.title, 'B');
  assert.equal(model.total, 2);
});
