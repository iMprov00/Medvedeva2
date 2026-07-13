import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimizeUploadedImages } from '../src/utils/imageProcessing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

const RASTER_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function uploadKind(name) {
  if (name.includes('-thumb.') || name.includes('-full.')) return 'gallery';
  if (name.includes('-card.') || name.includes('-full.')) return 'doctor';
  return 'doctor';
}

function variantPaths(baseName, kind) {
  if (kind === 'doctor') {
    return [`${baseName}-card.jpg`, `${baseName}-full.jpg`];
  }
  return [`${baseName}-thumb.jpg`, `${baseName}-full.jpg`];
}

function extractBaseName(filename) {
  return filename
    .replace(/-card\.jpg$/i, '')
    .replace(/-full\.jpg$/i, '')
    .replace(/-thumb\.jpg$/i, '')
    .replace(/\.(jpe?g|png|webp)$/i, '');
}

async function optimizeExistingUploads() {
  const entries = await readdir(uploadsDir);
  const processedBases = new Set();
  let optimizedCount = 0;

  for (const name of entries) {
    const ext = path.extname(name).toLowerCase();
    if (!RASTER_EXT.has(ext)) continue;
    if (/-(card|full|thumb)\./i.test(name)) continue;

    const baseName = extractBaseName(name);
    if (processedBases.has(baseName)) continue;
    processedBases.add(baseName);

    const filepath = path.join(uploadsDir, name);
    const original = await readFile(filepath);
    const mime =
      ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const kind = uploadKind(name);
    const { files } = await optimizeUploadedImages(original, mime, kind);

    for (const variant of files) {
      const nextName = `${baseName}${variant.suffix}${variant.ext}`;
      await writeFile(path.join(uploadsDir, nextName), variant.buffer);
    }

    const keepNames = new Set(variantPaths(baseName, kind));
    if (!keepNames.has(name)) {
      await unlink(filepath);
    }

    optimizedCount += 1;
    console.log(`${name} -> ${kind} variants (${original.length} bytes source)`);
  }

  console.log(`Optimized ${optimizedCount} upload(s).`);
}

optimizeExistingUploads().catch((error) => {
  console.error(error);
  process.exit(1);
});
