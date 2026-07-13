import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api/cms';
import './admin.css';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await adminLogin(username, password);
      navigate('/admin/doctors');
    } catch {
      setError('Неверный логин или пароль');
    }
  }

  return (
    <div className="loginWrap">
      <form className="loginCard" onSubmit={handleSubmit}>
        <h1 className="adminTitle">Вход в админку</h1>
        {error && <p className="error">{error}</p>}
        <div className="formGroup">
          <label htmlFor="username">Логин</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="formGroup">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="adminBtn">
          Войти
        </button>
      </form>
    </div>
  );
}
