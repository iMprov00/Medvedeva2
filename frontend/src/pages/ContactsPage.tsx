import type { ReactNode } from 'react';
import { PageHero } from '../components/ui/PageHero';
import { FeatureIcon } from '../components/ui/FeatureIcon';
import type { FeatureIconName } from '../components/ui/FeatureIcon';
import { YandexMap } from '../components/ui/YandexMap';
import { Button } from '../components/ui/Button';
import { phoneToTel } from '../api/client';
import { BOOKING_URL } from '../content/booking';
import { contactsHero, contactsIntro, contactsDirections } from '../content/contacts';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { FinalCtaSection } from '../components/home/FinalCtaSection';
import styles from './ContactsPage.module.css';

interface ContactItemProps {
  icon: FeatureIconName;
  label: string;
  wide?: boolean;
  children: ReactNode;
}

function ContactItem({ icon, label, wide, children }: ContactItemProps) {
  return (
    <article className={`${styles.contactItem} ${wide ? styles.contactItemWide : ''}`}>
      <div className={styles.contactIcon}>
        <FeatureIcon name={icon} size={22} />
      </div>
      <div className={styles.contactBody}>
        <h3 className={styles.contactLabel}>{label}</h3>
        <div className={styles.contactValue}>{children}</div>
      </div>
    </article>
  );
}

export function ContactsPage() {
  const { settings } = useSiteSettings();
  const { workingHours } = settings;

  return (
    <>
      <PageHero title={contactsHero.title} subtitle={contactsHero.subtitle} />
      <section className="section sectionToneWhite">
        <div className="container">
          <div className={styles.mainGrid}>
            <div className={styles.intro}>
              <h2 className={styles.sectionTitle}>{contactsIntro.title}</h2>
              <p className={styles.introText}>{contactsIntro.text}</p>
              <Button href={BOOKING_URL} className={styles.bookingBtn}>
                Записаться на прием
              </Button>
            </div>

            <div className={styles.cards}>
              <ContactItem icon="building" label="Адрес" wide>
                <p>{settings.address}</p>
              </ContactItem>
              <ContactItem icon="info" label="Телефоны">
                {settings.phones.map((phone) => (
                  <a key={phone} href={phoneToTel(phone)} className={styles.link}>
                    {phone}
                  </a>
                ))}
              </ContactItem>
              <ContactItem icon="clock" label="Часы работы">
                <p>{workingHours.weekdays}</p>
                <p>{workingHours.saturday}</p>
                <p>{workingHours.sunday}</p>
              </ContactItem>
              <ContactItem icon="mail" label="Электронная почта" wide>
                <a href={`mailto:${settings.email}`} className={styles.link}>
                  {settings.email}
                </a>
              </ContactItem>
            </div>
          </div>
        </div>
      </section>
      <section className="section sectionToneMuted">
        <div className="container">
          <h2 className={styles.mapTitle}>{contactsDirections.title}</h2>
          <div className={styles.mapCard}>
            <YandexMap />
            <div className={styles.mapInfo}>
              <div>
                <h3 className={styles.mapInfoLabel}>Адрес клиники</h3>
                <p className={styles.mapInfoText}>{contactsDirections.address}</p>
              </div>
              <div>
                <h3 className={styles.mapInfoLabel}>Как добраться</h3>
                <p className={styles.mapInfoText}>{contactsDirections.transport}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FinalCtaSection />
    </>
  );
}
