import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { price, in_stock } = body;

    const updates: string[] = [];
    const values: (number | string)[] = [];

    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (in_stock !== undefined) {
      updates.push('in_stock = ?');
      values.push(in_stock);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(params.id);
    db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(params.id);
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
