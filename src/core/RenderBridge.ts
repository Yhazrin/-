import type { EcosystemManager } from './EcosystemManager.js';
import type { RendererAdapter, RenderFrame } from './renderTypes.js';

export interface RenderBridgeStats {
  adapterCount: number;
  totalFlushes: number;
  totalAdapterErrors: number;
}

export interface RenderBridgeOptions {
  strictAdapterIsolation?: boolean;
  onAdapterError?: (error: unknown, adapter: RendererAdapter) => void;
}

export class RenderBridge {
  private readonly adapters = new Set<RendererAdapter>();
  private totalFlushes = 0;
  private totalAdapterErrors = 0;

  constructor(private readonly ecosystem: EcosystemManager, private readonly options: RenderBridgeOptions = {}) {}

  register(adapter: RendererAdapter): () => void {
    this.adapters.add(adapter);
    return () => {
      this.adapters.delete(adapter);
      adapter.dispose?.();
    };
  }

  createFrame(): RenderFrame {
    return this.ecosystem.exportRenderFrame();
  }

  flush(): RenderFrame {
    const frame = this.createFrame();
    this.totalFlushes += 1;

    for (const adapter of this.adapters) {
      try {
        adapter.onFrame(frame);
      } catch (error) {
        this.totalAdapterErrors += 1;
        this.options.onAdapterError?.(error, adapter);
        if (this.options.strictAdapterIsolation === false) {
          throw error;
        }
      }
    }
    return frame;
  }

  stats(): RenderBridgeStats {
    return {
      adapterCount: this.adapters.size,
      totalFlushes: this.totalFlushes,
      totalAdapterErrors: this.totalAdapterErrors,
    };
  }

  clear(): void {
    for (const adapter of this.adapters) adapter.dispose?.();
    this.adapters.clear();
  }
}
