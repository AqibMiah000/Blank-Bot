const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function createPng(width, height, r, g, b, a) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const body = Buffer.concat([typeBuf, data]);
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < body.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ body[i]) & 0xFF];
    }
    crc = (crc ^ 0xFFFFFFFF) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, body, crcBuf]);
  }

  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xEDB88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = chunk('IHDR', ihdr);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createIcoFromPng(pngBuf) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry[0] = 0; // 256
  entry[1] = 0; // 256
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(22, 12);

  return Buffer.concat([header, entry, pngBuf]);
}

const buildDir = path.resolve(__dirname, '../build');
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

// Sleek solid pitch-black blank canvas icon (#0a0a0c)
// macOS electron-builder requires icon.png to be at least 512x512
const png512 = createPng(512, 512, 10, 10, 12, 255);
fs.writeFileSync(path.join(buildDir, 'icon.png'), png512);

const png256 = createPng(256, 256, 10, 10, 12, 255);
const ico = createIcoFromPng(png256);
fs.writeFileSync(path.join(buildDir, 'icon.ico'), ico);
console.log('Successfully generated build/icon.png (512x512) and build/icon.ico (256x256)');
