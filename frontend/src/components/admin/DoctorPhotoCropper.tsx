import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper, { type Area, type MediaSize } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { cropImageToFile, type CropOutputFormat } from '../../utils/cropImage';
import styles from './DoctorPhotoCropper.module.css';

export const DOCTOR_CARD_ASPECT = 4 / 3;
/** Совпадает с шапкой карточки акции на сайте (16:10). */
export const PROMOTION_CARD_ASPECT = 16 / 10;
export const PROMOTION_OUTPUT_WIDTH = 1280;
export const PROMOTION_OUTPUT_HEIGHT = 800;

const MAX_ZOOM = 3;

function computeMinZoom(mediaSize: MediaSize, aspect: number): number {
  const mediaAspect = mediaSize.width / mediaSize.height;
  if (mediaAspect > aspect) {
    return aspect / mediaAspect;
  }
  return mediaAspect / aspect;
}

/** Мин. зум, при котором всё изображение помещается внутрь рамки (с полями). */
function computeFitInsideMinZoom(mediaSize: MediaSize, aspect: number): number {
  // Cover-зум заполняет рамку; для contain достаточно уменьшить ~в квадрат отношения сторон.
  const coverZoom = computeMinZoom(mediaSize, aspect);
  const mediaAspect = mediaSize.width / mediaSize.height;
  const ratio = mediaAspect > aspect ? aspect / mediaAspect : mediaAspect / aspect;
  return Math.max(0.1, coverZoom * ratio);
}

interface ImageCropperProps {
  imageSrc: string;
  fileName: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
  aspect?: number;
  outputWidth?: number;
  outputHeight?: number;
  title?: string;
  subtitle?: string;
  format?: CropOutputFormat;
  /** Если не задан — прозрачность сохраняется (для webp/png). */
  background?: string;
  /**
   * cover — рамка всегда заполнена (фото врачей).
   * contain — можно отдалить и оставить поля вокруг объекта (акции/PNG).
   */
  fitMode?: 'cover' | 'contain';
}

export function ImageCropper({
  imageSrc,
  fileName,
  onConfirm,
  onCancel,
  aspect = DOCTOR_CARD_ASPECT,
  outputWidth = 1200,
  outputHeight = 900,
  title = 'Кадрирование фото',
  subtitle = 'Перетащите фото и настройте масштаб.',
  format = 'jpeg',
  background,
  fitMode = 'cover',
}: ImageCropperProps) {
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

  const onMediaLoaded = useCallback(
    (mediaSize: MediaSize) => {
      const nextMinZoom =
        fitMode === 'contain'
          ? computeFitInsideMinZoom(mediaSize, aspect)
          : computeMinZoom(mediaSize, aspect);
      setMinZoom(nextMinZoom);
      setZoom(nextMinZoom);
      setMediaReady(true);
    },
    [aspect, fitMode],
  );

  async function handleConfirm() {
    const area = croppedAreaRef.current ?? croppedArea;
    if (!area) {
      setError('Подождите, пока загрузится изображение');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      const file = await cropImageToFile(imageSrc, area, fileName, {
        outputWidth,
        outputHeight,
        format,
        ...(background ? { background } : {}),
      });
      console.info('[crop] applied', {
        fileName,
        fitMode,
        format,
        area,
        debug: (window as Window & { __LAST_CROP_DEBUG__?: unknown }).__LAST_CROP_DEBUG__,
      });
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
            {title}
          </h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <div className={styles.cropArea}>
          {!mediaReady && <p className={styles.loading}>Загрузка фото...</p>}
          <Cropper
            key={imageSrc}
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={onMediaLoaded}
            objectFit="contain"
            minZoom={minZoom}
            maxZoom={MAX_ZOOM}
            showGrid
            restrictPosition={fitMode !== 'contain'}
            style={{
              containerStyle: {
                borderRadius: '16px',
                background: fitMode === 'contain' ? '#ffffff' : '#f3eef9',
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

/** Кадрирование фото врача (4:3). */
export function DoctorPhotoCropper(
  props: Omit<
    ImageCropperProps,
    | 'aspect'
    | 'outputWidth'
    | 'outputHeight'
    | 'title'
    | 'subtitle'
    | 'format'
    | 'background'
    | 'fitMode'
  >,
) {
  return (
    <ImageCropper
      {...props}
      aspect={DOCTOR_CARD_ASPECT}
      outputWidth={1200}
      outputHeight={900}
      format="jpeg"
      background="#ffffff"
      fitMode="cover"
      title="Кадрирование фото"
      subtitle="Перетащите фото и настройте масштаб. Рамка совпадает с карточкой врача на сайте."
    />
  );
}

/** Кадрирование картинки акции (16:10), WebP с прозрачностью. */
export function PromotionPhotoCropper(
  props: Omit<
    ImageCropperProps,
    | 'aspect'
    | 'outputWidth'
    | 'outputHeight'
    | 'title'
    | 'subtitle'
    | 'format'
    | 'background'
    | 'fitMode'
  >,
) {
  return (
    <ImageCropper
      {...props}
      aspect={PROMOTION_CARD_ASPECT}
      outputWidth={PROMOTION_OUTPUT_WIDTH}
      outputHeight={PROMOTION_OUTPUT_HEIGHT}
      format="webp"
      fitMode="contain"
      title="Кадрирование картинки акции"
      subtitle="Уменьшите масштаб ползунком, чтобы оставить поля вокруг логотипа. Всё, что внутри белой рамки, сохранится как на превью."
    />
  );
}
