import { Button } from '../ui/Button';
import { BOOKING_URL } from '../../content/booking';
import type { SpecialtyFaqContent } from '../../types/cms';
import styles from './SpecialtyFaq.module.css';

interface SpecialtyFaqProps {
  data?: SpecialtyFaqContent;
  bookingUrl?: string | null;
}

export function SpecialtyFaq({ data, bookingUrl }: SpecialtyFaqProps) {
  if (!data?.items?.length) return null;

  return (
    <section className="section sectionToneWhite">
      <div className={`container ${styles.grid}`}>
        <div className={styles.left}>
          <h2 className={styles.title}>{data.title || 'Часто спрашивают'}</h2>
          {data.ctaText && <p className={styles.ctaText}>{data.ctaText}</p>}
          <Button href={bookingUrl || BOOKING_URL} className={styles.cta}>
            Записаться на прием
          </Button>
        </div>
        <div className={styles.cards}>
          {data.items.map((item) => (
            <article key={item.question} className={styles.item}>
              <h3 className={styles.question}>{item.question}</h3>
              <p className={styles.answer}>{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
