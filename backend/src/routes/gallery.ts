import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { asc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { galleryPhotos } from '../db/schema.js';
import { requireAdmin } from '../auth/middleware.js';
import { nowIso, serializeGalleryPhoto } from '../utils/serialize.js';
import { uploadsDir } from './upload.js';

async function deleteUploadedFile(imageUrl: string) {
  if (!imageUrl.startsWith('/uploads/')) return;
  const filename = path.basename(imageUrl);
  try {
    await unlink(path.join(uploadsDir, filename));
  } catch {
    // file may already be removed
  }
}

export async function galleryPublicRoutes(app: FastifyInstance) {
  app.get('/api/gallery', async () => {
    const rows = db.select().from(galleryPhotos).orderBy(asc(galleryPhotos.sortOrder)).all();
    return rows.map(serializeGalleryPhoto);
  });
}

export async function galleryAdminRoutes(app: FastifyInstance) {
  app.get('/api/admin/gallery', { preHandler: requireAdmin }, async () => {
    const rows = db.select().from(galleryPhotos).orderBy(asc(galleryPhotos.sortOrder)).all();
    return rows.map(serializeGalleryPhoto);
  });

  app.post('/api/admin/gallery', { preHandler: requireAdmin }, async (request) => {
    const body = request.body as { imageUrl: string; sortOrder?: number };
    const now = nowIso();
    const maxOrder =
      db
        .select({ sortOrder: galleryPhotos.sortOrder })
        .from(galleryPhotos)
        .orderBy(asc(galleryPhotos.sortOrder))
        .all()
        .at(-1)?.sortOrder ?? -1;

    const result = db
      .insert(galleryPhotos)
      .values({
        imageUrl: body.imageUrl,
        sortOrder: body.sortOrder ?? maxOrder + 1,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    return serializeGalleryPhoto(result);
  });

  app.delete('/api/admin/gallery/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(galleryPhotos).where(eq(galleryPhotos.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ error: 'Not found' });

    await deleteUploadedFile(existing.imageUrl);
    db.delete(galleryPhotos).where(eq(galleryPhotos.id, Number(id))).run();
    return { ok: true };
  });
}
