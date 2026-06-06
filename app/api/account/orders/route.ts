import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customer-auth';
import { getDb } from '@/lib/db';

/**
 * Order history for the signed-in customer. Orders are matched either by the
 * account link (orders.user_id) OR by the account's email address — so orders
 * placed as a guest with the same email, or before the account existed, still
 * show up in the customer's history.
 */
export async function GET() {
  const session = getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const { rows } = await db.execute({
    sql: `SELECT o.order_id, o.created_at, o.total, o.status, o.payment_method,
                 COALESCE(SUM(oi.quantity), 0) AS item_count
          FROM orders o
          LEFT JOIN order_items oi ON oi.order_id = o.order_id
          WHERE o.user_id = ? OR lower(o.email) = ?
          GROUP BY o.id
          ORDER BY o.created_at DESC, o.id DESC
          LIMIT 50`,
    args: [session.uid, session.email.toLowerCase()],
  });

  return NextResponse.json({
    orders: rows.map((r) => ({
      order_id: String(r.order_id),
      created_at: String(r.created_at),
      total: Number(r.total),
      status: String(r.status),
      payment_method: String(r.payment_method),
      item_count: Number(r.item_count),
    })),
  });
}
