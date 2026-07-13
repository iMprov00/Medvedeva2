import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminDeleteDoctor, adminFetchDoctors } from '../../api/cms';
import type { Doctor } from '../../types/cms';
import './admin.css';

function photoStatus(photoUrl: string | null | undefined): {
  label: string;
  className: string;
} {
  if (!photoUrl) {
    return { label: 'Нет', className: 'photoStatusMissing' };
  }
  if (photoUrl.startsWith('/uploads/')) {
    return { label: 'OK', className: 'photoStatusOk' };
  }
  if (photoUrl.startsWith('/images/doctors/')) {
    return { label: 'Битая ссылка', className: 'photoStatusBroken' };
  }
  return { label: 'Проверить', className: 'photoStatusMissing' };
}

export function AdminDoctorsPage() {
  const [items, setItems] = useState<Doctor[]>([]);

  useEffect(() => {
    adminFetchDoctors().then(setItems);
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Удалить врача?')) return;
    await adminDeleteDoctor(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div>
      <div className="adminActions" style={{ justifyContent: 'space-between' }}>
        <h1 className="adminTitle">Врачи</h1>
        <Link to="/admin/doctors/new" className="adminBtn">
          Добавить
        </Link>
      </div>
      <div className="adminCard">
        <table className="adminTable">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Фото</th>
              <th>Опубликован</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const status = photoStatus(item.photoUrl);
              return (
              <tr key={item.id}>
                <td>{item.fullName}</td>
                <td className={status.className}>{status.label}</td>
                <td>{item.published ? 'Да' : 'Нет'}</td>
                <td>
                  <Link to={`/admin/doctors/${item.id}`}>Редактировать</Link>
                  {' | '}
                  <button type="button" className="adminBtn adminBtnDanger" onClick={() => handleDelete(item.id)}>
                    Удалить
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
