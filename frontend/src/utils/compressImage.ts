/** Сжимает фото в браузере перед загрузкой в галерею (меньше трафик и нагрузка на API). */
export async function compressImageForUpload(
  file: File,
  options: { maxSide?: number; quality?: number } = {},
): Promise<File> {
  const maxSide = options.maxSide ?? 1600;
  const quality = options.quality ?? 0.82;

  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  // HEIC и прочие форматы без canvas — отправляем как есть
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });

  if (!blob) return file;

  // Если сжатие почти не помогло и файл небольшой — оставляем оригинал
  if (blob.size >= file.size * 0.95 && file.size < 1_500_000) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}
