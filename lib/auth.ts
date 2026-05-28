import { cookies } from 'next/headers';

const ADMIN_USERNAME = 'ponkali_admin';
const ADMIN_PASSWORD = 'erode2024secure';
const SESSION_TOKEN = 'ponkali_session';
const SESSION_SECRET = 'ponkali_secret_2024_erode';

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function generateSessionToken(): string {
  const payload = {
    user: ADMIN_USERNAME,
    exp: Date.now() + 24 * 60 * 60 * 1000,
    secret: SESSION_SECRET,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function validateSessionToken(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return payload.secret === SESSION_SECRET && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_TOKEN)?.value;
  if (!token) return false;
  return validateSessionToken(token);
}

export const SESSION_COOKIE_NAME = SESSION_TOKEN;
