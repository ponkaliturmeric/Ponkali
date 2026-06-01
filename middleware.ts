import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_SESSION_SECRET, decodePayload } from '@/lib/admin-session';

/**
 * Edge verification of the admin session token. Recomputes the HMAC-SHA256 with
 * Web Crypto and compares against the token signature — the same algorithm the
 * Node side (lib/auth.ts) uses to sign, so tokens validate identically here.
 */
async function isValidAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [data, signature] = token.split('.');
  if (!data || !signature) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ADMIN_SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const expected = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (signature !== expected) return false;

  const payload = decodePayload(data);
  return !!payload && payload.exp > Date.now();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/admin/login';
  const authed = await isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);

  // Block every admin route except the login page when unauthenticated.
  if (!authed && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = `?from=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Already signed in — skip the login screen.
  if (authed && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Only run on admin routes; API routes keep their own getAdminSession() checks.
  matcher: ['/admin/:path*'],
};
