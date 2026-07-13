import { useState } from 'react';
import { Button } from '../ui/Button';
import type { Doctor } from '../../types/cms';
import { UploadImage } from '../ui/ResponsiveImage';
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
              <Button href={doctor.bookingUrl} className={styles.cta}>
                Записаться на прием
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
