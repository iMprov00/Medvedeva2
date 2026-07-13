import { useEffect } from 'react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onChange,
}: ImageLightboxProps) {
  useEffect(() => {
    if (currentIndex === null) return;

    const index = currentIndex;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') {
        onChange((index + 1) % images.length);
      }
      if (event.key === 'ArrowLeft') {
        onChange((index - 1 + images.length) % images.length);
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, images.length, onChange, onClose]);

  if (currentIndex === null) return null;

  const src = images[currentIndex];

  return (
    <div
      className="lightboxOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр фотографии"
      onClick={onClose}
    >
      <button type="button" className="lightboxClose" onClick={onClose} aria-label="Закрыть">
        ×
      </button>
      <button
        type="button"
        className="lightboxNav lightboxPrev"
        onClick={(e) => {
          e.stopPropagation();
          onChange((currentIndex - 1 + images.length) % images.length);
        }}
        aria-label="Предыдущее фото"
      >
        ‹
      </button>
      <img
        src={src}
        alt="Фото клиники"
        className="lightboxImage"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        className="lightboxNav lightboxNext"
        onClick={(e) => {
          e.stopPropagation();
          onChange((currentIndex + 1) % images.length);
        }}
        aria-label="Следующее фото"
      >
        ›
      </button>
    </div>
  );
}
