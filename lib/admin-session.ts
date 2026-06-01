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

// The ONLY credentials that may ever authenticate as admin.
export const ADMIN_USERNAME = 'ponkali_admin';
export const ADMIN_PASSWORD = 'erode2024secure';

export const ADMIN_COOKIE = 'ponkali_session';
export const ADMIN_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Secret used to sign session tokens. MUST be overridden in production via
 * ADMIN_SESSION_SECRET — the dev fallback is public, so a deployed site that
 * keeps it would allow anyone to forge an admin cookie.
 */
export const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ?? 'ponkali_admin_dev_secret_change_me';

export function validateCredentials(username: string, password: string): boolean {
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
