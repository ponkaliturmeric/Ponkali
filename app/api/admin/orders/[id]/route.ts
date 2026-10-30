import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { buildManualOrder } from '@/lib/manual-orders';

/**
 * Full edit of an existing order — customer, address, line items, charges and
 * payment. The admin needs this because a WhatsApp order changes while you are
 * still talking to the customer ("make it two of the 500g, and my brother will
 * collect it").
 *
 * Validated by exactly the same builder as creation, so an edited order can
 * never end up in a state a new one couldn't. Line items are replaced wholesale
 * (delete + re-insert) inside one transaction together with the order row and a
 * timeline entry, so the row and its items can never disagree.
 *
 * PUT on /api/orders/[id] stays as it was for the quick status/notes updates
 * made from the orders table.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const existing = await db.execute({
      sql: 'SELECT order_id, status FROM orders WHERE order_id = ?',
      args: [params.id],
    });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const built = await buildManualOrder(await request.json());
    if (!built.ok) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }
    const o = built.order;
    const c = o.customer;
    const statusChanged = String(existing.rows[0].status) !== o.status;

    const stmts: { sql: string; args: (string | number | null)[] }[] = [
      {
        sql: `UPDATE orders SET
                customer_name = ?, phone = ?, email = ?,
                address_line1 = ?, address_line2 = ?, city = ?, state = ?, pincode = ?, landmark = ?,
                payment_method = ?, subtotal = ?, shipping = ?, cod_charge = ?, discount = ?, total = ?,
                status = ?, notes = ?, source = ?, payment_status = ?, amount_paid = ?, payment_ref = ?
              WHERE order_id = ?`,
        args: [
          c.customer_name,
          c.phone,
          c.email ?? null,
          c.address_line1,
          c.address_line2 ?? null,
          c.city,
          c.state,
          c.pincode,
          c.landmark ?? null,
          o.payment_method,
          o.cart.subtotal,
          o.cart.shipping,
          o.cart.codCharge,
          o.discount,
          o.cart.total,
          o.status,
          o.notes,
          o.source,
          o.payment_status,
          o.amount_paid,
          o.payment_ref,
          params.id,
        ],
      },
      { sql: 'DELETE FROM order_items WHERE order_id = ?', args: [params.id] },
      ...o.cart.lines.map((l) => ({
        sql: 'INSERT INTO order_items (order_id, product_name, weight, quantity, price) VALUES (?, ?, ?, ?, ?)',
        args: [params.id, l.name, l.weight, l.quantity, l.price] as (string | number | null)[],
      })),
      {
        sql: 'INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)',
        args: [params.id, o.status, statusChanged ? 'Order edited by admin (status changed)' : 'Order edited by admin'],
      },
    ];

    await db.batch(stmts, 'write');

    return NextResponse.json({ success: true, order_id: params.id, total: o.cart.total });
  } catch (error) {
    console.error('Manual order edit error:', error);
    return NextResponse.json({ error: 'Could not save the changes. Please try again.' }, { status: 500 });
  }
}
