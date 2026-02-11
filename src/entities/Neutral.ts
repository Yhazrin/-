import { ActionNode, BehaviorStatus, BehaviorTree, SelectorNode } from '../ai/behaviorTree.js';
import type { SimulationContext } from '../core/types.js';
import { normalize, sub, type Vector3 } from '../types/math.js';
import { EcosystemEntity } from './EcosystemEntity.js';

export class Neutral extends EcosystemEntity {
  private socialDrive = 0.4;

  constructor(position: Vector3, generation = 0, traits?: { speed: number; efficiency: number; resilience: number }) {
    super('neutral', position, generation, traits);
  }

  protected createBehaviorTree(): BehaviorTree {
    return new BehaviorTree(
      new SelectorNode([
        new ActionNode((_, ctx) => {
          const mates = ctx.manager.findNearby(this.position, 8, 'neutral').filter((m) => m.id !== this.id);
          if (!mates.length) return BehaviorStatus.FAILURE;
          const center = mates.reduce((acc, m) => ({ x: acc.x + m.position.x, y: 0, z: acc.z + m.position.z }), { x: 0, y: 0, z: 0 });
          center.x /= mates.length;
          center.z /= mates.length;
          this.velocity = normalize(sub(center, this.position));
          this.velocity.x *= this.traits.speed * this.socialDrive * ctx.manager.getHints().neutralSocialBias;
          this.velocity.z *= this.traits.speed * this.socialDrive * ctx.manager.getHints().neutralSocialBias;
          return BehaviorStatus.SUCCESS;
        }),
        new ActionNode((_, ctx) => {
          if (ctx.random.next() < 0.04) {
            this.velocity = {
              x: ctx.random.range(-1, 1) * this.traits.speed,
              y: 0,
              z: ctx.random.range(-1, 1) * this.traits.speed,
            };
          }
          return BehaviorStatus.RUNNING;
        }),
      ]),
    );
  }

  reproduce(ctx: SimulationContext): Neutral | null {
    if (this.energy > 72 && this.age > 10) {
      this.energy -= 34;
      return new Neutral(
        { x: this.position.x + ctx.random.range(-4, 4), y: 0, z: this.position.z + ctx.random.range(-4, 4) },
        this.generation + 1,
        this.mutateTraits(ctx, this.traits),
      );
    }
    return null;
  }
}
