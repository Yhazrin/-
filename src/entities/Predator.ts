import { ActionNode, BehaviorStatus, BehaviorTree } from '../ai/behaviorTree.js';
import { QLearningAgent, type AgentState } from '../ai/qLearningAgent.js';
import type { SimulationContext } from '../core/types.js';
import { distance, normalize, sub, type Vector3 } from '../types/math.js';
import { EcosystemEntity } from './EcosystemEntity.js';

export class Predator extends EcosystemEntity {
  private readonly learner = new QLearningAgent();
  private lastState: AgentState | null = null;
  private lastAction: string | null = null;

  constructor(position: Vector3, generation = 0, traits?: { speed: number; efficiency: number; resilience: number }) {
    super('predator', position, generation, traits);
  }

  protected createBehaviorTree(): BehaviorTree {
    return new BehaviorTree(
      new ActionNode((_, ctx) => {
        const actions = ['hunt', 'search', 'rest'];
        const state = this.makeState(ctx);

        if (this.lastState && this.lastAction) {
          const reward = this.reward(ctx);
          this.learner.update(this.lastState, this.lastAction, reward, state, actions);
          this.learner.decayExploration();
        }

        const action = this.learner.chooseAction(state, actions, () => ctx.random.next());
        this.lastState = state;
        this.lastAction = action;

        if (action === 'hunt') {
          const prey = ctx.manager.findNearestPrey(this.position, 15);
          if (!prey) return BehaviorStatus.FAILURE;
          const dir = sub(prey.position, this.position);
          const d = distance(prey.position, this.position);
          if (d < 1.8) {
            prey.health -= 22 * this.traits.resilience;
            this.energy += 12 * this.traits.efficiency;
            return BehaviorStatus.SUCCESS;
          }
          this.velocity = normalize(dir);
          this.velocity.x *= this.traits.speed * 1.2;
          this.velocity.z *= this.traits.speed * 1.2;
          return BehaviorStatus.RUNNING;
        }

        if (action === 'search') {
          if (ctx.random.next() < 0.2) {
            this.velocity = { x: ctx.random.range(-1, 1) * this.traits.speed, y: 0, z: ctx.random.range(-1, 1) * this.traits.speed };
          }
          return BehaviorStatus.RUNNING;
        }

        this.energy += 0.5 * this.traits.efficiency;
        this.velocity = { x: 0, y: 0, z: 0 };
        return BehaviorStatus.RUNNING;
      }),
    );
  }

  override update(ctx: SimulationContext): void {
    super.update(ctx);
    this.energy -= ctx.delta * 0.35 * ctx.manager.getHints().predatorEnergyDrain * ctx.environment.predatorDrainMultiplier;
  }

  reproduce(ctx: SimulationContext): Predator | null {
    if (this.energy > 84 && this.age > 12) {
      this.energy -= 42;
      return new Predator(
        { x: this.position.x + ctx.random.range(-2.5, 2.5), y: 0, z: this.position.z + ctx.random.range(-2.5, 2.5) },
        this.generation + 1,
        this.mutateTraits(ctx, this.traits),
      );
    }
    return null;
  }

  private makeState(ctx: SimulationContext): AgentState {
    const prey = ctx.manager.findNearestPrey(this.position, 20);
    const d = prey ? distance(this.position, prey.position) : 20;
    return {
      x: this.position.x,
      z: this.position.z,
      health: this.health,
      energy: this.energy,
      nearestPreyDistanceBucket: Math.floor(d / 2),
    };
  }

  private reward(ctx: SimulationContext): number {
    let r = 0.1 + this.energy * 0.01 + this.health * 0.006;
    const prey = ctx.manager.findNearestPrey(this.position, 3);
    if (prey) r += 1.4;
    if (this.energy < 18) r -= 1.6;
    return r;
  }
}
