import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    const { rows } = await db.execute({ sql: 'SELECT * FROM orders WHERE order_id = ?', args: [params.id] });
    const order = rows[0];
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const { rows: items } = await db.execute({ sql: 'SELECT * FROM order_items WHERE order_id = ?', args: [params.id] });
    const { rows: history } = await db.execute({ sql: 'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC', args: [params.id] });
    return NextResponse.json({ ...order, items, history });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, notes } = body;

    const db = await getDb();
    const { rows: existing } = await db.execute({ sql: 'SELECT * FROM orders WHERE order_id = ?', args: [params.id] });
    const order = existing[0] as unknown as { status: string } | undefined;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const statements: { sql: string; args: (string | number | null)[] }[] = [];

    if (status) {
      statements.push({ sql: 'UPDATE orders SET status = ? WHERE order_id = ?', args: [status, params.id] });
      if (status !== order.status) {
        statements.push({ sql: 'INSERT INTO order_status_history (order_id, status) VALUES (?, ?)', args: [params.id, status] });
      }
    }

    if (notes !== undefined) {
      statements.push({ sql: 'UPDATE orders SET notes = ? WHERE order_id = ?', args: [notes, params.id] });
    }

    if (statements.length > 0) {
      await db.batch(statements, 'write');
    }

    const { rows } = await db.execute({ sql: 'SELECT * FROM orders WHERE order_id = ?', args: [params.id] });
    const { rows: items } = await db.execute({ sql: 'SELECT * FROM order_items WHERE order_id = ?', args: [params.id] });
    const { rows: history } = await db.execute({ sql: 'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC', args: [params.id] });

    return NextResponse.json({ ...rows[0], items, history });
  } catch {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
