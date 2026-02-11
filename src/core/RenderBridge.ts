import type { EcosystemManager } from './EcosystemManager.js';
import type { RendererAdapter, RenderFrame } from './renderTypes.js';

export class RenderBridge {
  private readonly adapters = new Set<RendererAdapter>();

  constructor(private readonly ecosystem: EcosystemManager) {}

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
    for (const adapter of this.adapters) {
      adapter.onFrame(frame);
    }
    return frame;
  }

  clear(): void {
    for (const adapter of this.adapters) adapter.dispose?.();
    this.adapters.clear();
  }
}
