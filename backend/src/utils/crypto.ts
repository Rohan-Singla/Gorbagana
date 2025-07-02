import crypto from 'crypto'

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export function xorHex(hex1: string, hex2: string): string {
  const buf1 = Buffer.from(hex1, 'hex')
  const buf2 = Buffer.from(hex2, 'hex')
  const res = Buffer.alloc(Math.min(buf1.length, buf2.length))

  for (let i = 0; i < res.length; i++) {
    res[i] = buf1[i] ^ buf2[i]
  }
  return res.toString('hex')
}
