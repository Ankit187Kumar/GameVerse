const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to write a big-endian 32-bit integer to a buffer
function writeInt32(buf, offset, value) {
  buf.writeUInt32BE(value, offset);
}

// Calculate CRC32 for PNG chunks
const CRC_TABLE = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

// Create a chunk buffer
function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const checkBuf = Buffer.concat([typeBuf, data]);
  crcBuf.writeInt32BE(crc32(checkBuf), 0);

  return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
}

/**
 * Generate a transparent PNG with a colored border in Pure Node.js
 */
function generateBorderPNG(width, height, borderWidth, r, g, b, outputPath) {
  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR Data
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;     // Bit depth: 8 bits per channel
  ihdrData[9] = 6;     // Color type: 6 (RGBA)
  ihdrData[10] = 0;    // Compression: 0 (deflate)
  ihdrData[11] = 0;    // Filter: 0
  ihdrData[12] = 0;    // Interlace: 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Pixel Data
  // PNG raw scanline format: [filter type byte (0)] [rgba rgba rgba ...]
  // For width 1080, height 1920:
  // Each scanline is 1 + 1080 * 4 = 4321 bytes.
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type: 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Determine if this pixel is within the border
      const isBorder = 
        x < borderWidth || 
        x >= (width - borderWidth) || 
        y < borderWidth || 
        y >= (height - borderWidth);

      if (isBorder) {
        rawData[pixelOffset] = r;     // R
        rawData[pixelOffset + 1] = g; // G
        rawData[pixelOffset + 2] = b; // B
        rawData[pixelOffset + 3] = 255; // Alpha (fully opaque border)
      } else {
        rawData[pixelOffset] = 0;     // R
        rawData[pixelOffset + 1] = 0; // G
        rawData[pixelOffset + 2] = 0; // B
        rawData[pixelOffset + 3] = 0;   // Alpha (fully transparent interior)
      }
    }
  }

  // Compress IDAT data using zlib deflate
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  // Combine and write to file
  const pngFile = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, pngFile);
  console.log(`Generated frame image: ${path.basename(outputPath)}`);
}

// Generate the three templates in the frame directory
const framesDir = path.join(__dirname, 'public/frames');
generateBorderPNG(1080, 1920, 30, 239, 68, 68, path.join(framesDir, 'frame_1.png'));   // Spider-Man Red #EF4444
generateBorderPNG(1080, 1920, 30, 99, 102, 241, path.join(framesDir, 'frame_2.png'));  // Space Indigo #6366F1
generateBorderPNG(1080, 1920, 30, 6, 182, 212, path.join(framesDir, 'frame_3.png'));   // Cyberpunk Cyan #06B6D4
generateBorderPNG(1080, 1920, 30, 245, 158, 11, path.join(framesDir, 'frame_4.png'));  // Gold #F59E0B

console.log('Pure JS PNG frame generation completed successfully.');
