/**
 * Edge-safe admin session primitives: constants, credential check, and payload
 * encoding only. NO Node `crypto` and NO `next/headers` here, so this module can
 * be imported from both Node route handlers (lib/auth.ts) and Edge middleware.
 *
 * The actual HMAC signing/verifying lives in the runtime-specific callers:
 *   - lib/auth.ts        → Node `crypto.createHmac` (sign + verify)
 *   - middleware.ts      → Web Crypto `crypto.subtle` (verify)
 * Both produce the same HMAC-SHA256 hex over the same data, so tokens are
 * interchangeable across runtimes.
 */

const IS_PROD = process.env.NODE_ENV === 'production';

// The admin credentials and signing secret come from the environment. The
// username is not sensitive, so it keeps a default; the password and secret
// MUST be provided in production (see .env.example). In local dev they fall
// back to known values so the build and local login keep working.
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'ponkali_admin';

const ADMIN_PASSWORD_ENV = process.env.ADMIN_PASSWORD;
const ADMIN_SESSION_SECRET_ENV = process.env.ADMIN_SESSION_SECRET;

const ADMIN_PASSWORD = ADMIN_PASSWORD_ENV ?? (IS_PROD ? undefined : 'erode2024secure');

export const ADMIN_COOKIE = 'ponkali_session';
export const ADMIN_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Secret used to sign session tokens. In production it MUST come from
 * ADMIN_SESSION_SECRET; the dev fallback is public, so it is only ever used
 * locally. When auth is unconfigured in production (see ADMIN_AUTH_CONFIGURED)
 * the callers fail closed before this is ever used to issue/verify a token.
 */
export const ADMIN_SESSION_SECRET =
  ADMIN_SESSION_SECRET_ENV ?? 'ponkali_admin_dev_secret_change_me';

/**
 * Whether admin auth is safely configured. In production this requires BOTH the
 * password and the signing secret to be set via the environment. When false,
 * every admin auth path (login, token signing, token verification, middleware)
 * fails closed — no one can sign in and no cookie validates — instead of falling
 * back to a public, forgeable secret.
 */
export const ADMIN_AUTH_CONFIGURED =
  !IS_PROD || (!!ADMIN_PASSWORD_ENV && !!ADMIN_SESSION_SECRET_ENV);

if (IS_PROD && !ADMIN_AUTH_CONFIGURED) {
  // Surfaced in server/edge logs so a misconfigured deploy is obvious.
  console.error(
    '[admin-session] ADMIN_PASSWORD and ADMIN_SESSION_SECRET must both be set in production. ' +
      'Admin login is DISABLED until they are configured.',
  );
}

export function validateCredentials(username: string, password: string): boolean {
  // Fail closed when auth isn't configured (production missing env vars).
  if (!ADMIN_AUTH_CONFIGURED || !ADMIN_PASSWORD) return false;
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export interface AdminPayload {
  user: string;
  exp: number;
}

/* base64url helpers — payload is ASCII JSON, safe with btoa/atob (global in
 * both Node 18+ and the Edge runtime). */
export function encodePayload(payload: AdminPayload): string {
  return btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodePayload(data: string): AdminPayload | null {
  try {
    const json = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json);
    if (typeof payload?.exp !== 'number') return null;
    return payload as AdminPayload;
  } catch {
    return null;
  }
}