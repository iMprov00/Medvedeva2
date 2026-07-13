import { randomBytes } from 'node:crypto';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const sessions = new Map<string, number>();

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? '1',
    password: process.env.ADMIN_PASSWORD ?? '1',
  };
}

export function createSession(): string {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token: string | undefined) {
  if (token) sessions.delete(token);
}
