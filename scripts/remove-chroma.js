const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require('pngjs');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toAlphaFromDistance(distance, hardCutoff, softEdge) {
  if (distance <= hardCutoff) {
    return 0;
  }

  if (distance >= hardCutoff + softEdge) {
    return 255;
  }

  const ratio = (distance - hardCutoff) / softEdge;
  return Math.round(255 * ratio);
}

function run() {
  const [, , inputPath, outputPath] = process.argv;

  if (!inputPath || !outputPath) {
    throw new Error('Usage: node scripts/remove-chroma.js <input.png> <output.png>');
  }

  const source = PNG.sync.read(fs.readFileSync(inputPath));
  const data = source.data;
  const hardCutoff = 70;
  const softEdge = 95;
  const key = { r: 0, g: 255, b: 0 };
  let transparentCount = 0;
  let partialCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) {
      continue;
    }

    const distance = Math.sqrt(
      (r - key.r) * (r - key.r) +
        (g - key.g) * (g - key.g) +
        (b - key.b) * (b - key.b),
    );

    if (distance >= hardCutoff + softEdge) {
      continue;
    }

    const nextAlpha = toAlphaFromDistance(distance, hardCutoff, softEdge);
    const mixedAlpha = Math.min(a, nextAlpha);
    data[i + 3] = mixedAlpha;
    if (mixedAlpha === 0) {
      transparentCount += 1;
    } else if (mixedAlpha < 255) {
      partialCount += 1;
    }

    if (mixedAlpha > 0 && mixedAlpha < 255) {
      const blend = mixedAlpha / 255;
      data[i] = clamp(Math.round(r * blend), 0, 255);
      data[i + 1] = clamp(Math.round(g * blend), 0, 255);
      data[i + 2] = clamp(Math.round(b * blend), 0, 255);
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, PNG.sync.write(source));
  const pixelCount = source.width * source.height;
  console.log(
    `Processed ${path.basename(outputPath)} - transparent: ${transparentCount}, partial: ${partialCount}, total: ${pixelCount}`,
  );
}

run();
