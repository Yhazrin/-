import { IncrementalReplayStore } from './IncrementalReplayStore.js';
import type { ReplayChunkMeta } from './IncrementalReplayStore.js';

export interface ReplayStorageAdapter {
  writeChunk(meta: ReplayChunkMeta, data: Uint8Array): Promise<void>;
  readChunk(meta: ReplayChunkMeta): Promise<Uint8Array>;
  removeChunk?(meta: ReplayChunkMeta): Promise<void>;
}

export interface FileBridge {
  write(path: string, data: Uint8Array): Promise<void>;
  read(path: string): Promise<Uint8Array>;
  remove?(path: string): Promise<void>;
}

export class FileReplayStorageAdapter implements ReplayStorageAdapter {
  constructor(private readonly bridge: FileBridge, private readonly prefix = 'replay') {}

  async writeChunk(meta: ReplayChunkMeta, data: Uint8Array): Promise<void> {
    await this.bridge.write(this.pathOf(meta), data);
  }

  async readChunk(meta: ReplayChunkMeta): Promise<Uint8Array> {
    return this.bridge.read(this.pathOf(meta));
  }

  async removeChunk(meta: ReplayChunkMeta): Promise<void> {
    await this.bridge.remove?.(this.pathOf(meta));
  }

  private pathOf(meta: ReplayChunkMeta): string {
    return `${this.prefix}/${meta.index}_${meta.checksum}.bin`;
  }
}

export interface HttpClient {
  put(url: string, body: Uint8Array): Promise<void>;
  get(url: string): Promise<Uint8Array>;
  delete?(url: string): Promise<void>;
}

export class RemoteReplayStorageAdapter implements ReplayStorageAdapter {
  constructor(private readonly http: HttpClient, private readonly baseUrl: string) {}

  async writeChunk(meta: ReplayChunkMeta, data: Uint8Array): Promise<void> {
    await this.http.put(this.urlOf(meta), data);
  }

  async readChunk(meta: ReplayChunkMeta): Promise<Uint8Array> {
    return this.http.get(this.urlOf(meta));
  }

  async removeChunk(meta: ReplayChunkMeta): Promise<void> {
    await this.http.delete?.(this.urlOf(meta));
  }

  private urlOf(meta: ReplayChunkMeta): string {
    return `${this.baseUrl.replace(/\/$/, '')}/${meta.index}_${meta.checksum}.bin`;
  }
}

export class ReplayPersistenceService {
  constructor(
    private readonly store: IncrementalReplayStore,
    private readonly adapter: ReplayStorageAdapter,
  ) {}

  async flushAll(): Promise<ReplayChunkMeta[]> {
    const meta = this.store.listMeta();
    const chunks = this.store.readAllValidated();
    for (let i = 0; i < meta.length; i += 1) {
      await this.adapter.writeChunk(meta[i]!, chunks[i]!);
    }
    return meta;
  }

  async restore(meta: ReplayChunkMeta[]): Promise<Uint8Array[]> {
    const out: Uint8Array[] = [];
    for (const item of meta) {
      out.push(await this.adapter.readChunk(item));
    }
    return out;
  }
}
