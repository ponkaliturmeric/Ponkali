import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * Lets a checkout page that was reloaded mid-payment (mobile UPI app switch)
 * find out whether the webhook already recorded the order, so the customer can
 * be sent to their confirmation instead of a stale cart.
 *
 * The Razorpay order id (order_XXXXXXXXXXXXXX) is only ever known to the
 * browser that started the checkout, so it acts as the bearer here. The
 * response is limited to what the confirmation page renders — no phone, no
 * address.
 */
export async function GET(request: NextRequest) {
  const razorpayOrderId = request.nextUrl.searchParams.get('razorpay_order_id') ?? '';
  if (!/^order_[A-Za-z0-9]+$/.test(razorpayOrderId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const db = await getDb();
  const { rows } = await db.execute({
    sql: `SELECT o.order_id, o.customer_name, o.total, o.payment_method, o.status, o.created_at,
                 COALESCE(json_agg(json_build_object(
                   'product_name', oi.product_name, 'weight', oi.weight,
                   'quantity', oi.quantity, 'price', oi.price
                 ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
          FROM orders o
          LEFT JOIN order_items oi ON oi.order_id = o.order_id
          WHERE o.razorpay_order_id = ?
          GROUP BY o.id`,
    args: [razorpayOrderId],
  });
  if (!rows.length) return NextResponse.json({ order_id: null });

  const r = rows[0];
  return NextResponse.json({
    order_id: String(r.order_id),
    order: {
      order_id: String(r.order_id),
      // First name only — enough for "Thank you, Ramesh".
      customer_name: String(r.customer_name).split(' ')[0],
      total: Number(r.total),
      payment_method: String(r.payment_method),
      status: String(r.status),
      created_at: r.created_at,
      items: r.items,
    },
  });
}
