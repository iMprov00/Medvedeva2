import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(__dirname, '../public/images');

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function placeholderSvg({ title, subtitle, hint, width, height }) {
  const titleSize = Math.min(26, Math.round(width / 22));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f3eef9"/>
      <stop offset="100%" style="stop-color:#d9c8ef"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="16" fill="none" stroke="#9b7bc7" stroke-width="2" stroke-dasharray="10 6"/>
  <text x="50%" y="40%" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="${titleSize}" fill="#3d2d5c" font-weight="700">${escapeXml(title)}</text>
  <text x="50%" y="50%" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="15" fill="#5c4a7a">${escapeXml(subtitle)}</text>
  <text x="50%" y="60%" text-anchor="middle" font-family="Consolas,monospace" font-size="14" fill="#7a6a9a">${escapeXml(hint)}</text>
  <text x="50%" y="70%" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="12" fill="#8a7aa0">${width} × ${height} px</text>
</svg>`;
}

function write(relativePath, content) {
  const fullPath = join(imagesDir, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, 'utf8');
  console.log(`  ${relativePath}`);
}

const mainPhotos = [
  {
    path: 'hero.svg',
    title: 'Главная страница',
    subtitle: 'Большое фото справа в шапке',
    hint: 'Заменить на: hero.jpg',
    width: 1200,
    height: 900,
  },
  {
    path: 'clinic-entrance.svg',
    title: 'Вход в клинику',
    subtitle: 'Блок «Первая клиника доказательной медицины»',
    hint: 'Заменить на: clinic-entrance.jpg',
    width: 800,
    height: 600,
  },
  {
    path: 'about.svg',
    title: 'О клинике',
    subtitle: 'Фото в начале страницы «О нашей клинике»',
    hint: 'Заменить на: about/about.jpg',
    width: 1600,
    height: 900,
  },
  {
    path: 'certificates.svg',
    title: 'Медицинские справки',
    subtitle: 'Блок «Справки» на главной',
    hint: 'Заменить на: certificates.jpg',
    width: 800,
    height: 600,
  },
];

const directions = [
  { slug: 'pediatrics', title: 'Педиатрия' },
  { slug: 'home-visit', title: 'Вызов врача на дом' },
  { slug: 'certificates', title: 'Справки' },
  { slug: 'neurology', title: 'Неврология' },
  { slug: 'epileptology', title: 'Невролог-эпилептолог' },
  { slug: 'nutrition', title: 'Нутрициолог' },
  { slug: 'gastroenterology', title: 'Гастроэнтеролог' },
  { slug: 'pulmonology', title: 'Пульмонолог' },
  { slug: 'endocrinology', title: 'Эндокринолог' },
  { slug: 'psychotherapy', title: 'Психотерапия' },
  { slug: 'psychology', title: 'Психолог' },
];

const gallery = [
  { file: '1.jpeg', title: 'Галерея — фото 1' },
  { file: '2.jpeg', title: 'Галерея — фото 2' },
  { file: '3.jpeg', title: 'Галерея — фото 3' },
  { file: '4.jpeg', title: 'Галерея — фото 4' },
  { file: '5.jpeg', title: 'Галерея — фото 5' },
  { file: '6.jpeg', title: 'Галерея — фото 6' },
  { file: '7.jpeg', title: 'Галерея — фото 7' },
  { file: '8.jpeg', title: 'Галерея — фото 8' },
];

const discounts = [
  { file: 'kids.png', title: 'Акция — двойня', hint: 'discounts/kids.png' },
  { file: 'support.png', title: 'Акция — инвалидность', hint: 'discounts/support.png' },
  { file: 'tax.png', title: 'Акция — налоговый вычет', hint: 'discounts/tax.png' },
];

const withGallery = process.argv.includes('--gallery');
const withDiscounts = process.argv.includes('--discounts');

console.log('Генерация SVG-заглушек...\n');

console.log('Главная:');
for (const item of mainPhotos) {
  write(item.path, placeholderSvg({ ...item, hint: item.hint }));
}

console.log('\nНаправления (карточки на главной и страницы специальностей):');
for (const item of directions) {
  write(
    `directions/${item.slug}.svg`,
    placeholderSvg({
      title: item.title,
      subtitle: 'Карточка направления',
      hint: `Заменить на: directions/${item.slug}.jpg`,
      width: 800,
      height: 600,
    }),
  );
}

console.log('\nПревью-заглушки (папка placeholders/):');
write(
  'placeholders/founder-medvedeva.svg',
  placeholderSvg({
    title: 'Наталья Васильевна Медведева',
    subtitle: 'Фото основателя на странице «О клинике»',
    hint: 'Заменить на: medvedeva3.jpg',
    width: 600,
    height: 800,
  }),
);

write(
  'placeholders/logo.svg',
  placeholderSvg({
    title: 'Логотип клиники',
    subtitle: 'Шапка сайта',
    hint: 'Заменить на: logo.png',
    width: 400,
    height: 200,
  }),
);

for (const item of gallery) {
  write(
    `placeholders/about/${item.file.replace('.jpeg', '.svg')}`,
    placeholderSvg({
      title: item.title,
      subtitle: 'Галерея на странице «О клинике»',
      hint: `Заменить на: about/${item.file}`,
      width: 800,
      height: 600,
    }),
  );
}

for (const item of discounts) {
  write(
    `placeholders/discounts/${item.file.replace('.png', '.svg')}`,
    placeholderSvg({
      title: item.title,
      subtitle: 'Карточка акции на странице «Цены»',
      hint: `Заменить на: ${item.hint}`,
      width: 600,
      height: 400,
    }),
  );
}

if (withGallery) {
  console.log('\nГалерея (перезапись about/*.jpeg пропущена — используйте готовые фото):');
  console.log('  Подсказки лежат в placeholders/about/');
}

if (withDiscounts) {
  console.log('\nАкции (перезапись discounts/*.png пропущена — используйте готовые фото):');
  console.log('  Подсказки лежат в placeholders/discounts/');
}

console.log('\nГотово.');
