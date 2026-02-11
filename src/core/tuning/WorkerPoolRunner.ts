export class WorkerPoolRunner {
  constructor(private readonly concurrency = 4) {}

  async run<T, R>(items: T[], task: (item: T) => Promise<R>): Promise<R[]> {
    const out: R[] = [];
    const n = Math.max(1, this.concurrency);
    let cursor = 0;

    const worker = async () => {
      while (cursor < items.length) {
        const idx = cursor;
        cursor += 1;
        out[idx] = await task(items[idx]!);
      }
    };

    await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
    return out;
  }
}
