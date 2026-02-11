import { crc32, type ChecksummedChunk, validateChunk } from './ReplayChecksum.js';

export interface ReplayChunkMeta {
  id: string;
  index: number;
  sizeBytes: number;
  checksum: number;
}

export class IncrementalReplayStore {
  private readonly chunks: ChecksummedChunk[] = [];

  append(data: Uint8Array): ReplayChunkMeta {
    const checksum = crc32(data);
    const index = this.chunks.length;
    this.chunks.push({ data, checksum });
    return { id: `chunk_${index}`, index, sizeBytes: data.byteLength, checksum };
  }

  listMeta(): ReplayChunkMeta[] {
    return this.chunks.map((c, i) => ({ id: `chunk_${i}`, index: i, sizeBytes: c.data.byteLength, checksum: c.checksum }));
  }

  readAllValidated(): Uint8Array[] {
    return this.chunks.filter(validateChunk).map((c) => c.data);
  }

  clear(): void {
    this.chunks.length = 0;
  }
}
