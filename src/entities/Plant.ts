import { ActionNode, BehaviorStatus, BehaviorTree, SequenceNode } from '../ai/behaviorTree.js';
import { vec3, type Vector3 } from '../types/math.js';
import { EcosystemEntity } from './EcosystemEntity.js';

export class Plant extends EcosystemEntity {
  private growthRate = 0.5 + Math.random() * 0.5;
  private energyProduction = 1 + Math.random() * 0.5;

  constructor(position: Vector3, generation = 0) {
    super('plant', position, generation);
  }

  protected createBehaviorTree(): BehaviorTree {
    return new BehaviorTree(
      new SequenceNode([
        new ActionNode(() => {
          this.energy = Math.min(100, this.energy + this.energyProduction * 0.1);
          this.health = Math.min(100, this.health + this.growthRate * 0.1);
          this.velocity = vec3(0, 0, 0);
          return BehaviorStatus.SUCCESS;
        }),
      ]),
    );
  }

  reproduce(): Plant | null {
    if (this.energy > 60 && this.age > 5) {
      this.energy -= 30;
      return new Plant({ x: this.position.x + (Math.random() - 0.5) * 5, y: 0, z: this.position.z + (Math.random() - 0.5) * 5 }, this.generation + 1);
    }
    return null;
  }
}
