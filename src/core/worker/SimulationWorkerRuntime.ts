import { SimulationRuntime } from '../SimulationRuntime.js';
import type { WorkerRequest, WorkerResponse } from './WorkerProtocol.js';

export interface WorkerRuntimePort {
  postMessage(message: WorkerResponse): void;
}

/**
 * Runtime that can be hosted inside a WebWorker.
 * It is transport-agnostic and only needs a `postMessage`-compatible port.
 */
export class SimulationWorkerRuntime {
  private readonly runtime = new SimulationRuntime();
  private readonly port: WorkerRuntimePort;

  constructor(port: WorkerRuntimePort) {
    this.port = port;
    this.runtime.getRenderBridge().register({
      onFrame: (frame) => this.port.postMessage({ type: 'frame', payload: frame }),
    });
  }

  handle(message: WorkerRequest): void {
    try {
      if (message.type === 'init') {
        this.port.postMessage({ type: 'inited', payload: { acceptedCanvas: Boolean(message.payload.canvas) } });
        return;
      }

      if (message.type === 'bootstrap') {
        this.runtime.bootstrap(message.payload);
        return;
      }

      if (message.type === 'step') {
        this.runtime.step(message.payload?.delta);
        return;
      }

      if (message.type === 'run') {
        const history = this.runtime.run({ delta: message.payload?.delta, maxSteps: message.payload?.maxSteps });
        this.port.postMessage({ type: 'run:done', payload: { steps: history.length } });
        return;
      }

      if (message.type === 'checkpoint') {
        const checkpoint = this.runtime.checkpoint(message.payload?.timelineTail ?? 120);
        this.port.postMessage({ type: 'checkpoint', payload: checkpoint });
        return;
      }

      if (message.type === 'stop') {
        this.runtime.stop();
      }
    } catch (error) {
      this.port.postMessage({
        type: 'error',
        payload: { message: error instanceof Error ? error.message : 'Unknown worker runtime error' },
      });
    }
  }
}
