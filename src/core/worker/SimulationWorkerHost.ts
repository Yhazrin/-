import type { RuntimeCheckpoint } from '../SimulationRuntime.js';
import type { RenderFrame } from '../renderTypes.js';
import type { WorkerLike, WorkerRequest, WorkerResponse } from './WorkerProtocol.js';

export interface SimulationWorkerHostHooks {
  onFrame?: (frame: RenderFrame) => void;
  onCheckpoint?: (checkpoint: RuntimeCheckpoint) => void;
  onError?: (message: string) => void;
}

export class SimulationWorkerHost {
  constructor(private readonly worker: WorkerLike, private readonly hooks: SimulationWorkerHostHooks = {}) {
    this.worker.onmessage = (event) => this.handleMessage(event.data);
  }

  init(payload: Extract<WorkerRequest, { type: 'init' }>['payload'] = {}): void {
    this.worker.postMessage({ type: 'init', payload });
  }

  bootstrap(payload: Extract<WorkerRequest, { type: 'bootstrap' }>['payload']): void {
    this.worker.postMessage({ type: 'bootstrap', payload });
  }

  step(delta?: number): void {
    this.worker.postMessage({ type: 'step', payload: { delta } });
  }

  run(delta?: number, maxSteps?: number): void {
    this.worker.postMessage({ type: 'run', payload: { delta, maxSteps } });
  }

  checkpoint(timelineTail = 120): void {
    this.worker.postMessage({ type: 'checkpoint', payload: { timelineTail } });
  }

  stop(): void {
    this.worker.postMessage({ type: 'stop' });
  }

  private handleMessage(message: WorkerResponse): void {
    if (message.type === 'frame') this.hooks.onFrame?.(message.payload);
    if (message.type === 'checkpoint') this.hooks.onCheckpoint?.(message.payload);
    if (message.type === 'error') this.hooks.onError?.(message.payload.message);
  }
}
