import { teamCta } from '../../content/about';
import { Button } from '../ui/Button';
import styles from './TeamCtaSection.module.css';

export function TeamCtaSection() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div>
          <h2 className={styles.title}>{teamCta.title}</h2>
          <p className={styles.text}>{teamCta.text}</p>
          <Button to="/doctors" className={styles.button}>
            {teamCta.button}
          </Button>
        </div>
        <div className={styles.icon} aria-hidden>
          ♥
        </div>
      </div>
    </section>
  );
}
