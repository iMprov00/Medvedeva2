import type { FastifyInstance } from 'fastify';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { reviews } from '../db/schema.js';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function reviewsRoutes(app: FastifyInstance) {
  app.get('/api/reviews', async () => {
    const rows = db
      .select()
      .from(reviews)
      .where(eq(reviews.approved, true))
      .orderBy(desc(reviews.createdAt))
      .all();

    return rows.map((row) => ({
      id: row.id,
      author_name: row.authorName,
      content: row.content,
      rating: row.rating,
      created_at: row.createdAt,
      formatted_date: formatDate(row.createdAt),
    }));
  });

  app.post<{ Body: { author_name?: string; content?: string; rating?: number } }>(
    '/api/reviews',
    async (request, reply) => {
      const authorName = request.body.author_name?.trim() ?? '';
      const content = request.body.content?.trim() ?? '';
      const rating = Number(request.body.rating);

      const errors: string[] = [];
      if (!authorName) errors.push('Имя не может быть пустым');
      if (!content) errors.push('Текст отзыва не может быть пустым');
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        errors.push('Оценка должна быть от 1 до 5');
      }

      if (errors.length > 0) {
        return reply.status(400).send({ success: false, errors });
      }

      const now = new Date().toISOString();

      db.insert(reviews)
        .values({
          authorName,
          content,
          rating,
          approved: false,
          featured: false,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      return {
        success: true,
        message: 'Спасибо за отзыв! Он будет опубликован после модерации.',
      };
    },
  );
}
