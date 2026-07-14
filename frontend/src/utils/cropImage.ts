export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CropOutputFormat = 'jpeg' | 'webp' | 'png';

export interface CropImageOptions {
  outputWidth?: number;
  outputHeight?: number;
  /**
   * Фон под прозрачными областями.
   * Не задавать — прозрачность сохраняется (нужен webp/png).
   */
  background?: string;
  format?: CropOutputFormat;
  quality?: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('Не удалось загрузить изображение')));
    image.crossOrigin = 'anonymous';
    image.src = src;
  });
}

function mimeForFormat(format: CropOutputFormat): string {
  if (format === 'webp') return 'image/webp';
  if (format === 'png') return 'image/png';
  return 'image/jpeg';
}

function extensionForFormat(format: CropOutputFormat): string {
  if (format === 'webp') return '.webp';
  if (format === 'png') return '.png';
  return '.jpg';
}

/**
 * Рисует область кропа на canvas.
 * croppedAreaPixels из react-easy-crop может выходить за края исходника
 * (поля вокруг картинки при zoom-out) — эти зоны остаются фоном/прозрачными,
 * а видимая часть не растягивается на весь кадр.
 */
function drawCroppedArea(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  crop: CropArea,
  outputWidth: number,
  outputHeight: number,
) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;

  if (crop.width <= 0 || crop.height <= 0) {
    throw new Error('Некорректная область кадрирования');
  }

  const scaleX = outputWidth / crop.width;
  const scaleY = outputHeight / crop.height;

  const sx = Math.max(0, crop.x);
  const sy = Math.max(0, crop.y);
  const sx2 = Math.min(imageWidth, crop.x + crop.width);
  const sy2 = Math.min(imageHeight, crop.y + crop.height);
  const sWidth = sx2 - sx;
  const sHeight = sy2 - sy;

  if (sWidth <= 0 || sHeight <= 0) {
    throw new Error('Область кадрирования не пересекается с изображением');
  }

  const dx = (sx - crop.x) * scaleX;
  const dy = (sy - crop.y) * scaleY;
  const dWidth = sWidth * scaleX;
  const dHeight = sHeight * scaleY;

  context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

  const debug = {
    imageWidth,
    imageHeight,
    crop: { ...crop },
    output: { outputWidth, outputHeight },
    source: { sx, sy, sWidth, sHeight },
    dest: { dx, dy, dWidth, dHeight },
    outOfBounds:
      crop.x < 0 ||
      crop.y < 0 ||
      crop.x + crop.width > imageWidth ||
      crop.y + crop.height > imageHeight,
    destFillRatio: (dWidth * dHeight) / (outputWidth * outputHeight),
  };
  console.info('[cropImage] drawCroppedArea', debug);
  if (typeof window !== 'undefined') {
    (window as Window & { __LAST_CROP_DEBUG__?: unknown }).__LAST_CROP_DEBUG__ = debug;
  }
}

export async function cropImageToFile(
  imageSrc: string,
  crop: CropArea,
  fileName: string,
  outputWidthOrOptions: number | CropImageOptions = 1200,
  outputHeight = 900,
): Promise<File> {
  const options: CropImageOptions =
    typeof outputWidthOrOptions === 'number'
      ? { outputWidth: outputWidthOrOptions, outputHeight }
      : outputWidthOrOptions;

  const width = options.outputWidth ?? 1200;
  const height = options.outputHeight ?? 900;
  const format = options.format ?? 'jpeg';
  const quality = options.quality ?? 0.92;

  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Не удалось подготовить изображение');
  }

  if (options.background) {
    context.fillStyle = options.background;
    context.fillRect(0, 0, width, height);
  } else {
    context.clearRect(0, 0, width, height);
  }

  drawCroppedArea(context, image, crop, width, height);

  const mime = mimeForFormat(format);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error('Не удалось сохранить изображение'));
      },
      mime,
      quality,
    );
  });

  return new File([blob], fileName.replace(/\.\w+$/, extensionForFormat(format)), { type: mime });
}
