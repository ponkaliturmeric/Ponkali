import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(params.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(params.id);
    const history = db.prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC').all(params.id);
    return NextResponse.json({ ...order as object, items, history });
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

    const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(params.id) as { status: string } | undefined;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (status) {
      db.prepare('UPDATE orders SET status = ? WHERE order_id = ?').run(status, params.id);
      if (status !== order.status) {
        db.prepare('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)').run(params.id, status);
      }
    }

    if (notes !== undefined) {
      db.prepare('UPDATE orders SET notes = ? WHERE order_id = ?').run(notes, params.id);
    }

    const updated = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(params.id);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(params.id);
    const history = db.prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC').all(params.id);

    return NextResponse.json({ ...updated as object, items, history });
  } catch {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
