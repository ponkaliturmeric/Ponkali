import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  const body = await request.json();
  const db = await getDb();

  const existing = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const updates: string[] = [];
  const args: (string | number)[] = [];

  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }
    updates.push('price = ?');
    args.push(price);
  }
  if (body.in_stock !== undefined) {
    updates.push('in_stock = ?');
    args.push(body.in_stock ? 1 : 0);
  }

  if (updates.length > 0) {
    args.push(id);
    await db.execute({ sql: `UPDATE products SET ${updates.join(', ')} WHERE id = ?`, args });
  }

  const updated = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
  return NextResponse.json(updated.rows[0]);
}
