import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
});

export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authorName: text('author_name').notNull(),
  content: text('content').notNull(),
  rating: integer('rating').notNull(),
  approved: integer('approved', { mode: 'boolean' }).default(false),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const promotions = sqliteTable('promotions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  badge: text('badge').notNull(),
  title: text('title').notNull(),
  discount: text('discount').notNull(),
  text: text('text').notNull(),
  tags: text('tags').notNull().default('[]'),
  imageUrl: text('image_url').notNull(),
  accentColor: text('accent_color').notNull(),
  validUntil: text('valid_until'),
  active: integer('active', { mode: 'boolean' }).default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const doctors = sqliteTable('doctors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lastName: text('last_name').notNull(),
  firstName: text('first_name').notNull(),
  middleName: text('middle_name'),
  role: text('role'),
  photoUrl: text('photo_url'),
  bookingUrl: text('booking_url').notNull(),
  published: integer('published', { mode: 'boolean' }).default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const doctorSpecialties = sqliteTable(
  'doctor_specialties',
  {
    doctorId: integer('doctor_id')
      .notNull()
      .references(() => doctors.id, { onDelete: 'cascade' }),
    specialtySlug: text('specialty_slug').notNull(),
  },
  (table) => [primaryKey({ columns: [table.doctorId, table.specialtySlug] })],
);

export const galleryPhotos = sqliteTable('gallery_photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  imageUrl: text('image_url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
