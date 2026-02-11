export interface Task {
  id: string;
  priority: number;
  run: () => void;
}

export class TaskQueue {
  private readonly tasks: Task[] = [];

  enqueue(task: Task): void {
    this.tasks.push(task);
    this.tasks.sort((a, b) => b.priority - a.priority);
  }

  drain(max = Number.POSITIVE_INFINITY): string[] {
    const executed: string[] = [];
    let count = 0;
    while (this.tasks.length && count < max) {
      const task = this.tasks.shift();
      if (!task) break;
      task.run();
      executed.push(task.id);
      count += 1;
    }
    return executed;
  }

  clear(): void { this.tasks.length = 0; }
  size(): number { return this.tasks.length; }
}
