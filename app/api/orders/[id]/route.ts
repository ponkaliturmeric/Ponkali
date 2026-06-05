import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

const VALID_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Paid'];

async function loadOrder(orderId: string) {
  const db = await getDb();
  const orderRes = await db.execute({
    sql: 'SELECT * FROM orders WHERE order_id = ?',
    args: [orderId],
  });
  if (orderRes.rows.length === 0) return null;

  const itemsRes = await db.execute({
    sql: 'SELECT product_name, weight, quantity, price FROM order_items WHERE order_id = ? ORDER BY id',
    args: [orderId],
  });
  const historyRes = await db.execute({
    sql: 'SELECT status, changed_at, notes FROM order_status_history WHERE order_id = ? ORDER BY id DESC',
    args: [orderId],
  });

  return {
    ...orderRes.rows[0],
    items: itemsRes.rows,
    history: historyRes.rows,
  };
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const order = await loadOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const db = await getDb();

  const exists = await db.execute({
    sql: 'SELECT 1 FROM orders WHERE order_id = ?',
    args: [params.id],
  });
  if (exists.rows.length === 0) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (typeof body.status === 'string') {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    await db.batch([
      { sql: 'UPDATE orders SET status = ? WHERE order_id = ?', args: [body.status, params.id] },
      {
        sql: 'INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)',
        args: [params.id, body.status, 'Status updated by admin'],
      },
    ], 'write');
  }

  if (typeof body.notes === 'string') {
    await db.execute({
      sql: 'UPDATE orders SET notes = ? WHERE order_id = ?',
      args: [body.notes, params.id],
    });
  }

  const order = await loadOrder(params.id);
  return NextResponse.json(order);
}
