import { EnvironmentController, type EnvironmentState } from './Environment.js';
import { EventBus } from './EventBus.js';
import { EcosystemOptimizer, type OptimizationHints } from './Optimizer.js';
import { SeededRandom } from './Random.js';
import { SpatialGrid } from './SpatialGrid.js';
import { TaskQueue } from './TaskQueue.js';
import type { TickReport, TimelinePoint } from './types.js';
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
  private readonly spatialGrid = new SpatialGrid(8);
  private readonly timeline: TimelinePoint[] = [];
  private random = new SeededRandom(42);
  private hints: OptimizationHints = { spawnPlantBoost: 1, predatorEnergyDrain: 1, neutralSocialBias: 1 };
  private tickCount = 0;
  private environment: EnvironmentState = this.environmentController.tick(0);
  private bornThisTick = 0;
  private diedThisTick = 0;
  readonly events = new EventBus();

  initialize(init: EcosystemInit = { plants: 6, predators: 3, neutrals: 5, seed: 42 }): void {
    this.entities = [];
    this.timeline.length = 0;
    this.tickCount = 0;
    this.random = new SeededRandom(init.seed ?? 42);
    for (let i = 0; i < init.plants; i += 1) this.addEntity(new Plant(this.randomPosition(40)), 'entity:added');
    for (let i = 0; i < init.predators; i += 1) this.addEntity(new Predator(this.randomPosition(40)), 'entity:added');
    for (let i = 0; i < init.neutrals; i += 1) this.addEntity(new Neutral(this.randomPosition(40)), 'entity:added');
    this.spatialGrid.rebuild(this.entities);
  }

  update(delta: number): TickReport {
    this.tickCount += 1;
    this.bornThisTick = 0;
    this.diedThisTick = 0;
    this.environment = this.environmentController.tick(delta);
    this.events.emit({ type: 'tick:started', tick: this.tickCount, payload: { season: this.environment.season } });

    const context = { manager: this, random: this.random, environment: this.environment, delta };

    this.queue.enqueue({ id: 'entities:update', priority: 100, run: () => this.entities.forEach((e) => e.update(context)) });
    this.queue.enqueue({ id: 'spatial:reindex', priority: 90, run: () => this.spatialGrid.rebuild(this.entities) });
    this.queue.enqueue({ id: 'entities:reproduce', priority: 80, run: () => this.handleReproduction(context) });
    this.queue.enqueue({ id: 'entities:cleanup', priority: 70, run: () => this.handleDeaths() });
    this.queue.enqueue({ id: 'environment:spawn-energy', priority: 60, run: () => this.spawnEnergy() });
    this.queue.enqueue({ id: 'system:optimize', priority: 50, run: () => this.optimize() });
    this.queue.enqueue({ id: 'timeline:snapshot', priority: 40, run: () => this.captureTimelinePoint() });

    const executed = this.queue.drain(16);
    const stats = this.getStats();

    const report: TickReport = {
      tick: this.tickCount,
      executedTasks: executed,
      born: this.bornThisTick,
      died: this.diedThisTick,
      total: this.entities.length,
      season: this.environment.season,
      avgEnergy: stats.avgEnergy,
    };

    this.events.emit({ type: 'tick:completed', tick: this.tickCount, payload: report });
    return report;
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

  getTimeline(limit?: number): TimelinePoint[] {
    return limit ? this.timeline.slice(-limit) : [...this.timeline];
  }

  addEntityAtPosition(position: Vector3, type: EntityType): void {
    if (type === 'plant') this.addEntity(new Plant(position), 'entity:added');
    if (type === 'predator') this.addEntity(new Predator(position), 'entity:added');
    if (type === 'neutral') this.addEntity(new Neutral(position), 'entity:added');
    this.spatialGrid.rebuild(this.entities);
  }

  removeEntityAtPosition(position: Vector3, range = 2): void {
    const kept: EcosystemEntity[] = [];
    for (const entity of this.entities) {
      if (distance(entity.position, position) <= range) {
        this.diedThisTick += 1;
        this.events.emit({ type: 'entity:removed', tick: this.tickCount, payload: { id: entity.id, type: entity.type } });
      } else {
        kept.push(entity);
      }
    }
    this.entities = kept;
    this.spatialGrid.rebuild(this.entities);
  }

  findNearestPrey(position: Vector3, range: number): EcosystemEntity | null {
    const candidates = this.spatialGrid
      .nearby(position, range)
      .filter((e) => (e.type === 'plant' || e.type === 'neutral') && distance(e.position, position) <= range);

    if (!candidates.length) return null;
    return candidates.reduce((best, current) => (distance(current.position, position) < distance(best.position, position) ? current : best), candidates[0]!);
  }

  findNearby(position: Vector3, range: number, type?: EntityType): EcosystemEntity[] {
    return this.spatialGrid
      .nearby(position, range)
      .filter((e) => (!type || e.type === type) && distance(position, e.position) <= range);
  }

  private handleReproduction(context: { manager: EcosystemManager; random: SeededRandom; environment: EnvironmentState; delta: number }): void {
    const newborns: EcosystemEntity[] = [];
    for (const entity of this.entities) {
      const child = entity.reproduce(context);
      if (child) newborns.push(child);
    }

    for (const newborn of newborns) {
      this.addEntity(newborn, 'entity:born');
    }
    this.bornThisTick += newborns.length;
    if (newborns.length > 0) this.spatialGrid.rebuild(this.entities);
  }

  private handleDeaths(): void {
    const alive: EcosystemEntity[] = [];

    for (const entity of this.entities) {
      if (entity.isDead()) {
        this.diedThisTick += 1;
        this.events.emit({ type: 'entity:died', tick: this.tickCount, payload: { id: entity.id, type: entity.type } });
      } else {
        alive.push(entity);
      }
    }

    this.entities = alive;
    this.spatialGrid.rebuild(this.entities);
  }

  private spawnEnergy(): void {
    if (this.tickCount % 120 !== 0) return;
    const bursts = this.hints.spawnPlantBoost;

    for (let i = 0; i < bursts; i += 1) {
      if (this.entities.length < 250) {
        this.addEntity(new Plant(this.randomPosition(40)), 'entity:born');
        this.bornThisTick += 1;
      }
    }
    this.spatialGrid.rebuild(this.entities);
  }

  private optimize(): void {
    this.hints = this.optimizer.tune(this.getStats());
  }

  private captureTimelinePoint(): void {
    const stats = this.getStats();
    this.timeline.push({
      tick: stats.tick,
      total: stats.totalEntities,
      predators: stats.predatorCount,
      plants: stats.plantCount,
      neutrals: stats.neutralCount,
      avgEnergy: stats.avgEnergy,
      avgHealth: stats.avgHealth,
      season: stats.season,
    });

    if (this.timeline.length > 10_000) {
      this.timeline.splice(0, this.timeline.length - 10_000);
    }
  }

  private addEntity(entity: EcosystemEntity, eventType: 'entity:born' | 'entity:added'): void {
    this.entities.push(entity);
    this.events.emit({ type: eventType, tick: this.tickCount, payload: { id: entity.id, type: entity.type } });
  }

  private randomPosition(spread: number): Vector3 {
    return vec3(this.random.range(-spread / 2, spread / 2), 0, this.random.range(-spread / 2, spread / 2));
  }
}
