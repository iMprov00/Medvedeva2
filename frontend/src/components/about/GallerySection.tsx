import { useEffect, useState } from 'react';
import { gallery } from '../../content/about';
import { fetchGalleryPhotos } from '../../api/cms';
import { Button } from '../ui/Button';
import { ImageLightbox } from '../ui/ImageLightbox';
import styles from './GallerySection.module.css';

const INITIAL = 8;

export function GallerySection() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchGalleryPhotos()
      .then((items) => setPhotos(items.map((item) => item.imageUrl)))
      .catch(() => {
        setPhotos(gallery.images.map((image) => `/images/about/${image}`));
      });
  }, []);

  const visibleCount = expanded ? photos.length : INITIAL;
  const hasMore = photos.length > INITIAL;

  if (photos.length === 0) return null;

  return (
    <section className="section sectionToneWhite" id="gallery">
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>{gallery.title}</h2>
          <p className={styles.subtitle}>{gallery.subtitle}</p>
        </div>
        <div className={styles.grid}>
          {photos.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              className={`${styles.item} ${index >= visibleCount ? styles.hidden : ''}`}
              onClick={() => setLightboxIndex(index)}
              aria-label={`Открыть фото ${index + 1}`}
            >
              <img
                src={imageUrl}
                alt="Интерьер клиники доктора Медведевой"
                className={styles.image}
                loading="lazy"
              />
            </button>
          ))}
        </div>
        {hasMore && (
          <div className={styles.actions}>
            {!expanded ? (
              <Button onClick={() => setExpanded(true)} variant="outline">
                Показать еще фотографии
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setExpanded(false);
                  document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                }}
                variant="outline"
              >
                Свернуть галерею
              </Button>
            )}
          </div>
        )}
      </div>
      <ImageLightbox
        images={photos}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChange={setLightboxIndex}
      />
    </section>
  );
}
