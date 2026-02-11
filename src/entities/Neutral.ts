import { ActionNode, BehaviorStatus, BehaviorTree, SelectorNode } from '../ai/behaviorTree.js';
import { normalize, sub, type Vector3 } from '../types/math.js';
import { EcosystemEntity } from './EcosystemEntity.js';

export class Neutral extends EcosystemEntity {
  private curiosity = 0.5 + Math.random() * 0.5;
  private social = 0.3 + Math.random() * 0.4;

  constructor(position: Vector3, generation = 0) {
    super('neutral', position, generation);
  }

  protected createBehaviorTree(): BehaviorTree {
    return new BehaviorTree(
      new SelectorNode([
        new ActionNode((_, ecosystem) => {
          const nearby = ecosystem.findNearbyEntities(this.position, 8, 'neutral').filter((n) => n.id !== this.id);
          if (nearby.length > 0 && this.social > 0.5) {
            const center = nearby.reduce(
              (acc, n) => ({ x: acc.x + n.position.x, y: 0, z: acc.z + n.position.z }),
              { x: 0, y: 0, z: 0 },
            );
            center.x /= nearby.length;
            center.z /= nearby.length;
            this.velocity = normalize(sub(center, this.position));
            return BehaviorStatus.SUCCESS;
          }
          return BehaviorStatus.FAILURE;
        }),
        new ActionNode(() => {
          if (Math.random() < this.curiosity * 0.05) {
            this.velocity = { x: (Math.random() - 0.5) * 0.8, y: 0, z: (Math.random() - 0.5) * 0.8 };
          }
          return BehaviorStatus.RUNNING;
        }),
      ]),
    );
  }

  reproduce(): Neutral | null {
    if (this.energy > 70 && this.age > 8) {
      this.energy -= 35;
      return new Neutral({ x: this.position.x + (Math.random() - 0.5) * 4, y: 0, z: this.position.z + (Math.random() - 0.5) * 4 }, this.generation + 1);
    }
    return null;
  }
}
