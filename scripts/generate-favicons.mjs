import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');
const sourcePath = resolve(__dirname, '..', 'src', 'assets', 'logo.png');

const sizes = [
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192.png', size: 192 },
  { name: 'android-chrome-512.png', size: 512 },
];

const source = readFileSync(sourcePath);

for (const { name, size } of sizes) {
  const buffer = await sharp(source)
    .resize(size, size, { fit: 'contain', background: { r: 5, g: 20, b: 36, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(resolve(publicDir, name), buffer);
  console.log(`✓ ${name} (${size}x${size}) — ${buffer.length} bytes`);
}

const icoSizes = [16, 32, 48];
const icoBuffers = await Promise.all(
  icoSizes.map((size) =>
    sharp(source)
      .resize(size, size, { fit: 'contain', background: { r: 5, g: 20, b: 36, alpha: 1 } })
      .png()
      .toBuffer()
  )
);

const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(icoSizes.length, 4);

const icoEntries = [];
let icoOffset = 6 + 16 * icoSizes.length;
const icoImages = [];
for (let i = 0; i < icoSizes.length; i += 1) {
  const size = icoSizes[i];
  const buf = icoBuffers[i];
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0);
  entry.writeUInt8(size === 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(buf.length, 8);
  entry.writeUInt32LE(icoOffset, 12);
  icoEntries.push(entry);
  icoImages.push(buf);
  icoOffset += buf.length;
}

const icoBuffer = Buffer.concat([icoHeader, ...icoEntries, ...icoImages]);
writeFileSync(resolve(publicDir, 'favicon.ico'), icoBuffer);
console.log(`✓ favicon.ico (multi-tamaño 16/32/48) — ${icoBuffer.length} bytes`);

console.log('\nTodos los favicons generados con éxito.');
