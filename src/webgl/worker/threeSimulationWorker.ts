import { createSimulationWorker, type WorkerGlobalLike } from '../../core/worker/createSimulationWorker.js';

/**
 * Browser worker entrypoint:
 * import { bindThreeSimulationWorker } from '.../threeSimulationWorker';
 * bindThreeSimulationWorker(self as unknown as WorkerGlobalLike);
 */
export const bindThreeSimulationWorker = (scope: WorkerGlobalLike): void => {
  createSimulationWorker(scope);
};
