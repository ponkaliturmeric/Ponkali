import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
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

  const where: string[] = [];
  const args: (string | number)[] = [];
  if (status && status !== 'All') {
    where.push('status = ?');
    args.push(status);
  }
  if (search) {
    where.push('(order_id ILIKE ? OR customer_name ILIKE ? OR phone ILIKE ?)');
    args.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const db = await getDb();

  const countRes = await db.execute({
    sql: `SELECT COUNT(*) AS count FROM orders ${whereSql}`,
    args,
  });
  const total = Number(countRes.rows[0].count);

  const offset = (page - 1) * PAGE_SIZE;
  const ordersRes = await db.execute({
    sql: `SELECT o.*, COALESCE(SUM(oi.quantity), 0) AS item_count
          FROM orders o
          LEFT JOIN order_items oi ON oi.order_id = o.order_id
          ${whereSql}
          GROUP BY o.id
          ORDER BY o.created_at DESC, o.id DESC
          LIMIT ? OFFSET ?`,
    args: [...args, PAGE_SIZE, offset],
  });

  return NextResponse.json({
    orders: ordersRes.rows,
    total,
    page,
    pageSize: PAGE_SIZE,
  });
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

    const order_id = await createOrder({
      customer: customer as CustomerDetails,
      cart,
      payment_method,
      status: 'Pending',
    });

    return NextResponse.json({ order_id, success: true, total: cart.total }, { status: 201 });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
