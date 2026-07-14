import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminFetchDoctor, adminSaveDoctor, adminUpload } from '../../api/cms';
import { DoctorPhotoCropper } from '../../components/admin/DoctorPhotoCropper';
import { specialtyOptions } from '../../content/specialtyOptions';
import './admin.css';

interface CropSession {
  src: string;
  fileName: string;
  revokeOnClose: boolean;
}

function isLegacyDoctorPhotoPath(url: string) {
  return url.startsWith('/images/doctors/');
}

function isUploadPhotoPath(url: string) {
  return url.startsWith('/uploads/');
}

export function AdminDoctorEditPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const cropSessionRef = useRef<CropSession | null>(null);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [role, setRole] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [noBookingLink, setNoBookingLink] = useState(false);
  const [published, setPublished] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [specialtySlugs, setSpecialtySlugs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cropSession, setCropSession] = useState<CropSession | null>(null);
  const [savedPhotoUrl, setSavedPhotoUrl] = useState('');
  const [photoPreviewBroken, setPhotoPreviewBroken] = useState(false);

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
      adminFetchDoctor(Number(id)).then((data) => {
        const loadedPhotoUrl = data.photoUrl ?? '';
        setLastName(data.lastName);
        setFirstName(data.firstName);
        setMiddleName(data.middleName ?? '');
        setRole(data.role ?? '');
        setPhotoUrl(loadedPhotoUrl);
        setSavedPhotoUrl(loadedPhotoUrl);
        setBookingUrl(data.bookingUrl);
        setNoBookingLink(Boolean(data.noBookingLink));
        setPublished(data.published);
        setSortOrder(data.sortOrder);
        setSpecialtySlugs(data.specialtySlugs);
        setPhotoPreviewBroken(false);
      });
    }
  }, [id, isNew]);

  useEffect(() => {
    setPhotoPreviewBroken(false);
  }, [photoUrl]);

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
      fileName: 'doctor-photo.jpg',
      revokeOnClose: false,
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (uploading || cropSession) return;

    setSaveError('');
    setSaving(true);
    try {
      const payload = {
        lastName,
        firstName,
        middleName: middleName || null,
        role: role || null,
        photoUrl: photoUrl || null,
        bookingUrl: noBookingLink ? '' : bookingUrl.trim(),
        noBookingLink,
        published,
        sortOrder,
        specialtySlugs,
      };
      await adminSaveDoctor(payload, isNew ? undefined : Number(id));
      setSavedPhotoUrl(photoUrl);
      navigate('/admin/doctors');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(file: File) {
    setUploadError('');
    setUploading(true);
    try {
      const { url } = await adminUpload(file, 'doctor');
      setPhotoUrl(url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Не удалось загрузить фото');
    } finally {
      setUploading(false);
    }
  }

  async function handleCropConfirm(file: File) {
    closeCropper();
    await handlePhotoUpload(file);
  }

  function toggleSpecialty(slug: string) {
    setSpecialtySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  const photoDirty = photoUrl !== savedPhotoUrl;
  const canRecrop = isUploadPhotoPath(photoUrl);
  const hasLegacyPhotoPath = Boolean(photoUrl && isLegacyDoctorPhotoPath(photoUrl));
  const showUploadPreview = isUploadPhotoPath(photoUrl) && !photoPreviewBroken;

  return (
    <div>
      <Link to="/admin/doctors" className="adminBackLink">
        ← Назад
      </Link>
      <h1 className="adminTitle">{isNew ? 'Новый врач' : 'Редактирование врача'}</h1>

      {cropSession && (
        <DoctorPhotoCropper
          imageSrc={cropSession.src}
          fileName={cropSession.fileName}
          onConfirm={handleCropConfirm}
          onCancel={closeCropper}
        />
      )}

      <form className="adminCard" onSubmit={handleSubmit}>
        {saveError && <p className="error">{saveError}</p>}
        <div className="formRow">
          <div className="formGroup">
            <label htmlFor="doctor-last-name">Фамилия</label>
            <input
              id="doctor-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="formGroup">
            <label htmlFor="doctor-first-name">Имя</label>
            <input
              id="doctor-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="formGroup">
          <label htmlFor="doctor-middle-name">Отчество</label>
          <input
            id="doctor-middle-name"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
        </div>
        <div className="formGroup">
          <label htmlFor="doctor-role">Должность / специальность</label>
          <input
            id="doctor-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Например: врач-педиатр"
          />
        </div>

        <div className="formSection">
          <p className="formSectionTitle">Фото</p>
          <p className="adminHint">
            Выберите файл — откроется редактор: перетащите фото и настройте масштаб под рамку
            карточки 4:3. Максимальный размер исходника — 30 МБ.
          </p>
          <div className="formGroup">
            <label htmlFor="doctor-photo-url">URL фото</label>
            <input
              id="doctor-photo-url"
              value={photoUrl}
              onChange={(e) => {
                setPhotoUrl(e.target.value);
                setUploadError('');
              }}
              placeholder="/uploads/..."
            />
            <input
              id="doctor-photo-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading || Boolean(cropSession)}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) openCropperFromFile(file);
                e.target.value = '';
              }}
            />
            {canRecrop && (
              <button
                type="button"
                className="adminBtn adminBtnSecondary"
                style={{ marginTop: 8 }}
                disabled={uploading || Boolean(cropSession)}
                onClick={() => openCropperFromUrl(photoUrl)}
              >
                Настроить кадрирование
              </button>
            )}
            {uploading && <p className="adminHint">Загрузка и обработка фото...</p>}
            {uploadError && <p className="error">{uploadError}</p>}
            {photoDirty && !uploading && (
              <p className="photoSaveNotice">
                Фото загружено. Нажмите «Сохранить», чтобы оно появилось на сайте.
              </p>
            )}
            {hasLegacyPhotoPath && (
              <p className="error">
                Старый путь к фото отсутствует на сервере. Загрузите файл заново через «Выберите
                файл».
              </p>
            )}
            {showUploadPreview && (
              <img
                src={photoUrl}
                alt=""
                className="photoPreview"
                onError={() => setPhotoPreviewBroken(true)}
              />
            )}
            {isUploadPhotoPath(photoUrl) && photoPreviewBroken && (
              <div className="photoPreviewPlaceholder">Не удалось загрузить превью</div>
            )}
            {photoUrl && !isUploadPhotoPath(photoUrl) && !hasLegacyPhotoPath && (
              <p className="adminHint">
                Укажите путь /uploads/... или загрузите файл через редактор.
              </p>
            )}
          </div>
        </div>

        <div className="formGroup">
          <label className="toggleField" htmlFor="doctor-no-booking-link">
            <input
              id="doctor-no-booking-link"
              type="checkbox"
              checked={noBookingLink}
              onChange={(e) => setNoBookingLink(e.target.checked)}
            />
            Нет ссылки
          </label>
          <p className="adminHint">
            Если отмечено, на сайте при нажатии «Записаться» покажутся телефоны клиники вместо
            онлайн-записи.
          </p>
        </div>

        <div className="formGroup">
          <label htmlFor="doctor-booking-url">Ссылка на запись</label>
          <input
            id="doctor-booking-url"
            value={bookingUrl}
            onChange={(e) => setBookingUrl(e.target.value)}
            required={!noBookingLink}
            disabled={noBookingLink}
            placeholder={noBookingLink ? 'Не используется' : 'https://...'}
          />
        </div>

        <div className="formSection">
          <p className="formSectionTitle">Показывать на страницах специальностей</p>
          <p className="adminHint">
            Карточка всегда отображается на странице «Все врачи». Отметьте специальности, где врач
            должен появляться дополнительно.
          </p>
          <div className="specialtyGrid">
            {specialtyOptions.map((specialty) => (
              <label key={specialty.slug} className="specialtyToggle">
                <input
                  type="checkbox"
                  checked={specialtySlugs.includes(specialty.slug)}
                  onChange={() => toggleSpecialty(specialty.slug)}
                />
                <span className="specialtyToggleBox">
                  <span className="specialtyToggleTitle">{specialty.title}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="formRow">
          <div className="formGroup">
            <label htmlFor="doctor-sort-order">Порядок</label>
            <input
              id="doctor-sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="formFooter">
          <label className="toggleField">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Опубликован на сайте
          </label>
          <button
            type="submit"
            className={`adminBtn${photoDirty ? ' adminBtnHighlight' : ''}`}
            disabled={saving || uploading || Boolean(cropSession)}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}
