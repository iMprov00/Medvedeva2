import { getImageAsset } from './imageAssets';

const CARD_SIZES = '(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw';
const HERO_SIZES = '(max-width: 900px) 100vw, 50vw';
const CONTENT_SIZES = '(max-width: 900px) 100vw, 45vw';
const PORTRAIT_SIZES = '(max-width: 900px) 100vw, 45vw';

export const siteImages = {
  get hero() {
    return getImageAsset('hero', '/images/hero.svg', HERO_SIZES);
  },
  get aboutHero() {
    return getImageAsset('aboutHero', '/images/about/about.jpg', CONTENT_SIZES);
  },
  get clinicEntrance() {
    return getImageAsset('clinicEntrance', '/images/clinic-entrance.jpg', CONTENT_SIZES);
  },
  get certificates() {
    return getImageAsset('certificates', '/images/certificates.jpg', CARD_SIZES);
  },
  get founder() {
    return getImageAsset('founder', '/images/medvedeva3.jpg', PORTRAIT_SIZES);
  },
  logo: '/images/logo.png',
} as const;

export function directionImage(slug: string) {
  return getImageAsset(`directions.${slug}`, `/images/directions/${slug}.svg`, CARD_SIZES);
}

export function galleryImage(fileName: string) {
  const num = fileName.replace(/\D/g, '');
  return getImageAsset(
    `about.gallery.${num}`,
    `/images/about/${fileName}`,
    '(max-width: 640px) 50vw, 25vw',
  );
}
