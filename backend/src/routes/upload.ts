import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { requireAdmin } from '../auth/middleware.js';
import { optimizeUploadedImages, type ImageUploadKind } from '../utils/imageProcessing.js';

const uploadsDir = path.resolve(process.cwd(), '..', 'uploads');

function parseKind(value: unknown): ImageUploadKind {
  if (value === 'doctor' || value === 'gallery' || value === 'default') {
    return value;
  }
  return 'default';
}

export async function uploadRoutes(app: FastifyInstance) {
  await mkdir(uploadsDir, { recursive: true });

  app.post('/api/admin/upload', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const kind = parseKind((request.query as { kind?: string }).kind);
      const file = await request.file();
      if (!file) {
        return reply.status(400).send({ error: 'Файл не выбран' });
      }

      const originalBuffer = await file.toBuffer();
      const { files } = await optimizeUploadedImages(originalBuffer, file.mimetype, kind);
      const baseName = `${Date.now()}-${randomBytes(8).toString('hex')}`;

      let primaryUrl = '';
      for (const variant of files) {
        const filename = `${baseName}${variant.suffix}${variant.ext}`;
        await writeFile(path.join(uploadsDir, filename), variant.buffer);
        if (variant.suffix === '-card' || variant.suffix === '-thumb') {
          primaryUrl = `/uploads/${filename}`;
        }
      }

      if (!primaryUrl) {
        const fallback = files[0];
        primaryUrl = `/uploads/${baseName}${fallback.suffix}${fallback.ext}`;
      }

      return { url: primaryUrl };
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.status(413).send({
          error: 'Файл слишком большой. Максимум 30 МБ. Попробуйте уменьшить фото или сохранить как JPEG.',
        });
      }

      request.log.error(error);
      return reply.status(500).send({
        error: 'Не удалось обработать изображение. Попробуйте другой файл (JPG или PNG).',
      });
    }
  });
}

export { uploadsDir };
