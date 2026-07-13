# Фотографии сайта — куда класть файлы

Все пути относительно папки **`frontend/public/images/`**.

Фото врачей **не** перечислены — они загружаются через админку (`/admin/doctors`) и хранятся на сервере в `uploads/`.

Иконки карточек (Tilda), декор `plus.jpg` и PDF в `docs/` — отдельно, их менять не нужно.

---

## Сейчас на сайте

| Имя файла | Папка | Где используется | Формат | Рекомендуемый размер |
|-----------|-------|------------------|--------|----------------------|
| `hero.jpg` | `images/` | Главная, большое фото справа | JPG | 1200×900, 4:3 |
| `about.jpg` | `images/about/` | «О клинике», фото справа от блока «Наша философия» | JPG | 800×600, 4:3 |
| `clinic-entrance.jpg` | `images/` | Главная, блок «Первая клиника…» | JPG | 800×600, 4:3 |
| `certificates.jpg` | `images/` | Главная, блок «Справки» | JPG | 800×600, 4:3 |
| `medvedeva3.jpeg` | `images/` | «О клинике», фото основателя | JPEG | ~600×800, вертикаль |
| `logo.png` | `images/` | Логотип в шапке | PNG, прозрачный фон | ~400×200 |
| `1.jpeg` … `8.jpeg` | `images/about/` | Галерея на «О клинике» | JPEG | 800×600, 4:3 |
| `kids.png` | `images/discounts/` | Акция «Для второго ребёнка из двойни» | PNG | 600×400 |
| `support.png` | `images/discounts/` | Акция «Скидка для людей с инвалидностью» | PNG | 600×400 |
| `tax.png` | `images/discounts/` | Акция «Налоговый вычет» | PNG | 600×400 |
| `favicon.ico` | `frontend/public/` | Иконка вкладки браузера | ICO | 32×32 |

### Направления (11 штук)

Карточки на главной и фото в шапке страниц специальностей.

Папка: **`images/directions/`**

| Имя файла | Направление |
|-----------|-------------|
| `pediatrics.jpg` | Педиатрия |
| `home-visit.jpg` | Вызов врача на дом / патронаж |
| `certificates.jpg` | Справки |
| `neurology.jpg` | Неврология |
| `epileptology.jpg` | Невролог-эпилептолог |
| `nutrition.jpg` | Нутрициолог |
| `gastroenterology.jpg` | Гастроэнтеролог |
| `pulmonology.jpg` | Пульмонолог |
| `endocrinology.jpg` | Эндокринолог |
| `psychotherapy.jpg` | Психотерапия |
| `psychology.jpg` | Психолог |

Рекомендуемый размер: **800×600** (4:3).

---

## Заглушки

Пока реальные JPG не загружены, на сайте показываются SVG-заглушки с подписью (`hero.svg`, `directions/*.svg` и т.д.).

Превью с подсказками (не подключаются к сайту напрямую):

- `placeholders/founder-medvedeva.svg`
- `placeholders/logo.svg`
- `placeholders/about/1.svg` … `8.svg`
- `placeholders/discounts/kids.svg`, `support.svg`, `tax.svg`

Перегенерировать заглушки:

```bash
cd frontend
npm run placeholders
```

---

## Как заменить фото

1. Положите файл **с точным именем** из таблицы в нужную папку (перезаписав старый).
2. Добавьте имя в `frontend/src/content/siteImages.ts`:
   - корневые фото (`hero.jpg` и т.д.) → `ROOT_PHOTOS`
   - направления → `DIRECTION_PHOTOS`

Уже рабочие файлы (можно просто перезаписать тем же именем):

- `medvedeva3.jpeg`, `logo.png`, `about/about.jpg`, `about/1.jpeg`–`8.jpeg`, `discounts/*.png`

---

## Не трогать

| Что | Почему |
|-----|--------|
| `plus.jpg` | Декор в блоках карточек |
| `Tilda_Icons_*` | Иконки в карточках |
| `docs/*.pdf`, `docs/reg.webp` | Документы, не фото |
| `uploads/` на бэкенде | Фото врачей из админки |
