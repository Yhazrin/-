import type { RecordedFrame } from '../FrameRecorder.js';

const MAGIC = 0x45534d52; // ESMR
const VERSION = 1;

export class BinaryReplayCodec {
  encode(frames: RecordedFrame[]): Uint8Array {
    const entityCount = frames.reduce((sum, f) => sum + f.entities.length, 0);
    const bytes = 16 + frames.length * 32 + entityCount * 40;
    const buffer = new ArrayBuffer(bytes);
    const view = new DataView(buffer);
    let offset = 0;

    view.setUint32(offset, MAGIC); offset += 4;
    view.setUint16(offset, VERSION); offset += 2;
    view.setUint16(offset, 0); offset += 2;
    view.setUint32(offset, frames.length); offset += 4;
    view.setUint32(offset, entityCount); offset += 4;

    for (const frame of frames) {
      view.setFloat64(offset, frame.t); offset += 8;
      view.setUint32(offset, frame.tick); offset += 4;
      view.setUint16(offset, frame.counts.total); offset += 2;
      view.setUint16(offset, frame.counts.predators); offset += 2;
      view.setUint16(offset, frame.counts.plants); offset += 2;
      view.setUint16(offset, frame.counts.neutrals); offset += 2;
      view.setUint8(offset, this.seasonCode(frame.season)); offset += 1;
      view.setUint8(offset, frame.entities.length); offset += 1;
      view.setUint16(offset, 0); offset += 2;

      for (const e of frame.entities) {
        view.setUint32(offset, this.hash(e.id)); offset += 4;
        view.setUint8(offset, this.typeCode(e.type)); offset += 1;
        view.setUint8(offset, 0); offset += 1;
        view.setUint16(offset, 0); offset += 2;
        view.setFloat32(offset, e.x); offset += 4;
        view.setFloat32(offset, e.y); offset += 4;
        view.setFloat32(offset, e.z); offset += 4;
        view.setFloat32(offset, e.e); offset += 4;
        view.setFloat32(offset, e.h); offset += 4;
        view.setUint32(offset, 0); offset += 4;
        view.setUint32(offset, 0); offset += 4;
      }
    }

    return new Uint8Array(buffer, 0, offset);
  }

  decode(data: Uint8Array): RecordedFrame[] {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 0;
    const magic = view.getUint32(offset); offset += 4;
    if (magic !== MAGIC) throw new Error('Invalid replay magic');
    const version = view.getUint16(offset); offset += 2;
    if (version !== VERSION) throw new Error(`Unsupported replay version ${version}`);
    offset += 2;
    const frameCount = view.getUint32(offset); offset += 4;
    offset += 4;

    const frames: RecordedFrame[] = [];
    for (let i = 0; i < frameCount; i += 1) {
      const t = view.getFloat64(offset); offset += 8;
      const tick = view.getUint32(offset); offset += 4;
      const total = view.getUint16(offset); offset += 2;
      const predators = view.getUint16(offset); offset += 2;
      const plants = view.getUint16(offset); offset += 2;
      const neutrals = view.getUint16(offset); offset += 2;
      const season = this.seasonFromCode(view.getUint8(offset)); offset += 1;
      const entityLen = view.getUint8(offset); offset += 1;
      offset += 2;

      const entities: RecordedFrame['entities'] = [];
      for (let n = 0; n < entityLen; n += 1) {
        const idHash = view.getUint32(offset); offset += 4;
        const type = this.typeFromCode(view.getUint8(offset)); offset += 1;
        offset += 3;
        const x = view.getFloat32(offset); offset += 4;
        const y = view.getFloat32(offset); offset += 4;
        const z = view.getFloat32(offset); offset += 4;
        const e = view.getFloat32(offset); offset += 4;
        const h = view.getFloat32(offset); offset += 4;
        offset += 8;

        entities.push({ id: `h_${idHash.toString(16)}`, type, x, y, z, e, h });
      }

      frames.push({ t, tick, counts: { total, predators, plants, neutrals }, season, entities });
    }

    return frames;
  }

  private seasonCode(season: string): number {
    if (season === 'spring') return 0;
    if (season === 'summer') return 1;
    if (season === 'autumn') return 2;
    if (season === 'winter') return 3;
    return 0;
  }

  private seasonFromCode(code: number): string {
    if (code === 0) return 'spring';
    if (code === 1) return 'summer';
    if (code === 2) return 'autumn';
    if (code === 3) return 'winter';
    return 'spring';
  }

  private typeCode(type: string): number {
    if (type === 'predator') return 0;
    if (type === 'neutral') return 1;
    return 2;
  }

  private typeFromCode(code: number): string {
    if (code === 0) return 'predator';
    if (code === 1) return 'neutral';
    return 'plant';
  }

  private hash(input: string): number {
    let h = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
}
