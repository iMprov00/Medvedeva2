import sharp from 'sharp';

/** Совпадает с aspect-ratio карточки врача на сайте (4:3). */
const DOCTOR_CARD_WIDTH = 1200;
const DOCTOR_CARD_HEIGHT = 900;
const DOCTOR_THUMB_WIDTH = 800;
const DOCTOR_THUMB_HEIGHT = 600;
const GALLERY_FULL_MAX = 1200;
const GALLERY_THUMB_MAX = 400;
const DOCTOR_JPEG_QUALITY = 85;
const GALLERY_JPEG_QUALITY = 82;

export type ImageUploadKind = 'doctor' | 'gallery' | 'default';

export interface OptimizedImageFile {
  suffix: string;
  buffer: Buffer;
  ext: string;
}

export interface OptimizedUploadResult {
  files: OptimizedImageFile[];
  primaryUrl: string;
}

async function optimizeDoctorVariants(buffer: Buffer): Promise<OptimizedImageFile[]> {
  const rotated = sharp(buffer).rotate();
  const meta = await rotated.metadata();
  const isCardSize =
    meta.width === DOCTOR_CARD_WIDTH && meta.height === DOCTOR_CARD_HEIGHT;

  const fullPipeline = isCardSize
    ? rotated
    : rotated.resize(DOCTOR_CARD_WIDTH, DOCTOR_CARD_HEIGHT, {
        fit: 'cover',
        position: 'top',
      });

  const cardBuffer = await sharp(buffer)
    .rotate()
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

async function optimizeGalleryVariants(buffer: Buffer): Promise<OptimizedImageFile[]> {
  const thumbBuffer = await sharp(buffer)
    .rotate()
    .resize(GALLERY_THUMB_MAX, GALLERY_THUMB_MAX, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: GALLERY_JPEG_QUALITY,
      mozjpeg: true,
    })
    .toBuffer();

  const fullBuffer = await sharp(buffer)
    .rotate()
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
  const output = await sharp(buffer)
    .rotate()
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
