import manifestData from './imageManifest.json';
import type { ImageAsset } from './imageAssets.types';

export type { ImageAsset } from './imageAssets.types';

const manifest = manifestData as Record<string, ImageAsset>;

const manifestBySrc = new Map<string, ImageAsset>();
const legacyPathIndex = new Map<string, ImageAsset>();

for (const asset of Object.values(manifest)) {
  manifestBySrc.set(asset.src, asset);
  for (const legacyPath of asset.legacyPaths ?? []) {
    legacyPathIndex.set(legacyPath, asset);
  }
}

const LEGACY_PATH_KEYS: Record<string, string> = {
  '/images/discounts/kids.png': 'discounts.kids',
  '/images/discounts/support.png': 'discounts.support',
  '/images/discounts/tax.png': 'discounts.tax',
};

function fallbackAsset(src: string, sizes = '100vw'): ImageAsset {
  return { src, sizes };
}

export function getImageAsset(key: string, fallbackSrc: string, sizes?: string): ImageAsset {
  const asset = manifest[key];
  if (asset) return asset;
  return fallbackAsset(fallbackSrc, sizes);
}

export function resolveStaticImage(url: string): ImageAsset {
  const fromLegacy = legacyPathIndex.get(url);
  if (fromLegacy) return fromLegacy;

  const key = LEGACY_PATH_KEYS[url];
  if (key && manifest[key]) return manifest[key];

  const fromSrc = manifestBySrc.get(url);
  if (fromSrc) return fromSrc;

  return fallbackAsset(url);
}
