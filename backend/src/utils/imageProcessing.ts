import sharp from 'sharp';

/** Совпадает с aspect-ratio карточки врача на сайте (4:3). */
const DOCTOR_CARD_WIDTH = 1200;
const DOCTOR_CARD_HEIGHT = 900;
const DOCTOR_THUMB_WIDTH = 800;
const DOCTOR_THUMB_HEIGHT = 600;
/** Совпадает с шапкой карточки акции (16:10). */
const PROMO_CARD_WIDTH = 800;
const PROMO_CARD_HEIGHT = 500;
const PROMO_FULL_WIDTH = 1280;
const PROMO_FULL_HEIGHT = 800;
const GALLERY_FULL_MAX = 1200;
const GALLERY_THUMB_MAX = 400;
const DOCTOR_JPEG_QUALITY = 85;
const GALLERY_JPEG_QUALITY = 82;
const WHITE_BG = { r: 255, g: 255, b: 255 };

export type ImageUploadKind = 'doctor' | 'gallery' | 'promotion' | 'default';

export interface OptimizedImageFile {
  suffix: string;
  buffer: Buffer;
  ext: string;
}

export interface OptimizedUploadResult {
  files: OptimizedImageFile[];
  primaryUrl: string;
}

function withWhiteBackground(pipeline: ReturnType<typeof sharp>) {
  return pipeline.flatten({ background: WHITE_BG });
}

async function optimizeDoctorVariants(buffer: Buffer): Promise<OptimizedImageFile[]> {
  const rotated = sharp(buffer).rotate();
  const meta = await rotated.metadata();
  const isCardSize =
    meta.width === DOCTOR_CARD_WIDTH && meta.height === DOCTOR_CARD_HEIGHT;

  const fullPipeline = isCardSize
    ? withWhiteBackground(rotated)
    : withWhiteBackground(rotated).resize(DOCTOR_CARD_WIDTH, DOCTOR_CARD_HEIGHT, {
        fit: 'cover',
        position: 'top',
      });

  const cardBuffer = await withWhiteBackground(sharp(buffer).rotate())
    .resize(DOCTOR_THUMB_WIDTH, DOCTOR_THUMB_HEIGHT, {
      fit: 'cover',
      position: 'top',
    })
    .jpeg({
      quality: DOCTOR_JPEG_QUALITY,
      mozjpeg: true,
      chromaSubsampling: '4:4:4',
    })
    .toBuffer();

  const fullBuffer = await fullPipeline
    .jpeg({
      quality: DOCTOR_JPEG_QUALITY,
      mozjpeg: true,
      chromaSubsampling: '4:4:4',
    })
    .toBuffer();

  return [
    { suffix: '-card', buffer: cardBuffer, ext: '.jpg' },
    { suffix: '-full', buffer: fullBuffer, ext: '.jpg' },
  ];
}

async function optimizePromotionVariants(buffer: Buffer): Promise<OptimizedImageFile[]> {
  const meta = await sharp(buffer).rotate().metadata();
  const isFullSize = meta.width === PROMO_FULL_WIDTH && meta.height === PROMO_FULL_HEIGHT;
  const webpOpts = { quality: DOCTOR_JPEG_QUALITY, alphaQuality: 100 };
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

  const fullBuffer = await (
    isFullSize
      ? sharp(buffer).rotate()
      : sharp(buffer).rotate().resize(PROMO_FULL_WIDTH, PROMO_FULL_HEIGHT, {
          fit: 'contain',
          background: transparent,
        })
  )
    .webp(webpOpts)
    .toBuffer();

  const cardBuffer = await sharp(buffer)
    .rotate()
    .resize(PROMO_CARD_WIDTH, PROMO_CARD_HEIGHT, {
      fit: 'contain',
      background: transparent,
    })
    .webp(webpOpts)
    .toBuffer();

  return [
    { suffix: '-card', buffer: cardBuffer, ext: '.webp' },
    { suffix: '-full', buffer: fullBuffer, ext: '.webp' },
  ];
}

async function optimizeGalleryVariants(buffer: Buffer): Promise<OptimizedImageFile[]> {
  const thumbBuffer = await withWhiteBackground(sharp(buffer).rotate())
    .resize(GALLERY_THUMB_MAX, GALLERY_THUMB_MAX, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: GALLERY_JPEG_QUALITY,
      mozjpeg: true,
    })
    .toBuffer();

  const fullBuffer = await withWhiteBackground(sharp(buffer).rotate())
    .resize(GALLERY_FULL_MAX, GALLERY_FULL_MAX, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: GALLERY_JPEG_QUALITY,
      mozjpeg: true,
    })
    .toBuffer();

  return [
    { suffix: '-thumb', buffer: thumbBuffer, ext: '.jpg' },
    { suffix: '-full', buffer: fullBuffer, ext: '.jpg' },
  ];
}

async function optimizeDefaultImage(buffer: Buffer): Promise<OptimizedImageFile[]> {
  const output = await withWhiteBackground(sharp(buffer).rotate())
    .resize(GALLERY_FULL_MAX, GALLERY_FULL_MAX, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: GALLERY_JPEG_QUALITY,
      mozjpeg: true,
    })
    .toBuffer();

  return [{ suffix: '', buffer: output, ext: '.jpg' }];
}

export async function optimizeUploadedImages(
  buffer: Buffer,
  mime: string,
  kind: ImageUploadKind = 'default',
): Promise<OptimizedUploadResult> {
  if (mime === 'image/svg+xml') {
    return {
      files: [{ suffix: '', buffer, ext: '.svg' }],
      primaryUrl: '',
    };
  }

  let files: OptimizedImageFile[];
  if (kind === 'doctor') {
    files = await optimizeDoctorVariants(buffer);
  } else if (kind === 'promotion') {
    files = await optimizePromotionVariants(buffer);
  } else if (kind === 'gallery') {
    files = await optimizeGalleryVariants(buffer);
  } else {
    files = await optimizeDefaultImage(buffer);
  }

  return { files, primaryUrl: '' };
}

/** @deprecated используйте optimizeUploadedImages */
export async function optimizeUploadedImage(
  buffer: Buffer,
  mime: string,
  kind: ImageUploadKind = 'default',
): Promise<{ buffer: Buffer; ext: string }> {
  const result = await optimizeUploadedImages(buffer, mime, kind);
  const primary =
    result.files.find((file) => file.suffix === '-card') ??
    result.files.find((file) => file.suffix === '-thumb') ??
    result.files[0];
  return { buffer: primary.buffer, ext: primary.ext };
}

