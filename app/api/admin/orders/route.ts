import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { createOrder } from '@/lib/orders';
import { buildManualOrder } from '@/lib/manual-orders';

/**
 * Create an order by hand — the WhatsApp / phone / walk-in orders that never
 * pass through checkout. Admin-only.
 *
 * Everything the storefront guarantees still holds: the order row, its line
 * items and the first timeline entry are written in ONE transaction by
 * createOrder(), so a half-written order is impossible. What differs is that
 * prices come from the operator rather than the catalogue (see
 * lib/manual-orders.ts for why) and the customer notification is opt-in.
 */
export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const built = await buildManualOrder(await request.json());
    if (!built.ok) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }
    const o = built.order;

    // If this phone already has an account, link the order to it so the order
    // shows up in the customer's own order history too.
    const db = await getDb();
    const { rows } = await db.execute({
      sql: 'SELECT id FROM users WHERE phone = ? LIMIT 1',
      args: [o.customer.phone],
    });
    const user_id = rows.length ? Number(rows[0].id) : null;

    const order_id = await createOrder({
      customer: o.customer,
      cart: o.cart,
      payment_method: o.payment_method,
      status: o.status,
      notes: o.notes ?? undefined,
      user_id,
      source: o.source,
      payment_status: o.payment_status,
      amount_paid: o.amount_paid,
      payment_ref: o.payment_ref,
      discount: o.discount,
      history_note: `Added manually by admin (${o.source})`,
      notify: o.notify,
    });

    return NextResponse.json({ success: true, order_id, total: o.cart.total }, { status: 201 });
  } catch (error) {
    console.error('Manual order create error:', error);
    return NextResponse.json({ error: 'Could not save the order. Please try again.' }, { status: 500 });
  }
}
