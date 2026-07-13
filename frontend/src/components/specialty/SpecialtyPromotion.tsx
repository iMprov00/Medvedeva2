import { Button } from '../ui/Button';
import { BOOKING_URL } from '../../content/booking';
import type { SpecialtyPromotionContent } from '../../types/cms';
import styles from './SpecialtyPromotion.module.css';

interface SpecialtyPromotionProps {
  promotion?: SpecialtyPromotionContent | null;
  bookingUrl?: string | null;
}

export function SpecialtyPromotion({ promotion, bookingUrl }: SpecialtyPromotionProps) {
  if (!promotion) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.banner}>
          <div className={styles.titleBlock}>
            <div className={styles.rule} aria-hidden />
            <h2 className={styles.title}>
              {promotion.discount} {promotion.title}
            </h2>
            <div className={styles.rule} aria-hidden />
          </div>
          <div className={styles.bottomRow}>
            <div className={styles.details}>
              <p className={styles.text}>{promotion.text}</p>
              {promotion.validUntil && (
                <p className={styles.validUntil}>Срок действия акции до {promotion.validUntil}</p>
              )}
            </div>
            <Button href={bookingUrl || BOOKING_URL} className={styles.cta}>
              Записаться на прием
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
