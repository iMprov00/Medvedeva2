# Фотографии сайта — куда класть файлы

Оптимизированные файлы для браузера: **`frontend/public/images/`**  
Оригиналы (полное качество): **`frontend/image-source/`**  
Манифест для React: **`frontend/src/content/imageManifest.json`**

Фото врачей загружаются через админку (`/admin/doctors`) и хранятся на сервере в `uploads/`.

Иконки карточек (Tilda), декор `plus.jpg` и PDF в `docs/` — отдельно, их менять не нужно.

---

## Как работает оптимизация

1. **Оригиналы** кладёте в **`frontend/image-source/`** (вне `public/`, не попадают в deploy).
2. Запускаете **`npm run optimize-images`** в папке `frontend`.
3. Скрипт создаёт лёгкие **WebP + JPEG** в `public/images/` с размерами под блоки на сайте (400px, 800px и т.д.).
4. Обновляется **`imageManifest.json`** — сайт использует **srcset**, браузер грузит только нужный размер.

```bash
cd frontend
npm run optimize-images
```

`npm run build` **не** запускает оптимизацию автоматически. После смены фото в `image-source/` запустите `optimize-images` вручную.

Рекомендуемый размер оригинала: **1200×900 px (4:3)** для карточек направлений, **не меньше 1600px** по длинной стороне для остальных.

---

## Оригиналы (`image-source/`)

| Имя файла | Папка в `image-source/` | Где на сайте |
|-----------|-------------------------|--------------|
| `hero.jpg` | `image-source/` | Главная, шапка |
| `about.jpg` | `image-source/about/` | «О клинике», блок философии |
| `clinic-entrance.jpg` | `image-source/` | Главная, «Первая клиника» |
| `certificates.jpg` | `image-source/` | Главная, блок «Справки» |
| `medvedeva3.jpg` | `image-source/` | Фото основателя |
| `1.jpeg` … `8.jpeg` | `image-source/about/` | Галерея |
| `*.jpg` | `image-source/directions/` | Карточки направлений |
| `*.png` | `image-source/discounts/` | Акции (иконки в CMS) |

**Важно:** `certificates.jpg` в корне `image-source/` — для блока на главной.  
`directions/certificates.jpg` — отдельное фото для карточки направления «Справки».

---

## Направления (11 штук)

Папка оригиналов: **`image-source/directions/`**

| Файл | Направление |
|------|-------------|
| `pediatrics.jpg` | Педиатрия |
| `home-visit.jpg` | Вызов врача на дом |
| `certificates.jpg` | Справки |
| `neurology.jpg` | Неврология |
| `epileptology.jpg` | Невролог-эпилептолог |
| `nutrition.jpg` | Нутрициолог |
| `gastroenterology.jpg` | Гастроэнтеролог |
| `pulmonology.jpg` | Пульмонолог |
| `endocrinology.jpg` | Эндокринолог |
| `psychotherapy.jpg` | Психотерапия |
| `psychology.jpg` | Психолог |

---

## Заглушки

Если ключа нет в `imageManifest.json`, сайт показывает SVG-fallback (`hero.svg`, `directions/*.svg`).

Перегенерировать SVG-заглушки (только для разработки):

```bash
cd frontend
npm run placeholders
```

---

## Не трогать

| Что | Почему |
|-----|--------|
| `plus.jpg` | Декор в карточках |
| `Tilda_Icons_*` | Иконки |
| `docs/*.pdf` | Документы |
| `uploads/` | Фото врачей (оптимизируются при загрузке) |

---

## Фото врачей и галерея (uploads)

При загрузке через админку бэкенд автоматически создаёт:

- **Врачи:** `-card.jpg` (800×600) для карточки + `-full.jpg` (1200×900)
- **Галерея:** `-thumb.jpg` (до 400px) для сетки + `-full.jpg` (до 1200px) для просмотра

Перегенерировать старые uploads:

```bash
npm run optimize-uploads -w backend
```
