import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

function generateOrderId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PKL-${date}-${rand}`;
}

export async function GET(request: NextRequest) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    let query = 'SELECT * FROM orders';
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(order_id LIKE ? OR customer_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const total = (db.prepare(countQuery).get(...params) as { total: number }).total;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const orders = db.prepare(query).all(...params);

    return NextResponse.json({ orders, total, page, pageSize });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name, phone, email,
      address_line1, address_line2, city, state, pincode, landmark,
      payment_method, upi_id,
      subtotal, shipping, cod_charge, total,
      items,
    } = body;

    if (!customer_name || !phone || !address_line1 || !city || !state || !pincode || !payment_method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const order_id = generateOrderId();

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_id, customer_name, phone, email,
        address_line1, address_line2, city, state, pincode, landmark,
        payment_method, upi_id, subtotal, shipping, cod_charge, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_name, weight, quantity, price)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertHistory = db.prepare(`
      INSERT INTO order_status_history (order_id, status) VALUES (?, ?)
    `);

    const transaction = db.transaction(() => {
      insertOrder.run(
        order_id, customer_name, phone, email || null,
        address_line1, address_line2 || null, city, state, pincode, landmark || null,
        payment_method, upi_id || null,
        subtotal, shipping, cod_charge || 0, total,
      );

      for (const item of items) {
        insertItem.run(order_id, item.product_name, item.weight, item.quantity, item.price);
      }

      insertHistory.run(order_id, 'Pending');
    });

    transaction();

    return NextResponse.json({ order_id, success: true }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
