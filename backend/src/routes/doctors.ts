import { eq, asc } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { doctors, doctorSpecialties } from '../db/schema.js';
import { requireAdmin } from '../auth/middleware.js';
import { nowIso, serializeDoctor } from '../utils/serialize.js';

function getSpecialtySlugsForDoctor(doctorId: number): string[] {
  return db
    .select()
    .from(doctorSpecialties)
    .where(eq(doctorSpecialties.doctorId, doctorId))
    .all()
    .map((r) => r.specialtySlug);
}

function setDoctorSpecialties(doctorId: number, specialtySlugs: string[]) {
  db.delete(doctorSpecialties).where(eq(doctorSpecialties.doctorId, doctorId)).run();
  for (const specialtySlug of specialtySlugs) {
    db.insert(doctorSpecialties).values({ doctorId, specialtySlug }).run();
  }
}

export async function doctorsPublicRoutes(app: FastifyInstance) {
  app.get('/api/doctors', async (request) => {
    const { specialty } = request.query as { specialty?: string };
    let rows = db
      .select()
      .from(doctors)
      .where(eq(doctors.published, true))
      .orderBy(asc(doctors.sortOrder))
      .all();

    if (specialty) {
      const links = db
        .select()
        .from(doctorSpecialties)
        .where(eq(doctorSpecialties.specialtySlug, specialty))
        .all();
      const ids = links.map((l) => l.doctorId);
      rows = rows.filter((d) => ids.includes(d.id));
    }

    return rows.map((d) => serializeDoctor(d, getSpecialtySlugsForDoctor(d.id)));
  });
}

export async function doctorsAdminRoutes(app: FastifyInstance) {
  app.get('/api/admin/doctors', { preHandler: requireAdmin }, async () => {
    const rows = db.select().from(doctors).orderBy(asc(doctors.sortOrder)).all();
    return rows.map((d) => serializeDoctor(d, getSpecialtySlugsForDoctor(d.id)));
  });

  app.get('/api/admin/doctors/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = db.select().from(doctors).where(eq(doctors.id, Number(id))).get();
    if (!row) return reply.status(404).send({ error: 'Not found' });
    return serializeDoctor(row, getSpecialtySlugsForDoctor(row.id));
  });

  app.post('/api/admin/doctors', { preHandler: requireAdmin }, async (request) => {
    const body = request.body as {
      lastName: string;
      firstName: string;
      middleName?: string | null;
      role?: string | null;
      photoUrl?: string | null;
      bookingUrl: string;
      published?: boolean;
      sortOrder?: number;
      specialtySlugs?: string[];
    };
    const now = nowIso();
    const result = db
      .insert(doctors)
      .values({
        lastName: body.lastName,
        firstName: body.firstName,
        middleName: body.middleName ?? null,
        role: body.role ?? null,
        photoUrl: body.photoUrl ?? null,
        bookingUrl: body.bookingUrl,
        published: body.published ?? false,
        sortOrder: body.sortOrder ?? 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
    setDoctorSpecialties(result.id, body.specialtySlugs ?? []);
    return serializeDoctor(result, body.specialtySlugs ?? []);
  });

  app.put('/api/admin/doctors/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      lastName: string;
      firstName: string;
      middleName?: string | null;
      role?: string | null;
      photoUrl?: string | null;
      bookingUrl: string;
      published?: boolean;
      sortOrder?: number;
      specialtySlugs?: string[];
    };
    const existing = db.select().from(doctors).where(eq(doctors.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ error: 'Not found' });

    const result = db
      .update(doctors)
      .set({
        lastName: body.lastName,
        firstName: body.firstName,
        middleName: body.middleName ?? null,
        role: body.role ?? null,
        photoUrl: body.photoUrl ?? null,
        bookingUrl: body.bookingUrl,
        published: body.published ?? false,
        sortOrder: body.sortOrder ?? 0,
        updatedAt: nowIso(),
      })
      .where(eq(doctors.id, Number(id)))
      .returning()
      .get();
    setDoctorSpecialties(result.id, body.specialtySlugs ?? []);
    return serializeDoctor(result, body.specialtySlugs ?? []);
  });

  app.delete('/api/admin/doctors/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    db.delete(doctors).where(eq(doctors.id, Number(id))).run();
    return { ok: true };
  });
}
