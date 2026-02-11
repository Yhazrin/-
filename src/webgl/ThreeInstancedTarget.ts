import type { RenderEntitySnapshot } from '../core/renderTypes.js';
import type { InstanceWriteTarget } from './ThreeAdapter.js';

export interface InstancedMeshLike {
  count: number;
  setMatrixAt(index: number, matrix: readonly number[]): void;
  setColorAt?(index: number, color: { r: number; g: number; b: number }): void;
  instanceMatrix: { needsUpdate: boolean };
  instanceColor?: { needsUpdate: boolean };
}

export interface InstancedTargetOptions {
  mesh: InstancedMeshLike;
  colorFor: (entity: RenderEntitySnapshot) => { r: number; g: number; b: number };
  matrixFor: (entity: RenderEntitySnapshot) => readonly number[];
}

export class ThreeInstancedTarget implements InstanceWriteTarget {
  constructor(private readonly options: InstancedTargetOptions) {}

  setInstance(index: number, entity: RenderEntitySnapshot): void {
    this.options.mesh.setMatrixAt(index, this.options.matrixFor(entity));
    if (this.options.mesh.setColorAt) {
      this.options.mesh.setColorAt(index, this.options.colorFor(entity));
    }
  }

  finalize(count: number): void {
    this.options.mesh.count = count;
    this.options.mesh.instanceMatrix.needsUpdate = true;
    if (this.options.mesh.instanceColor) this.options.mesh.instanceColor.needsUpdate = true;
  }
}
