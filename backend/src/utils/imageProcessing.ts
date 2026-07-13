import sharp from 'sharp';

/** Совпадает с aspect-ratio карточки врача на сайте (4:3). */
const DOCTOR_CARD_WIDTH = 1200;
const DOCTOR_CARD_HEIGHT = 900;
const GALLERY_MAX_SIDE = 1600;
const DOCTOR_JPEG_QUALITY = 92;
const GALLERY_JPEG_QUALITY = 88;

export type ImageUploadKind = 'doctor' | 'gallery' | 'default';

async function optimizeDoctorPhoto(buffer: Buffer): Promise<Buffer> {
  const rotated = sharp(buffer).rotate();
  const meta = await rotated.metadata();
  const isCardSize =
    meta.width === DOCTOR_CARD_WIDTH && meta.height === DOCTOR_CARD_HEIGHT;

  if (isCardSize) {
    return rotated
      .jpeg({
        quality: DOCTOR_JPEG_QUALITY,
        mozjpeg: true,
        chromaSubsampling: '4:4:4',
      })
      .toBuffer();
  }

  return rotated
    .resize(DOCTOR_CARD_WIDTH, DOCTOR_CARD_HEIGHT, {
      fit: 'cover',
      position: 'top',
    })
    .jpeg({
      quality: DOCTOR_JPEG_QUALITY,
      mozjpeg: true,
      chromaSubsampling: '4:4:4',
    })
    .toBuffer();
}

async function optimizeGalleryPhoto(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(GALLERY_MAX_SIDE, GALLERY_MAX_SIDE, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: GALLERY_JPEG_QUALITY,
      mozjpeg: true,
      chromaSubsampling: '4:4:4',
    })
    .toBuffer();
}

export async function optimizeUploadedImage(
  buffer: Buffer,
  mime: string,
  kind: ImageUploadKind = 'default',
): Promise<{ buffer: Buffer; ext: string }> {
  if (mime === 'image/svg+xml') {
    return { buffer, ext: '.svg' };
  }

  if (kind === 'doctor') {
    return { buffer: await optimizeDoctorPhoto(buffer), ext: '.jpg' };
  }

  if (kind === 'gallery' || kind === 'default') {
    return { buffer: await optimizeGalleryPhoto(buffer), ext: '.jpg' };
  }

  return { buffer: await optimizeGalleryPhoto(buffer), ext: '.jpg' };
}
