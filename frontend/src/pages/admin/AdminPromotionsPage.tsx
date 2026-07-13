import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminDeletePromotion, adminFetchPromotions } from '../../api/cms';
import type { Promotion } from '../../types/cms';
import './admin.css';

export function AdminPromotionsPage() {
  const [items, setItems] = useState<Promotion[]>([]);

  useEffect(() => {
    adminFetchPromotions().then(setItems);
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Удалить акцию?')) return;
    await adminDeletePromotion(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div>
      <div className="adminActions" style={{ justifyContent: 'space-between' }}>
        <h1 className="adminTitle">Акции</h1>
        <Link to="/admin/promotions/new" className="adminBtn">
          Добавить
        </Link>
      </div>
      <div className="adminCard">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Название</th>
              <th>Скидка</th>
              <th>Активна</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.discount}</td>
                <td>{item.active ? 'Да' : 'Нет'}</td>
                <td>
                  <Link to={`/admin/promotions/${item.id}`}>Редактировать</Link>
                  {' | '}
                  <button type="button" className="adminBtn adminBtnDanger" onClick={() => handleDelete(item.id)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
