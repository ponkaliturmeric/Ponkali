import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendContactNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const message = String(body.message ?? '').trim();

    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
    }

    const db = await getDb();
    await db.execute({
      sql: 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
      args: [name, email || null, message],
    });

    // Notify the business by email. Never let an email failure fail the request —
    // the message is already safely saved in the database above.
    try {
      await sendContactNotification({ name, email: email || null, message });
    } catch (err) {
      console.error('[contact] notification email failed (message still saved):', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
