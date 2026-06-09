import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

/** Admin inbox for contact-form submissions stored in `contact_messages`. */

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const filter = searchParams.get('filter'); // 'unread' | null
  const offset = (page - 1) * PAGE_SIZE;

  const where = filter === 'unread' ? 'WHERE COALESCE(is_read, 0) = 0' : '';

  try {
    const db = await getDb();
    const { rows } = await db.execute({
      sql: `
        SELECT
          (SELECT COALESCE(json_agg(m), '[]'::json) FROM (
            SELECT id, name, email, message, created_at, COALESCE(is_read, 0) AS is_read,
                   COUNT(*) OVER() AS total_count
            FROM contact_messages
            ${where}
            ORDER BY created_at DESC, id DESC
            LIMIT ? OFFSET ?
          ) m) AS rows,
          (SELECT COUNT(*) FROM contact_messages WHERE COALESCE(is_read, 0) = 0) AS unread
      `,
      args: [PAGE_SIZE, offset],
    });

    const row = rows[0] as { rows: Array<Record<string, unknown>>; unread: number };
    const list = (row.rows || []).map((r) => ({
      id: Number(r.id),
      name: r.name != null ? String(r.name) : '',
      email: r.email != null ? String(r.email) : null,
      message: r.message != null ? String(r.message) : '',
      created_at: r.created_at,
      is_read: Number(r.is_read) === 1,
    }));
    const total = row.rows?.length ? Number(row.rows[0].total_count) : 0;

    return NextResponse.json({
      messages: list,
      total,
      page,
      pageSize: PAGE_SIZE,
      unread: Number(row.unread),
    });
  } catch (error) {
    console.error('Messages list error:', error);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const db = await getDb();

    // Mark every message read in one shot, or a single message by id.
    if (body.markAllRead) {
      await db.execute('UPDATE contact_messages SET is_read = 1 WHERE COALESCE(is_read, 0) = 0');
      return NextResponse.json({ success: true });
    }

    const id = Number(body.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Invalid message id' }, { status: 400 });
    }
    const is_read = body.is_read ? 1 : 0;
    await db.execute({ sql: 'UPDATE contact_messages SET is_read = ? WHERE id = ?', args: [is_read, id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Message update error:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
