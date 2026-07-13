export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
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

export async function cropImageToFile(
  imageSrc: string,
  crop: CropArea,
  fileName: string,
  outputWidth = 1200,
  outputHeight = 900,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Не удалось подготовить изображение');
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error('Не удалось сохранить изображение'));
      },
      'image/jpeg',
      0.92,
    );
  });

  return new File([blob], fileName.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}
