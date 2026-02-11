export type SimulationEventType =
  | 'tick:started'
  | 'tick:completed'
  | 'entity:born'
  | 'entity:died'
  | 'entity:added'
  | 'entity:removed';

export interface SimulationEvent<T = unknown> {
  type: SimulationEventType;
  tick: number;
  payload: T;
}

type Handler<T = unknown> = (event: SimulationEvent<T>) => void;

export class EventBus {
  private readonly handlers = new Map<SimulationEventType, Set<Handler>>();
  private readonly wildcard = new Set<Handler>();

  on<T = unknown>(type: SimulationEventType | '*', handler: Handler<T>): () => void {
    if (type === '*') {
      this.wildcard.add(handler as Handler);
      return () => this.wildcard.delete(handler as Handler);
    }

    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler as Handler);

    return () => {
      const set = this.handlers.get(type);
      if (!set) return;
      set.delete(handler as Handler);
      if (set.size === 0) this.handlers.delete(type);
    };
  }

  emit<T = unknown>(event: SimulationEvent<T>): void {
    const set = this.handlers.get(event.type);
    if (set) {
      for (const handler of set) handler(event);
    }
    for (const handler of this.wildcard) handler(event);
  }
}
