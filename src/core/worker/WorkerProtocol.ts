import type { RuntimeCheckpoint } from '../SimulationRuntime.js';
import type { RenderFrame } from '../renderTypes.js';

export interface OffscreenCanvasLike {
  width: number;
  height: number;
}

export type WorkerRequest =
  | { type: 'init'; payload: { canvas?: OffscreenCanvasLike; options?: Record<string, unknown> } }
  | { type: 'resize'; payload: { width: number; height: number } }
  | { type: 'bootstrap'; payload: { plants: number; predators: number; neutrals: number; seed?: number } }
  | { type: 'step'; payload?: { delta?: number } }
  | { type: 'run'; payload?: { delta?: number; maxSteps?: number } }
  | { type: 'checkpoint'; payload?: { timelineTail?: number } }
  | { type: 'stop' };

export type WorkerResponse =
  | { type: 'inited'; payload: { acceptedCanvas: boolean } }
  | { type: 'resized'; payload: { width: number; height: number } }
  | { type: 'frame'; payload: RenderFrame }
  | { type: 'checkpoint'; payload: RuntimeCheckpoint }
  | { type: 'run:done'; payload: { steps: number } }
  | { type: 'error'; payload: { message: string } };

export interface WorkerLike {
  postMessage(message: WorkerRequest): void;
  onmessage: ((event: { data: WorkerResponse }) => void) | null;
}
