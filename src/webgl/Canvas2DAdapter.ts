import type { RenderEntitySnapshot, RenderFrame, RendererAdapter } from '../core/renderTypes.js';

export interface Canvas2DLike {
  canvas: { width: number; height: number };
  clearRect(x: number, y: number, w: number, h: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  beginPath(): void;
  arc(x: number, y: number, r: number, start: number, end: number): void;
  fill(): void;
  fillText(text: string, x: number, y: number): void;
  set fillStyle(value: string);
  set font(value: string);
}

export interface Canvas2DAdapterOptions {
  ctx: Canvas2DLike;
  worldSize?: number;
  pointRadius?: number;
  palette?: Record<string, string>;
}

export class Canvas2DAdapter implements RendererAdapter {
  private readonly ctx: Canvas2DLike;
  private readonly worldSize: number;
  private readonly pointRadius: number;
  private readonly palette: Record<string, string>;

  constructor(options: Canvas2DAdapterOptions) {
    this.ctx = options.ctx;
    this.worldSize = options.worldSize ?? 120;
    this.pointRadius = options.pointRadius ?? 4;
    this.palette = {
      predator: '#ff6b6b',
      neutral: '#6bcff6',
      plant: '#9be564',
      ...(options.palette ?? {}),
    };
  }

  onFrame(frame: RenderFrame): void {
    const { width, height } = this.ctx.canvas;
    this.ctx.fillStyle = '#111827';
    this.ctx.fillRect(0, 0, width, height);

    for (const entity of frame.entities) {
      this.drawEntity(entity, width, height);
    }

    this.ctx.fillStyle = '#e5e7eb';
    this.ctx.font = '12px sans-serif';
    this.ctx.fillText(
      `tick=${frame.tick} total=${frame.counts.total} p=${frame.counts.predators} n=${frame.counts.neutrals} pl=${frame.counts.plants}`,
      8,
      16,
    );
    this.ctx.fillText(`season=${frame.season} energy=${frame.avgEnergy.toFixed(1)} health=${frame.avgHealth.toFixed(1)}`, 8, 32);
  }

  private drawEntity(entity: RenderEntitySnapshot, width: number, height: number): void {
    const x = ((entity.position.x + this.worldSize / 2) / this.worldSize) * width;
    const y = ((entity.position.z + this.worldSize / 2) / this.worldSize) * height;
    this.ctx.beginPath();
    this.ctx.fillStyle = this.palette[entity.type] ?? '#ffffff';
    this.ctx.arc(x, y, this.pointRadius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
