import { BehaviorTree } from '../ai/behaviorTree.js';
import type { EcosystemManager } from '../core/EcosystemManager.js';
import { add, mul, vec3, type Vector3 } from '../types/math.js';

let entityCounter = 0;

export type EntityType = 'predator' | 'plant' | 'neutral';

export abstract class EcosystemEntity {
  readonly id: string;
  readonly type: EntityType;
  position: Vector3;
  velocity = vec3(0, 0, 0);
  health = 100;
  energy = 100;
  age = 0;
  readonly generation: number;

  protected readonly behavior: BehaviorTree;

  protected constructor(type: EntityType, position: Vector3, generation = 0) {
    this.id = `entity_${entityCounter++}`;
    this.type = type;
    this.position = { ...position };
    this.generation = generation;
    this.behavior = this.createBehaviorTree();
  }

  protected abstract createBehaviorTree(): BehaviorTree;
  abstract reproduce(): EcosystemEntity | null;

  update(delta: number, ecosystem: EcosystemManager): void {
    this.age += delta;
    this.energy -= delta * 0.5;
    this.behavior.tick(this, ecosystem);
    this.position = add(this.position, mul(this.velocity, delta));
  }

  isDead(): boolean {
    return this.health <= 0 || this.energy <= 0 || this.age > 100;
  }
}
