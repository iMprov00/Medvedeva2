import { Button } from '../ui/Button';
import { BOOKING_URL } from '../../content/booking';
import type { SpecialtyWhenContent } from '../../types/cms';
import styles from './SpecialtyWhen.module.css';

interface SpecialtyWhenProps {
  data?: SpecialtyWhenContent;
  bookingUrl?: string | null;
}

export function SpecialtyWhen({ data, bookingUrl }: SpecialtyWhenProps) {
  const hasItems = Boolean(data?.items?.length);
  const hasGroups = Boolean(data?.groups?.length);
  if (!hasItems && !hasGroups) return null;

  return (
    <section className="section sectionToneWhite">
      <div className={`container ${styles.grid}`}>
        <div className={styles.left}>
          <h2 className={styles.title}>{data?.title || 'Когда стоит записаться?'}</h2>
          {data?.description && <p className={styles.description}>{data.description}</p>}
          <Button href={bookingUrl || BOOKING_URL} className={styles.cta}>
            Записаться на прием
          </Button>
        </div>
        <div className={styles.lists}>
          {hasGroups
            ? data!.groups!.map((group) => (
                <div key={group.label} className={styles.group}>
                  <p className={styles.groupLabel}>{group.label}</p>
                  <ul className={styles.list}>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))
            : (
                <ul className={styles.list}>
                  {data!.items!.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
        </div>
      </div>
    </section>
  );
}
