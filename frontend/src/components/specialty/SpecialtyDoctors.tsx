import { useState } from 'react';
import { Button } from '../ui/Button';
import type { Doctor } from '../../types/cms';
import { UploadImage } from '../ui/ResponsiveImage';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { phoneToTel } from '../../api/client';
import styles from './SpecialtyDoctors.module.css';

interface SpecialtyDoctorsProps {
  title?: string;
  doctors: Doctor[];
}

function DoctorPhoto({ doctor }: { doctor: Doctor }) {
  const [broken, setBroken] = useState(false);

  if (!doctor.photoUrl || broken) {
    return <div className={styles.photoPlaceholder} aria-hidden />;
  }

  return (
    <UploadImage
      url={doctor.photoUrl}
      alt={doctor.fullName}
      className={styles.photo}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

function DoctorBookingCta({ doctor }: { doctor: Doctor }) {
  const { settings } = useSiteSettings();
  const [phonesOpen, setPhonesOpen] = useState(false);
  const showPhones = doctor.noBookingLink || !doctor.bookingUrl?.trim();

  if (!showPhones) {
    return (
      <Button href={doctor.bookingUrl} className={styles.cta} target="_blank" rel="noopener noreferrer">
        Записаться на прием
      </Button>
    );
  }

  return (
    <div className={styles.ctaWrap}>
      <Button
        type="button"
        className={styles.cta}
        onClick={() => setPhonesOpen((open) => !open)}
        aria-expanded={phonesOpen}
      >
        Записаться на прием
      </Button>
      {phonesOpen && (
        <div className={styles.phonesBox} role="region" aria-label="Телефоны клиники">
          <p className={styles.phonesHint}>Запись по телефону:</p>
          <div className={styles.phonesList}>
            {settings.phones.map((phone) => (
              <a key={phone} href={phoneToTel(phone)} className={styles.phoneLink}>
                {phone}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SpecialtyDoctors({ title, doctors }: SpecialtyDoctorsProps) {
  if (!doctors.length) return null;

  return (
    <section className="section sectionToneWhite">
      <div className="container">
        <h2 className={styles.title}>{title || 'Врачи клиники'}</h2>
        <div className={styles.grid}>
          {doctors.map((doctor) => (
            <div key={doctor.id} className={styles.item}>
              <article className={styles.card}>
                <div className={styles.photoWrap}>
                  <DoctorPhoto doctor={doctor} />
                </div>
                <h3 className={styles.name}>{doctor.fullName}</h3>
                {doctor.role && <p className={styles.role}>{doctor.role}</p>}
              </article>
              <DoctorBookingCta doctor={doctor} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
