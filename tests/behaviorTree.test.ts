import { describe, expect, it } from 'vitest';
import { ActionNode, BehaviorStatus, BehaviorTree, ConditionNode, SelectorNode, SequenceNode } from '../src/ai/behaviorTree.js';

describe('BehaviorTree', () => {
  it('sequence and selector behave as expected', () => {
    const sequence = new SequenceNode([
      new ConditionNode(() => true),
      new ActionNode(() => BehaviorStatus.SUCCESS),
    ]);

    const selector = new SelectorNode([
      new ActionNode(() => BehaviorStatus.FAILURE),
      sequence,
    ]);

    const tree = new BehaviorTree(selector);
    const result = tree.tick({} as never, {} as never);

    expect(result).toBe(BehaviorStatus.SUCCESS);
  });
});
