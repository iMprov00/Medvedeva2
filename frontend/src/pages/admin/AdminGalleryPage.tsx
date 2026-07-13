import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  adminAddGalleryPhoto,
  adminDeleteGalleryPhoto,
  adminFetchGalleryPhotos,
  adminUpload,
} from '../../api/cms';
import type { GalleryPhoto } from '../../types/cms';
import './admin.css';

export function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    adminFetchGalleryPhotos().then(setItems);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await adminUpload(file, 'gallery');
      await adminAddGalleryPhoto(imageUrl);
      load();
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Удалить фото из галереи?')) return;
    await adminDeleteGalleryPhoto(id);
    load();
  }

  return (
    <>
      <div className="adminActions" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="adminTitle">Фото</h1>
          <p className="adminHint">Галерея на странице «О клинике»</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleUpload}
          />
          <button
            type="button"
            className="adminBtn"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Загрузка...' : 'Добавить фото'}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="adminCard">
          <p className="adminHint">Пока нет фотографий. Нажмите «Добавить фото».</p>
        </div>
      ) : (
        <div className="adminGalleryGrid">
          {items.map((item) => (
            <article key={item.id} className="adminGalleryCard">
              <img src={item.imageUrl} alt="" className="adminGalleryImage" />
              <button
                type="button"
                className="adminBtn adminBtnDanger adminGalleryDelete"
                onClick={() => handleDelete(item.id)}
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
