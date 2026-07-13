import { phoneToTel } from '../../api/client';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { YandexMap } from '../ui/YandexMap';
import styles from './ContactsSection.module.css';

export function ContactsSection() {
  const { settings } = useSiteSettings();
  const { workingHours } = settings;

  return (
    <section className={styles.section} aria-labelledby="contacts-heading">
      <div className="container">
        <div className={styles.card}>
          <h2 id="contacts-heading" className={styles.title}>
            Контакты
          </h2>
          <div className={styles.grid}>
            <YandexMap />
            <div className={styles.info}>
              <p className={styles.address}>{settings.address}</p>
              <div className={styles.phones}>
                {settings.phones.map((phone) => (
                  <a key={phone} href={phoneToTel(phone)} className={styles.link}>
                    {phone}
                  </a>
                ))}
              </div>
              <a href={`mailto:${settings.email}`} className={styles.link}>
                {settings.email}
              </a>
              <div className={styles.hours}>
                <p className={styles.hoursTitle}>Часы работы</p>
                <p>{workingHours.weekdays}</p>
                <p>{workingHours.saturday}</p>
                <p>{workingHours.sunday}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
