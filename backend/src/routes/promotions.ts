import { eq, asc } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { promotions } from '../db/schema.js';
import { requireAdmin } from '../auth/middleware.js';
import { nowIso, serializePromotion } from '../utils/serialize.js';

export async function promotionsPublicRoutes(app: FastifyInstance) {
  app.get('/api/promotions', async () => {
    const rows = db
      .select()
      .from(promotions)
      .where(eq(promotions.active, true))
      .orderBy(asc(promotions.sortOrder))
      .all();
    return rows.map(serializePromotion);
  });
}

export async function promotionsAdminRoutes(app: FastifyInstance) {
  app.get('/api/admin/promotions', { preHandler: requireAdmin }, async () => {
    const rows = db.select().from(promotions).orderBy(asc(promotions.sortOrder)).all();
    return rows.map(serializePromotion);
  });

  app.get('/api/admin/promotions/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = db.select().from(promotions).where(eq(promotions.id, Number(id))).get();
    if (!row) return reply.status(404).send({ error: 'Not found' });
    return serializePromotion(row);
  });

  app.post('/api/admin/promotions', { preHandler: requireAdmin }, async (request) => {
    const body = request.body as {
      badge: string;
      title: string;
      discount: string;
      text: string;
      tags?: string[];
      imageUrl: string;
      accentColor: string;
      validUntil?: string | null;
      active?: boolean;
      sortOrder?: number;
    };
    const now = nowIso();
    const result = db
      .insert(promotions)
      .values({
        badge: body.badge,
        title: body.title,
        discount: body.discount,
        text: body.text,
        tags: JSON.stringify(body.tags ?? []),
        imageUrl: body.imageUrl,
        accentColor: body.accentColor,
        validUntil: body.validUntil ?? null,
        active: body.active ?? true,
        sortOrder: body.sortOrder ?? 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
    return serializePromotion(result);
  });

  app.put('/api/admin/promotions/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      badge: string;
      title: string;
      discount: string;
      text: string;
      tags?: string[];
      imageUrl: string;
      accentColor: string;
      validUntil?: string | null;
      active?: boolean;
      sortOrder?: number;
    };
    const existing = db.select().from(promotions).where(eq(promotions.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ error: 'Not found' });

    const result = db
      .update(promotions)
      .set({
        badge: body.badge,
        title: body.title,
        discount: body.discount,
        text: body.text,
        tags: JSON.stringify(body.tags ?? []),
        imageUrl: body.imageUrl,
        accentColor: body.accentColor,
        validUntil: body.validUntil ?? null,
        active: body.active ?? true,
        sortOrder: body.sortOrder ?? 0,
        updatedAt: nowIso(),
      })
      .where(eq(promotions.id, Number(id)))
      .returning()
      .get();
    return serializePromotion(result);
  });

  app.delete('/api/admin/promotions/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    db.delete(promotions).where(eq(promotions.id, Number(id))).run();
    return { ok: true };
  });
}
