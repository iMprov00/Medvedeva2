export function normalizeUploadUrl(url: string): string {
  if (!url.startsWith('/uploads/')) return url;
  if (/-(card|full|thumb)\./i.test(url)) return url;
  const match = url.match(/^(\/uploads\/.+?)\.(jpe?g|png|webp)$/i);
  if (!match) return url;
  return `${match[1]}-card.jpg`;
}

export function uploadFullUrl(url: string): string {
  if (url.includes('-card.')) return url.replace('-card.', '-full.');
  if (url.includes('-thumb.')) return url.replace('-thumb.', '-full.');
  return url;
}

export function uploadSrcSet(url: string): string | undefined {
  const normalized = normalizeUploadUrl(url);
  if (normalized.includes('-card.')) {
    const full = uploadFullUrl(normalized);
    return `${normalized} 1x, ${full} 2x`;
  }
  if (normalized.includes('-thumb.')) {
    const full = uploadFullUrl(normalized);
    return `${normalized} 400w, ${full} 1200w`;
  }
  return undefined;
}

export function uploadSizes(url: string): string {
  if (url.includes('-thumb.')) return '(max-width: 640px) 50vw, 25vw';
  if (url.includes('-card.')) return '(max-width: 640px) 100vw, 33vw';
  return '100vw';
}
