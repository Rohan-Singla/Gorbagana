import crypto from 'crypto'

export function sha256(data: string) {
  const hex = crypto.createHash('sha256').update(data).digest('hex');
  console.log("🔸 Backend hash for:", data, "=>", hex);
  return hex;
}


export function xorHex(hex1: string, hex2: string): string {
  if (hex1.length !== hex2.length) {
    throw new Error(`XOR input length mismatch: ${hex1.length} != ${hex2.length}`);
  }

  const b1 = Buffer.from(hex1, 'hex');
  const b2 = Buffer.from(hex2, 'hex');
  const result = Buffer.alloc(b1.length);

  for (let i = 0; i < b1.length; i++) {
    result[i] = b1[i] ^ b2[i];
  }

  return result.toString('hex');
}
