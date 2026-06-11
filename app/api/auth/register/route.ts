import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  hashPassword,
  createSessionToken,
  buildSessionCookie,
  isValidEmail,
  isValidPhone,
  normalizePhone,
  passwordError,
} from '@/lib/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const rawEmail = String(body.email ?? '').trim().toLowerCase();
    const rawPhone = String(body.phone ?? '').trim();
    const password = String(body.password ?? '');

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }

    // Phone is required (it links the account to its orders); email is optional.
    if (!rawPhone) {
      return NextResponse.json({ error: 'Please enter your mobile number.' }, { status: 400 });
    }
    if (!isValidPhone(rawPhone)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }
    const phone = normalizePhone(rawPhone);

    const email = rawEmail || null;
    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const pwErr = passwordError(password);
    if (pwErr) {
      return NextResponse.json({ error: pwErr }, { status: 400 });
    }

    const db = await getDb();

    // Reject if either the phone or (when given) the email is already taken.
    const existing = await db.execute({
      sql: 'SELECT phone, lower(email) AS email FROM users WHERE phone = ? OR (email IS NOT NULL AND lower(email) = ?)',
      args: [phone, email ?? ''],
    });
    if (existing.rows.length > 0) {
      const clash = existing.rows[0] as { phone: string | null; email: string | null };
      const byPhone = clash.phone === phone;
      return NextResponse.json(
        {
          error: byPhone
            ? 'An account with this mobile number already exists.'
            : 'An account with this email already exists.',
        },
        { status: 409 },
      );
    }

    const result = await db.execute({
      sql: 'INSERT INTO users (email, phone, password_hash, name) VALUES (?, ?, ?, ?) RETURNING id',
      args: [email, phone, hashPassword(password), name],
    });

    const uid = Number(result.rows[0].id);
    const token = createSessionToken(uid, email, name, phone);

    const response = NextResponse.json(
      { success: true, user: { id: uid, email, phone, name } },
      { status: 201 },
    );
    response.cookies.set(buildSessionCookie(token));
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Could not create account. Please try again.' }, { status: 500 });
  }
}
