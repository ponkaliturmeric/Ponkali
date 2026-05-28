import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
    }

    db.prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)').run(name, email || null, message);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
