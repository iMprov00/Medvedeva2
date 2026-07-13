import type { ImageAsset } from '../../content/imageAssets';
import { normalizeUploadUrl, uploadSizes, uploadSrcSet } from '../../utils/uploadImage';

interface UploadImageProps {
  url: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onError?: () => void;
}

export function UploadImage({ url, alt, className, loading = 'lazy', onError }: UploadImageProps) {
  const src = normalizeUploadUrl(url);
  const srcSet = uploadSrcSet(src);

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? uploadSizes(url) : undefined}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={onError}
    />
  );
}

interface StaticOrUploadImageProps {
  image: ImageAsset;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function StaticImage({ image, alt, className, loading = 'lazy' }: StaticOrUploadImageProps) {
  const hasSrcSet = Boolean(image.webpSrcSet || image.jpegSrcSet);

  if (!hasSrcSet || image.src.endsWith('.svg')) {
    return (
      <img
        src={image.src}
        alt={alt}
        className={className}
        loading={loading}
        decoding="async"
      />
    );
  }

  return (
    <picture>
      {image.webpSrcSet && (
        <source type="image/webp" srcSet={image.webpSrcSet} sizes={image.sizes} />
      )}
      <img
        src={image.src}
        srcSet={image.jpegSrcSet}
        sizes={image.sizes}
        alt={alt}
        className={className}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
}
