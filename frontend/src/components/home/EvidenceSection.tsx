import { Button } from '../ui/Button';
import { BOOKING_URL } from '../../content/booking';
import { evidenceContent } from '../../content/home';
import styles from './EvidenceSection.module.css';

export function EvidenceSection() {
  return (
    <section className={`section ${styles.section}`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          <h2 className={styles.title}>{evidenceContent.title}</h2>
          <p className={styles.paragraph}>{evidenceContent.paragraph}</p>
          <p className={styles.principle}>{evidenceContent.principle}</p>
          <Button href={BOOKING_URL} className={styles.cta}>
            Записаться на прием
          </Button>
        </div>
        <div className={styles.listBlock}>
          <ul className={styles.list}>
            {evidenceContent.items.map((item) => (
              <li key={item} className={styles.listItem}>
                <span className={styles.check} aria-hidden>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
