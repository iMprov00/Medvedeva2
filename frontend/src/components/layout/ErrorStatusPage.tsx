import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import styles from './ErrorStatusPage.module.css';

interface ErrorStatusPageProps {
  code: 404 | 500;
  title: string;
  description: string;
  homeLabel?: string;
  secondaryTo?: string;
  secondaryLabel?: string;
  onHomeClick?: () => void;
}

export function ErrorStatusPage({
  code,
  title,
  description,
  homeLabel = 'На главную',
  secondaryTo = '/contacts',
  secondaryLabel = 'Контакты',
  onHomeClick,
}: ErrorStatusPageProps) {
  return (
    <section className={`section ${styles.page}`}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.code} aria-hidden>
          {code}
        </p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{description}</p>
        <div className={styles.actions}>
          {onHomeClick ? (
            <Button type="button" onClick={onHomeClick}>
              {homeLabel}
            </Button>
          ) : (
            <Button to="/">{homeLabel}</Button>
          )}
          {secondaryTo && (
            <Link to={secondaryTo} className={styles.link}>
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
