import type { EcosystemEntity } from '../entities/EcosystemEntity.js';
import type { EcosystemManager } from '../core/EcosystemManager.js';

export enum BehaviorStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  RUNNING = 'running',
}

export abstract class BehaviorNode {
  abstract tick(entity: EcosystemEntity, ecosystem: EcosystemManager): BehaviorStatus;
}

export class SelectorNode extends BehaviorNode {
  constructor(private readonly children: BehaviorNode[]) {
    super();
  }

  tick(entity: EcosystemEntity, ecosystem: EcosystemManager): BehaviorStatus {
    for (const child of this.children) {
      const result = child.tick(entity, ecosystem);
      if (result !== BehaviorStatus.FAILURE) return result;
    }
    return BehaviorStatus.FAILURE;
  }
}

export class SequenceNode extends BehaviorNode {
  constructor(private readonly children: BehaviorNode[]) {
    super();
  }

  tick(entity: EcosystemEntity, ecosystem: EcosystemManager): BehaviorStatus {
    for (const child of this.children) {
      const result = child.tick(entity, ecosystem);
      if (result !== BehaviorStatus.SUCCESS) return result;
    }
    return BehaviorStatus.SUCCESS;
  }
}

export class ConditionNode extends BehaviorNode {
  constructor(private readonly condition: (entity: EcosystemEntity, ecosystem: EcosystemManager) => boolean) {
    super();
  }

  tick(entity: EcosystemEntity, ecosystem: EcosystemManager): BehaviorStatus {
    return this.condition(entity, ecosystem) ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE;
  }
}

export class ActionNode extends BehaviorNode {
  constructor(private readonly action: (entity: EcosystemEntity, ecosystem: EcosystemManager) => BehaviorStatus) {
    super();
  }

  tick(entity: EcosystemEntity, ecosystem: EcosystemManager): BehaviorStatus {
    return this.action(entity, ecosystem);
  }
}

export class BehaviorTree {
  constructor(private readonly root: BehaviorNode) {}

  tick(entity: EcosystemEntity, ecosystem: EcosystemManager): BehaviorStatus {
    return this.root.tick(entity, ecosystem);
  }
}
