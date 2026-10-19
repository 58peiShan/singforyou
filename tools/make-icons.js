#!/usr/bin/env node
/* 產生主畫面圖示 PNG（game/icon-180.png、icon-192.png、icon-512.png）。零相依，只用 Node 內建 zlib。
   圖案和 game/icon.svg 相同：夜晚的海、月亮、海浪。一般不需要重跑。 */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.resolve(__dirname, '..', 'game');

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function sky(y) {
  const stops = [[0, '#06122a'], [0.55, '#1b2a5c'], [0.62, '#6b4b7c'], [0.63, '#0d2a55'], [1, '#030b1c']].map(([o, c]) => [o, hex(c)]);
  for (let i = 1; i < stops.length; i++) {
    if (y <= stops[i][0]) { const [o0, c0] = stops[i - 1]; const [o1, c1] = stops[i]; return mix(c0, c1, (y - o0) / (o1 - o0 || 1)); }
  }
  return stops[stops.length - 1][1];
}
function color(u, v) {
  // u, v ∈ [0,1]，對應 512×512 的 SVG 座標
  const X = u * 512, Y = v * 512;
  let c = sky(v);
  const dm = Math.hypot(X - 256, Y - 210);
  const glow = Math.max(0, 1 - dm / 150);
  c = mix(c, [216, 228, 255], glow * glow * 0.55);
  if (dm < 78) {
    const t = Math.hypot(X - 225, Y - 180) / 110;
    c = mix([255, 253, 246], [207, 200, 187], Math.min(1, t));
  }
  [[110, 110, 3], [400, 90, 2.5], [420, 180, 2], [80, 220, 2], [160, 60, 2]].forEach(([sx, sy, r]) => { if (Math.hypot(X - sx, Y - sy) < r) c = mix(c, [255, 255, 255], 0.85); });
  if (Y > 336 && Y < 388 && Math.abs(((Y - 340) % 22)) < 5 && Math.abs(X - 256) < 30 - (Y - 340) / 4) c = mix(c, [255, 246, 224], 0.5);
  const w1 = 400 + 14 * Math.sin((X / 192) * Math.PI) * -1;
  const w2 = 440 + 12 * Math.sin((X / 192) * Math.PI) * -1;
  if (Y > w1) c = hex('#10305c');
  if (Y > w2) c = hex('#081d40');
  if (Math.abs(Y - w1) < 2.2) c = mix(c, [147, 216, 204], 0.5);
  return c;
}
function render(size) {
  const buf = Buffer.alloc(size * size * 3);
  const ss = 3;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let acc = [0, 0, 0];
      for (let j = 0; j < ss; j++) for (let i = 0; i < ss; i++) {
        const c = color((x + (i + 0.5) / ss) / size, (y + (j + 0.5) / ss) / size);
        acc = acc.map((v, k) => v + c[k]);
      }
      const o = (y * size + x) * 3;
      buf[o] = Math.round(acc[0] / (ss * ss)); buf[o + 1] = Math.round(acc[1] / (ss * ss)); buf[o + 2] = Math.round(acc[2] / (ss * ss));
    }
  }
  return png(size, size, buf);
}
for (const s of [180, 192, 512]) {
  fs.writeFileSync(path.join(OUT, `icon-${s}.png`), render(s));
  console.log(`game/icon-${s}.png`);
}
