import Database from 'better-sqlite3';
import { dbPath } from './index.js';

const db = new Database(dbPath);
db.pragma('foreign_keys = OFF');

db.exec(`
  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL,
    approved INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    badge TEXT NOT NULL,
    title TEXT NOT NULL,
    discount TEXT NOT NULL,
    text TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    image_url TEXT NOT NULL,
    accent_color TEXT NOT NULL,
    valid_until TEXT,
    active INTEGER DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    role TEXT,
    photo_url TEXT,
    booking_url TEXT NOT NULL,
    published INTEGER DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS gallery_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const tableInfo = (table: string) =>
  db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];

const hasTable = (table: string) =>
  (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table) as
    | { name: string }
    | undefined) !== undefined;

const documentsColumns = hasTable('documents')
  ? tableInfo('documents').map((c) => c.name)
  : [];
const isLegacyDocuments =
  documentsColumns.includes('file_path') && !documentsColumns.includes('file_url');

if (isLegacyDocuments) {
  db.exec(`ALTER TABLE documents RENAME TO documents_legacy`);
  db.exec(`
    CREATE TABLE documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      file_url TEXT NOT NULL,
      original_filename TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const now = new Date().toISOString();
  const legacyDocs = db.prepare('SELECT * FROM documents_legacy').all() as {
    id: number;
    title: string;
    description: string | null;
    file_path: string;
    original_filename: string | null;
    position: number | null;
    active: number | boolean | null;
    created_at: string | null;
    updated_at: string | null;
  }[];

  const insertDoc = db.prepare(`
    INSERT INTO documents (id, title, description, file_url, original_filename, sort_order, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const doc of legacyDocs) {
    insertDoc.run(
      doc.id,
      doc.title,
      doc.description,
      doc.file_path,
      doc.original_filename,
      doc.position ?? 0,
      doc.active ? 1 : 0,
      doc.created_at ?? now,
      doc.updated_at ?? now,
    );
  }

  db.exec(`DROP TABLE documents_legacy`);
} else if (!hasTable('documents')) {
  db.exec(`
    CREATE TABLE documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      file_url TEXT NOT NULL,
      original_filename TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

const doctorsColumns = hasTable('doctors') ? tableInfo('doctors').map((c) => c.name) : [];
if (doctorsColumns.length > 0 && !doctorsColumns.includes('role')) {
  db.exec(`ALTER TABLE doctors ADD COLUMN role TEXT`);
}

const dsColumns = hasTable('doctor_specialties') ? tableInfo('doctor_specialties').map((c) => c.name) : [];
const usesLegacyDoctorSpecialties = dsColumns.includes('specialty_id');

if (usesLegacyDoctorSpecialties) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS doctor_specialties_new (
      doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      specialty_slug TEXT NOT NULL,
      PRIMARY KEY (doctor_id, specialty_slug)
    );
  `);

  if (hasTable('specialties')) {
    db.exec(`
      INSERT OR IGNORE INTO doctor_specialties_new (doctor_id, specialty_slug)
      SELECT ds.doctor_id, s.slug
      FROM doctor_specialties ds
      JOIN specialties s ON s.id = ds.specialty_id;
    `);
  }

  db.exec(`DROP TABLE doctor_specialties`);
  db.exec(`ALTER TABLE doctor_specialties_new RENAME TO doctor_specialties`);
} else if (!hasTable('doctor_specialties')) {
  db.exec(`
    CREATE TABLE doctor_specialties (
      doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      specialty_slug TEXT NOT NULL,
      PRIMARY KEY (doctor_id, specialty_slug)
    );
  `);
}

if (hasTable('specialties')) {
  db.exec(`DROP TABLE specialties`);
}

const isLegacyDoctors = doctorsColumns.includes('booking_link') && !doctorsColumns.includes('booking_url');
if (isLegacyDoctors) {
  db.exec(`ALTER TABLE doctors RENAME TO doctors_legacy`);
  db.exec(`
    CREATE TABLE doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      last_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      middle_name TEXT,
      role TEXT,
      photo_url TEXT,
      booking_url TEXT NOT NULL,
      published INTEGER DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const now = new Date().toISOString();
  const legacyDoctors = db.prepare('SELECT * FROM doctors_legacy').all() as {
    id: number;
    last_name: string;
    first_name: string;
    middle_name: string | null;
    photo_path: string | null;
    booking_link: string | null;
  }[];

  const insertDoctor = db.prepare(`
    INSERT INTO doctors (last_name, first_name, middle_name, photo_url, booking_url, published, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
  `);

  for (const doc of legacyDoctors) {
    insertDoctor.run(
      doc.last_name,
      doc.first_name,
      doc.middle_name,
      doc.photo_path,
      doc.booking_link || 'https://booking.medflex.ru/?user=83de76a588b26ad9b729c20d4b1ffbf6&source=3',
      doc.id,
      now,
      now,
    );
  }

  db.exec(`DROP TABLE doctors_legacy`);
}

console.log('Migration complete.');
db.pragma('foreign_keys = ON');
db.close();
