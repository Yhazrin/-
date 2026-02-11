import type { RenderEntitySnapshot } from '../core/renderTypes.js';
import { distance, vec3, type Vector3 } from '../types/math.js';

export interface CullingStats {
  totalSeen: number;
  totalCulled: number;
  totalVisible: number;
  cullRatio: number;
}

export class DistanceCuller {
  private seen = 0;
  private culled = 0;
  private visible = 0;

  constructor(private readonly cameraPosition: Vector3 = vec3(0, 25, 30), private readonly maxDistance = 80) {}

  filter(entities: RenderEntitySnapshot[]): RenderEntitySnapshot[] {
    this.seen += entities.length;
    const visible = entities.filter((e) => distance(e.position, this.cameraPosition) <= this.maxDistance);
    this.visible += visible.length;
    this.culled += entities.length - visible.length;
    return visible;
  }

  stats(): CullingStats {
    return {
      totalSeen: this.seen,
      totalCulled: this.culled,
      totalVisible: this.visible,
      cullRatio: this.seen === 0 ? 0 : this.culled / this.seen,
    };
  }
}
