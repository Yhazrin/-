import type { EntityType, GeneticTraits } from '../entities/EcosystemEntity.js';
import type { Vector3 } from '../types/math.js';

export interface RenderEntitySnapshot {
  id: string;
  type: EntityType;
  position: Vector3;
  velocity: Vector3;
  health: number;
  energy: number;
  age: number;
  generation: number;
  traits: GeneticTraits;
}

export interface RenderFrame {
  tick: number;
  season: string;
  avgEnergy: number;
  avgHealth: number;
  counts: {
    total: number;
    predators: number;
    plants: number;
    neutrals: number;
  };
  entities: RenderEntitySnapshot[];
}

export interface RendererAdapter {
  onFrame(frame: RenderFrame): void;
  dispose?(): void;
}
