import { readFileSync } from 'node:fs';

export function isJpegBuffer(bytes) {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

/** SOF0/SOF1/SOF2: altura e largura. Sem decoder externo. */
export function readJpegDimensionsFromBytes(bytes) {
  if (!isJpegBuffer(bytes)) throw new Error('não é JPEG (magic bytes)');
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) throw new Error('JPEG malformado');
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    if (offset + 4 > bytes.length) break;
    const size = bytes.readUInt16BE(offset + 2);
    if (size < 2) throw new Error('JPEG segment size inválido');
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      const height = bytes.readUInt16BE(offset + 5);
      const width = bytes.readUInt16BE(offset + 7);
      if (width < 1 || height < 1) throw new Error(`JPEG ${width}x${height}`);
      return { width, height };
    }
    offset += 2 + size;
  }
  throw new Error('JPEG sem SOF');
}

export function readJpegDimensions(filePath) {
  return readJpegDimensionsFromBytes(readFileSync(filePath));
}
