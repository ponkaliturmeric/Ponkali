import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { createOrder } from '@/lib/orders';
import { buildManualOrder } from '@/lib/manual-orders';
import { MAX_BULK_DELETE } from '@/lib/crm';

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

/**
 * Bulk delete — the orders ticked in the admin list.
 *
 * One transaction for the whole selection, not a loop of single deletes. Half a
 * selection disappearing because request 7 of 20 failed would leave the
 * operator with no idea what actually went, and no way back.
 *
 * Children first (order_items has an FK to orders(order_id) with no
 * ON DELETE CASCADE), and the statement count is fixed at three however many
 * orders were selected, because the ids go in as one IN list rather than a
 * statement per order.
 */
export async function DELETE(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body with order_ids.' }, { status: 400 });
  }

  const raw = (body as { order_ids?: unknown })?.order_ids;
  if (!Array.isArray(raw) || raw.length === 0) {
    return NextResponse.json({ error: 'Select at least one order to delete.' }, { status: 400 });
  }

  // De-duplicated, because the same id arriving twice would otherwise inflate
  // the reported count.
  const ids = Array.from(
    new Set(raw.filter((v): v is string => typeof v === 'string' && v.trim() !== '').map((v) => v.trim())),
  );
  if (ids.length === 0) {
    return NextResponse.json({ error: 'No valid order IDs were supplied.' }, { status: 400 });
  }
  if (ids.length > MAX_BULK_DELETE) {
    return NextResponse.json(
      { error: `Too many orders in one request (${ids.length}). The limit is ${MAX_BULK_DELETE}.` },
      { status: 400 },
    );
  }

  const placeholders = ids.map(() => '?').join(', ');

  try {
    const db = await getDb();

    // Report on what actually exists, so a stale selection (a row someone else
    // already deleted) doesn't get counted as deleted here.
    const found = await db.execute({
      sql: `SELECT order_id, total FROM orders WHERE order_id IN (${placeholders})`,
      args: ids,
    });
    if (found.rows.length === 0) {
      return NextResponse.json({ error: 'None of those orders exist any more.' }, { status: 404 });
    }
    const existing = found.rows.map((r) => String(r.order_id));
    const revenue = found.rows.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
    const ph = existing.map(() => '?').join(', ');

    await db.batch([
      { sql: `DELETE FROM order_items WHERE order_id IN (${ph})`, args: existing },
      { sql: `DELETE FROM order_status_history WHERE order_id IN (${ph})`, args: existing },
      { sql: `DELETE FROM orders WHERE order_id IN (${ph})`, args: existing },
    ], 'write');

    return NextResponse.json({
      success: true,
      deleted: existing.length,
      revenue_removed: Math.round(revenue),
      // Ids that were selected but already gone — the UI can mention them.
      missing: ids.filter((id) => !existing.includes(id)),
    });
  } catch (error) {
    console.error('Bulk order delete error:', error);
    return NextResponse.json({ error: 'Could not delete the selected orders. Please try again.' }, { status: 500 });
  }
}
