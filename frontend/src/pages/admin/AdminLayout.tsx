import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { adminCheck, adminLogout } from '../../api/cms';
import './admin.css';

export function AdminLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    adminCheck().then((ok) => {
      setAuthed(ok);
      setReady(true);
      if (!ok) navigate('/admin/login');
    });
  }, [navigate]);

  async function handleLogout() {
    await adminLogout();
    navigate('/admin/login');
  }

  if (!ready) return <div className="adminPage">Загрузка...</div>;
  if (!authed) return null;

  return (
    <div className="adminPage">
      <header className="adminHeader">
        <strong>Админка клиники</strong>
        <nav className="adminNav">
          <NavLink to="/admin/doctors" className={({ isActive }) => (isActive ? 'active' : '')}>
            Врачи
          </NavLink>
          <NavLink to="/admin/promotions" className={({ isActive }) => (isActive ? 'active' : '')}>
            Акции
          </NavLink>
          <NavLink to="/admin/gallery" className={({ isActive }) => (isActive ? 'active' : '')}>
            Фото
          </NavLink>
          <NavLink to="/admin/documents" className={({ isActive }) => (isActive ? 'active' : '')}>
            Документы
          </NavLink>
          <a href="/" target="_blank" rel="noreferrer">
            Сайт
          </a>
        </nav>
        <button type="button" className="adminBtn adminBtnSecondary" onClick={handleLogout}>
          Выйти
        </button>
      </header>
      <main className="adminBody">
        <Outlet />
      </main>
    </div>
  );
}
