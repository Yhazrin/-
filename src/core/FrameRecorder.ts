import type { RenderFrame } from './renderTypes.js';

export interface RecordedFrame {
  t: number;
  tick: number;
  counts: RenderFrame['counts'];
  season: string;
  entities: Array<{ id: string; type: string; x: number; y: number; z: number; e: number; h: number }>;
}

export class FrameRecorder {
  private readonly frames: RecordedFrame[] = [];

  constructor(private readonly maxFrames = 36000) {}

  push(frame: RenderFrame, nowMs: number = Date.now()): void {
    this.frames.push({
      t: nowMs,
      tick: frame.tick,
      counts: frame.counts,
      season: frame.season,
      entities: frame.entities.map((e) => ({
        id: e.id,
        type: e.type,
        x: e.position.x,
        y: e.position.y,
        z: e.position.z,
        e: e.energy,
        h: e.health,
      })),
    });

    if (this.frames.length > this.maxFrames) {
      this.frames.splice(0, this.frames.length - this.maxFrames);
    }
  }

  list(): RecordedFrame[] {
    return [...this.frames];
  }

  exportJSON(): string {
    return JSON.stringify({ version: '1.0.0', frames: this.frames }, null, 2);
  }

  clear(): void {
    this.frames.length = 0;
  }
}
