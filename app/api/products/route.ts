import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY price ASC').all();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
