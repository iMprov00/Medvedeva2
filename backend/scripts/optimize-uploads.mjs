import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimizeUploadedImage } from '../src/utils/imageProcessing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

async function optimizeExistingUploads() {
  const entries = await readdir(uploadsDir);
  let optimizedCount = 0;

  for (const name of entries) {
    const filepath = path.join(uploadsDir, name);
    const ext = path.extname(name).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

    const original = await readFile(filepath);
    const mime =
      ext === '.png'
        ? 'image/png'
        : ext === '.webp'
          ? 'image/webp'
          : 'image/jpeg';

    const { buffer, ext: nextExt } = await optimizeUploadedImage(original, mime, 'doctor');
    const nextName = `${path.basename(name, ext)}${nextExt}`;
    const nextPath = path.join(uploadsDir, nextName);

    await writeFile(nextPath, buffer);
    if (nextPath !== filepath) {
      await unlink(filepath);
    }

    optimizedCount += 1;
    console.log(`${name} -> ${nextName} (${original.length} -> ${buffer.length} bytes)`);
  }

  console.log(`Optimized ${optimizedCount} file(s).`);
}

optimizeExistingUploads().catch((error) => {
  console.error(error);
  process.exit(1);
});
