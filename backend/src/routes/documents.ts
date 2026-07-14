import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { asc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { documents } from '../db/schema.js';
import { requireAdmin } from '../auth/middleware.js';
import { nowIso, serializeDocument } from '../utils/serialize.js';
import { uploadsDir } from './upload.js';

async function deleteUploadedDocument(fileUrl: string) {
  if (!fileUrl.startsWith('/uploads/')) return;
  const filename = path.basename(fileUrl);
  try {
    await unlink(path.join(uploadsDir, filename));
  } catch {
    // file may already be removed
  }
}

export async function documentsPublicRoutes(app: FastifyInstance) {
  app.get('/api/documents', async () => {
    const rows = db
      .select()
      .from(documents)
      .where(eq(documents.active, true))
      .orderBy(asc(documents.sortOrder))
      .all();
    return rows.map(serializeDocument);
  });
}

export async function documentsAdminRoutes(app: FastifyInstance) {
  app.get('/api/admin/documents', { preHandler: requireAdmin }, async () => {
    const rows = db.select().from(documents).orderBy(asc(documents.sortOrder)).all();
    return rows.map(serializeDocument);
  });

  app.post('/api/admin/documents', { preHandler: requireAdmin }, async (request, reply) => {
    const body = request.body as {
      title?: string;
      description?: string | null;
      fileUrl?: string;
      originalFilename?: string | null;
      sortOrder?: number;
      active?: boolean;
    };

    if (!body.title?.trim() || !body.fileUrl?.trim()) {
      return reply.status(400).send({ error: 'Укажите название и файл' });
    }

    const now = nowIso();
    const maxOrder =
      db
        .select({ sortOrder: documents.sortOrder })
        .from(documents)
        .orderBy(asc(documents.sortOrder))
        .all()
        .at(-1)?.sortOrder ?? -1;

    const result = db
      .insert(documents)
      .values({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        fileUrl: body.fileUrl.trim(),
        originalFilename: body.originalFilename?.trim() || null,
        sortOrder: body.sortOrder ?? maxOrder + 1,
        active: body.active ?? true,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    return serializeDocument(result);
  });

  app.put('/api/admin/documents/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      title?: string;
      description?: string | null;
      fileUrl?: string;
      originalFilename?: string | null;
      sortOrder?: number;
      active?: boolean;
    };

    const existing = db.select().from(documents).where(eq(documents.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ error: 'Not found' });

    if (!body.title?.trim() || !body.fileUrl?.trim()) {
      return reply.status(400).send({ error: 'Укажите название и файл' });
    }

    const previousFileUrl = existing.fileUrl;
    const nextFileUrl = body.fileUrl.trim();

    const result = db
      .update(documents)
      .set({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        fileUrl: nextFileUrl,
        originalFilename:
          body.originalFilename !== undefined
            ? body.originalFilename?.trim() || null
            : existing.originalFilename,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        active: body.active ?? true,
        updatedAt: nowIso(),
      })
      .where(eq(documents.id, Number(id)))
      .returning()
      .get();

    if (previousFileUrl !== nextFileUrl) {
      await deleteUploadedDocument(previousFileUrl);
    }

    return serializeDocument(result);
  });

  app.delete('/api/admin/documents/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(documents).where(eq(documents.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ error: 'Not found' });

    await deleteUploadedDocument(existing.fileUrl);
    db.delete(documents).where(eq(documents.id, Number(id))).run();
    return { ok: true };
  });
}
