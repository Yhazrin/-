import type { BehaviorTree } from '../ai/behaviorTree.js';
import type { SimulationContext } from '../core/types.js';
import { add, clamp, scale, vec3, type Vector3 } from '../types/math.js';

export type EntityType = 'predator' | 'plant' | 'neutral';

export interface GeneticTraits {
  speed: number;
  efficiency: number;
  resilience: number;
}

let idCounter = 0;

export abstract class EcosystemEntity {
  readonly id = `e_${idCounter++}`;
  readonly type: EntityType;
  readonly generation: number;
  readonly traits: GeneticTraits;

  position: Vector3;
  velocity: Vector3 = vec3();
  health = 100;
  energy = 100;
  age = 0;

  protected behavior: BehaviorTree;

  constructor(type: EntityType, position: Vector3, generation = 0, traits?: GeneticTraits) {
    this.type = type;
    this.position = { ...position };
    this.generation = generation;
    this.traits = traits ?? { speed: 1, efficiency: 1, resilience: 1 };
    this.behavior = this.createBehaviorTree();
  }

  protected abstract createBehaviorTree(): BehaviorTree;
  abstract reproduce(ctx: SimulationContext): EcosystemEntity | null;

  update(ctx: SimulationContext): void {
    this.age += ctx.delta;
    this.energy -= ctx.delta * (0.45 / this.traits.efficiency);
    this.behavior.tick(this, ctx);
    this.position = add(this.position, scale(this.velocity, ctx.delta));
    this.health = clamp(this.health, 0, 100);
    this.energy = clamp(this.energy, 0, 100);
  }


  toRenderSnapshot() {
    return {
      id: this.id,
      type: this.type,
      position: { ...this.position },
      velocity: { ...this.velocity },
      health: this.health,
      energy: this.energy,
      age: this.age,
      generation: this.generation,
      traits: { ...this.traits },
    };
  }

  isDead(): boolean {
    return this.health <= 0 || this.energy <= 0 || this.age > 180;
  }

  protected mutateTraits(ctx: SimulationContext, base: GeneticTraits): GeneticTraits {
    const mutate = (v: number) => clamp(v + ctx.random.range(-0.08, 0.08), 0.5, 1.6);
    return {
      speed: mutate(base.speed),
      efficiency: mutate(base.efficiency),
      resilience: mutate(base.resilience),
    };
  }
}
