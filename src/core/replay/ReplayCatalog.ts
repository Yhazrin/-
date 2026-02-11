export interface ReplayArtifact {
  id: string;
  createdAt: number;
  sizeBytes: number;
  frameCount: number;
  tags: string[];
}

export class ReplayCatalog {
  private readonly items: ReplayArtifact[] = [];

  add(item: ReplayArtifact): void {
    this.items.push(item);
    this.items.sort((a, b) => b.createdAt - a.createdAt);
  }

  list(limit = 50): ReplayArtifact[] {
    return this.items.slice(0, limit);
  }

  findByTag(tag: string): ReplayArtifact[] {
    return this.items.filter((item) => item.tags.includes(tag));
  }

  remove(id: string): boolean {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }
}
