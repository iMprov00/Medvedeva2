import { Button } from '../ui/Button';
import { SectionTitle } from '../ui/SectionTitle';
import { directions } from '../../content/directions';
import { StaticImage } from '../ui/ResponsiveImage';
import styles from './DirectionsSection.module.css';

export function DirectionsSection() {
  return (
    <section id="directions" className={`section ${styles.section}`}>
      <div className="container">
        <SectionTitle>Наши направления</SectionTitle>
        <div className={styles.grid}>
          {directions.map((item) => (
            <article key={item.path} className={styles.cardWrap}>
              <div className={styles.card}>
                <div className={styles.imageWrap}>
                  <StaticImage image={item.image} alt={item.title} className={styles.image} />
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.description}>{item.description}</p>
              </div>
              <Button to={item.path} variant="pill">
                Подробнее
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
