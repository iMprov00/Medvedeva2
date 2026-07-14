import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { requireAdmin } from '../auth/middleware.js';
import { optimizeUploadedImages, type ImageUploadKind } from '../utils/imageProcessing.js';

const uploadsDir = path.resolve(process.cwd(), '..', 'uploads');

const DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const DOCUMENT_EXTENSIONS = new Set([
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.doc',
  '.docx',
]);

type UploadKind = ImageUploadKind | 'document';

function parseKind(value: unknown): UploadKind {
  if (
    value === 'doctor' ||
    value === 'gallery' ||
    value === 'promotion' ||
    value === 'document' ||
    value === 'default'
  ) {
    return value;
  }
  return 'default';
}

function safeExtension(filename: string, mimetype: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (DOCUMENT_EXTENSIONS.has(ext)) return ext;
  if (mimetype === 'application/pdf') return '.pdf';
  if (mimetype === 'image/jpeg') return '.jpg';
  if (mimetype === 'image/png') return '.png';
  if (mimetype === 'image/webp') return '.webp';
  if (mimetype === 'application/msword') return '.doc';
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return '.docx';
  }
  return '';
}

function isAllowedDocument(filename: string, mimetype: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return DOCUMENT_MIME_TYPES.has(mimetype) || DOCUMENT_EXTENSIONS.has(ext);
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
      const originalFilename = path.basename(file.filename || 'document');

      if (kind === 'document') {
        if (!isAllowedDocument(originalFilename, file.mimetype)) {
          return reply.status(400).send({
            error: 'Допустимы PDF, DOC, DOCX и изображения (JPG, PNG, WebP).',
          });
        }

        const ext = safeExtension(originalFilename, file.mimetype);
        if (!ext) {
          return reply.status(400).send({ error: 'Не удалось определить тип файла' });
        }

        const filename = `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
        await writeFile(path.join(uploadsDir, filename), originalBuffer);
        return {
          url: `/uploads/${filename}`,
          originalFilename,
        };
      }

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
          error: 'Файл слишком большой. Максимум 30 МБ. Попробуйте уменьшить файл.',
        });
      }

      request.log.error(error);
      return reply.status(500).send({
        error: 'Не удалось обработать файл. Попробуйте другой формат.',
      });
    }
  });
}

export { uploadsDir };
