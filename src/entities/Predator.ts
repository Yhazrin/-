import { ActionNode, BehaviorStatus, BehaviorTree, SelectorNode } from '../ai/behaviorTree.js';
import { QLearningAgent, type AgentState } from '../ai/qLearningAgent.js';
import { normalize, sub, type Vector3 } from '../types/math.js';
import { EcosystemEntity } from './EcosystemEntity.js';

export class Predator extends EcosystemEntity {
  private aggression = 0.7 + Math.random() * 0.3;
  private speed = 1 + Math.random() * 0.5;
  private qAgent = new QLearningAgent();
  private lastState: AgentState | null = null;
  private lastAction: string | null = null;

  constructor(position: Vector3, generation = 0) {
    super('predator', position, generation);
  }

  protected createBehaviorTree(): BehaviorTree {
    return new BehaviorTree(
      new SelectorNode([
        new ActionNode((_, ecosystem) => {
          const state = this.toState();
          const actions = ['hunt', 'search', 'rest'];

          if (this.lastState && this.lastAction) {
            const reward = this.rewardSignal(ecosystem);
            this.qAgent.update(this.lastState, this.lastAction, reward, state, actions);
            this.qAgent.decayExploration();
          }

          const action = this.qAgent.chooseAction(state, actions);
          this.lastState = state;
          this.lastAction = action;

          if (action === 'hunt') {
            const prey = ecosystem.findNearestPrey(this.position, 15);
            if (!prey) return BehaviorStatus.FAILURE;
            const direction = sub(prey.position, this.position);
            const dist = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
            if (dist < 2) {
              prey.health -= 20 * this.aggression;
              this.energy = Math.min(100, this.energy + 10);
              return BehaviorStatus.SUCCESS;
            }
            this.velocity = normalize(direction);
            this.velocity.x *= this.speed;
            this.velocity.z *= this.speed;
            return BehaviorStatus.RUNNING;
          }

          if (action === 'search') {
            if (Math.random() < 0.1) {
              this.velocity = { x: (Math.random() - 0.5) * this.speed, y: 0, z: (Math.random() - 0.5) * this.speed };
            }
            return BehaviorStatus.RUNNING;
          }

          this.energy = Math.min(100, this.energy + 0.4);
          this.velocity = { x: 0, y: 0, z: 0 };
          return BehaviorStatus.RUNNING;
        }),
      ]),
    );
  }

  reproduce(): Predator | null {
    if (this.energy > 80 && this.age > 10) {
      this.energy -= 40;
      return new Predator({ x: this.position.x + (Math.random() - 0.5) * 3, y: 0, z: this.position.z + (Math.random() - 0.5) * 3 }, this.generation + 1);
    }
    return null;
  }

  private toState(): AgentState {
    return { x: this.position.x, z: this.position.z, health: this.health, energy: this.energy };
  }

  private rewardSignal(ecosystem: { findNearestPrey: (pos: Vector3, range: number) => EcosystemEntity | null }): number {
    let reward = 0.1 + this.energy * 0.01 + this.health * 0.005;
    const nearby = ecosystem.findNearestPrey(this.position, 4);
    if (nearby && nearby.health < 50) reward += 2;
    if (this.energy < 20) reward -= 1;
    return reward;
  }
}
