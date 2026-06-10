import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  verifyPassword,
  createSessionToken,
  buildSessionCookie,
  isValidEmail,
} from '@/lib/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const db = await getDb();
    const result = await db.execute({
      sql: 'SELECT id, email, password_hash, name FROM users WHERE email = ?',
      args: [email],
    });

    const user = result.rows[0];
    // Generic message + always run verify path to avoid leaking which emails exist.
    if (!user || !verifyPassword(password, String(user.password_hash))) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const uid = Number(user.id);
    const name = user.name ? String(user.name) : undefined;
    const token = createSessionToken(uid, email, name);

    const response = NextResponse.json({ success: true, user: { id: uid, email, name } });
    response.cookies.set(buildSessionCookie(token));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Could not sign in. Please try again.' }, { status: 500 });
  }
}
