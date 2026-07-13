import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import styles from './PageStub.module.css';

interface PageStubProps {
  title: string;
  description?: string;
}

export function PageStub({ title, description }: PageStubProps) {
  return (
    <section className={`section ${styles.stub}`}>
      <div className="container">
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>
          {description ?? 'Страница в разработке. Скоро здесь появится полный контент.'}
        </p>
        <div className={styles.actions}>
          <Button to="/">На главную</Button>
          <Link to="/doctors" className={styles.link}>
            Все врачи
          </Link>
        </div>
      </div>
    </section>
  );
}
