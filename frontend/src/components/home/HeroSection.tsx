import { Button } from '../ui/Button';
import { siteImages } from '../../content/siteImages';
import { BOOKING_URL } from '../../content/booking';
import { heroContent } from '../../content/home';
import { StaticImage } from '../ui/ResponsiveImage';
import styles from './HeroSection.module.css';

export function HeroSection() {
  return (
    <section className={`section ${styles.hero}`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          <p className={styles.label}>{heroContent.label}</p>
          <h1 className={styles.title}>{heroContent.title}</h1>
          <p className={styles.subtitle}>{heroContent.subtitle}</p>
          <div className={styles.actions}>
            <Button href={BOOKING_URL}>Записаться на прием</Button>
            <Button href="#directions" variant="outline">
              Направления
            </Button>
          </div>
          <p className={styles.note}>{heroContent.note}</p>
        </div>
        <div className={styles.imageWrap}>
          <StaticImage
            image={siteImages.hero}
            alt="Семья в современной клинике"
            className={styles.image}
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
