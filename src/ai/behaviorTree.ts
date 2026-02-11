import type { SimulationContext } from '../core/types.js';
import type { EcosystemEntity } from '../entities/EcosystemEntity.js';

export enum BehaviorStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  RUNNING = 'running',
}

export abstract class BehaviorNode {
  abstract tick(entity: EcosystemEntity, context: SimulationContext): BehaviorStatus;
}

export class SelectorNode extends BehaviorNode {
  constructor(private readonly children: BehaviorNode[]) { super(); }
  tick(entity: EcosystemEntity, context: SimulationContext): BehaviorStatus {
    for (const child of this.children) {
      const s = child.tick(entity, context);
      if (s !== BehaviorStatus.FAILURE) return s;
    }
    return BehaviorStatus.FAILURE;
  }
}

export class SequenceNode extends BehaviorNode {
  constructor(private readonly children: BehaviorNode[]) { super(); }
  tick(entity: EcosystemEntity, context: SimulationContext): BehaviorStatus {
    for (const child of this.children) {
      const s = child.tick(entity, context);
      if (s !== BehaviorStatus.SUCCESS) return s;
    }
    return BehaviorStatus.SUCCESS;
  }
}

export class ConditionNode extends BehaviorNode {
  constructor(private readonly condition: (entity: EcosystemEntity, context: SimulationContext) => boolean) { super(); }
  tick(entity: EcosystemEntity, context: SimulationContext): BehaviorStatus {
    return this.condition(entity, context) ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE;
  }
}

export class ActionNode extends BehaviorNode {
  constructor(private readonly action: (entity: EcosystemEntity, context: SimulationContext) => BehaviorStatus) { super(); }
  tick(entity: EcosystemEntity, context: SimulationContext): BehaviorStatus {
    return this.action(entity, context);
  }
}

export class BehaviorTree {
  constructor(private readonly root: BehaviorNode) {}
  tick(entity: EcosystemEntity, context: SimulationContext): BehaviorStatus {
    return this.root.tick(entity, context);
  }
}
