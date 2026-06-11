import crypto from 'crypto';
import { cookies } from 'next/headers';

/**
 * Customer authentication helpers.
 *
 * Passwords are hashed with scrypt (salt-per-user, constant-time compare).
 * Sessions are stateless HMAC-signed tokens stored in an httpOnly cookie —
 * no extra dependencies beyond Node's built-in `crypto`.
 *
 * SESSION_SECRET should be set in the environment for production. The dev
 * fallback below keeps local builds working but MUST be overridden before launch.
 */
const SESSION_SECRET =
  process.env.SESSION_SECRET ?? 'ponkali_customer_dev_secret_change_me';

export const CUSTOMER_COOKIE = 'ponkali_customer_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/* ──────────────────────────  Password hashing  ────────────────────────── */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const hashBuf = Buffer.from(hash, 'hex');
  // Length check guards timingSafeEqual against throwing on mismatched sizes.
  if (hashBuf.length !== derived.length) return false;
  return crypto.timingSafeEqual(hashBuf, derived);
}

/* ──────────────────────────  Session tokens  ─────────────────────────── */

interface SessionPayload {
  uid: number;
  /** Email is optional — an account may have been created with a phone only. */
  email: string | null;
  phone?: string | null;
  name?: string;
  exp: number;
}

function sign(data: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
}

export function createSessionToken(
  uid: number,
  email: string | null,
  name?: string,
  phone?: string | null,
): string {
  const payload: SessionPayload = {
    uid,
    email: email ?? null,
    phone: phone ?? null,
    name,
    exp: Date.now() + SESSION_DURATION_MS,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${data}.${sign(data)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;

  const expected = sign(data);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/* ──────────────────────────  Cookie helpers  ─────────────────────────── */

export function buildSessionCookie(token: string) {
  return {
    name: CUSTOMER_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  };
}

/** Reads and validates the current customer session from cookies (server-side). */
export function getCustomerSession(): SessionPayload | null {
  const token = cookies().get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/* ──────────────────────────  Validation  ─────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export function passwordError(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  return null;
}

/* ──────────────────────────  Phone helpers  ─────────────────────────── */

/**
 * Reduce a phone number to a canonical 10-digit string: strip every non-digit,
 * then drop a leading country code (91) or a 0 trunk prefix if it leaves 10
 * digits. Returns '' when the result isn't a plausible 10-digit Indian mobile,
 * so callers can treat '' as "invalid".
 */
export function normalizePhone(raw: string): string {
  let digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.length === 10 ? digits : '';
}

export function isValidPhone(raw: string): boolean {
  const p = normalizePhone(raw);
  // Indian mobile numbers start with 6–9.
  return p.length === 10 && /^[6-9]/.test(p);
}

/** True when the identifier looks like an email rather than a phone number. */
export function looksLikeEmail(identifier: string): boolean {
  return identifier.includes('@');
}
