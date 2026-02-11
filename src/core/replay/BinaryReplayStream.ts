import type { RecordedFrame } from '../FrameRecorder.js';
import { BinaryReplayCodec } from './BinaryReplay.js';

export class BinaryReplayStream {
  private readonly codec = new BinaryReplayCodec();

  encodeChunks(frames: RecordedFrame[], chunkSize = 256): Uint8Array[] {
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < frames.length; i += chunkSize) {
      chunks.push(this.codec.encode(frames.slice(i, i + chunkSize)));
    }
    return chunks;
  }

  decodeChunks(chunks: Uint8Array[]): RecordedFrame[] {
    const frames: RecordedFrame[] = [];
    for (const chunk of chunks) {
      frames.push(...this.codec.decode(chunk));
    }
    return frames;
  }
}
