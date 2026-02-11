import { EnvironmentController, type EnvironmentState } from './Environment.js';
import { EcosystemOptimizer, type OptimizationHints } from './Optimizer.js';
import { SeededRandom } from './Random.js';
import { TaskQueue } from './TaskQueue.js';
import type { TickReport } from './types.js';
import type { EntityType, EcosystemEntity } from '../entities/EcosystemEntity.js';
import { Plant } from '../entities/Plant.js';
import { Predator } from '../entities/Predator.js';
import { Neutral } from '../entities/Neutral.js';
import { distance, vec3, type Vector3 } from '../types/math.js';

export interface EcosystemStats {
  tick: number;
  totalEntities: number;
  predatorCount: number;
  plantCount: number;
  neutralCount: number;
  avgGeneration: number;
  avgHealth: number;
  avgEnergy: number;
  season: string;
  queueDepth: number;
}

export interface EcosystemInit {
  plants: number;
  predators: number;
  neutrals: number;
  seed?: number;
}

export class EcosystemManager {
  private entities: EcosystemEntity[] = [];
  private readonly queue = new TaskQueue();
  private readonly optimizer = new EcosystemOptimizer();
  private readonly environmentController = new EnvironmentController();
  private random = new SeededRandom(42);
  private hints: OptimizationHints = { spawnPlantBoost: 1, predatorEnergyDrain: 1, neutralSocialBias: 1 };
  private tickCount = 0;
  private environment: EnvironmentState = this.environmentController.tick(0);
  private bornThisTick = 0;
  private diedThisTick = 0;

  initialize(init: EcosystemInit = { plants: 6, predators: 3, neutrals: 5, seed: 42 }): void {
    this.entities = [];
    this.tickCount = 0;
    this.random = new SeededRandom(init.seed ?? 42);
    for (let i = 0; i < init.plants; i += 1) this.entities.push(new Plant(this.randomPosition(40)));
    for (let i = 0; i < init.predators; i += 1) this.entities.push(new Predator(this.randomPosition(40)));
    for (let i = 0; i < init.neutrals; i += 1) this.entities.push(new Neutral(this.randomPosition(40)));
  }

  update(delta: number): TickReport {
    this.tickCount += 1;
    this.bornThisTick = 0;
    this.diedThisTick = 0;
    this.environment = this.environmentController.tick(delta);

    const context = { manager: this, random: this.random, environment: this.environment, delta };
    this.queue.enqueue({ id: 'entities:update', priority: 100, run: () => this.entities.forEach((e) => e.update(context)) });
    this.queue.enqueue({ id: 'entities:reproduce', priority: 80, run: () => this.handleReproduction(context) });
    this.queue.enqueue({ id: 'entities:cleanup', priority: 70, run: () => this.handleDeaths() });
    this.queue.enqueue({ id: 'environment:spawn-energy', priority: 60, run: () => this.spawnEnergy() });
    this.queue.enqueue({ id: 'system:optimize', priority: 50, run: () => this.optimize() });

    const executed = this.queue.drain(8);
    return { tick: this.tickCount, executedTasks: executed, born: this.bornThisTick, died: this.diedThisTick, total: this.entities.length };
  }

  getStats(): EcosystemStats {
    const total = this.entities.length;
    const predatorCount = this.entities.filter((e) => e.type === 'predator').length;
    const plantCount = this.entities.filter((e) => e.type === 'plant').length;
    const neutralCount = this.entities.filter((e) => e.type === 'neutral').length;

    return {
      tick: this.tickCount,
      totalEntities: total,
      predatorCount,
      plantCount,
      neutralCount,
      avgGeneration: total ? this.entities.reduce((s, e) => s + e.generation, 0) / total : 0,
      avgHealth: total ? this.entities.reduce((s, e) => s + e.health, 0) / total : 0,
      avgEnergy: total ? this.entities.reduce((s, e) => s + e.energy, 0) / total : 0,
      season: this.environment.season,
      queueDepth: this.queue.size(),
    };
  }

  getHints(): OptimizationHints { return this.hints; }

  addEntityAtPosition(position: Vector3, type: EntityType): void {
    if (type === 'plant') this.entities.push(new Plant(position));
    if (type === 'predator') this.entities.push(new Predator(position));
    if (type === 'neutral') this.entities.push(new Neutral(position));
  }

  removeEntityAtPosition(position: Vector3, range = 2): void {
    const before = this.entities.length;
    this.entities = this.entities.filter((e) => distance(e.position, position) > range);
    this.diedThisTick += before - this.entities.length;
  }

  findNearestPrey(position: Vector3, range: number): EcosystemEntity | null {
    const prey = this.entities.filter((e) => (e.type === 'plant' || e.type === 'neutral') && distance(e.position, position) <= range);
    if (!prey.length) return null;
    return prey.reduce((best, current) => (distance(current.position, position) < distance(best.position, position) ? current : best), prey[0]!);
  }

  findNearby(position: Vector3, range: number, type?: EntityType): EcosystemEntity[] {
    return this.entities.filter((e) => (!type || e.type === type) && distance(position, e.position) <= range);
  }

  private handleReproduction(context: { manager: EcosystemManager; random: SeededRandom; environment: EnvironmentState; delta: number }): void {
    const newborns: EcosystemEntity[] = [];
    for (const entity of this.entities) {
      const child = entity.reproduce(context);
      if (child) newborns.push(child);
    }
    this.bornThisTick += newborns.length;
    this.entities.push(...newborns);
  }

  private handleDeaths(): void {
    const before = this.entities.length;
    this.entities = this.entities.filter((e) => !e.isDead());
    this.diedThisTick += before - this.entities.length;
  }

  private spawnEnergy(): void {
    if (this.tickCount % 120 !== 0) return;
    const bursts = this.hints.spawnPlantBoost;
    for (let i = 0; i < bursts; i += 1) {
      if (this.entities.length < 250) {
        this.entities.push(new Plant(this.randomPosition(40)));
        this.bornThisTick += 1;
      }
    }
  }

  private optimize(): void {
    this.hints = this.optimizer.tune(this.getStats());
  }

  private randomPosition(spread: number): Vector3 {
    return vec3(this.random.range(-spread / 2, spread / 2), 0, this.random.range(-spread / 2, spread / 2));
  }
}
