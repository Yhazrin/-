import { distance, vec3, type Vector3 } from '../types/math.js';
import type { EntityType, EcosystemEntity } from '../entities/EcosystemEntity.js';
import { Predator } from '../entities/Predator.js';
import { Plant } from '../entities/Plant.js';
import { Neutral } from '../entities/Neutral.js';
import { TaskQueue } from './TaskQueue.js';
import { EcosystemOptimizer, type OptimizationHints } from './Optimizer.js';

export interface EcosystemStats {
  totalEntities: number;
  predatorCount: number;
  plantCount: number;
  neutralCount: number;
  avgGeneration: number;
  avgHealth: number;
  avgEnergy: number;
  queueDepth: number;
}

export class EcosystemManager {
  private entities: EcosystemEntity[] = [];
  private time = 0;
  private readonly queue = new TaskQueue();
  private readonly optimizer = new EcosystemOptimizer();
  private hints: OptimizationHints = {
    spawnPlantBoost: 1,
    predatorEnergyDecayMultiplier: 1,
    neutralCuriosityBoost: 1,
  };

  initialize(seed = { plants: 5, predators: 3, neutrals: 4 }): void {
    this.entities = [];
    for (let i = 0; i < seed.plants; i += 1) this.addEntity(new Plant(this.randomPosition(40)));
    for (let i = 0; i < seed.predators; i += 1) this.addEntity(new Predator(this.randomPosition(40)));
    for (let i = 0; i < seed.neutrals; i += 1) this.addEntity(new Neutral(this.randomPosition(40)));
  }

  update(delta: number): void {
    this.time += delta;
    this.scheduleLifecycleTasks(delta);
    this.queue.drain(8);
  }

  addEntityAtPosition(position: Vector3, type: EntityType): void {
    if (type === 'plant') this.addEntity(new Plant(position));
    if (type === 'predator') this.addEntity(new Predator(position));
    if (type === 'neutral') this.addEntity(new Neutral(position));
  }

  removeEntityAtPosition(position: Vector3, range = 2): void {
    this.entities = this.entities.filter((entity) => distance(entity.position, position) > range);
  }

  findNearestPrey(position: Vector3, range: number): EcosystemEntity | null {
    const candidates = this.entities.filter((e) => (e.type === 'plant' || e.type === 'neutral') && distance(e.position, position) < range);
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => distance(a.position, position) - distance(b.position, position))[0] ?? null;
  }

  findNearbyEntities(position: Vector3, range: number, type?: EntityType): EcosystemEntity[] {
    return this.entities.filter((e) => (!type || e.type === type) && distance(e.position, position) < range);
  }

  getStats(): EcosystemStats {
    const total = this.entities.length;
    const predatorCount = this.entities.filter((e) => e.type === 'predator').length;
    const plantCount = this.entities.filter((e) => e.type === 'plant').length;
    const neutralCount = this.entities.filter((e) => e.type === 'neutral').length;
    const avgGeneration = total === 0 ? 0 : this.entities.reduce((sum, e) => sum + e.generation, 0) / total;
    const avgHealth = total === 0 ? 0 : this.entities.reduce((sum, e) => sum + e.health, 0) / total;
    const avgEnergy = total === 0 ? 0 : this.entities.reduce((sum, e) => sum + e.energy, 0) / total;

    return { totalEntities: total, predatorCount, plantCount, neutralCount, avgGeneration, avgHealth, avgEnergy, queueDepth: this.queue.size() };
  }

  getOptimizationHints(): OptimizationHints {
    return this.hints;
  }

  private addEntity(entity: EcosystemEntity): void {
    this.entities.push(entity);
  }

  private scheduleLifecycleTasks(delta: number): void {
    this.queue.enqueue({ id: 'update-entities', priority: 100, run: () => this.updateEntities(delta) });
    this.queue.enqueue({ id: 'handle-reproduction', priority: 80, run: () => this.handleReproduction() });
    this.queue.enqueue({ id: 'handle-deaths', priority: 70, run: () => this.handleDeaths() });
    this.queue.enqueue({ id: 'spawn-energy', priority: 60, run: () => this.spawnEnergySource() });
    this.queue.enqueue({ id: 'optimize', priority: 50, run: () => this.optimize() });
  }

  private updateEntities(delta: number): void {
    this.entities.forEach((entity) => {
      entity.update(delta, this);
      if (entity.type === 'predator') {
        entity.energy -= delta * 0.2 * this.hints.predatorEnergyDecayMultiplier;
      }
    });
  }

  private handleReproduction(): void {
    const newborns: EcosystemEntity[] = [];
    for (const entity of this.entities) {
      const offspring = entity.reproduce();
      if (offspring) newborns.push(offspring);
    }
    newborns.forEach((n) => this.entities.push(n));
  }

  private handleDeaths(): void {
    this.entities = this.entities.filter((entity) => !entity.isDead());
  }

  private spawnEnergySource(): void {
    const tick = Math.floor(this.time);
    if (tick % 10 === 0 && tick !== Math.floor(this.time - 0.016)) {
      const bursts = this.hints.spawnPlantBoost;
      for (let i = 0; i < bursts; i += 1) {
        if (this.entities.length < 120) this.entities.push(new Plant(this.randomPosition(40)));
      }
    }
  }

  private optimize(): void {
    this.hints = this.optimizer.tune(this.getStats());
  }

  private randomPosition(spread: number): Vector3 {
    return vec3((Math.random() - 0.5) * spread, 0, (Math.random() - 0.5) * spread);
  }
}
