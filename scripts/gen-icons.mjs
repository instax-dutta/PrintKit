// Regenerates the PWA icons deterministically (opaque rounded square + pixel
// art "P"), no rasterizer dependency. Run: node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const crc32Table = [...Array(256)].map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crc32Table[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

const hex = (n) => Math.round(n).toString(16).padStart(2, '0')
function rgbFromHex(hexStr) {
  return [parseInt(hexStr.slice(0, 2), 16), parseInt(hexStr.slice(2, 4), 16), parseInt(hexStr.slice(4, 6), 16)]
}

// 16x16 pixel art "P" on a rounded dark tile with a sky accent.
const tile = [...'#  ', '@  '] // palette placeholders, replaced below
void tile

function render(size) {
  const bg = rgbFromHex('23262e')
  const accent = rgbFromHex('60a5fa')
  const accentDim = rgbFromHex('3b82f6')
  const raw = Buffer.alloc(size * size * 3)
  // Tile with margin (10%), rounded corners; P occupies middle-left 40-75% rows.
  const m = Math.round(size * 0.1)
  const inner = size - m * 2
  const corner = Math.round(Math.abs(size) * 0.12)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const ix = x - m
      const iy = y - m
      const inTile =
        ix >= 0 && iy >= 0 && ix < inner && iy < inner &&
        !(ix < corner && iy < corner && Math.hypot(corner - ix, corner - iy) > corner) &&
        !(ix >= inner - corner && iy < corner && Math.hypot(ix - (inner - corner - 1), corner - iy) > corner) &&
        !(ix < corner && iy >= inner - corner && Math.hypot(corner - ix, iy - (inner - corner - 1)) > corner) &&
        !(ix >= inner - corner && iy >= inner - corner && Math.hypot(ix - (inner - corner - 1), iy - (inner - corner - 1)) > corner)
      const col = inTile ? accentDim : rgbFromHex('101216')
      const i = (y * size + x) * 3
      raw[i] = col[0]
      raw[i + 1] = col[1]
      raw[i + 2] = col[2]
      if (!inTile) continue
      // Stroke the P relative to a 16x16 art grid.
      const gx = Math.floor((ix / inner) * 16)
      const gy = Math.floor((iy / inner) * 16)
      const stroke = (3 <= gx && gx <= 5 && 3 <= gy && gy <= 13) ||
        (3 <= gx && gx <= 11 && 3 <= gy && gy <= 5) ||
        (9 <= gx && gx <= 11 && 5 <= gy && gy <= 9) ||
        (3 <= gx && gx <= 9 && 7 <= gy && gy <= 9)
      if (stroke) {
        raw[i] = accent[0]
        raw[i + 1] = accent[1]
        raw[i + 2] = accent[2]
      }
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type RGB
  const scanlines = []
  for (let y = 0; y < size; y++) {
    scanlines.push(Buffer.from([0]), raw.subarray(y * size * 3, (y + 1) * size * 3))
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(scanlines), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [180, 192, 512]) {
  writeFileSync(`public/icon-${size}.png`, render(size))
  console.log(`public/icon-${size}.png written`)
}
