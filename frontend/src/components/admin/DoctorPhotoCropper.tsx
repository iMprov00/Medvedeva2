import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper, { type Area, type MediaSize } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { cropImageToFile } from '../../utils/cropImage';
import styles from './DoctorPhotoCropper.module.css';

export const DOCTOR_CARD_ASPECT = 4 / 3;
const MAX_ZOOM = 3;

function computeMinZoom(mediaSize: MediaSize, aspect: number): number {
  const mediaAspect = mediaSize.width / mediaSize.height;
  if (mediaAspect > aspect) {
    return aspect / mediaAspect;
  }
  return mediaAspect / aspect;
}

interface DoctorPhotoCropperProps {
  imageSrc: string;
  fileName: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

export function DoctorPhotoCropper({
  imageSrc,
  fileName,
  onConfirm,
  onCancel,
}: DoctorPhotoCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [minZoom, setMinZoom] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [mediaReady, setMediaReady] = useState(false);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const croppedAreaRef = useRef<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setMinZoom(1);
    setZoom(1);
    setMediaReady(false);
    setCroppedArea(null);
    croppedAreaRef.current = null;
    setError('');
  }, [imageSrc]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    croppedAreaRef.current = pixels;
    setCroppedArea(pixels);
  }, []);

  const onMediaLoaded = useCallback((mediaSize: MediaSize) => {
    const nextMinZoom = computeMinZoom(mediaSize, DOCTOR_CARD_ASPECT);
    setMinZoom(nextMinZoom);
    setZoom(nextMinZoom);
    setMediaReady(true);
  }, []);

  async function handleConfirm() {
    const area = croppedAreaRef.current ?? croppedArea;
    if (!area) {
      setError('Подождите, пока загрузится изображение');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      const file = await cropImageToFile(imageSrc, area, fileName);
      onConfirm(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обрезать фото');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="crop-title">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 id="crop-title" className={styles.title}>
            Кадрирование фото
          </h2>
          <p className={styles.subtitle}>
            Перетащите фото и настройте масштаб. Рамка совпадает с карточкой врача на сайте.
          </p>
        </div>

        <div className={styles.cropArea}>
          {!mediaReady && <p className={styles.loading}>Загрузка фото...</p>}
          <Cropper
            key={imageSrc}
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={DOCTOR_CARD_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={onMediaLoaded}
            objectFit="contain"
            minZoom={minZoom}
            maxZoom={MAX_ZOOM}
            showGrid
            style={{
              containerStyle: {
                borderRadius: '16px',
                background: '#f3eef9',
              },
              cropAreaStyle: {
                border: '2px solid #c5b8d8',
                borderRadius: '14px',
              },
            }}
          />
        </div>

        {mediaReady && (
          <label className={styles.zoomLabel}>
            Масштаб
            <input
              type="range"
              min={minZoom}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className="adminBtn adminBtnSecondary"
            onClick={onCancel}
            disabled={processing}
          >
            Отмена
          </button>
          <button
            type="button"
            className="adminBtn"
            onClick={handleConfirm}
            disabled={processing || !mediaReady}
          >
            {processing ? 'Сохранение...' : 'Применить'}
          </button>
        </div>
      </div>
    </div>
  );
}
