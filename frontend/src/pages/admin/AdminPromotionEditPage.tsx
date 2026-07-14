import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminFetchPromotion, adminSavePromotion, adminUpload } from '../../api/cms';
import { PromotionPhotoCropper } from '../../components/admin/DoctorPhotoCropper';
import './admin.css';

interface CropSession {
  src: string;
  fileName: string;
  revokeOnClose: boolean;
}

export function AdminPromotionEditPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const cropSessionRef = useRef<CropSession | null>(null);
  const [badge, setBadge] = useState('');
  const [title, setTitle] = useState('');
  const [discount, setDiscount] = useState('');
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#c9a8e0');
  const [validUntil, setValidUntil] = useState('');
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [cropSession, setCropSession] = useState<CropSession | null>(null);

  useEffect(() => {
    cropSessionRef.current = cropSession;
  }, [cropSession]);

  useEffect(() => {
    return () => {
      const session = cropSessionRef.current;
      if (session?.revokeOnClose) {
        URL.revokeObjectURL(session.src);
      }
    };
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      adminFetchPromotion(Number(id)).then((data) => {
        setBadge(data.badge);
        setTitle(data.title);
        setDiscount(data.discount);
        setText(data.text);
        setTags(data.tags.join(', '));
        setImageUrl(data.imageUrl);
        setAccentColor(data.accentColor);
        setValidUntil(data.validUntil ?? '');
        setActive(data.active);
        setSortOrder(data.sortOrder);
      });
    }
  }, [id, isNew]);

  function closeCropper() {
    if (cropSession?.revokeOnClose) {
      URL.revokeObjectURL(cropSession.src);
    }
    setCropSession(null);
  }

  function openCropperFromFile(file: File) {
    closeCropper();
    const src = URL.createObjectURL(file);
    setCropSession({
      src,
      fileName: file.name,
      revokeOnClose: true,
    });
  }

  function openCropperFromUrl(url: string) {
    closeCropper();
    setCropSession({
      src: url,
      fileName: 'promotion-image.jpg',
      revokeOnClose: false,
    });
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setUploadError('');
    try {
      const { url } = await adminUpload(file, 'promotion');
      setImageUrl(url);
      closeCropper();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Не удалось загрузить изображение');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (uploading || cropSession) return;

    const payload = {
      badge,
      title,
      discount,
      text,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      imageUrl,
      accentColor,
      validUntil: validUntil || null,
      active,
      sortOrder,
    };
    await adminSavePromotion(payload, isNew ? undefined : Number(id));
    navigate('/admin/promotions');
  }

  return (
    <div>
      <Link to="/admin/promotions" className="adminBackLink">
        ← Назад
      </Link>
      <h1 className="adminTitle">{isNew ? 'Новая акция' : 'Редактирование акции'}</h1>
      <form className="adminCard" onSubmit={handleSubmit}>
        <div className="formGroup">
          <label>Бейдж</label>
          <input value={badge} onChange={(e) => setBadge(e.target.value)} required />
        </div>
        <div className="formRow">
          <div className="formGroup">
            <label>Название</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="formGroup">
            <label>Скидка</label>
            <input value={discount} onChange={(e) => setDiscount(e.target.value)} required />
          </div>
        </div>
        <div className="formGroup">
          <label>Текст</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} required />
        </div>
        <div className="formGroup">
          <label>Теги (через запятую)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="formSection">
          <p className="formSectionTitle">Картинка акции</p>
          <div className="formGroup">
            <label htmlFor="promo-image-file">Загрузить и кадрировать</label>
            <input
              id="promo-image-file"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) openCropperFromFile(file);
              }}
            />
            {imageUrl && (
              <div className="photoPreviewRow">
                <img src={imageUrl} alt="" className="photoPreview" />
                <button
                  type="button"
                  className="adminBtn adminBtnSecondary"
                  disabled={uploading}
                  onClick={() => openCropperFromUrl(imageUrl)}
                >
                  Изменить кадр
                </button>
              </div>
            )}
            {uploading && <p className="formHint">Загрузка...</p>}
            {uploadError && <p className="formError">{uploadError}</p>}
            <label htmlFor="promo-image-url">URL (можно указать вручную)</label>
            <input
              id="promo-image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="formRow">
          <div className="formGroup">
            <label>Цвет акцента</label>
            <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
          </div>
          <div className="formGroup">
            <label>Срок действия</label>
            <input
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              placeholder="31 июля"
            />
          </div>
        </div>
        <div className="formGroup">
          <label>Порядок</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </div>
        <div className="formFooter">
          <label className="toggleField">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Активна на сайте
          </label>
          <button type="submit" className="adminBtn" disabled={uploading || Boolean(cropSession)}>
            Сохранить
          </button>
        </div>
      </form>

      {cropSession && (
        <PromotionPhotoCropper
          imageSrc={cropSession.src}
          fileName={cropSession.fileName}
          onCancel={closeCropper}
          onConfirm={handleImageUpload}
        />
      )}
    </div>
  );
}
