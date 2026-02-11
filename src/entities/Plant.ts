import { ActionNode, BehaviorStatus, BehaviorTree } from '../ai/behaviorTree.js';
import type { SimulationContext } from '../core/types.js';
import type { Vector3 } from '../types/math.js';
import { EcosystemEntity } from './EcosystemEntity.js';

export class Plant extends EcosystemEntity {
  constructor(position: Vector3, generation = 0, traits?: { speed: number; efficiency: number; resilience: number }) {
    super('plant', position, generation, traits);
  }

  protected createBehaviorTree(): BehaviorTree {
    return new BehaviorTree(
      new ActionNode((_, ctx) => {
        const growth = 0.3 * this.traits.efficiency * ctx.environment.plantGrowthMultiplier;
        this.energy += growth;
        this.health += 0.2 * this.traits.resilience;
        this.velocity = { x: 0, y: 0, z: 0 };
        return BehaviorStatus.SUCCESS;
      }),
    );
  }

  reproduce(ctx: SimulationContext): Plant | null {
    if (this.energy > 65 && this.age > 8) {
      this.energy -= 30;
      return new Plant(
        {
          x: this.position.x + ctx.random.range(-3, 3),
          y: 0,
          z: this.position.z + ctx.random.range(-3, 3),
        },
        this.generation + 1,
        this.mutateTraits(ctx, this.traits),
      );
    }
    return null;
  }
}
