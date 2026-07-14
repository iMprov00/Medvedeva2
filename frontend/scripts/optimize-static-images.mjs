import { mkdir, readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.resolve(__dirname, '../public/images');
const sourceDir = path.resolve(__dirname, '../image-source');
const manifestPath = path.resolve(__dirname, '../src/content/imageManifest.json');
const cachePath = path.join(__dirname, '.image-cache.json');

const WEBP_QUALITY = 82;
const JPEG_QUALITY = 85;

const PROFILES = {
  hero: {
    widths: [600, 1200],
    aspect: 4 / 3,
    sizes: '(max-width: 900px) 100vw, 50vw',
  },
  card: {
    widths: [400, 800],
    aspect: 4 / 3,
    sizes: '(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw',
  },
  portrait: {
    widths: [400, 800],
    aspect: null,
    sizes: '(max-width: 900px) 100vw, 45vw',
  },
  content: {
    widths: [600, 1200],
    aspect: 4 / 3,
    sizes: '(max-width: 900px) 100vw, 45vw',
  },
  gallery: {
    widths: [400, 800],
    aspect: 4 / 3,
    sizes: '(max-width: 640px) 50vw, 25vw',
  },
  promo: {
    widths: [400, 600],
    aspect: null,
    sizes: '120px',
  },
};

const RASTER_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const SKIP_NAMES = new Set(['logo.png', 'plus.png']);

function profileForRelativePath(rel) {
  const norm = rel.replace(/\\/g, '/').toLowerCase();

  if (norm === 'hero.jpg' || norm === 'hero.jpeg') {
    return { key: 'hero', profile: 'hero', outDir: '', baseName: 'hero' };
  }
  if (norm === 'clinic-entrance.jpg' || norm === 'clinic-entrance.jpeg' || norm === 'clinic-entrance.png') {
    return { key: 'clinicEntrance', profile: 'content', outDir: '', baseName: 'clinic-entrance' };
  }
  if (norm === 'certificates.jpg' || norm === 'certificates.jpeg') {
    return { key: 'certificates', profile: 'card', outDir: '', baseName: 'certificates' };
  }
  if (norm === 'medvedeva3.jpg' || norm === 'medvedeva3.jpeg') {
    return { key: 'founder', profile: 'portrait', outDir: '', baseName: 'medvedeva3' };
  }
  if (norm === 'about/about.jpg' || norm === 'about/about.jpeg') {
    return { key: 'aboutHero', profile: 'content', outDir: 'about', baseName: 'about' };
  }
  const galleryMatch = norm.match(/^about\/(\d+)\.jpe?g$/);
  if (galleryMatch) {
    return {
      key: `about.gallery.${galleryMatch[1]}`,
      profile: 'gallery',
      outDir: 'about',
      baseName: galleryMatch[1],
    };
  }
  const directionMatch = norm.match(/^directions\/(.+)\.(jpe?g|png|webp)$/);
  if (directionMatch) {
    return {
      key: `directions.${directionMatch[1]}`,
      profile: 'card',
      outDir: 'directions',
      baseName: directionMatch[1],
    };
  }
  const promoMatch = norm.match(/^discounts\/(.+)\.png$/);
  if (promoMatch) {
    return {
      key: `discounts.${promoMatch[1]}`,
      profile: 'promo',
      outDir: 'discounts',
      baseName: promoMatch[1],
    };
  }
  return null;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function isRasterSource(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!RASTER_EXT.has(ext)) return false;
  if (SKIP_NAMES.has(path.basename(filePath))) return false;
  return true;
}

async function loadCache() {
  try {
    const raw = await readFile(cachePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { sources: {}, entries: {} };
  }
}

async function renderVariant(input, width, aspect, format) {
  let image = sharp(input).rotate().flatten({ background: { r: 255, g: 255, b: 255 } });
  if (aspect) {
    image = image.resize(width, Math.round(width / aspect), {
      fit: 'cover',
      position: 'centre',
      withoutEnlargement: true,
    });
  } else {
    image = image.resize(width, null, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }
  if (format === 'webp') {
    return image.webp({ quality: WEBP_QUALITY }).toBuffer();
  }
  return image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
}

function legacyPathForSource(rel) {
  return `/images/${rel.replace(/\\/g, '/')}`;
}

async function optimizeSourceFile(sourcePath, meta) {
  const { key, profile: profileName, outDir, baseName } = meta;
  const profile = PROFILES[profileName];
  const outputDir = path.join(imagesDir, outDir);
  await mkdir(outputDir, { recursive: true });

  const input = await readFile(sourcePath);
  const rel = path.relative(sourceDir, sourcePath);

  const webpParts = [];
  const jpegParts = [];
  let fallbackSrc = '';

  for (const width of profile.widths) {
    const webpName = `${baseName}-${width}.webp`;
    const jpegName = `${baseName}-${width}.jpg`;
    const webpPath = path.join(outputDir, webpName);
    const jpegPath = path.join(outputDir, jpegName);

    await writeFile(webpPath, await renderVariant(input, width, profile.aspect, 'webp'));
    webpParts.push(`/images/${outDir ? `${outDir}/` : ''}${webpName} ${width}w`);

    await writeFile(jpegPath, await renderVariant(input, width, profile.aspect, 'jpeg'));
    jpegParts.push(`/images/${outDir ? `${outDir}/` : ''}${jpegName} ${width}w`);

    fallbackSrc = `/images/${outDir ? `${outDir}/` : ''}${jpegName}`;
  }

  return {
    key,
    rel,
    entry: {
      src: fallbackSrc,
      webpSrcSet: webpParts.join(', '),
      jpegSrcSet: jpegParts.join(', '),
      sizes: profile.sizes,
      legacyPaths: [legacyPathForSource(rel)],
    },
  };
}

async function main() {
  console.log('Оптимизация статических изображений...\n');

  const cache = await loadCache();
  const nextCache = { sources: {}, entries: {} };
  const seenKeys = new Map();

  const sourceFiles = (await walk(sourceDir)).filter(isRasterSource);
  const manifest = {};
  let cachedCount = 0;

  for (const sourcePath of sourceFiles) {
    const rel = path.relative(sourceDir, sourcePath);
    const meta = profileForRelativePath(rel);
    if (!meta) {
      console.log(`  пропуск (нет профиля): ${rel.replace(/\\/g, '/')}`);
      continue;
    }

    if (seenKeys.has(meta.key)) {
      console.warn(
        `  предупреждение: дубликат ключа ${meta.key} (${seenKeys.get(meta.key)} и ${rel})`,
      );
      continue;
    }
    seenKeys.set(meta.key, rel);

    const { mtimeMs } = await stat(sourcePath);
    const cachedSource = cache.sources[rel];
    const cachedEntry = cache.entries[meta.key];

    if (cachedSource?.mtimeMs === mtimeMs && cachedEntry) {
      manifest[meta.key] = cachedEntry;
      nextCache.sources[rel] = { mtimeMs };
      nextCache.entries[meta.key] = cachedEntry;
      cachedCount += 1;
      console.log(`  ${meta.key} -> ${cachedEntry.src} (кэш)`);
      continue;
    }

    const result = await optimizeSourceFile(sourcePath, meta);
    manifest[result.key] = result.entry;
    nextCache.sources[rel] = { mtimeMs };
    nextCache.entries[result.key] = result.entry;
    console.log(`  ${result.key} -> ${result.entry.src}`);
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await writeFile(cachePath, `${JSON.stringify(nextCache, null, 2)}\n`, 'utf8');
  console.log(`\nМанифест: ${path.relative(process.cwd(), manifestPath)}`);
  console.log(`Готово: ${Object.keys(manifest).length} изображений (${cachedCount} из кэша).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
