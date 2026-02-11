import type { RenderEntitySnapshot, RenderFrame, RendererAdapter } from '../core/renderTypes.js';

export interface InstanceWriteTarget {
  setInstance(index: number, entity: RenderEntitySnapshot): void;
  finalize(count: number): void;
}

export interface ThreeAdapterOptions {
  maxInstances?: number;
  targets: {
    predator: InstanceWriteTarget;
    neutral: InstanceWriteTarget;
    plant: InstanceWriteTarget;
  };
  onFrameStats?: (frame: Pick<RenderFrame, 'tick' | 'season' | 'avgEnergy' | 'avgHealth' | 'counts'>) => void;
}

/**
 * Three.js/WebGL integration adapter.
 *
 * Note:
 * - This class deliberately does not import `three` directly.
 * - A concrete app should map `setInstance` to InstancedMesh matrix/color updates.
 */
export class ThreeAdapter implements RendererAdapter {
  private readonly maxInstances: number;

  constructor(private readonly options: ThreeAdapterOptions) {
    this.maxInstances = options.maxInstances ?? 10_000;
  }

  onFrame(frame: RenderFrame): void {
    const predators: RenderEntitySnapshot[] = [];
    const neutrals: RenderEntitySnapshot[] = [];
    const plants: RenderEntitySnapshot[] = [];

    for (const entity of frame.entities) {
      if (predators.length + neutrals.length + plants.length >= this.maxInstances) break;
      if (entity.type === 'predator') predators.push(entity);
      else if (entity.type === 'neutral') neutrals.push(entity);
      else plants.push(entity);
    }

    this.writeGroup(this.options.targets.predator, predators);
    this.writeGroup(this.options.targets.neutral, neutrals);
    this.writeGroup(this.options.targets.plant, plants);

    this.options.onFrameStats?.({
      tick: frame.tick,
      season: frame.season,
      avgEnergy: frame.avgEnergy,
      avgHealth: frame.avgHealth,
      counts: frame.counts,
    });
  }

  dispose(): void {
    this.options.targets.predator.finalize(0);
    this.options.targets.neutral.finalize(0);
    this.options.targets.plant.finalize(0);
  }

  private writeGroup(target: InstanceWriteTarget, entities: RenderEntitySnapshot[]): void {
    for (let i = 0; i < entities.length; i += 1) {
      target.setInstance(i, entities[i]!);
    }
    target.finalize(entities.length);
  }
}
