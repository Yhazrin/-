import { SimulationRuntime } from '../core/SimulationRuntime.js';
import { createSimulationWorker, type WorkerGlobalLike } from '../core/worker/createSimulationWorker.js';
import { SimulationWorkerHost } from '../core/worker/SimulationWorkerHost.js';
import { ThreeAdapter } from './ThreeAdapter.js';
import type { InstanceWriteTarget } from './ThreeAdapter.js';

export interface ThreeShellOptions {
  useWorker?: boolean;
  worker?: { postMessage: (msg: unknown) => void; onmessage: ((e: { data: unknown }) => void) | null };
  workerScopeFactory?: () => WorkerGlobalLike;
  targets: {
    predator: InstanceWriteTarget;
    neutral: InstanceWriteTarget;
    plant: InstanceWriteTarget;
  };
  stepDelta?: number;
}

/**
 * Thin application shell to wire runtime + renderer in either single-thread or worker mode.
 */
export class ThreeShell {
  private readonly runtime: SimulationRuntime | null;
  private readonly host: SimulationWorkerHost | null;
  private readonly stepDelta: number;

  constructor(private readonly options: ThreeShellOptions) {
    this.stepDelta = options.stepDelta ?? 1 / 30;

    if (options.useWorker) {
      const scope = options.workerScopeFactory?.();
      if (scope) createSimulationWorker(scope);

      const workerLike = options.worker as never;
      if (!workerLike) throw new Error('Worker mode requires `worker` transport');
      this.host = new SimulationWorkerHost(workerLike, {
        onFrame: (frame) => {
          new ThreeAdapter({ targets: options.targets }).onFrame(frame);
        },
      });
      this.runtime = null;
    } else {
      this.runtime = new SimulationRuntime();
      this.runtime.getRenderBridge().register(new ThreeAdapter({ targets: options.targets }));
      this.host = null;
    }
  }

  bootstrap(seed = { plants: 8, predators: 4, neutrals: 6, seed: 42 }): void {
    if (this.runtime) this.runtime.bootstrap(seed);
    if (this.host) this.host.bootstrap(seed);
  }

  step(): void {
    if (this.runtime) this.runtime.step(this.stepDelta);
    if (this.host) this.host.step(this.stepDelta);
  }
}
