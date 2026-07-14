import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { siteSettingsRoutes } from './routes/site-settings.js';
import { reviewsRoutes } from './routes/reviews.js';
import { authRoutes } from './routes/auth.js';
import { uploadRoutes, uploadsDir } from './routes/upload.js';
import { promotionsPublicRoutes, promotionsAdminRoutes } from './routes/promotions.js';
import { doctorsPublicRoutes, doctorsAdminRoutes } from './routes/doctors.js';
import { galleryPublicRoutes, galleryAdminRoutes } from './routes/gallery.js';
import { documentsPublicRoutes, documentsAdminRoutes } from './routes/documents.js';

const app = Fastify({ logger: true });

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';

await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? true,
  credentials: true,
});

await app.register(cookie);
await app.register(multipart, { limits: { fileSize: 30 * 1024 * 1024 } });
await app.register(fastifyStatic, {
  root: uploadsDir,
  prefix: '/uploads/',
  decorateReply: false,
});

app.get('/api/health', async () => ({ status: 'ok' }));

await app.register(siteSettingsRoutes);
await app.register(reviewsRoutes);
await app.register(authRoutes);
await app.register(uploadRoutes);
await app.register(promotionsPublicRoutes);
await app.register(promotionsAdminRoutes);
await app.register(doctorsPublicRoutes);
await app.register(doctorsAdminRoutes);
await app.register(galleryPublicRoutes);
await app.register(galleryAdminRoutes);
await app.register(documentsPublicRoutes);
await app.register(documentsAdminRoutes);

try {
  await app.listen({ port, host });
  console.log(`Uploads dir: ${uploadsDir}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
