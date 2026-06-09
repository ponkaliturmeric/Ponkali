import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getCustomerSession } from '@/lib/customer-auth';
import { getDb } from '@/lib/db';
import { priceCart } from '@/lib/pricing';
import { createOrder, missingCustomerField, type CustomerDetails } from '@/lib/orders';

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const status = searchParams.get('status');
  const search = (searchParams.get('search') || '').trim();
  const payment = searchParams.get('payment'); // 'cod' | 'online'
  const from = (searchParams.get('from') || '').trim(); // YYYY-MM-DD (inclusive)
  const to = (searchParams.get('to') || '').trim();     // YYYY-MM-DD (inclusive)
  const sort = searchParams.get('sort') || 'recent';

  // Whitelisted sort expressions — never interpolate user input into ORDER BY.
  const SORTS: Record<string, string> = {
    recent: 'o.created_at DESC, o.id DESC',
    oldest: 'o.created_at ASC, o.id ASC',
    amount_high: 'o.total DESC, o.id DESC',
    amount_low: 'o.total ASC, o.id DESC',
  };
  const orderBy = SORTS[sort] || SORTS.recent;

  // WHERE clauses are pushed in the same order as their args so the `?`→`$n`
  // rewrite (positional, left-to-right) lines up. All filter args precede the
  // trailing LIMIT/OFFSET args.
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (status && status !== 'All') {
    where.push('o.status = ?');
    args.push(status);
  }
  if (search) {
    // Columns are qualified with `o.` because order_items (joined below) also has
    // an `order_id` column — an unqualified `order_id` here is ambiguous and makes
    // Postgres throw, which surfaced as the admin search spinning forever.
    where.push('(o.order_id ILIKE ? OR o.customer_name ILIKE ? OR o.phone ILIKE ? OR o.city ILIKE ?)');
    args.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (payment === 'cod' || payment === 'online') {
    where.push('o.payment_method = ?');
    args.push(payment);
  }
  if (from) {
    where.push('o.created_at >= ?::date');
    args.push(from);
  }
  if (to) {
    // `< to + 1 day` so the whole `to` day is included regardless of time.
    where.push("o.created_at < (?::date + INTERVAL '1 day')");
    args.push(to);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const db = await getDb();

    // Page rows + grand total + filtered revenue all come back in ONE round-trip.
    // The window functions (COUNT/SUM OVER()) are evaluated over the full filtered
    // set before LIMIT, so each row carries the totals for the whole result — no
    // second query for the summary strip.
    const offset = (page - 1) * PAGE_SIZE;
    const ordersRes = await db.execute({
      sql: `SELECT o.*, COALESCE(SUM(oi.quantity), 0) AS item_count,
                   COUNT(*) OVER() AS total_count,
                   COALESCE(SUM(o.total) OVER(), 0) AS total_revenue
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.order_id
            ${whereSql}
            GROUP BY o.id
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?`,
      args: [...args, PAGE_SIZE, offset],
    });

    const total = ordersRes.rows.length ? Number(ordersRes.rows[0].total_count) : 0;
    const revenue = ordersRes.rows.length ? Number(ordersRes.rows[0].total_revenue) : 0;
    const orders = ordersRes.rows.map((row) => {
      const order = { ...row };
      delete order.total_count;
      delete order.total_revenue;
      return order;
    });

    return NextResponse.json({
      orders,
      total,
      page,
      pageSize: PAGE_SIZE,
      summary: {
        count: total,
        revenue,
        avg_order_value: total > 0 ? Math.round(revenue / total) : 0,
      },
    });
  } catch (error) {
    console.error('Orders list error:', error);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Customer details come from the request; prices are recomputed server-side.
    const customer = body as Partial<CustomerDetails>;
    const missing = missingCustomerField(customer);
    if (missing) {
      return NextResponse.json({ error: `Missing required field: ${missing}` }, { status: 400 });
    }

    const payment_method = body.payment_method === 'online' ? 'online' : 'cod';

    // Server-authoritative pricing — client-sent totals are ignored.
    const cart = await priceCart(body.items, { cod: payment_method === 'cod' });
    if (!cart) {
      return NextResponse.json(
        { error: 'Your cart is empty or contains an unavailable item.' },
        { status: 400 },
      );
    }

    // If the shopper is signed in, link the order to their account for history.
    const session = getCustomerSession();

    const order_id = await createOrder({
      customer: customer as CustomerDetails,
      cart,
      payment_method,
      status: 'Pending',
      user_id: session?.uid ?? null,
    });

    return NextResponse.json({ order_id, success: true, total: cart.total }, { status: 201 });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
