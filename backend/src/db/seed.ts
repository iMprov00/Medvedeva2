import { db } from './index.js';
import { siteSettings, promotions, galleryPhotos, documents } from './schema.js';
import { seedPromotions, seedDocuments } from './seed-data.js';
import { eq } from 'drizzle-orm';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDocsDir = path.resolve(__dirname, '../../../frontend/public/images/docs');

const now = new Date().toISOString();

const defaultGalleryUrls = [
  '/images/about/1.jpeg',
  '/images/about/2.jpeg',
  '/images/about/3.jpeg',
  '/images/about/4.jpeg',
  '/images/about/5.jpeg',
  '/images/about/6.jpeg',
  '/images/about/7.jpeg',
  '/images/about/8.jpeg',
];

const defaults: Record<string, unknown> = {
  address: 'г. Барнаул, ул. 280-летия Барнаула, д. 22',
  phones: ['+7 (913) 365-04-64', '+7 (385) 225-65-75'],
  email: 'medvedevaclinic@yandex.ru',
  workingHours: {
    weekdays: 'Пн-Пт: 09:00 - 19:00',
    saturday: 'Сб: 9:00 - 16:00',
    sunday: 'Вс: 9:00 - 16:00',
  },
};

for (const [key, value] of Object.entries(defaults)) {
  db.insert(siteSettings)
    .values({ key, value: JSON.stringify(value) })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: JSON.stringify(value) },
    })
    .run();
}

for (const promo of seedPromotions) {
  const existing = db.select().from(promotions).all().find((p) => p.title === promo.title);
  if (!existing) {
    db.insert(promotions)
      .values({
        ...promo,
        tags: JSON.stringify(promo.tags),
        active: true,
        validUntil: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }
}

const existingGallery = db.select().from(galleryPhotos).all();
if (existingGallery.length === 0) {
  defaultGalleryUrls.forEach((imageUrl, index) => {
    db.insert(galleryPhotos)
      .values({
        imageUrl,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  });
}

const existingDocuments = db.select().from(documents).all();
if (existingDocuments.length === 0) {
  for (const doc of seedDocuments) {
    db.insert(documents)
      .values({
        title: doc.title,
        description: doc.description,
        fileUrl: doc.fileUrl,
        originalFilename: doc.originalFilename,
        sortOrder: doc.sortOrder,
        active: true,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }
} else {
  // Старые пути из Ruby (doc_*.pdf) могут отсутствовать в public — подставляем известные файлы.
  const remaps: { test: RegExp; fileUrl: string; originalFilename: string }[] = [
    {
      test: /лицензия/i,
      fileUrl: '/images/docs/lic.pdf',
      originalFilename: 'Лицензия_клиники_Медведевой.pdf',
    },
    {
      test: /свидетельств/i,
      fileUrl: '/images/docs/reg.webp',
      originalFilename: 'Свидетельство_о_регистрации.webp',
    },
    {
      test: /прейскурант|прайс/i,
      fileUrl: '/images/docs/price.pdf',
      originalFilename: 'Прайс-лист_клиники_Медведевой.pdf',
    },
    {
      test: /доверенност/i,
      fileUrl: '/images/docs/dover.pdf',
      originalFilename: 'Доверенность.pdf',
    },
    {
      test: /политик.*конфиденц|конфиденциальност/i,
      fileUrl: '/images/docs/poly.pdf',
      originalFilename: 'Политика_конфиденциальности.pdf',
    },
  ];

  const availableDocs = new Set(
    (() => {
      try {
        return readdirSync(publicDocsDir);
      } catch {
        return [] as string[];
      }
    })(),
  );

  for (const row of existingDocuments) {
    const remap = remaps.find((r) => r.test.test(row.title));
    if (remap && row.fileUrl.includes('/images/docs/doc_')) {
      db.update(documents)
        .set({
          fileUrl: remap.fileUrl,
          originalFilename: remap.originalFilename,
          updatedAt: now,
        })
        .where(eq(documents.id, row.id))
        .run();
      continue;
    }

    // Скрыть записи со ссылками на отсутствующие локальные файлы
    if (row.fileUrl.startsWith('/images/docs/')) {
      const name = row.fileUrl.split('/').pop() ?? '';
      if (name && !availableDocs.has(name) && row.active) {
        db.update(documents)
          .set({ active: false, updatedAt: now })
          .where(eq(documents.id, row.id))
          .run();
      }
    }
  }
}

console.log('Seed complete.');
