import crypto from 'crypto';
import { cookies } from 'next/headers';
import {
  ADMIN_USERNAME,
  ADMIN_COOKIE,
  ADMIN_SESSION_SECRET,
  ADMIN_SESSION_DURATION_MS,
  ADMIN_AUTH_CONFIGURED,
  validateCredentials,
  encodePayload,
  decodePayload,
} from './admin-session';

export { validateCredentials };
export const SESSION_COOKIE_NAME = ADMIN_COOKIE;

/** HMAC-SHA256 of the encoded payload, hex — matches the Web Crypto impl in middleware.ts. */
function sign(data: string): string {
  return crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(data).digest('hex');
}

export function generateSessionToken(): string {
  const data = encodePayload({
    user: ADMIN_USERNAME,
    exp: Date.now() + ADMIN_SESSION_DURATION_MS,
  });
  return `${data}.${sign(data)}`;
}

export function validateSessionToken(token: string): boolean {
  // Fail closed when admin auth isn't configured (production missing env vars).
  if (!ADMIN_AUTH_CONFIGURED) return false;

  const [data, signature] = token.split('.');
  if (!data || !signature) return false;

  const expected = sign(data);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  const payload = decodePayload(data);
  return !!payload && payload.exp > Date.now();
}

export async function getAdminSession(): Promise<boolean> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return validateSessionToken(token);
}
