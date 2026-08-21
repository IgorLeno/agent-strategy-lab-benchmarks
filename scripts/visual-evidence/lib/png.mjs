import { readFileSync } from 'node:fs';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Lê largura e altura do IHDR. Sem dependência de decoder. */
export function readPngDimensions(filePath) {
  const bytes = readFileSync(filePath);
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(PNG_MAGIC)) {
    throw new Error(`não é um PNG válido: ${filePath}`);
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width < 1 || height < 1) {
    throw new Error(`dimensões PNG inválidas ${width}x${height}: ${filePath}`);
  }
  return { width, height };
}
