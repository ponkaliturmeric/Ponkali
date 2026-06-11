import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  verifyPassword,
  createSessionToken,
  buildSessionCookie,
  isValidEmail,
  isValidPhone,
  normalizePhone,
  looksLikeEmail,
} from '@/lib/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Accept `identifier` (email or phone). Fall back to `email` for older clients.
    const identifier = String(body.identifier ?? body.email ?? '').trim();
    const password = String(body.password ?? '');

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Email/phone and password are required.' }, { status: 400 });
    }

    const db = await getDb();

    // Look the account up by whichever credential they typed.
    let sql: string;
    let args: string[];
    if (looksLikeEmail(identifier)) {
      const email = identifier.toLowerCase();
      if (!isValidEmail(email)) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }
      sql = 'SELECT id, email, phone, password_hash, name FROM users WHERE lower(email) = ?';
      args = [email];
    } else {
      if (!isValidPhone(identifier)) {
        return NextResponse.json({ error: 'Invalid mobile number or password.' }, { status: 401 });
      }
      sql = 'SELECT id, email, phone, password_hash, name FROM users WHERE phone = ?';
      args = [normalizePhone(identifier)];
    }

    const result = await db.execute({ sql, args });
    const user = result.rows[0];
    // Generic message + always run verify path to avoid leaking which accounts exist.
    if (!user || !verifyPassword(password, String(user.password_hash))) {
      return NextResponse.json({ error: 'Invalid credentials. Please try again.' }, { status: 401 });
    }

    const uid = Number(user.id);
    const email = user.email ? String(user.email) : null;
    const phone = user.phone ? String(user.phone) : null;
    const name = user.name ? String(user.name) : undefined;
    const token = createSessionToken(uid, email, name, phone);

    const response = NextResponse.json({ success: true, user: { id: uid, email, phone, name } });
    response.cookies.set(buildSessionCookie(token));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Could not sign in. Please try again.' }, { status: 500 });
  }
}
