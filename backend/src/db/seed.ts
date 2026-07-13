import { db } from './index.js';
import { siteSettings, promotions, galleryPhotos } from './schema.js';
import { seedPromotions } from './seed-data.js';

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

console.log('Seed complete.');
