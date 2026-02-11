import { SimulationWorkerRuntime } from './SimulationWorkerRuntime.js';
import type { WorkerRequest, WorkerResponse } from './WorkerProtocol.js';

export interface WorkerGlobalLike {
  postMessage: (message: WorkerResponse) => void;
  onmessage: ((event: { data: WorkerRequest }) => void) | null;
}

/**
 * Bind simulation runtime to a real worker global scope.
 *
 * Usage in worker entry:
 *   import { createSimulationWorker } from '...';
 *   createSimulationWorker(self as unknown as WorkerGlobalLike);
 */
export const createSimulationWorker = (scope: WorkerGlobalLike): SimulationWorkerRuntime => {
  const runtime = new SimulationWorkerRuntime({
    postMessage: (message) => scope.postMessage(message),
  });

  scope.onmessage = (event) => runtime.handle(event.data);
  return runtime;
};
