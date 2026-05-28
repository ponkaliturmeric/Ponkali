import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
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
    const args: (number | string)[] = [];

    if (price !== undefined) {
      updates.push('price = ?');
      args.push(price);
    }
    if (in_stock !== undefined) {
      updates.push('in_stock = ?');
      args.push(in_stock);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    args.push(params.id);
    const db = await getDb();
    await db.execute({ sql: `UPDATE products SET ${updates.join(', ')} WHERE id = ?`, args });

    const { rows } = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [params.id] });
    return NextResponse.json(rows[0] ?? null);
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
