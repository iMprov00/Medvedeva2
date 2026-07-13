import type { FastifyInstance } from 'fastify';
import {
  createSession,
  destroySession,
  getAdminCredentials,
} from '../auth/session.js';
import {
  clearSessionCookie,
  getSessionToken,
  requireAdmin,
  setSessionCookie,
} from '../auth/middleware.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/admin/login', async (request, reply) => {
    const body = request.body as { username?: string; password?: string };
    const { username, password } = getAdminCredentials();

    if (body.username !== username || body.password !== password) {
      return reply.status(401).send({ error: 'Неверный логин или пароль' });
    }

    const token = createSession();
    setSessionCookie(reply, token);
    return { ok: true };
  });

  app.post('/api/admin/logout', async (request, reply) => {
    destroySession(getSessionToken(request));
    clearSessionCookie(reply);
    return { ok: true };
  });

  app.get('/api/admin/me', { preHandler: requireAdmin }, async () => ({ ok: true }));
}
