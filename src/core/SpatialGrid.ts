import type { Vector3 } from '../types/math.js';
import type { EcosystemEntity } from '../entities/EcosystemEntity.js';

export class SpatialGrid {
  private readonly cells = new Map<string, EcosystemEntity[]>();

  constructor(private readonly cellSize = 8) {}

  rebuild(entities: EcosystemEntity[]): void {
    this.cells.clear();
    for (const entity of entities) {
      const key = this.key(entity.position);
      if (!this.cells.has(key)) this.cells.set(key, []);
      this.cells.get(key)!.push(entity);
    }
  }

  nearby(position: Vector3, radius: number): EcosystemEntity[] {
    const x = Math.floor(position.x / this.cellSize);
    const z = Math.floor(position.z / this.cellSize);
    const range = Math.ceil(radius / this.cellSize);
    const entities: EcosystemEntity[] = [];

    for (let dx = -range; dx <= range; dx += 1) {
      for (let dz = -range; dz <= range; dz += 1) {
        const key = `${x + dx}:${z + dz}`;
        const bucket = this.cells.get(key);
        if (bucket) entities.push(...bucket);
      }
    }

    return entities;
  }

  private key(pos: Vector3): string {
    return `${Math.floor(pos.x / this.cellSize)}:${Math.floor(pos.z / this.cellSize)}`;
  }
}
