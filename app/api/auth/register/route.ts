import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  hashPassword,
  createSessionToken,
  buildSessionCookie,
  isValidEmail,
  passwordError,
} from '@/lib/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
    }
    if (name.length < 2) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    const pwErr = passwordError(password);
    if (pwErr) {
      return NextResponse.json({ error: pwErr }, { status: 400 });
    }

    const db = await getDb();

    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email],
    });
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    const result = await db.execute({
      sql: 'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?) RETURNING id',
      args: [email, hashPassword(password), name],
    });

    const uid = Number(result.rows[0].id);
    const token = createSessionToken(uid, email, name);

    const response = NextResponse.json(
      { success: true, user: { id: uid, email, name } },
      { status: 201 },
    );
    response.cookies.set(buildSessionCookie(token));
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Could not create account. Please try again.' }, { status: 500 });
  }
}
