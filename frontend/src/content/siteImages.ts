/** Главные фото в корне images/ — true = загружен .jpg, false = пока .svg-заглушка. */
const ROOT_PHOTOS: Record<string, boolean> = {
  hero: false,
  'clinic-entrance': true,
  certificates: true,
};

/** Направления в images/directions/ — slug → загружен .jpg. */
const DIRECTION_PHOTOS = new Set([
  'pediatrics',
  'certificates',
  'nutrition',
  'pulmonology',
  'neurology',
  'endocrinology',
  'psychotherapy',
]);

function rootImage(name: string): string {
  const ext = ROOT_PHOTOS[name] ? 'jpg' : 'svg';
  return `/images/${name}.${ext}`;
}

export const siteImages = {
  hero: rootImage('hero'),
  aboutHero: '/images/about/about.jpg',
  clinicEntrance: rootImage('clinic-entrance'),
  certificates: rootImage('certificates'),
  founder: '/images/medvedeva3.jpeg',
  logo: '/images/logo.png',
} as const;

/** Карточки направлений и фото в шапке страниц специальностей. */
export function directionImage(slug: string): string {
  const ext = DIRECTION_PHOTOS.has(slug) ? 'jpg' : 'svg';
  return `/images/directions/${slug}.${ext}`;
}
