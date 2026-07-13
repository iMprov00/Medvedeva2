import { Button } from '../ui/Button';
import { siteImages } from '../../content/siteImages';
import { BOOKING_URL } from '../../content/booking';
import { certificatesContent } from '../../content/home';
import { StaticImage } from '../ui/ResponsiveImage';
import styles from './CertificatesSection.module.css';

export function CertificatesSection() {
  return (
    <section className={`section ${styles.section}`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          <h2 className={styles.title}>{certificatesContent.title}</h2>
          <p className={styles.subtitle}>{certificatesContent.subtitle}</p>
          <ul className={styles.list}>
            {certificatesContent.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button href={BOOKING_URL} className={styles.cta}>
            Записаться на прием
          </Button>
        </div>
        <div className={styles.imageWrap}>
          <StaticImage
            image={siteImages.certificates}
            alt="Медицинская справка на столе врача"
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
