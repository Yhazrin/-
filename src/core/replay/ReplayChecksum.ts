export const crc32 = (input: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < input.length; i += 1) {
    crc ^= input[i]!;
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
};

export interface ChecksummedChunk {
  data: Uint8Array;
  checksum: number;
}

export const validateChunk = (chunk: ChecksummedChunk): boolean => crc32(chunk.data) === chunk.checksum;
