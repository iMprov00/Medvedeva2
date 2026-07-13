import { Button } from '../ui/Button';
import { siteImages } from '../../content/siteImages';
import { firstClinicContent } from '../../content/home';
import { StaticImage } from '../ui/ResponsiveImage';
import styles from './FirstClinicSection.module.css';

export function FirstClinicSection() {
  return (
    <section className={`section ${styles.section}`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          <h2 className={styles.title}>{firstClinicContent.title}</h2>
          {firstClinicContent.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
          <Button to="/about" className={styles.cta}>
            Подробнее
          </Button>
        </div>
        <div className={styles.imageWrap}>
          <StaticImage
            image={siteImages.clinicEntrance}
            alt="Вход в клинику доказательной медицины"
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
