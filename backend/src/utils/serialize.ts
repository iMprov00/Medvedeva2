export function nowIso() {
  return new Date().toISOString();
}

export function parseTags(raw: string): string[] {
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function serializePromotion(row: {
  id: number;
  badge: string;
  title: string;
  discount: string;
  text: string;
  tags: string;
  imageUrl: string;
  accentColor: string;
  validUntil: string | null;
  active: boolean | null;
  sortOrder: number;
}) {
  return {
    id: row.id,
    badge: row.badge,
    title: row.title,
    discount: row.discount,
    text: row.text,
    tags: parseTags(row.tags),
    imageUrl: row.imageUrl,
    accentColor: row.accentColor,
    validUntil: row.validUntil,
    active: Boolean(row.active),
    sortOrder: row.sortOrder,
  };
}

export function serializeDoctor(
  row: {
    id: number;
    lastName: string;
    firstName: string;
    middleName: string | null;
    role: string | null;
    photoUrl: string | null;
    bookingUrl: string;
    published: boolean | null;
    sortOrder: number;
  },
  specialtySlugs: string[] = [],
) {
  const parts = [row.lastName, row.firstName, row.middleName].filter(Boolean);
  return {
    id: row.id,
    lastName: row.lastName,
    firstName: row.firstName,
    middleName: row.middleName,
    role: row.role,
    fullName: parts.join(' '),
    photoUrl: row.photoUrl,
    bookingUrl: row.bookingUrl,
    published: Boolean(row.published),
    sortOrder: row.sortOrder,
    specialtySlugs,
  };
}

export function serializeGalleryPhoto(row: {
  id: number;
  imageUrl: string;
  sortOrder: number;
}) {
  return {
    id: row.id,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
  };
}

export function serializeDocument(row: {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  originalFilename: string | null;
  sortOrder: number;
  active: boolean | null;
}) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    fileUrl: row.fileUrl,
    originalFilename: row.originalFilename,
    sortOrder: row.sortOrder,
    active: Boolean(row.active),
  };
}
