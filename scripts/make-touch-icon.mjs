/* Renders public/apple-touch-icon.png (180x180) from the favicon design without any image library.
   Run: node scripts/make-touch-icon.mjs */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SIZE = 180;
const SS = 3; // supersampling factor for anti-aliasing
const BG = [0xd9, 0x77, 0x57]; // terracotta
const FG = [0xfc, 0xfb, 0xf8]; // cream
const SCALE = SIZE / 64; // favicon is drawn on a 64-unit grid

// Rounded square: full-bleed (iOS masks its own corners), so just fill.
// Check mark: polyline (30,42) -> (36,48) -> (50,34), stroke 5.5 with round caps/joins.
const CHECK = [
  [30, 42],
  [36, 48],
  [50, 34],
].map(([x, y]) => [x * SCALE, y * SCALE]);
const CHECK_R = (5.5 * SCALE) / 2;
// Faint route behind it, approximated by short segments along the favicon's S-curve.
const ROUTE = [];
for (let t = 0; t <= 1; t += 0.05) {
  // cubic-ish path from (14,40) through (26,32),(38,24) to (26,16) is decorative; sample a smooth curve
  const x = 14 + 24 * Math.sin(Math.PI * t) ;
  const y = 40 - 24 * t;
  ROUTE.push([x * SCALE, y * SCALE]);
}
const ROUTE_R = (4 * SCALE) / 2;
const ROUTE_ALPHA = 0.55;

const distToSeg = (px, py, [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
};
const onPolyline = (px, py, pts, r) => {
  for (let i = 0; i < pts.length - 1; i++) if (distToSeg(px, py, pts[i], pts[i + 1]) <= r) return true;
  return false;
};

const pixels = new Uint8Array(SIZE * SIZE * 3);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    let cover = 0, routeCover = 0;
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const px = x + (sx + 0.5) / SS, py = y + (sy + 0.5) / SS;
        if (onPolyline(px, py, CHECK, CHECK_R)) cover++;
        else if (onPolyline(px, py, ROUTE, ROUTE_R)) routeCover++;
      }
    }
    const a = cover / (SS * SS);
    const ra = (routeCover / (SS * SS)) * ROUTE_ALPHA;
    const i = (y * SIZE + x) * 3;
    for (let c = 0; c < 3; c++) {
      const v = BG[c] * (1 - a - ra) + FG[c] * (a + ra);
      pixels[i + c] = Math.round(v);
    }
  }
}

// PNG encoding
const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // RGB
const raw = Buffer.alloc((SIZE * 3 + 1) * SIZE);
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 3 + 1)] = 0; // filter: none
  Buffer.from(pixels.buffer, y * SIZE * 3, SIZE * 3).copy(raw, y * (SIZE * 3 + 1) + 1);
}
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'apple-touch-icon.png');
writeFileSync(out, png);
console.log(`wrote ${out} (${png.length} bytes)`);
