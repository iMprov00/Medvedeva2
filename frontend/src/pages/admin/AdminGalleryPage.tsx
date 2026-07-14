import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  adminAddGalleryPhoto,
  adminDeleteGalleryPhoto,
  adminFetchGalleryPhotos,
  adminUpload,
} from '../../api/cms';
import type { GalleryPhoto } from '../../types/cms';
import { resolveStaticImage } from '../../content/imageAssets';
import { compressImageForUpload } from '../../utils/compressImage';
import './admin.css';

function galleryPreviewSrc(url: string): string {
  if (url.startsWith('/uploads/')) return url;
  return resolveStaticImage(url).src;
}

export function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    return adminFetchGalleryPhotos().then(setItems);
  }

  useEffect(() => {
    load().catch(() => setError('Не удалось загрузить список фото'));
  }, []);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      setStatus('Сжимаем фото…');
      const prepared = await compressImageForUpload(file, { maxSide: 1600, quality: 0.82 });
      setStatus(`Загружаем (${(prepared.size / 1024 / 1024).toFixed(1)} МБ)…`);
      const { url } = await adminUpload(prepared, 'gallery');
      setStatus('Сохраняем в галерею…');
      await adminAddGalleryPhoto(url);
      await load();
      setStatus('');
    } catch (err) {
      setStatus('');
      setError(err instanceof Error ? err.message : 'Не удалось добавить фото');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Удалить фото из галереи?')) return;
    setError('');
    try {
      await adminDeleteGalleryPhoto(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить фото');
    }
  }

  return (
    <>
      <div className="adminActions" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="adminTitle">Фото</h1>
          <p className="adminHint">
            Галерея на странице «О клинике». Перед загрузкой фото автоматически сжимается — большие
            исходники тоже можно выбирать.
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            disabled={uploading}
            onChange={handleUpload}
          />
          <button
            type="button"
            className="adminBtn"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? status || 'Загрузка…' : 'Добавить фото'}
          </button>
        </div>
      </div>

      {error && (
        <div className="adminCard">
          <p className="error">{error}</p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="adminCard">
          <p className="adminHint">Пока нет фотографий. Нажмите «Добавить фото».</p>
        </div>
      ) : (
        <div className="adminGalleryGrid">
          {items.map((item) => (
            <article key={item.id} className="adminGalleryCard">
              <img
                src={galleryPreviewSrc(item.imageUrl)}
                alt=""
                className="adminGalleryImage"
              />
              <button
                type="button"
                className="adminBtn adminBtnDanger adminGalleryDelete"
                onClick={() => handleDelete(item.id)}
                disabled={uploading}
              >
                Удалить
              </button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
