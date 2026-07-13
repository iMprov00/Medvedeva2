import { Button } from '../ui/Button';
import { phoneToTel } from '../../api/client';
import { BOOKING_URL } from '../../content/booking';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { finalCtaContent } from '../../content/home';
import styles from './FinalCtaSection.module.css';

export function FinalCtaSection({
  subtitle,
}: {
  subtitle?: string;
} = {}) {
  const { settings } = useSiteSettings();

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <h2 className={styles.title}>{finalCtaContent.title}</h2>
        <p className={styles.subtitle}>{subtitle || finalCtaContent.subtitle}</p>
        <div className={styles.actions}>
          <Button href={BOOKING_URL} className={styles.actionBtn}>
            Запись на прием
          </Button>
          {settings.phones.map((phone) => (
            <Button key={phone} href={phoneToTel(phone)} variant="primary" className={styles.actionBtn}>
              {phone}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
