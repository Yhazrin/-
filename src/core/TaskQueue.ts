export type Task = {
  id: string;
  priority: number;
  run: () => void;
};

export class TaskQueue {
  private readonly queue: Task[] = [];

  enqueue(task: Task): void {
    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  drain(maxTasks = Infinity): string[] {
    const executed: string[] = [];
    let count = 0;
    while (this.queue.length > 0 && count < maxTasks) {
      const task = this.queue.shift();
      if (!task) break;
      task.run();
      executed.push(task.id);
      count += 1;
    }
    return executed;
  }

  size(): number {
    return this.queue.length;
  }
}
