export interface PoolWorker<T, R> {
  run(payload: T): Promise<R>;
  terminate?(): Promise<void> | void;
}

export interface PoolWorkerFactory<T, R> {
  create(workerId: number): Promise<PoolWorker<T, R>> | PoolWorker<T, R>;
}

/**
 * Executes tasks on long-lived workers (e.g. WebWorker / worker_threads wrappers).
 */
export class ThreadedWorkerPoolRunner<T, R> {
  constructor(
    private readonly factory: PoolWorkerFactory<T, R>,
    private readonly concurrency = 4,
  ) {}

  async run(items: T[]): Promise<R[]> {
    if (items.length === 0) return [];
    const n = Math.max(1, Math.min(this.concurrency, items.length));
    const workers = await Promise.all(Array.from({ length: n }, (_, i) => this.factory.create(i)));
    const out: R[] = new Array(items.length);
    let cursor = 0;

    const consume = async (worker: PoolWorker<T, R>) => {
      while (true) {
        const index = cursor;
        cursor += 1;
        if (index >= items.length) return;
        out[index] = await worker.run(items[index]!);
      }
    };

    try {
      await Promise.all(workers.map((worker) => consume(worker)));
      return out;
    } finally {
      await Promise.all(workers.map((worker) => Promise.resolve(worker.terminate?.())));
    }
  }
}
