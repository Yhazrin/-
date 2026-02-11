import test from 'node:test';
import assert from 'node:assert/strict';
import { BehaviorTree, SequenceNode, SelectorNode, ConditionNode, ActionNode, BehaviorStatus } from '../dist/ai/behaviorTree.js';

test('BehaviorTree sequence + selector works', () => {
  const tree = new BehaviorTree(
    new SelectorNode([
      new ConditionNode(() => false),
      new SequenceNode([
        new ConditionNode(() => true),
        new ActionNode(() => BehaviorStatus.SUCCESS),
      ]),
    ]),
  );

  assert.equal(tree.tick({}, {}), BehaviorStatus.SUCCESS);
});
