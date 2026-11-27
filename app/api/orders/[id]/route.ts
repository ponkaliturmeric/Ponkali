import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getCustomerSession } from '@/lib/customer-auth';
import { getDb } from '@/lib/db';
import { SUPPLIER_PAID_STATUSES } from '@/lib/crm';

const VALID_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Paid'];

async function loadOrder(orderId: string) {
  const db = await getDb();
  const orderRes = await db.execute({
    sql: 'SELECT * FROM orders WHERE order_id = ?',
    args: [orderId],
  });
  if (orderRes.rows.length === 0) return null;

  // In parallel: neither depends on the other, and awaiting them one after the
  // other paid the database's round-trip latency twice for no reason.
  const [itemsRes, historyRes] = await Promise.all([
    db.execute({
      sql: 'SELECT product_name, weight, quantity, price FROM order_items WHERE order_id = ? ORDER BY id',
      args: [orderId],
    }),
    db.execute({
      sql: 'SELECT status, changed_at, notes FROM order_status_history WHERE order_id = ? ORDER BY id DESC',
      args: [orderId],
    }),
  ]);

  return {
    ...orderRes.rows[0],
    items: itemsRes.rows,
    history: historyRes.rows,
  };
}

/**
 * What a signed-in CUSTOMER is allowed to see of their own order.
 *
 * loadOrder does SELECT *, which now carries internal business data: the
 * admin's "Internal Notes", the payment reference, and supplier_paid — whether
 * we have settled up with our own supplier, which is none of a buyer's
 * business. The status timeline carries note text for the same reason
 * ("Supplier marked as paid").
 *
 * A WHITELIST rather than a blocklist, deliberately: every column added to
 * orders from now on is excluded until someone decides a customer should see
 * it, instead of leaking by default. Tracking number IS included — that one is
 * genuinely useful to the person waiting for the parcel.
 */
function customerView(order: Record<string, unknown>) {
  const ALLOWED = [
    'order_id', 'created_at', 'customer_name', 'phone', 'email',
    'address_line1', 'address_line2', 'city', 'state', 'pincode', 'landmark',
    'payment_method', 'payment_status', 'amount_paid',
    'subtotal', 'shipping', 'cod_charge', 'discount', 'total',
    'status', 'tracking_number', 'items',
  ];
  const safe: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in order) safe[key] = order[key];
  }
  // Timeline without the internal note text.
  const history = Array.isArray(order.history) ? order.history : [];
  safe.history = history.map((h) => {
    const row = h as Record<string, unknown>;
    return { status: row.status, changed_at: row.changed_at };
  });
  return safe;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const order = await loadOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Admins see any order; a signed-in customer may see their OWN orders
  // (matched by the account link, the order's email, or the order's phone). This
  // keeps the address and phone on the order private to the owner while making
  // order history and cross-device confirmation pages work.
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    const session = getCustomerSession();
    const row = order as Record<string, unknown>;
    const orderEmail = typeof row.email === 'string' ? row.email.toLowerCase() : '';
    const orderPhone = typeof row.phone === 'string' ? row.phone.replace(/\D/g, '').slice(-10) : '';
    const sessionEmail = session?.email ? session.email.toLowerCase() : '';
    const sessionPhone = session?.phone ?? '';
    const ownsOrder =
      !!session &&
      (Number(row.user_id) === session.uid ||
        (!!sessionEmail && orderEmail === sessionEmail) ||
        (!!sessionPhone && orderPhone === sessionPhone));
    if (!ownsOrder) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Owns it, but is not an admin — strip the internal fields.
    return NextResponse.json(customerView(order as Record<string, unknown>));
  }

  return NextResponse.json(order);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ?brief=1 — the caller already applied the change locally and only needs to
  // know it saved. Skips re-reading the order, which is three more queries
  // against a remote database for a body nobody reads. The order detail page
  // omits it, because it DOES use the refreshed order and its new timeline.
  const brief = new URL(request.url).searchParams.get('brief') === '1';

  const body = await request.json();
  const db = await getDb();

  const exists = await db.execute({
    sql: 'SELECT status FROM orders WHERE order_id = ?',
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

  // Courier tracking number. Stored as NULL rather than '' when cleared, so the
  // partial index stays small and "has a tracking number" is a single IS NOT
  // NULL test everywhere. Capped because this is operator free-text, and a
  // consignment number is never anywhere near this long.
  if (typeof body.tracking_number === 'string') {
    const tracking = body.tracking_number.trim().slice(0, 64);
    await db.batch([
      {
        sql: 'UPDATE orders SET tracking_number = ? WHERE order_id = ?',
        args: [tracking || null, params.id],
      },
      {
        // The timeline entry carries the order's CURRENT status, not a made-up
        // one: adding a tracking number is a note on the order, not a change of
        // state, and a fake "Tracking" status would misread as a real step.
        sql: 'INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)',
        args: [
          params.id,
          String(exists.rows[0].status ?? 'Pending'),
          tracking ? `Tracking number set to ${tracking}` : 'Tracking number cleared',
        ],
      },
    ], 'write');
  }

  // Supplier settlement — money OUT, independent of the customer's payment.
  // Validated against the allowed list rather than stored as free text, so the
  // column stays filterable and a typo can't create a third state.
  if (typeof body.supplier_paid === 'string') {
    const value = body.supplier_paid.trim();
    if (!SUPPLIER_PAID_STATUSES.includes(value as (typeof SUPPLIER_PAID_STATUSES)[number])) {
      return NextResponse.json(
        { error: `Supplier payment must be one of: ${SUPPLIER_PAID_STATUSES.join(', ')}.` },
        { status: 400 },
      );
    }
    await db.batch([
      { sql: 'UPDATE orders SET supplier_paid = ? WHERE order_id = ?', args: [value, params.id] },
      {
        // Current status again, for the same reason as the tracking entry: this
        // is a note on the order, not a fulfilment step.
        sql: 'INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)',
        args: [
          params.id,
          String(exists.rows[0].status ?? 'Pending'),
          value === 'Paid' ? 'Supplier marked as paid' : 'Supplier marked as not paid',
        ],
      },
    ], 'write');
  }

  if (brief) {
    return NextResponse.json({ success: true });
  }

  const order = await loadOrder(params.id);
  return NextResponse.json(order);
}
