import { Button } from '../ui/Button';
import { BOOKING_URL } from '../../content/booking';
import type { SpecialtyPageDefinition } from '../../content/specialtyPages';
import styles from './SpecialtyHero.module.css';

interface SpecialtyHeroProps {
  page: SpecialtyPageDefinition;
}

export function SpecialtyHero({ page }: SpecialtyHeroProps) {
  const hero = page.pageContent.hero ?? {};
  const imageUrl = hero.imageUrl || page.cardImageUrl;
  const bookingUrl = page.bookingUrl || BOOKING_URL;

  return (
    <section className="section sectionToneMuted">
      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          {hero.bullets && hero.bullets.length > 0 ? (
            <ul className={styles.bullets}>
              {hero.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <h1 className={styles.title}>{page.title}</h1>
          )}
          {hero.subtitle && <p className={styles.subtitle}>{hero.subtitle}</p>}
          <p className={styles.description}>
            {hero.description || page.cardDescription}
          </p>
          {hero.ctaLabel && <p className={styles.ctaLabel}>{hero.ctaLabel}</p>}
          <Button href={bookingUrl} className={styles.cta}>
            Записаться на прием
          </Button>
        </div>
        <div className={styles.imageWrap}>
          <img src={imageUrl} alt={page.title} className={styles.image} />
        </div>
      </div>
    </section>
  );
}
