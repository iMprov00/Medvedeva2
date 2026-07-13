import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { mainNavItems } from '../../content/navigation';
import { specialtyOptions } from '../../content/specialtyOptions';
import { MedflexMedtochkaButton } from '../medflex/MedflexMedtochkaButton';
import styles from './Header.module.css';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [doctorsOpen, setDoctorsOpen] = useState(false);
  const doctorsRef = useRef<HTMLLIElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setDoctorsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (doctorsRef.current && !doctorsRef.current.contains(event.target as Node)) {
        setDoctorsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <img
            src="/images/logo.png"
            alt=""
            className={styles.logoImage}
            width={50}
            height={50}
          />
          <div className={styles.logoText}>
            <span className={styles.logoMain}>Клиника доктора Медведевой</span>
            <span className={styles.logoSub}>Доказательная медицина</span>
          </div>
        </Link>

        <button
          type="button"
          className={styles.burger}
          aria-label="Открыть меню"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ''}`} aria-label="Основная навигация">
          <div className={styles.mobileActions}>
            <MedflexMedtochkaButton variant="mobile" />
          </div>

          <ul className={styles.navList}>
            {mainNavItems.slice(0, 2).map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`.trim()
                  }
                  end={item.path === '/'}
                >
                  {item.title}
                </NavLink>
              </li>
            ))}

            <li className={styles.doctorsItem} ref={doctorsRef}>
              <button
                type="button"
                className={`${styles.navLink} ${styles.doctorsToggle} ${doctorsOpen ? styles.active : ''}`}
                aria-expanded={doctorsOpen}
                aria-haspopup="true"
                onClick={() => setDoctorsOpen((v) => !v)}
              >
                Врачи
                <span className={styles.chevron} aria-hidden>▾</span>
              </button>

              <div className={`${styles.dropdown} ${doctorsOpen ? styles.dropdownOpen : ''}`}>
                <Link to="/doctors" className={styles.dropdownAll}>
                  Все врачи
                </Link>
                <ul className={styles.dropdownList}>
                  {specialtyOptions.map((item) => (
                    <li key={item.slug}>
                      <Link to={`/${item.slug}`} className={styles.dropdownLink}>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            {mainNavItems.slice(2).map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`.trim()
                  }
                >
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.desktopActions}>
          <MedflexMedtochkaButton variant="desktop" />
        </div>
      </div>
    </header>
  );
}
