import type { FastifyReply, FastifyRequest } from 'fastify';
import { isValidSession } from '../auth/session.js';

const SESSION_COOKIE = 'admin_session';

export function getSessionToken(request: FastifyRequest): string | undefined {
  return request.cookies[SESSION_COOKIE];
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const token = getSessionToken(request);
  if (!isValidSession(token)) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
}

export function setSessionCookie(reply: FastifyReply, token: string) {
  reply.setCookie(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
  });
}

export function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE, { path: '/' });
}

export { SESSION_COOKIE };
