import crypto from 'crypto'

export function sha256(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex')
}

export function xorHex(hex1: string, hex2: string) {
  const b1 = Buffer.from(hex1, 'hex')
  const b2 = Buffer.from(hex2, 'hex')
  const len = Math.min(b1.length, b2.length)
  const result = Buffer.alloc(len)

  for (let i = 0; i < len; i++) {
    result[i] = b1[i] ^ b2[i]
  }

  return result.toString('hex')
}
