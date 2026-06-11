import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customer-auth';
import { getDb } from '@/lib/db';

/**
 * Order history for the signed-in customer. Orders are matched by the account
 * link (orders.user_id), OR the account's email, OR the account's phone — so
 * orders placed as a guest with the same email/phone, or before the account
 * existed, still show up in the customer's history.
 */
export async function GET() {
  const session = getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = session.email ? session.email.toLowerCase() : '';
  const phone = session.phone ?? '';

  const db = await getDb();
  const { rows } = await db.execute({
    sql: `SELECT o.order_id, o.created_at, o.total, o.status, o.payment_method,
                 COALESCE(SUM(oi.quantity), 0) AS item_count
          FROM orders o
          LEFT JOIN order_items oi ON oi.order_id = o.order_id
          WHERE o.user_id = ?
             OR (? <> '' AND lower(o.email) = ?)
             OR (? <> '' AND right(regexp_replace(o.phone, '[^0-9]', '', 'g'), 10) = ?)
          GROUP BY o.id
          ORDER BY o.created_at DESC, o.id DESC
          LIMIT 50`,
    args: [session.uid, email, email, phone, phone],
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
