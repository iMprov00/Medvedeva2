# Medvedeva Clinic — React + Node.js

Сайт клиники доказательной медицины доктора Медведевой.

## Стек

- **Frontend:** Vite + React + TypeScript + React Router
- **Backend:** Fastify + SQLite (Drizzle ORM)
- **Продакшен:** nginx (статика) + PM2 (API)

## Быстрый старт (разработка)

```bash
# Установка зависимостей
npm install

# Миграция и seed контактов
npm run db:migrate
npm run db:seed

# Запуск frontend (5173) + backend (3001)
npm run dev
```

Откройте http://localhost:5173

## Сборка

```bash
npm run build          # сборка frontend → frontend/dist
npm run build:backend  # компиляция TypeScript backend → backend/dist
```

## Деплой на Ubuntu VPS

### 1. Подготовка сервера

```bash
sudo apt update
sudo apt install -y nginx nodejs npm
sudo npm install -g pm2
```

Рекомендуется swap 512 МБ–1 ГБ при 1 ГБ RAM.

### 2. Клонирование и сборка

```bash
cd /var/www
git clone <repo-url> medvedeva
cd medvedeva
npm install
npm run db:migrate
npm run db:seed
npm run build
npm run build:backend
```

### 3. PM2

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

### 4. nginx

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/medvedeva
sudo ln -s /etc/nginx/sites-available/medvedeva /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Отредактируйте `server_name` и пути в конфиге под ваш домен.

### 5. SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d medvedeva-clinic.ru -d www.medvedeva-clinic.ru
```

## API

| Endpoint | Описание |
|----------|----------|
| `GET /api/health` | Проверка работы API |
| `GET /api/site-settings` | Контакты, адрес, часы работы |

Контакты редактируются в таблице `site_settings` (позже — через админку).

## Структура

```
frontend/   — React SPA
backend/    — Fastify API
db/         — SQLite (production.sqlite3)
deploy/     — nginx + PM2 конфиги
```

## Изображения

Плейсхолдеры в `frontend/public/images/`. Замените на реальные фото из макета, сохранив имена файлов или обновив пути в `frontend/src/content/`.

## Старый Ruby-сайт

Файлы Sinatra (`app.rb`, `Gemfile`) сохранены для справки. Новый сайт работает из `frontend/` и `backend/`.
