import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.copy}>
          © {new Date().getFullYear()} Клиника доказательной медицины доктора Медведевой
        </p>
        <nav className={styles.links} aria-label="Дополнительные ссылки">
          <Link to="/privacy">Политика конфиденциальности</Link>
          <Link to="/docs">Документы</Link>
        </nav>
      </div>
    </footer>
  );
}
