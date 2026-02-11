import type { TimelinePoint } from './types.js';

export interface PlaybackState {
  index: number;
  playing: boolean;
  speed: number;
  current: TimelinePoint | null;
}

export class TimelinePlayer {
  private index = 0;
  private playing = false;
  private speed = 1;

  constructor(private readonly timeline: TimelinePoint[]) {}

  play(speed = 1): void {
    this.playing = true;
    this.speed = Math.max(0.25, Math.min(8, speed));
  }

  pause(): void {
    this.playing = false;
  }

  seek(index: number): TimelinePoint | null {
    this.index = Math.max(0, Math.min(this.timeline.length - 1, index));
    return this.timeline[this.index] ?? null;
  }

  tick(): TimelinePoint | null {
    if (!this.playing || this.timeline.length === 0) return this.timeline[this.index] ?? null;
    this.index = Math.min(this.timeline.length - 1, this.index + Math.max(1, Math.floor(this.speed)));
    return this.timeline[this.index] ?? null;
  }

  state(): PlaybackState {
    return {
      index: this.index,
      playing: this.playing,
      speed: this.speed,
      current: this.timeline[this.index] ?? null,
    };
  }
}
